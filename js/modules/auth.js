// ========================================================
// DBO Basketball Academy - Authentication & Authorization
// (Coach/Staff Whitelist, Parent Phone Login, Logout, UI Badges)
// ========================================================

function handleParentPhoneLogin(e, forcedInput = null) {
  if (e && e.preventDefault) e.preventDefault();
  const inputEl = document.getElementById('parentPhoneInput');
  const feedbackEl = document.getElementById('loginFeedback');

  let rawVal = forcedInput !== null ? String(forcedInput).trim() : (inputEl ? inputEl.value : '').trim();
  if (!rawVal) {
    showToast('กรุณากรอกเบอร์โทรศัพท์มือถือ 10 หลักครับ');
    return;
  }

  // Replace Thai numerals to Arabic numerals
  const thaiDigits = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'];
  thaiDigits.forEach((td, idx) => {
    rawVal = rawVal.split(td).join(idx.toString());
  });

  // Strip non-digits and normalize country code
  let cleanPhone = rawVal.replace(/[^\d+]/g, '');
  if (cleanPhone.startsWith('+66')) cleanPhone = '0' + cleanPhone.slice(3);
  if (cleanPhone.startsWith('66') && cleanPhone.length === 11) cleanPhone = '0' + cleanPhone.slice(2);

  if (feedbackEl) {
    feedbackEl.classList.add('hidden');
    feedbackEl.innerHTML = '';
  }

  // 1. Check Authorized Staff Whitelist
  if (AUTHORIZED_STAFF[cleanPhone]) {
    const staff = AUTHORIZED_STAFF[cleanPhone];
    isCoachAuth = true;
    currentStaff = staff;
    localStorage.setItem('dbo_is_coach_v14', 'true');
    localStorage.setItem('dbo_current_staff', JSON.stringify(staff));
    loggedInStudent = null;
    localStorage.removeItem('dbo_parent_logged_v14');

    updateCoachStateUI();
    updateHeaderProfileUI();
    switchTab('coach-roster');
    showToast(`ยินดีต้อนรับ ${staff.fullName} เข้าสู่ระบบแอดมิน DBO`);
    if (typeof registerWebPushSubscription === 'function' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      registerWebPushSubscription(false);
    }
    return;
  }

  // 1.5 Check Assistant Coaches Whitelist (Only if this phone does NOT belong to a student/parent)
  const isStudentParentPhone = students.some(s => (s.phone || '').replace(/[^\d]/g, '') === cleanPhone);
  const matchedAsst = !isStudentParentPhone && assistantCoaches.find(a => (a.phone || '').replace(/[^\d]/g, '') === cleanPhone && cleanPhone !== '');
  if (matchedAsst) {
    isCoachAuth = true;
    currentStaff = {
      id: matchedAsst.id,
      name: matchedAsst.name,
      fullName: matchedAsst.name,
      role: 'ผู้ช่วยโค้ช',
      title: matchedAsst.name,
      phone: matchedAsst.phone,
      badge: 'ผู้ช่วยโค้ช',
      desc: matchedAsst.desc || 'ผู้ช่วยฝึกสอนในสนาม บันทึกเวลาสอน เช็คชื่อนักเรียน และวัดสมรรถภาพทางกาย',
      isAssistant: true
    };
    localStorage.setItem('dbo_is_coach_v14', 'true');
    localStorage.setItem('dbo_current_staff', JSON.stringify(currentStaff));
    loggedInStudent = null;
    localStorage.removeItem('dbo_parent_logged_v14');

    updateCoachStateUI();
    updateHeaderProfileUI();
    switchTab('coach-roster');
    showToast(`ยินดีต้อนรับ ${matchedAsst.name} เข้าสู่ระบบผู้ช่วยโค้ช DBO`);
    if (typeof registerWebPushSubscription === 'function' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      registerWebPushSubscription(false);
    }
    return;
  }

  // 2. Check Linked Student Phone for Parents
  let matched = students.filter(s => (s.phone || '').replace(/[^\d]/g, '') === cleanPhone && cleanPhone !== '');

  if (matched.length > 0) {
    const siblingGroupIds = new Set(matched.map(m => m.siblingGroupId).filter(Boolean));
    if (siblingGroupIds.size > 0) {
      students.forEach(st => {
        if (st.siblingGroupId && siblingGroupIds.has(st.siblingGroupId) && !matched.some(m => m.id === st.id)) {
          if (!st.phone) st.phone = cleanPhone;
          matched.push(st);
        }
      });
    }

    isCoachAuth = false;
    currentStaff = null;
    localStorage.setItem('dbo_is_coach_v14', 'false');
    localStorage.removeItem('dbo_current_staff');

    // MULTI-CHILD POPUP: If linked to 2+ students (siblings), prompt popup modal FIRST before showing any dashboard data!
    if (matched.length > 1) {
      // 1. Clear any prior logged in student from state & storage so no data is visible or preselected
      loggedInStudent = null;
      localStorage.removeItem('dbo_parent_logged_v14');
      sessionStorage.removeItem('dbo_tab_parent_logged');

      // 2. Ensure dashboard is strictly hidden and parent login box remains behind modal until selection
      const dashBox = document.getElementById('parent-dashboard');
      if (dashBox) dashBox.classList.add('hidden');
      const loginBox = document.getElementById('parent-login-box');
      if (loginBox) loginBox.classList.remove('hidden');

      // 3. Open modal for parent to select which child to view
      openSiblingSelectModal(matched, cleanPhone);
      return;
    }

    loginAsStudent(matched[0]);
    return;
  }

  // 3. Check Pending Registrations
  const pending = parentRegistrations.find(r => r.phone.replace(/[^\d]/g, '') === cleanPhone && r.status === 'pending');
  if (pending) {
    if (feedbackEl) {
      feedbackEl.className = 'text-xs p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 block space-y-1.5';
      feedbackEl.innerHTML = `
        <div class="font-bold flex items-center gap-1.5 text-amber-800">
          <i data-lucide="clock" class="w-4 h-4 text-amber-600"></i>
          <span>อยู่ระหว่างรอโค้ชโอ๊ตอนุมัติ</span>
        </div>
        <p>เบอร์ <strong>${cleanPhone}</strong> ได้ลงทะเบียนผูกกับ <strong>น้อง${pending.studentName}</strong> ไว้แล้ว อยู่ระหว่างรอโค้ชโอ๊ตหรือทีมงานกดยืนยันคำขอครับ</p>
      `;
      feedbackEl.classList.remove('hidden');
      lucide.createIcons();
    }
    showToast(`เบอร์ ${cleanPhone} อยู่ระหว่างรอโค้ชโอ๊ตอนุมัติครับ`);
    return;
  }

  // 4. Phone Not Registered Yet -> Prompt Registration
  if (feedbackEl) {
    feedbackEl.className = 'text-xs p-3.5 rounded-2xl bg-sky-50 text-sky-950 border border-sky-200 block space-y-2';
    feedbackEl.innerHTML = `
      <div class="font-bold flex items-center gap-1.5 text-sky-900 text-xs">
        <i data-lucide="info" class="w-4 h-4 text-sky-600"></i>
        <span>ยังไม่ได้ลงทะเบียนผูกเบอร์เข้าสู่ระบบ</span>
      </div>
      <p class="text-xs text-sky-800">ระบบได้รีเซ็ตเบอร์โทรเก่าเพื่อความปลอดภัย ผู้ปกครองสามารถแตะปุ่มด้านล่างเพื่อเลือกชื่อบุตรหลานและส่งขออนุมัติได้ทันทีครับ</p>
      <button type="button" onclick="openParentLinkModal('${cleanPhone}')" class="w-full mt-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer">
        <i data-lucide="user-plus" class="w-4 h-4"></i>
        <span>📝 แตะตรงนี้เพื่อลงทะเบียนผูกเบอร์กับน้อง</span>
      </button>
    `;
    feedbackEl.classList.remove('hidden');
    lucide.createIcons();
  }
  showToast('ไม่พบข้อมูลเบอร์โทรนี้ในระบบ กรุณาลงทะเบียนผูกเบอร์กับน้องเพื่อส่งให้โค้ชอนุมัติครับ');
  openParentLinkModal(cleanPhone);
}

