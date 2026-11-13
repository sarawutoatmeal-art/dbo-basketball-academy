const fs = require('fs');
const path = require('path');
const os = require('os');

const TMP_FILE = path.join(os.tmpdir(), 'dbo_cloud_state_v17.json');

function loadStoredState() {
  if (global.__dboCloudState) {
    return global.__dboCloudState;
  }
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      global.__dboCloudState = parsed;
      return parsed;
    }
  } catch (e) {
    console.error('Read tmp state error:', e);
  }
  return null;
}

function saveStoredState(state) {
  global.__dboCloudState = state;
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(state), 'utf8');
  } catch (e) {
    console.error('Write tmp state error:', e);
  }
}

function mergeStates(existing, incoming) {
  if (!existing) return incoming;
  if (!incoming) return existing;

  const result = {
    updatedAt: Math.max(existing.updatedAt || 0, incoming.updatedAt || 0, Date.now()),
    lastSubmittedAt: Math.max(existing.lastSubmittedAt || 0, incoming.lastSubmittedAt || 0),
    lastSubmittedBy: (incoming.lastSubmittedAt || 0) >= (existing.lastSubmittedAt || 0)
      ? (incoming.lastSubmittedBy || existing.lastSubmittedBy || '')
      : (existing.lastSubmittedBy || ''),
    deletedStudentIds: { ...(existing.deletedStudentIds || {}), ...(incoming.deletedStudentIds || {}) },
    processedSlipIds: { ...(existing.processedSlipIds || {}), ...(incoming.processedSlipIds || {}) },
    students: [],
    dailyAttendance: {},
    teachingRecords: [],
    parentRegistrations: [],
    pendingSlips: [],
    assistantCoaches: [],
    weeklySchedule: null,
    calendarDayOverrides: {}
  };

  // 1. Merge weeklySchedule (latest timestamp wins)
  result.weeklySchedule = (incoming.weeklySchedule && (incoming.updatedAt || 0) >= (existing.updatedAt || 0))
    ? incoming.weeklySchedule
    : (existing.weeklySchedule || incoming.weeklySchedule || null);

  // 1.1 Merge calendarDayOverrides
  const calOverrides = { ...(existing.calendarDayOverrides || {}) };
  for (const [k, v] of Object.entries(incoming.calendarDayOverrides || {})) {
    if (!calOverrides[k] || (v && (v.updatedAt || 0) >= (calOverrides[k].updatedAt || 0))) {
      calOverrides[k] = v;
    }
  }
  result.calendarDayOverrides = calOverrides;

  // 1. Merge deletedStudentIds timestamps
  const delMap = {};
  for (const [k, v] of Object.entries(existing.deletedStudentIds || {})) delMap[k] = v;
  for (const [k, v] of Object.entries(incoming.deletedStudentIds || {})) {
    if (!delMap[k] || v > delMap[k]) delMap[k] = v;
  }
  result.deletedStudentIds = delMap;

  // 2. Merge students by id & _updatedAt
  const nowTs = Date.now();
  const studentMap = new Map();
  (existing.students || []).forEach(s => {
    if (s && s.id != null) {
      // Clamp any legacy future timestamps to past so fresh edits always win
      if ((s._updatedAt || 0) > nowTs + 5000) {
        s._updatedAt = nowTs - 10000;
      }
      studentMap.set(String(s.id), s);
    }
  });
  (incoming.students || []).forEach(inc => {
    if (!inc || inc.id == null) return;
    const key = String(inc.id);
    const cur = studentMap.get(key);
    if (!cur) {
      studentMap.set(key, inc);
    } else {
      let incTime = inc._updatedAt || 0;
      let curTime = cur._updatedAt || 0;
      if (curTime > nowTs + 5000) curTime = nowTs - 10000;
      if (incTime >= curTime) {
        studentMap.set(key, inc);
      }
    }
  });
  result.students = Array.from(studentMap.values()).filter(s => {
    const delTime = delMap[String(s.id)];
    if (!delTime) return true;
    return (s._updatedAt || 0) > delTime;
  });

  // 3. Merge dailyAttendance by dateKey -> studentId -> updatedAt
  const allDates = new Set([
    ...Object.keys(existing.dailyAttendance || {}),
    ...Object.keys(incoming.dailyAttendance || {})
  ]);
  allDates.forEach(dk => {
    const exDay = (existing.dailyAttendance && existing.dailyAttendance[dk]) || {};
    const inDay = (incoming.dailyAttendance && incoming.dailyAttendance[dk]) || {};
    const mergedDay = { ...exDay };
    for (const [sid, rec] of Object.entries(inDay)) {
      const curRec = mergedDay[sid];
      if (!curRec || (rec.updatedAt || 0) >= (curRec.updatedAt || 0)) {
        mergedDay[sid] = rec;
      }
    }
    result.dailyAttendance[dk] = mergedDay;
  });

  // 4. Merge parentRegistrations by id -> updatedAt
  const regMap = new Map();
  (existing.parentRegistrations || []).forEach(r => {
    if (r && r.id) regMap.set(r.id, r);
  });
  (incoming.parentRegistrations || []).forEach(r => {
    if (!r || !r.id) return;
    const cur = regMap.get(r.id);
    if (!cur || (r.updatedAt || 0) >= (cur.updatedAt || 0)) {
      regMap.set(r.id, r);
    }
  });
  result.parentRegistrations = Array.from(regMap.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  // 5. Merge pendingSlips by id & filter out processedSlipIds
  const procMap = result.processedSlipIds;
  const slipMap = new Map();
  (existing.pendingSlips || []).forEach(s => {
    if (s && s.id && !procMap[s.id]) slipMap.set(s.id, s);
  });
  (incoming.pendingSlips || []).forEach(s => {
    if (s && s.id && !procMap[s.id]) {
      const cur = slipMap.get(s.id);
      if (!cur || (s.updatedAt || 0) >= (cur.updatedAt || 0)) {
        slipMap.set(s.id, s);
      }
    }
  });
  result.pendingSlips = Array.from(slipMap.values());

  // 6. Merge assistantCoaches by id
  const asstMap = new Map();
  (existing.assistantCoaches || []).forEach(a => {
    if (a && a.id) asstMap.set(a.id, a);
  });
  (incoming.assistantCoaches || []).forEach(a => {
    if (!a || !a.id) return;
    const cur = asstMap.get(a.id);
    if (!cur || (a.updatedAt || 0) >= (cur.updatedAt || 0)) {
      asstMap.set(a.id, a);
    }
  });
  result.assistantCoaches = Array.from(asstMap.values());

  // 7. Merge teachingRecords by id & updatedAt (Techawit Post-Teaching Records)
  const recMap = new Map();
  (existing.teachingRecords || []).forEach(r => {
    if (r && r.id) recMap.set(r.id, r);
  });
  (incoming.teachingRecords || []).forEach(r => {
    if (!r || !r.id) return;
    const cur = recMap.get(r.id);
    if (!cur || (r.updatedAt || 0) >= (cur.updatedAt || 0)) {
      recMap.set(r.id, r);
    }
  });
  result.teachingRecords = Array.from(recMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return result;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const state = loadStoredState();
    return res.status(200).json({
      ok: true,
      hasState: !!state,
      state: state || null,
      data: state || null
    });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const incoming = body && body.data ? body.data : body;
      if (body && body.overwrite) {
        saveStoredState(incoming);
        return res.status(200).json({
          ok: true,
          data: incoming
        });
      }
      const existing = loadStoredState();
      const merged = mergeStates(existing, incoming);
      saveStoredState(merged);
      return res.status(200).json({
        ok: true,
        data: merged
      });
    } catch (err) {
      return res.status(400).json({
        ok: false,
        error: err.message
      });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
};
