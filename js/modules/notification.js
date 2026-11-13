// ========================================================
// DBO Basketball Academy - Notification Engine
// (Audio Chime, Lockscreen Banners, Native Web Notifications, Class Timers)
// ========================================================

let telegramToastTimer = null;
let lockScreenDismissTimer = null;

// Crisp Audio Chime using Web Audio API (Zero external MP3 dependencies)
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    
    // Tone 1: High bell chime (A5 - 880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: Crisp harmonic chime (E6 - 1318.5Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.5, now + 0.08);
    gain2.gain.setValueAtTime(0.3, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.5);

    // Mobile Vibration Haptic Feedback
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([120, 60, 120]);
      } catch (e) {}
    }
  } catch (err) {
    console.warn('Audio chime skipped:', err);
  }
}

// Update Notification UI Status Badge
function updateNotificationPermissionUI() {
  const badge = document.getElementById('pushStatusBadge');
  const btn = document.getElementById('btnEnableNotifications');
  const coachBtn = document.getElementById('staffNotificationBtn');
  const coachTxt = document.getElementById('staffNotificationText');

  if (!('Notification' in window)) {
    if (badge) {
      badge.innerText = 'ระบบในแอปพร้อมใช้งาน';
      badge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-300';
    }
    if (btn) {
      btn.innerHTML = '<i data-lucide="bell-ring" class="w-3.5 h-3.5 text-emerald-600"></i><span>เปิดรับแจ้งเตือนในแอปแล้ว</span>';
      btn.className = 'btn-touch px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 flex-shrink-0 cursor-default shadow-2xs';
      btn.onclick = null;
    }
    return;
  }

  if (Notification.permission === 'granted') {
    if (badge) {
      badge.innerText = 'เปิดใช้งานแล้ว';
      badge.className = 'text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1';
    }
    if (btn) {
      btn.innerHTML = '<i data-lucide="bell-ring" class="w-3.5 h-3.5 text-emerald-600"></i><span>เปิดรับการแจ้งเตือนแล้ว</span>';
      btn.className = 'btn-touch px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 flex-shrink-0 cursor-default shadow-2xs';
      btn.onclick = null;
    }
    if (coachBtn && coachTxt) {
      coachBtn.className = 'px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 cursor-default';
      coachBtn.innerHTML = '<i data-lucide="bell-ring" class="w-3 h-3 text-emerald-400"></i><span>รับแจ้งเตือนเมื่อ ผปค. แจ้งเข้าเรียน/ลา (เปิดแล้ว)</span>';
      coachBtn.onclick = null;
    }
  } else if (Notification.permission === 'denied') {
    if (badge) {
      badge.innerText = 'ถูกปิดกั้นในเบราว์เซอร์';
      badge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-300';
    }
    if (btn) {
      btn.innerHTML = '<i data-lucide="settings" class="w-3.5 h-3.5"></i><span>ตั้งค่าอนุญาตแจ้งเตือน</span>';
      btn.className = 'btn-touch px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 flex-shrink-0 cursor-pointer';
      btn.onclick = () => {
        showToast('กรุณาเปิดสิทธิ์การแจ้งเตือนในการตั้งค่าเบราว์เซอร์ของคุณ');
      };
    }
    if (coachBtn && coachTxt) {
      coachBtn.className = 'px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1.5 cursor-pointer';
      coachBtn.innerHTML = '<i data-lucide="bell-off" class="w-3 h-3 text-rose-400"></i><span>การแจ้งเตือนถูกปิดกั้น (คลิกเพื่อดูวิธีเปิด)</span>';
      coachBtn.onclick = () => showToast('กรุณาเปิดสิทธิ์การแจ้งเตือนในการตั้งค่าเบราว์เซอร์ของคุณ');
    }
  } else {
    if (badge) {
      badge.innerText = 'ยังไม่เปิดใช้งาน';
      badge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300';
    }
    if (btn) {
      btn.innerHTML = '<i data-lucide="bell" class="w-3.5 h-3.5"></i><span>เปิดแจ้งเตือนบนมือถือ</span>';
      btn.className = 'btn-touch px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-xs cursor-pointer';
      btn.onclick = requestNotificationPermission;
    }
    if (coachBtn && coachTxt) {
      coachBtn.className = 'px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 flex items-center gap-1.5 hover:bg-indigo-500/50 transition cursor-pointer';
      coachBtn.innerHTML = '<i data-lucide="bell" class="w-3 h-3 text-emerald-400"></i><span>เปิดรับแจ้งเตือนเมื่อ ผปค. แจ้งเข้าเรียน/ลา</span>';
      coachBtn.onclick = requestNotificationPermission;
    }
  }
  lucide.createIcons();
}