function appLogout() {
  if (isCoachAuth) {
    const staffName = currentStaff ? currentStaff.name : 'แอดมิน';
    if (!confirm(`คุณต้องการออกจากระบบ ${staffName} ใช่หรือไม่?`)) return;
    isCoachAuth = false;
    currentStaff = null;
    localStorage.setItem('dbo_is_coach_v14', 'false');
    localStorage.removeItem('dbo_current_staff');
    updateCoachStateUI();
    updateHeaderProfileUI();
    switchTab('parent-portal');
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  } else if (loggedInStudent) {
    const sName = loggedInStudent.name;
    loggedInStudent = null;
    localStorage.removeItem('dbo_parent_logged_v14');
    updateCoachStateUI();
    updateHeaderProfileUI();
    if (typeof ensureHistoricalDatesSeeded === 'function') ensureHistoricalDatesSeeded();
    if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
    if (typeof renderParentView === 'function') renderParentView();
    switchTab('parent-portal');
    showToast(`ออกจากระบบผู้ปกครองน้อง ${sName} เรียบร้อยแล้ว`);
  }
}

function coachLogout() { appLogout(); }
function parentLogout() { appLogout(); }

function updateHeaderProfileUI() {
  const headerArea = document.getElementById('userHeaderArea');
  if (!headerArea) return;

  if (isCoachAuth && currentStaff) {
    headerArea.innerHTML = `
      <div class="app-header-account flex items-center gap-1.5 sm:gap-2">
        <div class="app-header-identity flex items-center gap-1.5 bg-white/15 border border-[#DEB95B]/60 text-white px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span class="truncate max-w-[130px] sm:max-w-none" title="${currentStaff.title}"><span class="app-header-staff-title text-[#DEB95B]">${currentStaff.title}</span> <span class="app-header-staff-name text-white">${currentStaff.name}</span></span>
        </div>
      </div>
    `;
  } else if (loggedInStudent) {
    const family = (typeof getLinkedStudents === 'function') ? getLinkedStudents(loggedInStudent) : [loggedInStudent];
    const familyLabel = family.length > 1
      ? family.map(s => `น้อง ${s.name}`).join(' & ')
      : `น้อง ${loggedInStudent.name}`;
    headerArea.innerHTML = `
      <div class="app-header-account flex items-center gap-1.5 sm:gap-2">
        <div class="app-header-identity flex items-center gap-1.5 bg-white/15 border border-[#DEB95B]/60 text-white px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span class="truncate max-w-[150px] sm:max-w-none">${familyLabel}</span>
        </div>
      </div>
    `;
  } else {
    headerArea.innerHTML = `
      <div class="flex items-center gap-1.5 text-xs text-[#FBF4DD]/80">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span class="hidden sm:inline font-semibold">Start from 0 to No. 1</span>
      </div>
    `;
  }
  lucide.createIcons();
}

