// ========================================================
// DBO Basketball Academy - Bilingual (TH/EN), PDPA Consent,
// Athlete U-Age Competition Classifier, Multi-Device Logout & Slip Receipt
// ========================================================

let currentAppLang = localStorage.getItem('dbo_app_lang_v1') || 'th';

const DBO_I18N_DICT = {
  th: {
    nav_home_login: 'เข้าสู่ระบบ',
    nav_home_coach: 'หน้าหลัก',
    nav_calendar: 'ปฏิทิน',
    nav_calendar_full: 'ปฏิทิน & ตารางซ้อม',
    nav_today_class: 'คลาสวันนี้',
    nav_renew: 'ต่อคอร์ส',
    nav_register: 'สมัครเรียนใหม่',
    nav_coach_board: 'Coach Board',
    nav_coach_panel: 'แผงโค้ช',
    header_notify_on: 'แจ้งเตือนเปิดอยู่',
    header_notify_enable: 'เปิดรับแจ้งเตือน',
    header_install: 'ติดตั้งแอป',
    header_online: 'ออนไลน์',
    login_title: 'เข้าสู่ระบบผู้ปกครอง & โค้ช',
    login_subtitle: 'กรอกเบอร์โทรศัพท์มือถือที่ผูกกับนักเรียน',
    login_phone_label: 'เบอร์โทรศัพท์มือถือ',
    login_btn: 'เข้าสู่ระบบ',
    login_link_btn: 'ผูกเบอร์กับนักเรียน (ต้องยืนยันตัวตน/รอโค้ชอนุมัติ)',
    login_today_btn: 'ดูตารางและคลาสวันนี้',
    login_new_prompt: 'สนใจสมัครเรียนบาสเกตบอลใหม่? ',
    login_new_link: 'กดสมัครเรียนที่นี่',
    student_info_heading: 'ข้อมูลนักเรียน',
    remaining_quota_label: 'สิทธิ์คงเหลือ',
    btn_renew_course: 'ต่อคอร์ส',
    btn_attend_today: 'แจ้งเข้าเรียนวันนี้',
    btn_leave_today: 'แจ้งขอลาเรียน',
    cat_history: 'ประวัติเข้าเรียน',
    cat_growth: 'พัฒนาการ & ข้อมูลนักกีฬา',
    cat_classmates: 'เพื่อนร่วมคลาสวันนี้',
    cat_schedule: 'ตารางซ้อมประจำสัปดาห์',
    history_heading: 'บันทึกการเช็คชื่อเข้าฝึกซ้อม (แสดงยอดคงเหลือรายครั้ง)',
    col_date: 'วันที่ซ้อม',
    col_class: 'คลาส',
    col_status: 'สถานะ',
    col_deduct: 'หักสิทธิ์',
    col_balance: 'คงเหลือ',
    logout_this_device: 'ออกจากระบบเครื่องนี้',
    logout_all_devices: 'ออกจากระบบทุกเครื่อง (Logout All Devices)'
  },
  en: {
    nav_home_login: 'Sign In',
    nav_home_coach: 'Home',
    nav_calendar: 'Calendar',
    nav_calendar_full: 'Calendar & Schedule',
    nav_today_class: "Today's Class",
    nav_renew: 'Renew Course',
    nav_register: 'Enroll New',
    nav_coach_board: 'Coach Board',
    nav_coach_panel: 'Coach Admin',
    header_notify_on: 'Alerts Active',
    header_notify_enable: 'Enable Alerts',
    header_install: 'Install App',
    header_online: 'Online',
    login_title: 'Parent & Coach Sign In',
    login_subtitle: 'Enter the mobile number linked to your athlete',
    login_phone_label: 'Mobile Phone Number',
    login_btn: 'Sign In',
    login_link_btn: 'Link Phone to Student (Requires Verification)',
    login_today_btn: "View Today's Class Board",
    login_new_prompt: 'New to DBO Basketball Academy? ',
    login_new_link: 'Enroll New Student',
    student_info_heading: 'Athlete Profile & Cards',
    remaining_quota_label: 'REMAINING SESSIONS',
    btn_renew_course: 'Renew Course',
    btn_attend_today: 'Confirm Attending',
    btn_leave_today: 'Request Leave',
    cat_history: 'Attendance Log',
    cat_growth: 'Growth & Athlete Info',
    cat_classmates: "Today's Classmates",
    cat_schedule: 'Weekly Schedule',
    history_heading: 'Attendance & Session Balance History',
    col_date: 'Date',
    col_class: 'Class',
    col_status: 'Status',
    col_deduct: 'Used',
    col_balance: 'Balance',
    logout_this_device: 'Sign Out (This Device)',
    logout_all_devices: 'Sign Out of All Devices'
  }
};