// Request Notification Permission
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    // For iOS Safari or unsupported, show in-app simulation test directly
    testRealPushNotification('checkin');
    showToast('เปิดระบบแจ้งเตือนแบบ In-App เรียบร้อย');
    return true;
  }
  try {
    const permission = await Notification.requestPermission();
    updateNotificationPermissionUI();
    if (permission === 'granted') {
      playNotificationChime();
      showToast('🔔 เปิดการแจ้งเตือนบนอุปกรณ์เรียบร้อยแล้ว');

      const childName = (loggedInStudent && loggedInStudent.name) ? loggedInStudent.name : '';
      const isCoach = (isCoachAuth && currentStaff);
      const welcomeTitle = '🏀 DBO Basketball Academy';
      let welcomeBody = '';

      if (isCoach) {
        welcomeBody = 'เปิดรับการแจ้งเตือนโค้ชเรียบร้อยแล้ว: ระบบจะเด้งข้อความแจ้งเตือนทันทีเมื่อมีผู้ปกครองแจ้งเข้าเรียนหรือขอลาหยุด';
      } else if (childName) {
        welcomeBody = `เปิดการแจ้งเตือนเรียบร้อยแล้ว: ระบบจะแจ้งเตือนเมื่อโค้ชเช็คชื่อน้อง ${childName} และแจ้งเตือนคลาสเรียนแบบเรียลไทม์`;
      } else {
        welcomeBody = 'เปิดการแจ้งเตือนเรียบร้อยแล้ว: ระบบจะส่งข้อความแจ้งเตือนเมื่อโค้ชเช็คชื่อและแจ้งเตือนคลาสเรียนแบบเรียลไทม์';
      }

      sendSystemNotification(welcomeTitle, {
        body: welcomeBody,
        subtitle: 'from DBO Academy',
        icon: 'assets/images/app-icon-192.png',
        tag: 'dbo-welcome-' + Date.now()
      });
      triggerTelegramPush(welcomeBody, '🔔 เปิดการแจ้งเตือนสำเร็จ');
      return true;
    } else {
      showToast('คุณยังไม่ได้เปิดการแจ้งเตือน สามารถเปิดได้ที่การตั้งค่าเว็บ');
      return false;
    }
  } catch (e) {
    console.error(e);
    testRealPushNotification('checkin');
    return false;
  }
}

// Send System Notification (Browser & PWA Level)
function sendSystemNotification(title, options = {}) {
  playNotificationChime();

  const defaultOptions = {
    icon: 'assets/images/app-icon-192.png',
    badge: 'assets/images/app-icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'dbo-alert-' + Date.now(),
    renotify: true,
    ...options
  };

  // Always show Lockscreen Simulation Banner so all mobile/desktop devices display it visually
  showLockScreenBannerSim(title, options.subtitle || 'from DBO Academy', options.body || '');

  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    let handledBySW = false;

    // 1. Post to active Service Worker controller
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: title,
          options: defaultOptions
        });
        handledBySW = true;
      } catch (e) {
        console.log('SW postMessage error:', e);
      }
    }

    // 2. Direct Service Worker Registration showNotification (Primary on Android Chrome & PWA)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && typeof reg.showNotification === 'function') {
          reg.showNotification(title, defaultOptions).catch(() => {});
          handledBySW = true;
        } else if (!handledBySW) {
          try { new Notification(title, defaultOptions); } catch (e) {}
        }
      }).catch(() => {
        if (!handledBySW) {
          try { new Notification(title, defaultOptions); } catch (e) {}
        }
      });
    } else if (!handledBySW) {
      try {
        new Notification(title, defaultOptions);
      } catch (e) {
        console.log('Notification constructor error:', e);
      }
    }
  }
}