function updateCoachStateUI() {
  if (typeof updateCourtCalendarRoleVisibility === 'function') updateCourtCalendarRoleVisibility();
  const coachTab = document.getElementById('nav-coach-roster');
  const coachMTab = document.getElementById('nav-m-coach-roster');
  const boardTab = document.getElementById('nav-coach-board');
  const boardMTab = document.getElementById('nav-m-coach-board');
  const staffCard = document.getElementById('staffProfileCard');
  const parentApprovalSec = document.getElementById('parentApprovalSection');
  const pendingSlipSec = document.getElementById('pendingSlipSection');
  const asstDutyCard = document.getElementById('assistantDutyCard');
  const btnManageAsst = document.getElementById('btnManageAssistantCoaches');
  const btnCSV = document.getElementById('btnExportCSV');
  const btnAddSt = document.getElementById('btnAddNewStudent');
  const btnEditSch = document.getElementById('btnEditWeeklySchedule');

  if (isCoachAuth && currentStaff) {
    if (coachTab) coachTab.classList.remove('hidden');
    if (coachMTab) coachMTab.classList.remove('hidden');
    if (boardTab) boardTab.classList.remove('hidden');
    if (boardMTab) boardMTab.classList.remove('hidden');
    if (btnEditSch) btnEditSch.classList.remove('hidden');
    if (staffCard) {
      staffCard.classList.remove('hidden');
      const nameEl = document.getElementById('staffCardName');
      const badgeEl = document.getElementById('staffCardBadge');
      const phoneEl = document.getElementById('staffCardPhone');
      const descEl = document.getElementById('staffCardDesc');
      if (nameEl) nameEl.innerText = currentStaff.fullName;
      if (badgeEl) badgeEl.innerText = currentStaff.badge;
      if (phoneEl) phoneEl.innerText = 'ยืนยันตัวตนแล้ว';
      if (descEl) descEl.innerHTML = `${currentStaff.desc}`;
    }

    if (currentStaff.isAssistant) {
      if (parentApprovalSec) parentApprovalSec.classList.add('hidden');
      if (pendingSlipSec) pendingSlipSec.classList.add('hidden');
      if (btnManageAsst) btnManageAsst.classList.add('hidden');
      if (btnCSV) btnCSV.classList.add('hidden');
      if (btnAddSt) btnAddSt.classList.remove('hidden');
      if (asstDutyCard) {
        asstDutyCard.classList.remove('hidden');
        if (typeof updateAssistantDutyUI === 'function') updateAssistantDutyUI();
      }
    } else {
      if (parentApprovalSec) parentApprovalSec.classList.remove('hidden');
      if (pendingSlipSec) pendingSlipSec.classList.remove('hidden');
      if (btnManageAsst) btnManageAsst.classList.remove('hidden');
      if (btnCSV) btnCSV.classList.remove('hidden');
      if (btnAddSt) btnAddSt.classList.remove('hidden');
      if (asstDutyCard) asstDutyCard.classList.add('hidden');
    }

    const mPortalLabel = document.querySelector('#nav-m-parent-portal span');
    const mPortalIcon = document.querySelector('#nav-m-parent-portal i');
    if (mPortalLabel) mPortalLabel.innerText = 'หน้าหลัก';
    if (mPortalIcon) mPortalIcon.setAttribute('data-lucide', 'home');

    if (window.innerWidth < 768) {
      coachRosterViewMode = 'cards';
    }
    if (typeof setCoachRosterViewMode === 'function') setCoachRosterViewMode(coachRosterViewMode);
    if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
    if (typeof renderPendingSlips === 'function') renderPendingSlips();
    if (typeof renderParentRegistrations === 'function') renderParentRegistrations();
    if (typeof renderParentView === 'function') renderParentView();
  } else {
    if (coachTab) coachTab.classList.add('hidden');
    if (coachMTab) coachMTab.classList.add('hidden');
    if (boardTab) boardTab.classList.remove('hidden');
    if (boardMTab) boardMTab.classList.remove('hidden');
    if (staffCard) staffCard.classList.add('hidden');
    if (typeof renderParentView === 'function') renderParentView();
  }
  lucide.createIcons();
}

