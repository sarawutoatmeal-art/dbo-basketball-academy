// ========================================================
// DBO Basketball Academy - Application Main Entry Point & Router
// ========================================================

// Tab Navigation Switcher
function switchTab(tabName) {
  if (tabName === 'coach-roster' && !isCoachAuth) {
    showToast('เฉพาะโค้ชและแอดมินเท่านั้นที่มีสิทธิ์เข้าใช้งาน');
    switchTab('parent-portal');
    return;
  }

  const tabs = ['parent-portal', 'daily-attendance', 'renew-payment', 'register-new', 'calendar', 'coach-roster'];
  
  tabs.forEach(t => {
    const sec = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-${t}`);
    const navMBtn = document.getElementById(`nav-m-${t}`);

    if (t === tabName) {
      if (sec) sec.classList.remove('hidden');
      if (navBtn) { navBtn.classList.add('active'); navBtn.classList.remove('inactive'); }
      if (navMBtn) { navMBtn.classList.add('active'); }
    } else {
      if (sec) sec.classList.add('hidden');
      if (navBtn) { navBtn.classList.remove('active'); navBtn.classList.add('inactive'); }
      if (navMBtn) { navMBtn.classList.remove('active'); }
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (tabName === 'daily-attendance' && typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
  if (tabName === 'calendar') {
    if (typeof updateCourtCalendarRoleVisibility === 'function') updateCourtCalendarRoleVisibility();
    if (typeof renderCourtExpenseStatement === 'function') renderCourtExpenseStatement();
    if (typeof renderMasterCalendar === 'function') renderMasterCalendar();
  }
  if (tabName === 'coach-roster') {
    if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
    if (typeof renderParentRegistrations === 'function') renderParentRegistrations();
    if (typeof renderPendingSlips === 'function') renderPendingSlips();
  }
  lucide.createIcons();
}

function handlePortalTabClick() {
  if (isCoachAuth && currentStaff) {
    switchTab('coach-roster');
  } else {
    switchTab('parent-portal');
  }
}

// Global View Refresh Helper
function refreshAllViews() {
  if (isCoachAuth) {
    if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
    if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
    if (typeof renderPendingSlips === 'function') renderPendingSlips();
    if (typeof renderParentRegistrations === 'function') renderParentRegistrations();
    if (typeof renderTeachingRecordsList === 'function') renderTeachingRecordsList();
  }
  if (loggedInStudent) {
    if (typeof ensureHistoricalDatesSeeded === 'function') ensureHistoricalDatesSeeded();
    if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
    if (typeof renderParentView === 'function') renderParentView();
  }
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
  if (typeof updateCourtCalendarRoleVisibility === 'function') updateCourtCalendarRoleVisibility();
  if (typeof updateInstallButtonVisibility === 'function') updateInstallButtonVisibility();
  lucide.createIcons();
}

// Service Worker Registration for PWA & System Notifications
if ('serviceWorker' in navigator) {
  const registerSW = () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(reg => {
        console.log('DBO Service Worker active:', reg.scope);
        reg.update();
      })
      .catch(err => console.log('SW registration error:', err));
  };
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}

// Application Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  // Clear legacy storage versions to reset mock metrics and guarantee pure factual data
  if (localStorage.getItem('dbo_app_version') !== APP_VERSION) {
    localStorage.removeItem('dbo_students_v8');
    localStorage.removeItem('dbo_students_v9');
    localStorage.removeItem('dbo_students_v10');
    localStorage.removeItem('dbo_students_v11');
    localStorage.removeItem('dbo_students_v12');
    localStorage.removeItem('dbo_students_v13');
    localStorage.removeItem('dbo_students_v14');
    localStorage.removeItem('dbo_parent_logged_v14');
    localStorage.removeItem('dbo_roster_view_mode');
    localStorage.setItem('dbo_roster_view_mode_v2', 'cards');
    localStorage.setItem('dbo_app_version', APP_VERSION);
  }

  // Sync clean state to cloud
  if (!localStorage.getItem('dbo_synced_clean_metrics_v20')) {
    localStorage.setItem('dbo_synced_clean_metrics_v20', 'true');
    setTimeout(() => {
      if (typeof saveState === 'function') {
        saveState(true, 'รีเซ็ตข้อมูลสมรรถภาพทางกายและคอมเมนต์โค้ชทุกคนเป็นค่าว่าง');
      }
    }, 600);
  }

  // Dynamic live date & class schedule banner based on real calendar
  try {
    const now = new Date();
    const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const thaiMonthsFull = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const dayNum = now.getDate();
    const dayW = now.getDay();
    const thaiYear = now.getFullYear() + 543;

    let scheduleNote = '';
    if (dayW === 1 || dayW === 2 || dayW === 4) {
      scheduleNote = 'คลาสปกติ 17:30 - 19:30 น. ณ ยิมเตชะวิทย์';
    } else if (dayW === 6) {
      scheduleNote = 'คลาสวันเสาร์ Basic Coach Oat 16:00 - 17:30 น. ณ ยิมเตชะวิทย์';
    } else {
      scheduleNote = 'วันนี้ไม่มีคลาส';
    }

    const pLabel = document.getElementById('parentTodayDateLabel');
    if (pLabel) pLabel.innerText = `${thaiDays[dayW]}ที่ ${dayNum} ${thaiMonths[now.getMonth()]} ${thaiYear} • ${scheduleNote}`;

    const bLabel = document.getElementById('dailyBoardDateLabel');
    if (bLabel) bLabel.innerText = `${thaiDays[dayW]}ที่ ${dayNum} ${thaiMonthsFull[now.getMonth()]} ${thaiYear} • ${scheduleNote}`;
  } catch (e) {
    console.log('Date banner update error:', e);
  }

  if (typeof ensureHistoricalDatesSeeded === 'function') ensureHistoricalDatesSeeded();
  if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
  if (typeof renderParentView === 'function') renderParentView();
  if (typeof updateCoachStateUI === 'function') updateCoachStateUI();
  if (typeof updateHeaderProfileUI === 'function') updateHeaderProfileUI();
  if (typeof updateNotificationPermissionUI === 'function') updateNotificationPermissionUI();
  if (typeof renderMasterCalendar === 'function') renderMasterCalendar();
  if (typeof renderCourtExpenseStatement === 'function') renderCourtExpenseStatement();
  if (typeof renderWeeklyScheduleView === 'function') renderWeeklyScheduleView();
  if (typeof renderPendingSlips === 'function') renderPendingSlips();
  if (typeof renderParentRegistrations === 'function') renderParentRegistrations();
  if (typeof renderTeachingRecordsList === 'function') renderTeachingRecordsList();
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
  if (typeof updateCourtCalendarRoleVisibility === 'function') updateCourtCalendarRoleVisibility();
  if (typeof updateInstallButtonVisibility === 'function') updateInstallButtonVisibility();
  lucide.createIcons();

  // Background sync for Web Push Subscription if permission already granted
  if (typeof registerWebPushSubscription === 'function' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    registerWebPushSubscription(false);
  }

  // Automated Lock Screen Notification Scheduler
  if (typeof runClassNotificationScheduler === 'function') {
    runClassNotificationScheduler();
    setInterval(runClassNotificationScheduler, 30000);
  }

  // Auto-restore active view based on authentication state
  if (isCoachAuth && currentStaff) {
    switchTab('coach-roster');
  } else if (loggedInStudent) {
    switchTab('parent-portal');
  }

  // Support direct link triggers (e.g. ?action=register-parent)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'register-parent') {
      setTimeout(() => openParentLinkModal(), 300);
    } else if (action === 'daily-attendance') {
      setTimeout(() => switchTab('daily-attendance'), 200);
    }
  } catch (e) {
    console.log('Query param check error:', e);
  }

  // Initialize Real-Time Multi-Device Engine (Standalone Database)
  if (typeof initRealtimeEngine === 'function') {
    initRealtimeEngine();
  }

  // Dismiss Native Splash Screen after 3 seconds as requested
  setTimeout(hideSplashScreen, 3000);
});

// Fallback safety trigger for Splash Screen dismissal (4 seconds maximum)
setTimeout(hideSplashScreen, 4000);

// Native App Splash Screen Controller
function hideSplashScreen() {
  const splash = document.getElementById('appSplashScreen');
  if (!splash || splash.classList.contains('splash-fade-out')) return;
  splash.classList.add('splash-fade-out');
  setTimeout(() => {
    if (splash.parentNode) {
      splash.parentNode.removeChild(splash);
    }
  }, 550);
}
