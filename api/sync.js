const fs = require('fs');
const path = require('path');
const os = require('os');

const TMP_FILE = path.join(os.tmpdir(), 'dbo_cloud_state_v17.json');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://igbgetsqqshzhhwnjfgm.supabase.co';
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || 'sb_publishable_8a6VGS9ItL20guHGSdlzEA_QkuuI3iA';
const SERVER_UA = 'DBO-Academy-Server/2.0';

function loadLocalTmpState() {
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

function saveLocalTmpState(state) {
  global.__dboCloudState = state;
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(state), 'utf8');
  } catch (e) {
    console.error('Write tmp state error:', e);
  }
}

async function loadSupabaseState(envId = 'production') {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/dbo_app_state?id=eq.${encodeURIComponent(envId)}&select=state,updated_at`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_API_KEY,
          'Accept': 'application/json',
          'User-Agent': SERVER_UA
        },
        signal: AbortSignal.timeout(4500)
      }
    );
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0].state) {
        return rows[0].state;
      }
    }
  } catch (e) {
    console.warn('Supabase load state fallback to local tmp:', e.message);
  }
  return null;
}

async function saveSupabaseState(state, envId = 'production') {
  if (!state) return;
  const nowIso = new Date().toISOString();

  // 1. Upsert full state snapshot into dbo_app_state
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/dbo_app_state?on_conflict=id`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_API_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
        'User-Agent': SERVER_UA
      },
      body: JSON.stringify([
        {
          id: envId,
          state: state,
          updated_at: nowIso
        }
      ]),
      signal: AbortSignal.timeout(5000)
    });
  } catch (e) {
    console.warn('Supabase dbo_app_state upsert error:', e.message);
  }

  // 2. Sync normalized students table when saving production state
  if (envId === 'production' && Array.isArray(state.students) && state.students.length > 0) {
    try {
      const studentRows = state.students
        .filter(s => s && s.id != null)
        .map(s => ({
          id: Number(s.id),
          name: String(s.name || ''),
          course: String(s.course || ''),
          course_type: String(s.courseType || 'regular'),
          remaining: Number(s.remaining || 0),
          next_renewal: String(s.nextRenewal || '-'),
          phone: String(s.phone || ''),
          data: s,
          updated_at: nowIso
        }));

      await fetch(`${SUPABASE_URL}/rest/v1/dbo_students?on_conflict=id`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_API_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal',
          'User-Agent': SERVER_UA
        },
        body: JSON.stringify(studentRows),
        signal: AbortSignal.timeout(5000)
      });
    } catch (e) {
      console.warn('Supabase dbo_students sync error:', e.message);
    }
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
    calendarDayOverrides: {},
    pushSubscriptions: []
  };

  result.weeklySchedule = (incoming.weeklySchedule && (incoming.updatedAt || 0) >= (existing.updatedAt || 0))
    ? incoming.weeklySchedule
    : (existing.weeklySchedule || incoming.weeklySchedule || null);

  const calOverrides = { ...(existing.calendarDayOverrides || {}) };
  for (const [k, v] of Object.entries(incoming.calendarDayOverrides || {})) {
    if (!calOverrides[k] || (v && (v.updatedAt || 0) >= (calOverrides[k].updatedAt || 0))) {
      calOverrides[k] = v;
    }
  }
  result.calendarDayOverrides = calOverrides;

  const delMap = {};
  for (const [k, v] of Object.entries(existing.deletedStudentIds || {})) delMap[k] = v;
  for (const [k, v] of Object.entries(incoming.deletedStudentIds || {})) {
    if (!delMap[k] || v > delMap[k]) delMap[k] = v;
  }
  // Active approved students must never be deleted
  delete delMap['58'];
  delete delMap['59'];
  result.deletedStudentIds = delMap;

  const nowTs = Date.now();
  const studentMap = new Map();
  (existing.students || []).forEach(s => {
    if (s && s.id != null) {
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
      let curAction = cur._lastCoachActionAt || 0;
      let incAction = inc._lastCoachActionAt || 0;
      let incTime = inc._updatedAt || 0;
      let curTime = cur._updatedAt || 0;
      if (curTime > nowTs + 5000) curTime = nowTs - 10000;

      if (curAction > 0 && incAction < curAction) {
        if (inc.phone && !cur.phone) cur.phone = inc.phone;
        studentMap.set(key, cur);
      } else if (incAction > curAction || (curAction === 0 && incTime >= curTime)) {
        studentMap.set(key, inc);
      } else {
        if (inc.phone && !cur.phone) cur.phone = inc.phone;
      }
    }
  });
  result.students = Array.from(studentMap.values()).filter(s => {
    const delTime = delMap[String(s.id)];
    if (!delTime) return true;
    return (s._updatedAt || 0) > delTime;
  });

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

  const subMap = new Map();
  (existing.pushSubscriptions || []).forEach(s => {
    if (s && s.endpoint) subMap.set(s.endpoint, s);
  });
  (incoming.pushSubscriptions || []).forEach(s => {
    if (s && s.endpoint) subMap.set(s.endpoint, s);
  });
  result.pushSubscriptions = Array.from(subMap.values());

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
    const supaState = await loadSupabaseState('production');
    const localState = loadLocalTmpState();
    const state = supaState && localState
      ? mergeStates(supaState, localState)
      : (supaState || localState || null);

    if (state) {
      saveLocalTmpState(state);
    }

    return res.status(200).json({
      ok: true,
      storage: supaState ? 'supabase' : 'tmp',
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
        saveLocalTmpState(incoming);
        await saveSupabaseState(incoming, 'production');
        return res.status(200).json({
          ok: true,
          storage: 'supabase',
          data: incoming
        });
      }
      const supaExisting = await loadSupabaseState('production');
      const localExisting = loadLocalTmpState();
      const baseExisting = supaExisting && localExisting
        ? mergeStates(supaExisting, localExisting)
        : (supaExisting || localExisting);

      const merged = mergeStates(baseExisting, incoming);
      saveLocalTmpState(merged);
      await saveSupabaseState(merged, 'production');
      return res.status(200).json({
        ok: true,
        storage: 'supabase',
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
