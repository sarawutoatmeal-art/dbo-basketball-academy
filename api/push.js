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

function loadStoredState() {
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

function saveStoredState(state) {
  global.__dboCloudState = state;
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(state), 'utf8');
  } catch (e) {
    console.error('Write tmp state error:', e);
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

  // GET Actions
  if (req.method === 'GET') {
    if (action === 'vapid_key') {
      return res.status(200).json({
        ok: true,
        publicKey: VAPID_PUBLIC_KEY
      });
    }

    if (action === 'status') {
      const state = loadStoredState();
      const subs = state.pushSubscriptions || [];
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
      const state = loadStoredState();
      const subs = state.pushSubscriptions || [];
      const overrides = state.calendarDayOverrides || {};

      // Calculate Bangkok Time (UTC+7)
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

      // Cleanup expired endpoints
      if (deadEndpoints.size > 0) {
        state.pushSubscriptions = subs.filter(s => !deadEndpoints.has(s.endpoint));
        saveStoredState(state);
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

    return res.status(200).json({
      ok: true,
      service: 'DBO Academy Web Push API',
      hasWebPushModule: !!webpush
    });
  }

  // POST Actions
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

        const state = loadStoredState();
        if (!state.pushSubscriptions) state.pushSubscriptions = [];

        const newSub = {
          endpoint: subData.endpoint,
          keys: subData.keys,
          studentId: body.studentId != null ? Number(body.studentId) : null,
          studentName: body.studentName || '',
          phone: body.phone || '',
          role: body.role || 'parent',
          updatedAt: Date.now()
        };

        // Upsert by endpoint
        const idx = state.pushSubscriptions.findIndex(s => s && s.endpoint === subData.endpoint);
        if (idx >= 0) {
          state.pushSubscriptions[idx] = newSub;
        } else {
          state.pushSubscriptions.push(newSub);
        }

        saveStoredState(state);

        // Optionally send confirmation welcome push immediately
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
          message: 'Push subscription saved successfully',
          totalActiveSubscriptions: state.pushSubscriptions.length
        });
      }

      // 2. Send Push Notification (e.g. When coach takes attendance or announces class)
      if (postAction === 'send') {
        const state = loadStoredState();
        const subs = state.pushSubscriptions || [];

        const targetStudentId = body.targetStudentId != null ? Number(body.targetStudentId) : null;
        const targetStudentName = (body.targetStudentName || '').trim();
        const targetRole = body.targetRole || null;
        const targetEndpoint = body.targetEndpoint || null;

        // Support test delay (e.g. 5 seconds to lock screen)
        if (body.delayMs && Number(body.delayMs) > 0) {
          const delay = Math.min(Number(body.delayMs), 7000);
          await new Promise(r => setTimeout(r, delay));
        }

        // Filter subscriptions
        let targets = subs.filter(s => {
          if (!s || !s.endpoint || !s.keys) return false;
          if (targetEndpoint) {
            return s.endpoint === targetEndpoint;
          }
          if (targetStudentId != null) {
            if (s.studentId === targetStudentId) return true;
            if (body.includeCoach && s.role === 'coach') return true;
            return false;
          }
          if (targetStudentName) {
            if (s.studentName && s.studentName.toLowerCase() === targetStudentName.toLowerCase()) return true;
            if (body.includeCoach && s.role === 'coach') return true;
            return false;
          }
          if (targetRole) {
            return s.role === targetRole;
          }
          return true;
        });

        if (targets.length === 0) {
          return res.status(200).json({
            ok: true,
            message: 'No matching subscriptions found for this target',
            sent: 0,
            targetStudentId
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

          // Prune dead endpoints
          if (deadEndpoints.size > 0) {
            state.pushSubscriptions = subs.filter(s => !deadEndpoints.has(s.endpoint));
            saveStoredState(state);
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