function tLang(key) {
  const dict = DBO_I18N_DICT[currentAppLang] || DBO_I18N_DICT.th;
  return dict[key] || DBO_I18N_DICT.th[key] || key;
}

function toggleAppLanguage(lang) {
  currentAppLang = lang || (currentAppLang === 'th' ? 'en' : 'th');
  localStorage.setItem('dbo_app_lang_v1', currentAppLang);
  applyAppLanguageUI();
  if (typeof renderParentView === 'function') renderParentView();
  if (typeof renderWeeklyScheduleView === 'function') renderWeeklyScheduleView();
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
}

function applyAppLanguageUI() {
  const isEn = currentAppLang === 'en';
  document.documentElement.lang = currentAppLang;

  // Update language toggle buttons
  const btnTop = document.getElementById('btnHeaderLangToggle');
  if (btnTop) btnTop.textContent = isEn ? '🇬🇧 EN | TH' : '🇹🇭 TH | EN';
  const btnLogin = document.getElementById('btnLoginBoxLangToggle');
  if (btnLogin) btnLogin.textContent = isEn ? '🇬🇧 EN | 🇹🇭 TH' : '🇹🇭 TH | 🇬🇧 EN';
  document.querySelectorAll('.dbo-lang-toggle-label').forEach(el => {
    el.textContent = isEn ? '🇬🇧 EN | TH' : '🇹🇭 TH | EN';
  });

  // Translate elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const txt = tLang(key);
    if (txt) el.textContent = txt;
  });

  // Translate navigation tabs & core labels directly by ID
  const setSpan = (id, key) => {
    const el = document.querySelector(`#${id} span`);
    if (el) el.textContent = tLang(key);
  };
  setSpan('nav-calendar', 'nav_calendar_full');
  setSpan('nav-m-calendar', 'nav_calendar');
  setSpan('nav-daily-attendance', 'nav_today_class');
  setSpan('nav-m-daily-attendance', 'nav_today_class');
  setSpan('nav-renew-payment', 'nav_renew');
  setSpan('nav-m-renew-payment', 'nav_renew');
  setSpan('nav-register-new', 'nav_register');
  setSpan('nav-m-register-new', 'nav_register');
  setSpan('nav-coach-roster', 'nav_coach_panel');
  setSpan('nav-m-coach-roster', 'nav_coach_panel');
  setSpan('pcat-btn-history', 'cat_history');
  setSpan('pcat-btn-growth', 'cat_growth');
  setSpan('pcat-btn-classmates', 'cat_classmates');
  setSpan('pcat-btn-schedule', 'cat_schedule');
  setSpan('btnParentLogoutBottom', 'logout_this_device');
  setSpan('btnParentLogoutAllDevices', 'logout_all_devices');

  const loginH1 = document.querySelector('#parent-login-box .workspace-title h1');
  if (loginH1) loginH1.textContent = tLang('login_title');
  const loginP = document.querySelector('#parent-login-box .workspace-title p');
  if (loginP) loginP.textContent = tLang('login_subtitle');
  const loginBtnSpan = document.querySelector('#btnLoginSubmit span');
  if (loginBtnSpan) loginBtnSpan.textContent = tLang('login_btn');
}

// ========================================================
// 2. Athlete Age & U-Category Calculator (U8/U10/U12/U14/U16/U18)
// ========================================================
function calculateAthleteAgeAndUCategory(student) {
  if (!student) return { age: null, uCategory: 'ยังไม่ระบุวันเกิด', birthYear: null };
  let age = null;
  let birthYear = null;

  if (student.birthDate && /^\d{4}-\d{2}-\d{2}$/.test(student.birthDate)) {
    const [y, m, d] = student.birthDate.split('-').map(Number);
    birthYear = y;
    const now = new Date();
    age = now.getFullYear() - y;
  } else if (student.age && Number(student.age) > 0) {
    age = Number(student.age);
    birthYear = new Date().getFullYear() - age;
  }

  if (age === null || isNaN(age) || age <= 0) {
    return { age: null, uCategory: 'รอระบุวันเกิด', birthYear: null };
  }

  let uCat = 'Open';
  if (age <= 8) uCat = 'U8';
  else if (age <= 10) uCat = 'U10';
  else if (age <= 12) uCat = 'U12';
  else if (age <= 14) uCat = 'U14';
  else if (age <= 16) uCat = 'U16';
  else if (age <= 18) uCat = 'U18';

  return { age, uCategory: uCat, birthYear };
}

