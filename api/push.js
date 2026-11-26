const fs = require('fs');
const path = require('path');
const os = require('os');

let webpush = null;
try {
  webpush = require('web-push');
} catch (e) {
  console.warn('web-push module load note:', e.message);
}

const TMP_FILE = path.join(os.tmpdir(), 'dbo_cloud_state_v17.json');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://igbgetsqqshzhhwnjfgm.supabase.co';
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || 'sb_publishable_8a6VGS9ItL20guHGSdlzEA_QkuuI3iA';
const SERVER_UA = 'DBO-Academy-Server/2.0';

// VAPID keys for DBO Academy Web Push
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BMWzRqf8Egbp6_qBttNc-KkXVst2VHSOUWIOYuvooCQtgquDSXDvka5oiImnUVT2oSpmr3bD5hLc-Mqx6k4-Kmo';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '86x-gN83JMvRbBDp3F9N0BiUPWFZAczQHPJqRuMF22g';
const VAPID_SUBJECT = 'mailto:coach@dbobasketball.com';

if (webpush) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch (err) {
    console.error('setVapidDetails error:', err);
  }
}

function loadLocalTmpState() {
  if (global.__dboCloudState) return global.__dboCloudState;
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
  return { pushSubscriptions: [], students: [], calendarDayOverrides: {} };
}

function saveLocalTmpState(state) {
  global.__dboCloudState = state;
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(state), 'utf8');
  } catch (e) {
    console.error('Write tmp state error:', e);
  }
}

async function fetchSupabaseProductionState() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/dbo_app_state?id=eq.production&select=state`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_API_KEY,
          'Accept': 'application/json',
          'User-Agent': SERVER_UA
        },
        signal: AbortSignal.timeout(4000)
      }
    );
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0].state) {
        return rows[0].state;
      }
    }
  } catch (e) {
    console.warn('Supabase state fetch note:', e.message);
  }
  return loadLocalTmpState();
}

async function fetchCloudSubscriptions() {
  const local = loadLocalTmpState();
  const subMap = new Map();

  (Array.isArray(local.pushSubscriptions) ? local.pushSubscriptions : []).forEach(s => {
    if (s && s.endpoint && s.keys) subMap.set(s.endpoint, s);
  });

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/dbo_push_subscriptions?select=endpoint,keys,student_id,student_name,phone,role,updated_at`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_API_KEY,
          'Accept': 'application/json',
          'User-Agent': SERVER_UA
        },
        signal: AbortSignal.timeout(4000)
      }
    );
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows)) {
        rows.forEach(r => {
          if (r && r.endpoint && r.keys) {
            const mapped = {
              endpoint: r.endpoint,
              keys: r.keys,
              studentId: r.student_id != null ? Number(r.student_id) : null,
              studentName: r.student_name || '',
              phone: r.phone || '',
              role: r.role || 'parent',
              updatedAt: Number(r.updated_at || 0)
            };
            const existing = subMap.get(r.endpoint);
            if (!existing || mapped.updatedAt >= (existing.updatedAt || 0)) {
              subMap.set(r.endpoint, mapped);
            }
          }
        });
      }
    }
  } catch (e) {
    console.warn('Fetch Supabase push subscriptions fallback to local:', e.message);
  }

  const subs = Array.from(subMap.values());
  local.pushSubscriptions = subs;
  saveLocalTmpState(local);
  return subs;
}

