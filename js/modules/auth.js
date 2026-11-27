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

  // 1.5 Check Assistant Coaches Whitelist
  const matchedAsst = assistantCoaches.find(a => (a.phone || '').replace(/[^\d]/g, '') === cleanPhone && cleanPhone !== '');
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

    loggedInStudent = matched[0];
    localStorage.setItem('dbo_parent_logged_v14', JSON.stringify(loggedInStudent));
    localStorage.setItem('dbo_my_device_login_ts', String(Date.now()));
    sessionStorage.setItem('dbo_tab_parent_logged', JSON.stringify(loggedInStudent));
    updateCoachStateUI();
    updateHeaderProfileUI();
    renderParentView(matched);
    switchTab('parent-portal');
    if (typeof checkAndPromptPdpaConsent === 'function') {
      setTimeout(checkAndPromptPdpaConsent, 350);
    }
    showToast(`เข้าสู่ระบบสำเร็จ ยินดีต้อนรับผู้ปกครองน้อง ${loggedInStudent.name}`);
    triggerTelegramPush(`🏀 ยินดีต้อนรับผู้ปกครองน้อง ${loggedInStudent.name} เข้าสู่ระบบ DBO`, 'DBO Basketball Academy');

    // Sync Web Push subscription for this student in background
    if (typeof registerWebPushSubscription === 'function' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      registerWebPushSubscription(false);
    }
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
