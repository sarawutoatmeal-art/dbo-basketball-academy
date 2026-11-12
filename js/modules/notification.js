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
      navigator.vibrate([120, 60, 120]);
    }
  } catch (err) {
    console.warn('Audio chime skipped:', err);
  }
}

// Update Notification UI Status Badge
function updateNotificationPermissionUI() {
  const badge = document.getElementById('pushStatusBadge');
  const btn = document.getElementById('btnEnableNotifications');
  if (!badge || !btn) return;

  if (!('Notification' in window)) {
    badge.innerText = 'อุปกรณ์ไม่รองรับ';
    badge.className = 'text-[10px] px-2 py-0.2 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-300';
    btn.classList.add('hidden');
    return;
  }

  if (Notification.permission === 'granted') {
    badge.innerText = 'เปิดใช้งานแล้ว (Live)';
    badge.className = 'text-xs px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-800 border border-emerald-200';
    btn.innerHTML = '<i data-lucide="volume-2" class="w-3.5 h-3.5"></i><span>ทดสอบเสียงแจ้งเตือน</span>';
    btn.className = 'btn-touch px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-2xs flex items-center gap-1.5 flex-shrink-0 w-full sm:w-auto justify-center transition-colors';
    btn.onclick = () => {
      playNotificationChime();
      sendSystemNotification('🏀 DBO Academy Live Test', {
        body: 'ระบบแจ้งเตือนทำงานได้สมบูรณ์แบบบนอุปกรณ์ของคุณแล้วครับ!',
        icon: 'assets/images/app-icon-192.png'
      });
      triggerTelegramPush('ระบบแจ้งเตือนทำงานได้สมบูรณ์แบบบนอุปกรณ์ของคุณแล้วครับ!', '🔔 ทดสอบระบบแจ้งเตือน');
    };
  } else if (Notification.permission === 'denied') {
    badge.innerText = '❌ ถูกปิดกั้นในเบราว์เซอร์';
    badge.className = 'text-[10px] px-2 py-0.2 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-300';
    btn.innerHTML = '<i data-lucide="settings" class="w-3.5 h-3.5"></i><span>ตั้งค่าอนุญาตแจ้งเตือน</span>';
    btn.onclick = () => {
      showToast('กรุณาเปิดสิทธิ์การแจ้งเตือนในการตั้งค่าเบราว์เซอร์ของคุณ');
    };
  } else {
    badge.innerText = 'ยังไม่เปิดใช้งาน';
    badge.className = 'text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300';
    btn.innerHTML = '<i data-lucide="bell" class="w-3.5 h-3.5"></i><span>เปิดแจ้งเตือนบนมือถือ</span>';
    btn.onclick = requestNotificationPermission;
  }
  lucide.createIcons();
}

// Request Notification Permission
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน Web Notification');
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    updateNotificationPermissionUI();
    if (permission === 'granted') {
      playNotificationChime();
      showToast('🔔 เปิดการแจ้งเตือนบนอุปกรณ์เรียบร้อยแล้ว');
      sendSystemNotification('🏀 DBO Basketball Academy', {
        body: 'ระบบแจ้งเตือนเข้าเรียน & ข้อความแชทสด พร้อมทำงานเรียลไทม์แล้ว ขอบคุณครับ!',
        icon: 'assets/images/app-icon-192.png'
      });
      triggerTelegramPush('ระบบแจ้งเตือนเข้าเรียน & ข้อความแชทสด พร้อมทำงานเรียลไทม์แล้ว', '🔔 เปิดการแจ้งเตือนสำเร็จ');
      return true;
    } else {
      showToast('คุณยังไม่ได้เปิดการแจ้งเตือน สามารถเปิดได้ที่การตั้งค่าเว็บ');
      return false;
    }
  } catch (e) {
    console.error(e);
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

  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: title,
        options: defaultOptions
      });
    } else {
      try {
        new Notification(title, defaultOptions);
      } catch (e) {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, defaultOptions);
          });
        }
      }
    }
  }
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

function notifyClassStartsIn15Mins(studentName = 'อิฐ', startTime = '17:00') {
  sendSystemLockscreenNotification({
    title: 'Class starts in 15 mins',
    subtitle: 'from DBO Academy',
    body: `น้อง ${studentName} • IN ${startTime}`,
    tag: 'class-15m-before'
  });
  triggerTelegramPush(`คลาสกำลังจะเริ่มในอีก 15 นาที (${startTime} น.) • น้อง ${studentName} เตรียมตัวลงสนามได้เลยครับ`, '⏰ Class starts in 15 mins');
}

function notifyClassStartsIn30Mins(studentName = 'อิฐ', startTime = '17:00') {
  sendSystemLockscreenNotification({
    title: 'Class starts in 30 mins',
    subtitle: 'from DBO Academy',
    body: `น้อง ${studentName} • เตรียมตัวเริ่มคลาสเวลา ${startTime} น.`,
    tag: 'class-30m-before'
  });
  triggerTelegramPush(`คลาสจะเริ่มในอีก 30 นาที (${startTime} น.) • กรุณาเตรียมตัวน้อง ${studentName} ให้พร้อมฝึกซ้อมครับ`, '⏰ Class starts in 30 mins');
}

function notifyClassEndsIn15Mins(studentName = 'อิฐ', endTime = '18:30') {
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
    notifyClassStartsIn15Mins(currentName, '17:00');
    showToast('ทดสอบแจ้งเตือนก่อนเริ่ม 15 นาที (Class starts in 15 mins)');
  } else if (type === '30m_before') {
    notifyClassStartsIn30Mins(currentName, '17:00');
    showToast('ทดสอบแจ้งเตือนก่อนเริ่ม 30 นาที (Class starts in 30 mins)');
  } else if (type === '15m_end') {
    notifyClassEndsIn15Mins(currentName, '18:30');
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
  if (dayW !== 1 && dayW !== 2 && dayW !== 4 && dayW !== 6) return;

  const todayKey = getTodayDateKey();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let startMinutes = (17 * 60);
  let endMinutes = (18 * 60) + 30;
  let startTimeStr = '17:00';
  let endTimeStr = '18:30';

  if (dayW === 6) {
    startMinutes = (9 * 60);
    endMinutes = (10 * 60) + 30;
    startTimeStr = '09:00';
    endTimeStr = '10:30';
  }

  const sName = loggedInStudent ? loggedInStudent.name : 'อิฐ';

  // 30 mins before start
  const diff30 = startMinutes - currentMinutes;
  const flag30Key = `dbo_alert_30m_${todayKey}`;
  if (diff30 >= 28 && diff30 <= 32 && !sessionStorage.getItem(flag30Key)) {
    sessionStorage.setItem(flag30Key, 'true');
    notifyClassStartsIn30Mins(sName, startTimeStr);
  }

  // 15 mins before start
  const diff15 = startMinutes - currentMinutes;
  const flag15Key = `dbo_alert_15m_${todayKey}`;
  if (diff15 >= 13 && diff15 <= 17 && !sessionStorage.getItem(flag15Key)) {
    sessionStorage.setItem(flag15Key, 'true');
    notifyClassStartsIn15Mins(sName, startTimeStr);
  }

  // 15 mins before end
  const diffEnd15 = endMinutes - currentMinutes;
  const flagEnd15Key = `dbo_alert_end15m_${todayKey}`;
  if (diffEnd15 >= 13 && diffEnd15 <= 17 && !sessionStorage.getItem(flagEnd15Key)) {
    sessionStorage.setItem(flagEnd15Key, 'true');
    notifyClassEndsIn15Mins(sName, endTimeStr);
  }
}