function showLockScreenBannerSim(title, subtitle, body) {
  const titleEl = document.getElementById('lockScreenTitle');
  const subEl = document.getElementById('lockScreenSubtitle');
  const bodyEl = document.getElementById('lockScreenBody');
  const banner = document.getElementById('lockScreenNotificationBanner');

  if (titleEl) titleEl.innerText = title || 'Class starts in 15 mins';
  if (subEl) subEl.innerText = subtitle || 'from DBO Academy';
  if (bodyEl) bodyEl.innerText = body || '';

  if (banner) {
    banner.classList.remove('hidden');
    void banner.offsetWidth; // Force reflow
    banner.classList.remove('-translate-y-4', 'opacity-0');
    banner.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(lockScreenDismissTimer);
    lockScreenDismissTimer = setTimeout(() => {
      dismissLockScreenBanner();
    }, 8000);
  }
}

// Lockscreen Notification Banner Simulation
function sendSystemLockscreenNotification({ title, subtitle, body, tag, icon }) {
  sendSystemNotification(title, {
    subtitle: subtitle || 'from DBO Academy',
    body: body || '',
    tag: tag || ('dbo-lockscreen-' + Date.now()),
    icon: icon || 'assets/images/app-icon-192.png'
  });
}

// Direct Instant Real Push Test Action
async function testRealPushNotification(scenario = 'checkin') {
  playNotificationChime();

  if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    try {
      await Notification.requestPermission();
      updateNotificationPermissionUI();
    } catch (e) {}
  }

  const sName = (loggedInStudent && loggedInStudent.name) ? loggedInStudent.name : 'อิฐ';
  const rem = (loggedInStudent && loggedInStudent.remaining !== undefined) ? loggedInStudent.remaining : 8;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

  let title = 'เช็คชื่อเข้าฝึกซ้อมแล้ว';
  let subtitle = 'from DBO Academy';
  let body = `น้อง ${sName} • IN ${timeStr} • สิทธิ์คงเหลือ: ${rem} ครั้ง`;

  if (scenario === 'morning') {
    title = '🏀 วันนี้มีเรียนบาสเกตบอล DBO';
    body = `วันนี้เป็นวันเรียนของอคาเดมี่ของ น้อง ${sName} เริ่มเรียนเวลา 17:30 ถึง 19:30 น. ณ ยิมเตชะวิทย์`;
  } else if (scenario === 'canceled') {
    title = '⚠️ วันนี้งดคลาสเรียน DBO Academy';
    body = `แจ้งเตือนผู้ปกครองน้อง ${sName}: วันนี้งดคลาสการฝึกซ้อมของอคาเดมี่ (ติดกิจกรรมโรงเรียน) ขอบคุณครับ`;
  } else if (scenario === '15m') {
    title = 'Class starts in 15 mins';
    body = `น้อง ${sName} • IN 17:30 น. เตรียมตัวลงสนามได้เลยครับ`;
  }

  sendSystemLockscreenNotification({ title, subtitle, body, tag: 'real-test-' + Date.now() });
  triggerTelegramPush(body, title);
  showToast('🔔 เด้งการแจ้งเตือนจริงแล้ว (เสียงเตือน + ล็อกสกรีน + ระบบ Push)');
}