async function persistCloudSubscriptions(subs, deadEndpointsToDelete = []) {
  const local = loadLocalTmpState();
  local.pushSubscriptions = subs;
  saveLocalTmpState(local);

  for (const deadEp of deadEndpointsToDelete) {
    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/dbo_push_subscriptions?endpoint=eq.${encodeURIComponent(deadEp)}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_API_KEY,
            'User-Agent': SERVER_UA
          },
          signal: AbortSignal.timeout(3000)
        }
      );
    } catch (e) {}
  }

  if (Array.isArray(subs) && subs.length > 0) {
    try {
      const rows = subs
        .filter(s => s && s.endpoint && s.keys)
        .map(s => ({
          endpoint: String(s.endpoint),
          keys: s.keys,
          student_id: s.studentId != null ? Number(s.studentId) : null,
          student_name: String(s.studentName || ''),
          phone: String(s.phone || ''),
          role: String(s.role || 'parent'),
          updated_at: Number(s.updatedAt || Date.now())
        }));

      await fetch(`${SUPABASE_URL}/rest/v1/dbo_push_subscriptions?on_conflict=endpoint`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_API_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal',
          'User-Agent': SERVER_UA
        },
        body: JSON.stringify(rows),
        signal: AbortSignal.timeout(4500)
      });
    } catch (e) {
      console.warn('Persist Supabase push subscriptions note:', e.message);
    }
  }
}

