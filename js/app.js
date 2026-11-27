// ========================================================
// DBO Basketball Academy - Application Main Entry Point & Router
// ========================================================

// Tab Navigation Switcher
function switchTab(tabName) {
  if (tabName === 'coach-roster' && !isCoachAuth) {
    showToast('เฉพาะโค้ชและทีมงานเท่านั้นที่มีสิทธิ์เข้าใช้งานหน้านี้');
    switchTab('parent-portal');
    return;
  }

  const tabs = ['parent-portal', 'daily-attendance', 'renew-payment', 'register-new', 'calendar', 'coach-board', 'coach-roster'];
  
  if (!tabs.includes(tabName)) tabName = 'parent-portal';
  sessionStorage.setItem('dbo_active_tab', tabName);

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
  if (tabName === 'parent-portal') renderNextTraining();
  if (tabName === 'daily-attendance') {
    renderTrainingWeek();
    renderDailyAttendanceBoard();
  }
  if (tabName === 'calendar') {
    if (typeof updateCourtCalendarRoleVisibility === 'function') updateCourtCalendarRoleVisibility();
    if (typeof renderCourtExpenseStatement === 'function') renderCourtExpenseStatement();
    if (typeof renderMasterCalendar === 'function') renderMasterCalendar();
  }
  if (tabName === 'coach-board') {
    if (typeof initCoachBoard === 'function') initCoachBoard();
  }
  if (tabName === 'coach-roster') {
    if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
    if (typeof renderParentRegistrations === 'function') renderParentRegistrations();
    if (typeof renderPendingSlips === 'function') renderPendingSlips();
  }
  lucide.createIcons();
}

function handlePortalTabClick() {
  switchTab('parent-portal');
}

// Global View Refresh Helper
function refreshAllViews() {
  renderNextTraining();
  renderTrainingWeek();
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
  if (typeof renderMasterCalendarGrid === 'function') renderMasterCalendarGrid();
  if (typeof renderCourtExpenseStatement === 'function') renderCourtExpenseStatement();
  if (typeof updateInstallButtonVisibility === 'function') updateInstallButtonVisibility();
  if (typeof applyAppLanguageUI === 'function') applyAppLanguageUI();
  lucide.createIcons();
}
window.refreshAllViews = refreshAllViews;

// In-App Manual Refresh (Syncs latest cloud state in-place without page reload)
async function handleManualInAppRefresh(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  const spinner = document.getElementById('spinHeaderWrapper') || document.getElementById('iconHeaderManualRefresh');
  const btn = document.getElementById('btnHeaderManualRefresh');
  if (btn) btn.disabled = true;
  if (spinner) spinner.classList.add('animate-spin');

  try {
    if (typeof pullStateFromCloudApi === 'function') {
      await pullStateFromCloudApi();
    }
  } catch (err) {
    console.error('In-app refresh error:', err);
  } finally {
    refreshAllViews();
    if (typeof showToast === 'function') {
      showToast('🔄 อัปเดตข้อมูลล่าสุดเรียบร้อย');
    }
    setTimeout(() => {
      const activeSpinner = document.getElementById('spinHeaderWrapper') || document.getElementById('iconHeaderManualRefresh');
      if (activeSpinner) activeSpinner.classList.remove('animate-spin');
      if (btn) btn.disabled = false;
    }, 700);
  }
}

// Smooth scroll to portal action for Campaign Hero CTA
function scrollToPortalAction() {
  const target = loggedInStudent ? document.getElementById('parent-dashboard') : document.getElementById('parent-login-box');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const input = document.getElementById('parentPhoneInput');
    if (!loggedInStudent && input) {
      setTimeout(() => input.focus(), 350);
    }
  }
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
  // Never delete dbo_students_v14 or auto-broadcast saveState on passive page load!
  localStorage.setItem('dbo_app_version', APP_VERSION);

  // Show Test Demo Mode Banner when running in local test/demo environment
  if (typeof IS_TEST_DEMO_ENV !== 'undefined' && IS_TEST_DEMO_ENV) {
    const demoBanner = document.createElement('div');
    demoBanner.id = 'testDemoModeBanner';
    demoBanner.className = 'bg-amber-500 text-neutral-950 text-center py-1.5 px-3 text-[11px] sm:text-xs font-bold tracking-wide border-b border-amber-600 sticky top-0 z-50 flex items-center justify-center gap-2 flex-wrap';
    demoBanner.textContent = 'โหมดทดสอบ · ใช้ข้อมูลแยกจากระบบจริง';
    document.body.insertBefore(demoBanner, document.body.firstChild);
    document.getElementById('recordPushOptions')?.classList.add('hidden');
    const recordPush = document.getElementById('recordSendPushCheckbox');
    if (recordPush) recordPush.checked = false;
  }

  // Dynamic live date & class schedule banner based on real calendar
  try {
    const now = new Date(getTodayDateKey() + 'T12:00:00Z');
    const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const thaiMonthsFull = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const dayNum = now.getUTCDate();
    const dayW = now.getUTCDay();
    const thaiYear = now.getUTCFullYear() + 543;

    const todayKeyStr = getTodayDateKey();
    const curInfo = (typeof getDayCurriculumDetails === 'function') ? getDayCurriculumDetails(todayKeyStr, dayW) : null;
    let scheduleNote = '';
    if (dayW === 1 || dayW === 2 || dayW === 4) {
      scheduleNote = `คลาสปกติ 17:30 - 19:30 น. ณ ยิมเตชะวิทย์${curInfo && curInfo.topic ? ` • หัวข้อซ้อม: ${curInfo.topic}` : ''}`;
    } else if (dayW === 6) {
      scheduleNote = `คลาสวันเสาร์ Basic Coach Oat 16:00 - 17:30 น. ณ ยิมเตชะวิทย์${curInfo && curInfo.topic ? ` • หัวข้อซ้อม: ${curInfo.topic}` : ''}`;
    } else {
      scheduleNote = 'วันนี้ไม่มีคลาสฝึกซ้อมประจำ (ติดตามคลาสพิเศษได้ในปฏิทิน)';
    }

    const pLabel = document.getElementById('parentTodayDateLabel');
    if (pLabel) pLabel.innerText = `${thaiDays[dayW]}ที่ ${dayNum} ${thaiMonths[now.getUTCMonth()]} ${thaiYear} • ${scheduleNote}`;

    const bLabel = document.getElementById('dailyBoardDateLabel');
    if (bLabel) bLabel.innerText = `${thaiDays[dayW]}ที่ ${dayNum} ${thaiMonthsFull[now.getUTCMonth()]} ${thaiYear} • ${scheduleNote}`;
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
  if (typeof renderMasterCalendarGrid === 'function') renderMasterCalendarGrid();
  if (typeof renderCourtExpenseStatement === 'function') renderCourtExpenseStatement();
  if (typeof updateInstallButtonVisibility === 'function') updateInstallButtonVisibility();
  if (typeof applyAppLanguageUI === 'function') applyAppLanguageUI();
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

  switchTab(sessionStorage.getItem('dbo_active_tab') || 'parent-portal');

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

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const remainingSplashTime = reducedMotion ? 0 : Math.max(0, 1500 - performance.now());
  setTimeout(hideSplashScreen, remainingSplashTime);
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
  }, 220);
}