// Telegram / Line Style In-App Floating Push Notification
function triggerTelegramPush(msg, title = 'DBO NOTIFICATION (แจ้งเตือนผู้ปกครอง)') {
  const toast = document.getElementById('telegramPushToast');
  const msgEl = document.getElementById('telegramPushMessage');
  const titleEl = document.getElementById('telegramPushTitle');
  if (titleEl) {
    titleEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> ${title}`;
  }
  if (msgEl) msgEl.innerText = msg;
  if (toast) {
    toast.classList.remove('hidden');
    playNotificationChime();
    clearTimeout(telegramToastTimer);
    telegramToastTimer = setTimeout(() => {
      closeTelegramPush();
    }, 7000);
  }
}

function closeTelegramPush() {
  const toast = document.getElementById('telegramPushToast');
  if (toast) toast.classList.add('hidden');
}

function showToast(msg) {
  const toast = document.getElementById('globalToast');
  if (!toast) return;
  const txt = document.getElementById('globalToastText');
  if (txt) txt.innerText = msg;
  toast.classList.remove('hidden');
  setTimeout(() => { toast.classList.add('hidden'); }, 3500);
}

// Lockscreen Notification Banner Simulation
function sendSystemLockscreenNotification({ title, subtitle, body, tag, icon }) {
  playNotificationChime();

  const titleEl = document.getElementById('lockScreenTitle');
  const subEl = document.getElementById('lockScreenSubtitle');
  const bodyEl = document.getElementById('lockScreenBody');
  const banner = document.getElementById('lockScreenNotificationBanner');

  if (titleEl) titleEl.innerText = title || 'Class starts in 15 mins';
  if (subEl) subEl.innerText = subtitle || 'from DBO Academy';
  if (bodyEl) bodyEl.innerText = body || '';

  if (banner) {
    banner.classList.remove('hidden');
    void banner.offsetWidth; // Force reflow
    banner.classList.remove('-translate-y-4', 'opacity-0');
    banner.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(lockScreenDismissTimer);
    lockScreenDismissTimer = setTimeout(() => {
      dismissLockScreenBanner();
    }, 8000);
  }

  // Send to OS native lock screen
  sendSystemNotification(title, {
    body: `${subtitle ? subtitle + ' • ' : ''}${body}`,
    tag: tag || ('dbo-lockscreen-' + Date.now()),
    icon: icon || 'assets/images/app-icon-192.png'
  });
}

function dismissLockScreenBanner() {
  const banner = document.getElementById('lockScreenNotificationBanner');
  if (!banner) return;
  banner.classList.remove('translate-y-0', 'opacity-100');
  banner.classList.add('-translate-y-4', 'opacity-0');
  setTimeout(() => {
    banner.classList.add('hidden');
  }, 300);
}

// Specific Alert Helpers
function notifyAttendanceCheckIn(studentName, coachName, timeStr, remainingCount) {
  sendSystemLockscreenNotification({
    title: 'เช็คชื่อเข้าฝึกซ้อมแล้ว',
    subtitle: 'from DBO Academy',
    body: `น้อง ${studentName} • IN ${timeStr || '17:00'} • สิทธิ์คงเหลือ: ${remainingCount} ครั้ง`,
    tag: 'checkin-' + studentName
  });
  triggerTelegramPush(`น้อง ${studentName} เข้าฝึกซ้อมเรียบร้อยแล้ว (${timeStr || '17:00 น.'}) โดย ${coachName || 'โค้ช'} • โควต้าคงเหลือ: ${remainingCount} ครั้ง`, '🏀 เช็คชื่อเข้าเรียนสำเร็จ');
}

function notifyClassStartsIn15Mins(studentName = 'อิฐ', startTime = '17:30') {
  sendSystemLockscreenNotification({
    title: 'Class starts in 15 mins',
    subtitle: 'from DBO Academy',
    body: `น้อง ${studentName} • IN ${startTime}`,
    tag: 'class-15m-before'
  });
  triggerTelegramPush(`คลาสกำลังจะเริ่มในอีก 15 นาที (${startTime} น.) • น้อง ${studentName} เตรียมตัวลงสนามได้เลยครับ`, '⏰ Class starts in 15 mins');
}

function notifyClassStartsIn30Mins(studentName = 'อิฐ', startTime = '17:30') {
  sendSystemLockscreenNotification({
    title: 'Class starts in 30 mins',
    subtitle: 'from DBO Academy',
    body: `น้อง ${studentName} • เตรียมตัวเริ่มคลาสเวลา ${startTime} น.`,
    tag: 'class-30m-before'
  });
  triggerTelegramPush(`คลาสจะเริ่มในอีก 30 นาที (${startTime} น.) • กรุณาเตรียมตัวน้อง ${studentName} ให้พร้อมฝึกซ้อมครับ`, '⏰ Class starts in 30 mins');
}

function notifyClassEndsIn15Mins(studentName = 'อิฐ', endTime = '19:30') {
  sendSystemLockscreenNotification({
    title: 'Class ends in 15 mins',
    subtitle: 'from DBO Academy',
    body: `เด็กๆ เรียนใกล้เสร็จแล้ว (เลิก ${endTime} น.) • ผู้ปกครองเตรียมมารับน้องได้ครับ`,
    tag: 'class-15m-end'
  });
  triggerTelegramPush(`เด็กๆ ฝึกซ้อมใกล้เสร็จแล้ว (เหลือ 15 นาทีก่อนเลิกคลาส ${endTime} น.) • ผู้ปกครองสามารถเตรียมตัวมารับน้อง ${studentName} ได้เลยครับ`, '🚗 Class ends in 15 mins');
}

function testLockscreenNotification(type) {
  const currentName = loggedInStudent ? loggedInStudent.name : 'อิฐ';
  const curRem = loggedInStudent ? (loggedInStudent.remaining !== undefined ? loggedInStudent.remaining : 4) : 4;

  if (type === '15m_before') {
    notifyClassStartsIn15Mins(currentName, '17:30');
    showToast('ทดสอบแจ้งเตือนก่อนเริ่ม 15 นาที (Class starts in 15 mins)');
  } else if (type === '30m_before') {
    notifyClassStartsIn30Mins(currentName, '17:30');
    showToast('ทดสอบแจ้งเตือนก่อนเริ่ม 30 นาที (Class starts in 30 mins)');
  } else if (type === '15m_end') {
    notifyClassEndsIn15Mins(currentName, '19:30');
    showToast('ทดสอบแจ้งเตือน 15 นาทีก่อนเลิกคลาส (Class ends in 15 mins)');
  } else if (type === 'checkin') {
    const timeNow = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    notifyAttendanceCheckIn(currentName, 'โค้ชโอ๊ต', timeNow, curRem);
    showToast('ทดสอบแจ้งเตือนเมื่อโค้ชเช็คชื่อเข้าเรียน');
  }
}

function runClassNotificationScheduler() {
  const now = new Date();
  const dayW = now.getDay();
  const todayKey = getTodayDateKey();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Check if today has calendar override (e.g. coach marked canceled or special)
  const override = (typeof calendarDayOverrides !== 'undefined' && calendarDayOverrides[todayKey]) ? calendarDayOverrides[todayKey] : null;
  const isCanceledToday = (override && override.status === 'canceled');

  let isClassDay = (dayW === 1 || dayW === 2 || dayW === 4 || dayW === 6);
  if (override && (override.status === 'normal' || override.status === 'special')) isClassDay = true;
  if (isCanceledToday) isClassDay = false;

  let startMinutes = (17 * 60) + 30; // 17:30
  let endMinutes = (19 * 60) + 30;   // 19:30
  let startTimeStr = '17:30';
  let endTimeStr = '19:30';

  if (dayW === 6) {
    startMinutes = (16 * 60);        // 16:00
    endMinutes = (17 * 60) + 30;     // 17:30 (1.5 hrs)
    startTimeStr = '16:00';
    endTimeStr = '17:30';
  }

  const sName = loggedInStudent ? loggedInStudent.name : '';

  // ========================================================
  // 1. MORNING 10:00 AM NOTIFICATION (แจ้งเตือนช่วงเช้า 10:00 น.)
  // ========================================================
  const morningAlertKey = `dbo_morning_alert_${todayKey}`;
  // Trigger if time is 10:00 AM onwards (>= 600 mins) and hasn't alerted today
  if (currentMinutes >= 600 && !localStorage.getItem(morningAlertKey)) {
    if (isCanceledToday) {
      localStorage.setItem(morningAlertKey, 'canceled');
      const cancelReason = (override && override.reason) ? ` (${override.reason})` : '';
      const cancelTitle = '⚠️ วันนี้งดคลาสเรียน DBO Academy';
      const cancelBody = sName
        ? `แจ้งเตือนผู้ปกครองน้อง ${sName}: วันนี้งดคลาสการฝึกซ้อมของอคาเดมี่${cancelReason} ขอบคุณครับ`
        : `แจ้งเตือนผู้ปกครอง: วันนี้งดคลาสการฝึกซ้อมของอคาเดมี่${cancelReason} ขอบคุณครับ`;

      sendSystemLockscreenNotification({
        title: cancelTitle,
        subtitle: 'from DBO Academy',
        body: cancelBody,
        tag: `morning-canceled-${todayKey}`
      });
      triggerTelegramPush(cancelBody, cancelTitle);
    } else if (isClassDay) {
      localStorage.setItem(morningAlertKey, 'class');
      const classTitle = '🏀 วันนี้มีเรียนบาสเกตบอล DBO';
      const classBody = sName
        ? `วันนี้เป็นวันเรียนของอคาเดมี่ของ น้อง ${sName} เริ่มเรียนเวลา ${startTimeStr} ถึงเวลา ${endTimeStr} น. ณ ยิมเตชะวิทย์`
        : `วันนี้เป็นวันเรียนของอคาเดมี่ DBO เริ่มเรียนเวลา ${startTimeStr} ถึงเวลา ${endTimeStr} น. ณ ยิมเตชะวิทย์`;

      sendSystemLockscreenNotification({
        title: classTitle,
        subtitle: 'from DBO Academy',
        body: classBody,
        tag: `morning-class-${todayKey}`
      });
      triggerTelegramPush(classBody, classTitle);
    }
  }

  // If today is canceled or not a class day, skip 30m / 15m countdowns
  if (isCanceledToday || !isClassDay) return;

  // 30 mins before start
  const diff30 = startMinutes - currentMinutes;
  const flag30Key = `dbo_alert_30m_${todayKey}`;
  if (diff30 >= 28 && diff30 <= 32 && !sessionStorage.getItem(flag30Key)) {
    sessionStorage.setItem(flag30Key, 'true');
    notifyClassStartsIn30Mins(sName || 'นักเรียน', startTimeStr);
  }

  // 15 mins before start
  const diff15 = startMinutes - currentMinutes;
  const flag15Key = `dbo_alert_15m_${todayKey}`;
  if (diff15 >= 13 && diff15 <= 17 && !sessionStorage.getItem(flag15Key)) {
    sessionStorage.setItem(flag15Key, 'true');
    notifyClassStartsIn15Mins(sName || 'นักเรียน', startTimeStr);
  }

  // 15 mins before end
  const diffEnd15 = endMinutes - currentMinutes;
  const flagEnd15Key = `dbo_alert_end15m_${todayKey}`;
  if (diffEnd15 >= 13 && diffEnd15 <= 17 && !sessionStorage.getItem(flagEnd15Key)) {
    sessionStorage.setItem(flagEnd15Key, 'true');
    notifyClassEndsIn15Mins(sName || 'นักเรียน', endTimeStr);
  }
}