function maskPhone(phone) {
  if (!phone) return '-';
  const clean = String(phone).replace(/[^\d]/g, '');
  if (clean.length === 10) {
    return clean.slice(0, 3) + '-***-' + clean.slice(7);
  }
  if (clean.length === 9) {
    return clean.slice(0, 2) + '-***-' + clean.slice(6);
  }
  return phone;
}

// ========================================================
// SIBLING / MULTI-STUDENT LOGIN POPUP SELECTION LOGIC
// ========================================================
let pendingSiblingMatches = [];
let pendingSiblingPhone = '';

function openSiblingSelectModal(matchedStudents = null, phone = '') {
  if (matchedStudents && Array.isArray(matchedStudents) && matchedStudents.length > 0) {
    pendingSiblingMatches = matchedStudents;
    pendingSiblingPhone = phone;
  } else if (loggedInStudent && typeof getLinkedStudents === 'function') {
    pendingSiblingMatches = getLinkedStudents(loggedInStudent);
    pendingSiblingPhone = loggedInStudent.phone || '';
  }

  if (!pendingSiblingMatches || pendingSiblingMatches.length === 0) return;

  const modal = document.getElementById('siblingSelectModal');
  const container = document.getElementById('siblingSelectCardsContainer');
  const subtitle = document.getElementById('siblingSelectSubtitle');
  if (!modal || !container) return;

  const isEn = typeof currentAppLang !== 'undefined' && currentAppLang === 'en';

  if (subtitle) {
    subtitle.textContent = isEn
      ? `Phone number linked to ${pendingSiblingMatches.length} students. Please select which student to view:`
      : `เบอร์โทรนี้ผูกข้อมูลนักเรียนไว้ ${pendingSiblingMatches.length} คน กรุณากดเลือกบุตรหลานที่ต้องการเข้าดูข้อมูล:`;
  }

  container.innerHTML = pendingSiblingMatches.map(s => {
    const isCur = loggedInStudent && Number(s.id) === Number(loggedInStudent.id);
    const sName = (typeof getStudentDisplayName === 'function') ? getStudentDisplayName(s.name, isEn) : (isEn ? s.name : `น้อง ${s.name}`);
    const uInfo = (typeof calculateAthleteAgeAndUCategory === 'function') ? calculateAthleteAgeAndUCategory(s) : { uCategory: isEn ? 'Age Pending' : 'รอวันเกิด' };
    const cTypeLabel = s.courseType === 'monthly' ? (isEn ? 'Monthly' : 'คอร์สรายเดือน') : s.courseType === 'saturday' ? (isEn ? 'Saturday 4' : 'คอร์สวันเสาร์ 4 ครั้ง') : (isEn ? 'Regular 10' : 'คอร์สปกติ 10 ครั้ง');

    return `
      <button type="button" onclick="selectLoginStudent(${s.id})" class="w-full p-4 rounded-2xl transition-all cursor-pointer text-left border-2 flex items-center justify-between gap-3 group active:scale-[0.98] ${isCur ? 'bg-[#241044] text-white border-[#DEB95B] shadow-md ring-2 ring-[#DEB95B]' : 'bg-white hover:bg-purple-50 text-[#241044] border-nike-hairlineSoft hover:border-[#241044] shadow-sm'}">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black font-mono flex-shrink-0 transition-transform group-hover:scale-105 ${isCur ? 'bg-[#DEB95B] text-[#241044]' : 'bg-[#241044] text-[#DEB95B]'}">
            ${typeof escapeHtml === 'function' ? escapeHtml(s.name.charAt(0)) : s.name.charAt(0)}
          </div>
          <div class="min-w-0 space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base sm:text-lg font-black ${isCur ? 'text-white' : 'text-[#241044]'}">${typeof escapeHtml === 'function' ? escapeHtml(sName) : sName}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCur ? 'bg-white/20 text-[#DEB95B]' : 'bg-[#FBF4DD] text-[#241044] border border-[#DEB95B]'}">${typeof escapeHtml === 'function' ? escapeHtml(cTypeLabel) : cTypeLabel}</span>
            </div>
            <div class="text-xs ${isCur ? 'text-white/80' : 'text-slate-500'} flex items-center gap-2 flex-wrap">
              <span>${typeof escapeHtml === 'function' ? escapeHtml(s.fullName || s.name) : (s.fullName || s.name)}</span>
              <span>•</span>
              <span class="font-mono">ID: #${s.id}</span>
              <span>•</span>
              <span class="font-bold ${isCur ? 'text-[#DEB95B]' : 'text-[#241044]'}">${typeof escapeHtml === 'function' ? escapeHtml(uInfo.uCategory) : uInfo.uCategory}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 flex-shrink-0">
          <span class="text-xs font-extrabold ${isCur ? 'text-[#DEB95B]' : 'text-[#241044] group-hover:text-[#DEB95B]'}">${isCur ? (isEn ? 'Viewing' : 'กำลังดูคนนี้') : (isEn ? 'Select' : 'เลือกคนนี้')}</span>
          <i data-lucide="chevron-right" class="w-4 h-4 ${isCur ? 'text-[#DEB95B]' : 'text-slate-400 group-hover:text-[#DEB95B]'}"></i>
        </div>
      </button>
    `;
  }).join('');

  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeSiblingSelectModal() {
  const modal = document.getElementById('siblingSelectModal');
  if (modal) modal.classList.add('hidden');
}

function selectLoginStudent(studentId) {
  let target = null;
  if (pendingSiblingMatches && pendingSiblingMatches.length > 0) {
    target = pendingSiblingMatches.find(s => Number(s.id) === Number(studentId));
  }
  if (!target && loggedInStudent && typeof getLinkedStudents === 'function') {
    target = getLinkedStudents(loggedInStudent).find(s => Number(s.id) === Number(studentId));
  }
  if (!target && typeof students !== 'undefined') {
    target = students.find(s => Number(s.id) === Number(studentId));
  }
  if (!target) return;

  closeSiblingSelectModal();
  loginAsStudent(target);
}

function loginAsStudent(student) {
  if (!student) return;

  isCoachAuth = false;
  currentStaff = null;
  localStorage.setItem('dbo_is_coach_v14', 'false');
  localStorage.removeItem('dbo_current_staff');

  loggedInStudent = student;
  localStorage.setItem('dbo_parent_logged_v14', JSON.stringify(loggedInStudent));
  localStorage.setItem('dbo_my_device_login_ts', String(Date.now()));
  sessionStorage.setItem('dbo_tab_parent_logged', JSON.stringify(loggedInStudent));

  updateCoachStateUI();
  updateHeaderProfileUI();
  if (typeof renderParentView === 'function') renderParentView();
  switchTab('parent-portal');

  if (typeof checkAndPromptPdpaConsent === 'function') {
    setTimeout(checkAndPromptPdpaConsent, 350);
  }

  showToast(`เข้าสู่ระบบสำเร็จ ยินดีต้อนรับผู้ปกครองน้อง ${loggedInStudent.name}`);
  triggerTelegramPush(`🏀 ยินดีต้อนรับผู้ปกครองน้อง ${loggedInStudent.name} เข้าสู่ระบบ DBO`, 'DBO Basketball Academy');

  if (typeof registerWebPushSubscription === 'function' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    registerWebPushSubscription(false);
  }
}

window.openSiblingSelectModal = openSiblingSelectModal;
window.closeSiblingSelectModal = closeSiblingSelectModal;
window.selectLoginStudent = selectLoginStudent;
window.loginAsStudent = loginAsStudent;