function maskCitizenId(cid) {
  if (!cid) return 'ยังไม่ระบุ';
  const clean = String(cid).replace(/\D/g, '');
  if (clean.length < 13) return clean;
  return `${clean[0]}-${clean.slice(1, 5)}-xxxxx-${clean.slice(10, 12)}-${clean[12]}`;
}

// ========================================================
// 3. PDPA First-Login Consent Modal & Audit Log
// ========================================================
function checkAndPromptPdpaConsent() {
  if (!loggedInStudent || isCoachAuth) return;
  const family = (typeof getLinkedStudents === 'function') ? getLinkedStudents(loggedInStudent) : [loggedInStudent];
  const hasConsented = family.some(s => s && s.pdpaConsentAcceptedAt);
  if (hasConsented) return;

  const modal = document.getElementById('pdpaConsentModal');
  if (modal) {
    const nameLabel = document.getElementById('pdpaStudentNamesLabel');
    if (nameLabel) {
      nameLabel.textContent = family.map(s => `น้อง ${s.name}`).join(', ');
    }
    modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function acceptPdpaConsent() {
  const chk = document.getElementById('pdpaConsentCheckbox') || document.getElementById('pdpaAcceptCheckbox');
  if (chk && !chk.checked) {
    if (typeof showToast === 'function') showToast('กรุณาติ๊กถูกเพื่อยืนยันความยินยอม PDPA ก่อนดำเนินการต่อครับ');
    return;
  }

  const nowTs = Date.now();
  const nowIso = new Date().toISOString();
  const family = (typeof getLinkedStudents === 'function' && loggedInStudent) ? getLinkedStudents(loggedInStudent) : (loggedInStudent ? [loggedInStudent] : []);

  family.forEach(s => {
    s.pdpaConsentAcceptedAt = nowIso;
    s.pdpaConsentTimestamp = nowTs;
    s.pdpaConsentVersion = 'DBO-PDPA-2026-v1';
  });

  if (loggedInStudent) {
    loggedInStudent.pdpaConsentAcceptedAt = nowIso;
    localStorage.setItem('dbo_parent_logged_v14', JSON.stringify(loggedInStudent));
  }
  localStorage.setItem('dbo_students_v14', JSON.stringify(students));

  const modal = document.getElementById('pdpaConsentModal');
  if (modal) modal.classList.add('hidden');

  if (typeof saveState === 'function') {
    saveState(true, `ผู้ปกครองยืนยันความยินยอม PDPA (${family.map(s => s.name).join(', ')})`, true);
  }
  if (typeof renderParentView === 'function') renderParentView();
  if (typeof showToast === 'function') showToast('บันทึกหลักฐานความยินยอม PDPA เรียบร้อยแล้ว ขอบคุณครับ');
}

// ========================================================
// 4. Logout All Devices (Revoke Session Across All Phones/iPads)
// ========================================================
function parentLogoutAllDevices() {
  if (!loggedInStudent) {
    if (typeof parentLogout === 'function') parentLogout();
    return;
  }

  const family = (typeof getLinkedStudents === 'function') ? getLinkedStudents(loggedInStudent) : [loggedInStudent];
  const names = family.map(s => `น้อง ${s.name}`).join(', ');
  if (!confirm(`ยืนยัน "ออกจากระบบทุกเครื่อง (Logout All Devices)" สำหรับบัญชีของ ${names} หรือไม่?\n\nมือถือและ iPad ทุกเครื่องที่ล็อกอินค้างไว้จะถูกบังคับออกจากระบบทันที`)) {
    return;
  }

  const revokeTs = Date.now();
  const phoneClean = (loggedInStudent.phone || '').replace(/\D/g, '');

  family.forEach(s => {
    s.sessionRevokedAt = revokeTs;
  });

  localStorage.setItem('dbo_students_v14', JSON.stringify(students));
  localStorage.setItem('dbo_my_device_login_ts', String(revokeTs - 5000));

  if (typeof saveState === 'function') {
    saveState(true, `ผู้ปกครองสั่งออกจากระบบทุกเครื่อง (Logout All Devices): ${names}`, true);
  }

  // Broadcast real-time revocation via MQTT & BroadcastChannel
  const revokePayload = {
    senderId: window.dboClientId || 'dbo_peer',
    type: 'FORCE_LOGOUT_ALL_DEVICES',
    phone: phoneClean,
    studentIds: family.map(s => Number(s.id)),
    revokedAt: revokeTs
  };

  if (typeof publishToMqttBrokers === 'function') {
    publishToMqttBrokers(REALTIME_SYNC_TOPIC, revokePayload);
  }
  if (window.dboRealtimeBC) {
    try { window.dboRealtimeBC.postMessage(revokePayload); } catch (e) {}
  }

  if (typeof parentLogout === 'function') parentLogout();
  if (typeof showToast === 'function') showToast('สั่งออกจากระบบทุกเครื่อง (มือถือ / iPad ทุกอุปกรณ์) เรียบร้อยแล้ว');
}

// ========================================================
// 5. Athlete Competition Info Modal (Full Name, BirthDate, Citizen ID, Enrolled Days)
// ========================================================
function openAthleteProfileModal(studentId) {
  const targetId = studentId != null ? Number(studentId) : (loggedInStudent ? Number(loggedInStudent.id) : null);
  const st = students.find(s => Number(s.id) === targetId);
  if (!st) return;

  const idEl = document.getElementById('athleteModalStudentId');
  if (idEl) idEl.value = st.id;

  const titleEl = document.getElementById('athleteModalTitle') || document.getElementById('athleteModalNickName');
  if (titleEl) titleEl.textContent = `ข้อมูลนักกีฬา & รุ่นอายุ: น้อง ${st.name} (#${st.id})`;

  const fnEl = document.getElementById('athleteModalFullName');
  if (fnEl) fnEl.value = st.fullName || '';

  const bdEl = document.getElementById('athleteModalBirthDate');
  if (bdEl) bdEl.value = st.birthDate || '';

  const cidEl = document.getElementById('athleteModalCitizenId');
  if (cidEl) cidEl.value = st.citizenId || '';

  const schEl = document.getElementById('athleteModalSchool');
  if (schEl) schEl.value = st.school || '';

  const defaultDays = st.courseType === 'saturday' ? ['sat'] : st.courseType === 'both' ? ['mon', 'tue', 'thu', 'sat'] : ['mon', 'tue', 'thu'];
  const enrolled = Array.isArray(st.enrolledDays) && st.enrolledDays.length > 0 ? st.enrolledDays : defaultDays;
  ['mon', 'tue', 'thu', 'sat'].forEach(d => {
    const cb = document.getElementById(`athleteDay-${d}`) || document.getElementById(`athleteDay_${d}`);
    if (cb) cb.checked = enrolled.includes(d);
  });

  updateAthleteModalAgePreview();
  document.getElementById('athleteProfileModal')?.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeAthleteProfileModal() {
  document.getElementById('athleteProfileModal')?.classList.add('hidden');
}

function previewAthleteModalUCategory() {
  updateAthleteModalAgePreview();
}

function updateAthleteModalAgePreview() {
  const bDate = document.getElementById('athleteModalBirthDate')?.value || '';
  const previewEl = document.getElementById('athleteModalUCategoryBadge') || document.getElementById('athleteModalUCatPreview');
  if (!previewEl) return;
  if (!bDate) {
    previewEl.textContent = 'รอกรอกวันเกิด (U8–U18)';
    return;
  }
  const info = calculateAthleteAgeAndUCategory({ birthDate: bDate });
  previewEl.textContent = `${info.uCategory} (อายุ ${info.age} ปี • เกิด พ.ศ. ${info.birthYear + 543})`;
}

function saveAthleteProfileModal(e) {
  if (e) e.preventDefault();
  const sid = Number(document.getElementById('athleteModalStudentId')?.value);
  const st = students.find(s => Number(s.id) === sid);
  if (!st) return;

  st.fullName = (document.getElementById('athleteModalFullName')?.value || '').trim();
  st.birthDate = (document.getElementById('athleteModalBirthDate')?.value || '').trim();
  st.citizenId = (document.getElementById('athleteModalCitizenId')?.value || '').replace(/\D/g, '').slice(0, 13);
  const schEl = document.getElementById('athleteModalSchool');
  if (schEl) st.school = (schEl.value || '').trim();

  const selectedDays = [];
  ['mon', 'tue', 'thu', 'sat'].forEach(d => {
    const cb = document.getElementById(`athleteDay-${d}`) || document.getElementById(`athleteDay_${d}`);
    if (cb && cb.checked) selectedDays.push(d);
  });
  if (selectedDays.length > 0) st.enrolledDays = selectedDays;

  const info = calculateAthleteAgeAndUCategory(st);
  if (info.age) st.age = info.age;

  if (!st.pdpaConsentAcceptedAt) {
    st.pdpaConsentAcceptedAt = new Date().toISOString();
  }
  st.pdpaConsentAccepted = true;

  localStorage.setItem('dbo_students_v14', JSON.stringify(students));
  if (loggedInStudent && Number(loggedInStudent.id) === sid) {
    loggedInStudent = st;
    localStorage.setItem('dbo_parent_logged_v14', JSON.stringify(loggedInStudent));
  }

  if (typeof saveState === 'function') {
    saveState(true, `อัปเดตข้อมูลนักกีฬาและรุ่นอายุ: น้อง ${st.name} (${info.uCategory})`, true);
  }

  closeAthleteProfileModal();
  if (typeof renderParentView === 'function') renderParentView();
  if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
  if (typeof showToast === 'function') showToast(`บันทึกข้อมูลนักกีฬาของน้อง ${st.name} (${info.uCategory}) เรียบร้อยแล้ว`);
}

// ========================================================
// 6. Instant Payment Slip Submission Receipt Modal (For Parent Screenshot)
// ========================================================
function showSlipSubmissionReceiptModal(receipt) {
  const modal = document.getElementById('slipReceiptConfirmationModal');
  if (!modal) return;

  const refCode = receipt.refId || ('DBO-' + String(Date.now()).slice(-6));
  const nowStr = receipt.submittedAt || (new Date().toLocaleString('th-TH', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) + ' น.');

  const refEl = document.getElementById('receiptRefId') || document.getElementById('receiptRefCode');
  if (refEl) refEl.textContent = refCode;

  const timeEl = document.getElementById('receiptTime') || document.getElementById('receiptDateTime');
  if (timeEl) timeEl.textContent = nowStr;

  const nameEl = document.getElementById('receiptStudentName');
  if (nameEl) nameEl.textContent = receipt.studentName ? `น้อง ${receipt.studentName}` : '-';

  const pkgEl = document.getElementById('receiptPackageName');
  if (pkgEl) pkgEl.textContent = receipt.packageName || 'ต่อคอร์สเรียน DBO';

  const amtEl = document.getElementById('receiptAmount') || document.getElementById('receiptAmountText');
  if (amtEl) amtEl.textContent = `${Number(receipt.amount || 0).toLocaleString()} บาท`;

  const imgWrapper = document.getElementById('receiptSlipImageWrapper');
  const imgPreview = document.getElementById('receiptSlipPreviewImg') || document.getElementById('receiptSlipThumb');
  if (imgPreview && receipt.slipImage) {
    imgPreview.src = receipt.slipImage;
    imgPreview.classList.remove('hidden');
    if (imgWrapper) imgWrapper.classList.remove('hidden');
  } else {
    if (imgWrapper) imgWrapper.classList.add('hidden');
  }

  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeSlipSubmissionReceiptModal() {
  document.getElementById('slipReceiptConfirmationModal')?.classList.add('hidden');
}

// ========================================================
// 7. EMVCo PromptPay Dynamic Amount QR Generator (Client-Side)
// ========================================================
// Generates a dynamic QR image URL with exact amount badge for renewal checkout
function updateDynamicPromptPayQrDisplay(amountNum, packageName) {
  const amt = Number(amountNum || 0);
  const amountBanner = document.getElementById('qrExactAmountBadge');
  if (amountBanner) {
    amountBanner.textContent = `ยอดโอนตามแพ็กเกจ: ${amt.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท`;
  }
  const pkgLabel = document.getElementById('qrSelectedPackageNameLabel');
  if (pkgLabel && packageName) {
    pkgLabel.textContent = packageName;
  }
}
