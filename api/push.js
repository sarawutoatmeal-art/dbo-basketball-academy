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
const CLOUD_OBJECT_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1d86cdcf2265e';

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

// Durable Cloud Storage Fetch
async function fetchCloudSubscriptions() {
  const local = loadLocalTmpState();
  let subs = Array.isArray(local.pushSubscriptions) ? local.pushSubscriptions : [];

  try {
    const res = await fetch(CLOUD_OBJECT_URL, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.subscriptions)) {
        const subMap = new Map();
        json.data.subscriptions.forEach(s => {
          if (s && s.endpoint) subMap.set(s.endpoint, s);
        });
        subs.forEach(s => {
          if (s && s.endpoint) {
            const existing = subMap.get(s.endpoint);
            if (!existing || (s.updatedAt || 0) >= (existing.updatedAt || 0)) {
              subMap.set(s.endpoint, s);
            }
          }
        });
        subs = Array.from(subMap.values());
        local.pushSubscriptions = subs;
        saveLocalTmpState(local);
      }
    }
  } catch (e) {
    console.warn('Fetch cloud subs fallback to local:', e.message);
  }
  return subs;
}

// Durable Cloud Storage Persist
async function persistCloudSubscriptions(subs) {
  const local = loadLocalTmpState();
  local.pushSubscriptions = subs;
  saveLocalTmpState(local);

  try {
    await fetch(CLOUD_OBJECT_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'dbo_push_subs',
        data: { subscriptions: subs, updatedAt: Date.now() }
      }),
      signal: AbortSignal.timeout(3500)
    });
  } catch (e) {
    console.warn('Persist cloud subs note:', e.message);
  }
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

  // ==========================================
  // GET Actions
  // ==========================================
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

    // Cron Trigger: Morning 10:00 AM class alert
    if (action === 'cron_morning') {
      const subs = await fetchCloudSubscriptions();
      const local = loadLocalTmpState();
      const overrides = local.calendarDayOverrides || {};

      const nowBkk = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
      const dayW = nowBkk.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
      const y = nowBkk.getFullYear();
      const m = String(nowBkk.getMonth() + 1).padStart(2, '0');
      const d = String(nowBkk.getDate()).padStart(2, '0');
      const todayKey = `${y}-${m}-${d}`;

      const override = overrides[todayKey];
      const isCanceled = (override && override.status === 'canceled');
      const isClassDay = (dayW === 1 || dayW === 2 || dayW === 4 || dayW === 6) || (override && override.status === 'normal');

      if (!isClassDay && !isCanceled) {
        return res.status(200).json({
          ok: true,
          message: 'Today is not a class day, no morning notifications sent.',
          date: todayKey
        });
      }

      let sentCount = 0;
      let failCount = 0;
      const deadEndpoints = new Set();

      for (const sub of subs) {
        if (!sub || !sub.endpoint || !sub.keys) continue;
        const sName = sub.studentName ? `น้อง ${sub.studentName}` : 'นักเรียน';

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
            await webpush.sendNotification({
              endpoint: sub.endpoint,
              keys: sub.keys
            }, payload);
            sentCount++;
          } catch (err) {
            failCount++;
            if (err.statusCode === 410 || err.statusCode === 404) {
              deadEndpoints.add(sub.endpoint);
            }
          }
        }
      }

      if (deadEndpoints.size > 0) {
        const cleaned = subs.filter(s => !deadEndpoints.has(s.endpoint));
        await persistCloudSubscriptions(cleaned);
      }

      return res.status(200).json({
        ok: true,
        message: 'Morning class cron executed',
        date: todayKey,
        isCanceled,
        sent: sentCount,
        failed: failCount
      });
    }

    // Cron Trigger: Class Reminder 30 mins before start
    if (action === 'cron_reminder_30m') {
      const subs = await fetchCloudSubscriptions();
      const local = loadLocalTmpState();
      const overrides = local.calendarDayOverrides || {};

      const nowBkk = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
      const dayW = nowBkk.getDay();
      const y = nowBkk.getFullYear();
      const m = String(nowBkk.getMonth() + 1).padStart(2, '0');
      const d = String(nowBkk.getDate()).padStart(2, '0');
      const todayKey = `${y}-${m}-${d}`;

      const override = overrides[todayKey];
      if (override && override.status === 'canceled') {
        return res.status(200).json({ ok: true, message: 'Class canceled today, no reminder sent.' });
      }

      const isSaturday = (dayW === 6);
      const startTime = isSaturday ? '16:00 น.' : '17:30 น.';
      const title = '⏰ Class starts in 30 mins';
      
      let sentCount = 0;
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
          } catch (e) {}
        }
      }

      return res.status(200).json({ ok: true, message: 'Reminder 30m executed', sent: sentCount });
    }

    return res.status(200).json({
      ok: true,
      service: 'DBO Academy Web Push API v2 (Durable Cloud Store)',
      hasWebPushModule: !!webpush
    });
  }

  // ==========================================
  // POST Actions
  // ==========================================
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const postAction = body.action;

      // 1. Subscribe Device
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

        // Confirmation push upon registration
        if (webpush && body.sendWelcome !== false) {
          try {
            const welcomePayload = JSON.stringify({
              title: '🏀 DBO Basketball Academy',
              body: body.studentName 
                ? `เปิดการแจ้งเตือนสำเร็จ: ระบบจะแจ้งเตือนผู้ปกครองน้อง ${body.studentName} ทุกครั้งที่โค้ชเช็คชื่อและแจ้งเตือนคลาสเรียนเรียลไทม์`
                : 'เปิดการแจ้งเตือนบนมือถือสำเร็จ: ระบบจะส่งข้อความแจ้งเตือนเมื่อโค้ชเช็คชื่อและแจ้งเตือนคลาสเรียนเรียลไทม์',
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
          message: 'Push subscription saved to durable cloud store successfully',
          totalActiveSubscriptions: subs.length
        });
      }

      // 2. Send Real Cloud Push Notification (Attendance Check-in, Leave, Class Alerts)
      if (postAction === 'send') {
        let subs = await fetchCloudSubscriptions();

        // Merge client passed subscriptions for maximum redundancy
        if (Array.isArray(body.clientSubscriptions) && body.clientSubscriptions.length > 0) {
          const map = new Map();
          subs.forEach(s => { if (s && s.endpoint) map.set(s.endpoint, s); });
          body.clientSubscriptions.forEach(s => {
            if (s && s.endpoint && s.keys) {
              const existing = map.get(s.endpoint);
              if (!existing) {
                map.set(s.endpoint, s);
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
        }

        const targetStudentId = body.targetStudentId != null ? Number(body.targetStudentId) : null;
        const targetStudentName = (body.targetStudentName || '').trim().toLowerCase();
        const targetRole = body.targetRole || null;
        const targetEndpoint = body.targetEndpoint || null;

        // Support test countdown delay
        if (body.delayMs && Number(body.delayMs) > 0) {
          const delay = Math.min(Number(body.delayMs), 7000);
          await new Promise(r => setTimeout(r, delay));
        }

        // Multi-level subscription targeting
        let targets = subs.filter(s => {
          if (!s || !s.endpoint || !s.keys) return false;
          if (targetEndpoint) {
            return s.endpoint === targetEndpoint;
          }
          if (targetStudentId != null || targetStudentName) {
            // 1. Target exact student ID
            if (targetStudentId != null && s.studentId === targetStudentId) return true;
            // 2. Target student name substring match
            if (targetStudentName && s.studentName && s.studentName.toLowerCase().includes(targetStudentName)) return true;
            // 3. ALWAYS include coaches so coaching devices hear the alert
            if (s.role === 'coach') return true;
            // 4. In testing mode or small subscriber pool, include unassigned devices
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

          // Prune dead endpoints from durable cloud store
          if (deadEndpoints.size > 0) {
            const alive = subs.filter(s => !deadEndpoints.has(s.endpoint));
            persistCloudSubscriptions(alive);
          }
        }

        return res.status(200).json({
          ok: true,
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