function getBangkokDateInfo() {
  const nowBkk = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
  const dayW = nowBkk.getDay();
  const y = nowBkk.getFullYear();
  const m = String(nowBkk.getMonth() + 1).padStart(2, '0');
  const d = String(nowBkk.getDate()).padStart(2, '0');
  const todayKey = `${y}-${m}-${d}`;
  const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const thaiShortToday = `${nowBkk.getDate()} ${thaiMonthsShort[nowBkk.getMonth()]} ${String(y + 543).slice(-2)}`;
  return { nowBkk, dayW, todayKey, thaiShortToday };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const action = query.action;

  if (req.method === 'GET') {
    if (action === 'vapid_key') {
      return res.status(200).json({
        ok: true,
        publicKey: VAPID_PUBLIC_KEY
      });
    }

    if (action === 'status') {
      const subs = await fetchCloudSubscriptions();
      return res.status(200).json({
        ok: true,
        storage: 'supabase',
        activeSubscriptionsCount: subs.length,
        subscriptions: subs.map(s => ({
          studentId: s.studentId,
          studentName: s.studentName,
          phone: s.phone ? s.phone.slice(0, 3) + '****' + s.phone.slice(-3) : '',
          role: s.role,
          updatedAt: s.updatedAt,
          endpointDomain: (s.endpoint || '').split('/')[2] || 'unknown'
        }))
      });
    }

    // 1. Cron Trigger: Morning 10:00 AM Bangkok class alert + monthly cutoff alert
    if (action === 'cron_morning') {
      const [subs, prodState] = await Promise.all([
        fetchCloudSubscriptions(),
        fetchSupabaseProductionState()
      ]);
      const overrides = (prodState && prodState.calendarDayOverrides) || {};
      const students = (prodState && Array.isArray(prodState.students)) ? prodState.students : [];
      const { dayW, todayKey, thaiShortToday } = getBangkokDateInfo();

      const override = overrides[todayKey];
      const isCanceled = (override && override.status === 'canceled');
      const isClassDay = (dayW === 1 || dayW === 2 || dayW === 4 || dayW === 6) ||
        (override && (override.status === 'normal' || override.status === 'special'));

      let sentCount = 0;
      let failCount = 0;
      let monthlySentCount = 0;
      const deadEndpoints = new Set();

      const monthlyDueMap = new Map();
      students.forEach(st => {
        if (st && st.courseType === 'monthly' && st.nextRenewal && st.nextRenewal !== '-') {
          if (st.nextRenewal.trim() === thaiShortToday || st.nextRenewal.trim() === todayKey) {
            monthlyDueMap.set(Number(st.id), st);
          }
        }
      });

      for (const sub of subs) {
        if (!sub || !sub.endpoint || !sub.keys) continue;
        const sName = sub.studentName ? `น้อง ${sub.studentName}` : 'นักเรียน';

        if (isClassDay || isCanceled) {
          let title = '🏀 วันนี้มีเรียนบาสเกตบอล DBO';
          let body = '';

          if (isCanceled) {
            title = '⚠️ วันนี้งดคลาสเรียน DBO Academy';
            body = `แจ้งเตือนผู้ปกครอง ${sName}: วันนี้งดคลาสการฝึกซ้อม (${override.reason || 'พักฟื้นร่างกายหรือติดภารกิจ'}) ขออภัยในความไม่สะดวกครับ`;
          } else {
            const timeStr = dayW === 6 ? '16:00 - 17:30 น.' : '17:30 - 19:30 น.';
            body = `วันนี้เป็นวันเรียนของอคาเดมี่ของ ${sName} เริ่มเรียนเวลา ${timeStr} ณ ยิมเตชะวิทย์`;
          }

          const payload = JSON.stringify({
            title,
            body,
            icon: 'assets/images/app-icon-192.png',
            badge: 'assets/images/favicon.png',
            tag: `dbo-morning-${todayKey}`,
            vibrate: [300, 100, 300, 100, 300],
            data: { url: 'https://dbobasketball.vercel.app/' }
          });

          if (webpush) {
            try {
              await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
              sentCount++;
            } catch (err) {
              failCount++;
              if (err.statusCode === 410 || err.statusCode === 404) {
                deadEndpoints.add(sub.endpoint);
              }
            }
          }
        }

        if (monthlyDueMap.size > 0 && webpush && !deadEndpoints.has(sub.endpoint)) {
          const matchedMonthlyStudent = (sub.studentId != null && monthlyDueMap.has(Number(sub.studentId)))
            ? monthlyDueMap.get(Number(sub.studentId))
            : null;

          if (matchedMonthlyStudent) {
            const mPayload = JSON.stringify({
              title: '🔔 ครบกำหนดวันตัดรอบคอร์สรายเดือน DBO',
              body: `แจ้งเตือนผู้ปกครองน้อง ${matchedMonthlyStudent.name}: ครบกำหนดตัดรอบรายเดือน (${matchedMonthlyStudent.nextRenewal}) แล้ว กรุณาสมัคร/ต่อคอร์สรายเดือนรอบใหม่ครับ`,
              icon: 'assets/images/app-icon-192.png',
              badge: 'assets/images/favicon.png',
              tag: `dbo-monthly-cutoff-${matchedMonthlyStudent.id}-${todayKey}`,
              vibrate: [300, 100, 300],
              data: { url: 'https://dbobasketball.vercel.app/' }
            });
            try {
              await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, mPayload);
              monthlySentCount++;
            } catch (e) {}
          }
        }
      }

      if (deadEndpoints.size > 0) {
        const cleaned = subs.filter(s => !deadEndpoints.has(s.endpoint));
        await persistCloudSubscriptions(cleaned, Array.from(deadEndpoints));
      }

      return res.status(200).json({
        ok: true,
        message: 'Morning 10:00 AM cron executed via Supabase',
        date: todayKey,
        isClassDay,
        isCanceled,
        sent: sentCount,
        monthlyAlertsSent: monthlySentCount,
        failed: failCount
      });
    }

    // 2. Cron Trigger: Class Reminder 30 mins before start (17:00 Weekday / 15:30 Saturday)
    if (action === 'cron_reminder_30m') {
      const [subs, prodState] = await Promise.all([
        fetchCloudSubscriptions(),
        fetchSupabaseProductionState()
      ]);
      const overrides = (prodState && prodState.calendarDayOverrides) || {};
      const { dayW, todayKey } = getBangkokDateInfo();

      const override = overrides[todayKey];
      if (override && override.status === 'canceled') {
        return res.status(200).json({ ok: true, message: 'Class canceled today, no 30m reminder sent.', date: todayKey });
      }

      const isSaturday = (dayW === 6);
      const startTime = isSaturday ? '16:00 น.' : '17:30 น.';
      const title = '⏰ Class starts in 30 mins';

      let sentCount = 0;
      const deadEndpoints = new Set();
      for (const sub of subs) {
        if (!sub || !sub.endpoint || !sub.keys) continue;
        const sName = sub.studentName ? `น้อง ${sub.studentName}` : 'นักเรียน';
        const body = `คลาสกำลังจะเริ่มในอีก 30 นาที (${startTime}) • กรุณาเตรียมตัว${sName}ให้พร้อมฝึกซ้อม ณ ยิมเตชะวิทย์ครับ`;

        const payload = JSON.stringify({
          title,
          body,
          icon: 'assets/images/app-icon-192.png',
          badge: 'assets/images/favicon.png',
          tag: `dbo-rem30-${todayKey}`,
          vibrate: [300, 100, 300, 100, 300],
          data: { url: 'https://dbobasketball.vercel.app/' }
        });

        if (webpush) {
          try {
            await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
            sentCount++;
          } catch (err) {
            if (err.statusCode === 410 || err.statusCode === 404) deadEndpoints.add(sub.endpoint);
          }
        }
      }

      if (deadEndpoints.size > 0) {
        const cleaned = subs.filter(s => !deadEndpoints.has(s.endpoint));
        await persistCloudSubscriptions(cleaned, Array.from(deadEndpoints));
      }

      return res.status(200).json({ ok: true, message: 'Reminder 30m executed', date: todayKey, sent: sentCount });
    }

    // 3. Cron Trigger: Class Reminder 15 mins before start (17:15 Weekday / 15:45 Saturday)
    if (action === 'cron_reminder_15m') {
      const [subs, prodState] = await Promise.all([
        fetchCloudSubscriptions(),
        fetchSupabaseProductionState()
      ]);
      const overrides = (prodState && prodState.calendarDayOverrides) || {};
      const { dayW, todayKey } = getBangkokDateInfo();

      const override = overrides[todayKey];
      if (override && override.status === 'canceled') {
        return res.status(200).json({ ok: true, message: 'Class canceled today, no 15m reminder sent.', date: todayKey });
      }

      const isSaturday = (dayW === 6);
      const startTime = isSaturday ? '16:00 น.' : '17:30 น.';
      const title = '⏰ Class starts in 15 mins';

      let sentCount = 0;
      const deadEndpoints = new Set();
      for (const sub of subs) {
        if (!sub || !sub.endpoint || !sub.keys) continue;
        const sName = sub.studentName ? `น้อง ${sub.studentName}` : 'นักเรียน';
        const body = `อีก 15 นาทีจะเริ่มคลาสบาสเกตบอล (${startTime}) • ${sName} เตรียมอบอุ่นร่างกายและลงสนามฝึกซ้อมครับ`;

        const payload = JSON.stringify({
          title,
          body,
          icon: 'assets/images/app-icon-192.png',
          badge: 'assets/images/favicon.png',
          tag: `dbo-rem15-${todayKey}`,
          vibrate: [300, 100, 300, 100, 300],
          data: { url: 'https://dbobasketball.vercel.app/' }
        });

        if (webpush) {
          try {
            await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
            sentCount++;
          } catch (err) {
            if (err.statusCode === 410 || err.statusCode === 404) deadEndpoints.add(sub.endpoint);
          }
        }
      }

      if (deadEndpoints.size > 0) {
        const cleaned = subs.filter(s => !deadEndpoints.has(s.endpoint));
        await persistCloudSubscriptions(cleaned, Array.from(deadEndpoints));
      }

      return res.status(200).json({ ok: true, message: 'Reminder 15m executed', date: todayKey, sent: sentCount });
    }

    // 4. Cron Trigger: Class Ends in 15 mins (19:15 Weekday / 17:15 Saturday)
    if (action === 'cron_end_15m') {
      const [subs, prodState] = await Promise.all([
        fetchCloudSubscriptions(),
        fetchSupabaseProductionState()
      ]);
      const overrides = (prodState && prodState.calendarDayOverrides) || {};
      const { dayW, todayKey } = getBangkokDateInfo();

      const override = overrides[todayKey];
      if (override && override.status === 'canceled') {
        return res.status(200).json({ ok: true, message: 'Class canceled today, no end-15m reminder sent.', date: todayKey });
      }

      const isSaturday = (dayW === 6);
      const endTime = isSaturday ? '17:30 น.' : '19:30 น.';
      const title = '🏁 Class ends in 15 mins';

      let sentCount = 0;
      const deadEndpoints = new Set();
      for (const sub of subs) {
        if (!sub || !sub.endpoint || !sub.keys) continue;
        const sName = sub.studentName ? `น้อง ${sub.studentName}` : 'นักเรียน';
        const body = `อีก 15 นาทีจะเลิกคลาส (${endTime}) • ผู้ปกครองสามารถเตรียมมารับ${sName}ได้ที่ยิมเตชะวิทย์ครับ`;

        const payload = JSON.stringify({
          title,
          body,
          icon: 'assets/images/app-icon-192.png',
          badge: 'assets/images/favicon.png',
          tag: `dbo-end15-${todayKey}`,
          vibrate: [300, 100, 300, 100, 300],
          data: { url: 'https://dbobasketball.vercel.app/' }
        });

        if (webpush) {
          try {
            await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
            sentCount++;
          } catch (err) {
            if (err.statusCode === 410 || err.statusCode === 404) deadEndpoints.add(sub.endpoint);
          }
        }
      }

      if (deadEndpoints.size > 0) {
        const cleaned = subs.filter(s => !deadEndpoints.has(s.endpoint));
        await persistCloudSubscriptions(cleaned, Array.from(deadEndpoints));
      }

      return res.status(200).json({ ok: true, message: 'End 15m reminder executed', date: todayKey, sent: sentCount });
    }

    return res.status(200).json({
      ok: true,
      service: 'DBO Academy Web Push API v3 (Supabase + Exact-Time pg_cron)',
      storage: 'supabase',
      hasWebPushModule: !!webpush
    });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const postAction = body.action;

      if (postAction === 'subscribe') {
        const subData = body.subscription;
        if (!subData || !subData.endpoint || !subData.keys) {
          return res.status(400).json({ ok: false, error: 'Invalid subscription object' });
        }

        const subs = await fetchCloudSubscriptions();
        const newSub = {
          endpoint: subData.endpoint,
          keys: subData.keys,
          studentId: body.studentId != null ? Number(body.studentId) : null,
          studentName: (body.studentName || '').trim(),
          phone: body.phone || '',
          role: body.role || 'parent',
          updatedAt: Date.now()
        };

        const idx = subs.findIndex(s => s && s.endpoint === subData.endpoint);
        if (idx >= 0) {
          subs[idx] = {
            ...subs[idx],
            ...newSub,
            studentId: newSub.studentId != null ? newSub.studentId : subs[idx].studentId,
            studentName: newSub.studentName || subs[idx].studentName,
            phone: newSub.phone || subs[idx].phone,
            role: newSub.role || subs[idx].role
          };
        } else {
          subs.push(newSub);
        }

        await persistCloudSubscriptions(subs);

        if (webpush && body.sendWelcome !== false) {
          try {
            const welcomePayload = JSON.stringify({
              title: '🏀 DBO Basketball Academy',
              body: body.studentName
                ? `เปิดการแจ้งเตือนสำเร็จ: ระบบจะแจ้งเตือนผู้ปกครองน้อง ${body.studentName} ทุกครั้งที่โค้ชเช็คชื่อและแจ้งเตือนคลาสเรียนตรงเวลาผ่าน Supabase`
                : 'เปิดการแจ้งเตือนบนมือถือสำเร็จ: ระบบจะส่งข้อความแจ้งเตือนเมื่อโค้ชเช็คชื่อและแจ้งเตือนคลาสเรียนตรงเวลาผ่าน Supabase',
              icon: 'assets/images/app-icon-192.png',
              badge: 'assets/images/favicon.png',
              tag: 'dbo-welcome',
              vibrate: [200, 100, 200],
              data: { url: 'https://dbobasketball.vercel.app/' }
            });
            await webpush.sendNotification({
              endpoint: subData.endpoint,
              keys: subData.keys
            }, welcomePayload);
          } catch (e) {
            console.warn('Welcome push delivery note:', e.message);
          }
        }

        return res.status(200).json({
          ok: true,
          storage: 'supabase',
          message: 'Push subscription saved to Supabase dbo_push_subscriptions successfully',
          totalActiveSubscriptions: subs.length
        });
      }

      if (postAction === 'send') {
        let subs = await fetchCloudSubscriptions();

        if (Array.isArray(body.clientSubscriptions) && body.clientSubscriptions.length > 0) {
          const map = new Map();
          subs.forEach(s => { if (s && s.endpoint) map.set(s.endpoint, s); });
          let addedNew = false;
          body.clientSubscriptions.forEach(s => {
            if (s && s.endpoint && s.keys) {
              const existing = map.get(s.endpoint);
              if (!existing) {
                map.set(s.endpoint, s);
                addedNew = true;
              } else {
                map.set(s.endpoint, {
                  ...existing,
                  ...s,
                  studentId: s.studentId != null ? s.studentId : existing.studentId,
                  studentName: s.studentName || existing.studentName
                });
              }
            }
          });
          subs = Array.from(map.values());
          if (addedNew) {
            persistCloudSubscriptions(subs);
          }
        }

        const targetStudentId = body.targetStudentId != null ? Number(body.targetStudentId) : null;
        const targetStudentName = (body.targetStudentName || '').trim().toLowerCase();
        const targetRole = body.targetRole || null;
        const targetEndpoint = body.targetEndpoint || null;

        if (body.delayMs && Number(body.delayMs) > 0) {
          const delay = Math.min(Number(body.delayMs), 7000);
          await new Promise(r => setTimeout(r, delay));
        }

        let targets = subs.filter(s => {
          if (!s || !s.endpoint || !s.keys) return false;
          if (targetEndpoint) {
            return s.endpoint === targetEndpoint;
          }
          if (targetStudentId != null || targetStudentName) {
            if (targetStudentId != null && s.studentId === targetStudentId) return true;
            if (targetStudentName && s.studentName && s.studentName.toLowerCase().includes(targetStudentName)) return true;
            if (s.role === 'coach') return true;
            if (!s.studentId && subs.length <= 5) return true;
            return false;
          }
          if (targetRole) {
            return s.role === targetRole || s.role === 'coach';
          }
          return true;
        });

        if (targets.length === 0) {
          return res.status(200).json({
            ok: true,
            storage: 'supabase',
            message: 'No matching subscriptions found for this target',
            sent: 0,
            totalSubscribersInStore: subs.length,
            targetStudentId,
            targetStudentName
          });
        }

        const pushPayload = JSON.stringify({
          title: body.title || '🏀 DBO Basketball Academy',
          body: body.body || 'มีการแจ้งเตือนใหม่จาก DBO Academy',
          icon: body.icon || 'assets/images/app-icon-192.png',
          badge: body.badge || 'assets/images/favicon.png',
          tag: body.tag || ('dbo-alert-' + Date.now()),
          vibrate: [300, 100, 300, 100, 300],
          data: body.data || { url: 'https://dbobasketball.vercel.app/' }
        });

        let sentCount = 0;
        let failCount = 0;
        const deadEndpoints = new Set();

        if (webpush) {
          await Promise.all(targets.map(async (sub) => {
            try {
              await webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: sub.keys
              }, pushPayload);
              sentCount++;
            } catch (err) {
              failCount++;
              if (err.statusCode === 410 || err.statusCode === 404) {
                deadEndpoints.add(sub.endpoint);
              }
            }
          }));

          if (deadEndpoints.size > 0) {
            const alive = subs.filter(s => !deadEndpoints.has(s.endpoint));
            await persistCloudSubscriptions(alive, Array.from(deadEndpoints));
          }
        }

        return res.status(200).json({
          ok: true,
          storage: 'supabase',
          sent: sentCount,
          failed: failCount,
          totalTargets: targets.length
        });
      }

      return res.status(400).json({ ok: false, error: 'Unknown action' });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
};
