// ========================================================
// DBO Basketball Academy - Application State Store
// ========================================================

// 1. Core State Variables
let weeklySchedule = JSON.parse(localStorage.getItem('dbo_weekly_schedule_v16')) || defaultWeeklySchedule;
let assistantCoaches = JSON.parse(localStorage.getItem('dbo_assistant_coaches_v14')) || defaultAssistantCoaches;
let calendarDayOverrides = JSON.parse(localStorage.getItem('dbo_calendar_overrides_v1')) || {};
let coachRosterViewMode = (window.innerWidth < 768) ? 'cards' : (localStorage.getItem('dbo_roster_view_mode_v2') || 'cards');

// Cross-Device Cloud Sync Metadata & Submit Tracking
let deletedStudentIds = JSON.parse(localStorage.getItem('dbo_deleted_students_v16')) || {};
if (typeof defaultDeletedStudentIds !== 'undefined' && defaultDeletedStudentIds) {
  Object.keys(defaultDeletedStudentIds).forEach(k => {
    if (!deletedStudentIds[k]) deletedStudentIds[k] = defaultDeletedStudentIds[k];
  });
  localStorage.setItem('dbo_deleted_students_v16', JSON.stringify(deletedStudentIds));
}
let processedSlipIds = JSON.parse(localStorage.getItem('dbo_processed_slips_v16')) || {};
let lastSubmittedAt = parseInt(localStorage.getItem('dbo_last_submitted_at_v16') || '0', 10);
let lastSubmittedBy = localStorage.getItem('dbo_last_submitted_by_v16') || '';
let pendingSessionChanges = 0;

let students = JSON.parse(localStorage.getItem('dbo_students_v14')) || null;
if (!students) {
  students = initialRawData.map(s => ({
    ...s,
    phone: s.phone || '',
    parentName: '',
    parentRelation: '',
    nextRenewal: s.courseType === 'monthly' ? calculateMonthlyNextRenewal(s.startDate) : '-',
    remarkOat: '',
    remarkOak: '',
    vJump: null,
    vJumpHistory: [],
    longJump: null,
    longJumpHistory: [],
    checkInHistory: s.checkInHistory || []
  }));
  syncSiblingState(students);
  localStorage.setItem('dbo_students_v14', JSON.stringify(students));
}

// One-time Authoritative Collision Recovery (Nov 20, 2026 v2):
// Restores exact quotas reconciled across all 7 teaching records (Nov 3, 5, 12, 13, 16, 17, 19) & Nov 20 renewals,
// clears cutoff dates (nextRenewal: '-') for all non-monthly courses, and removes the 13 deleted students.
const COLLISION_RECOVERY_KEY = 'dbo_collision_reconciled_nov20_v2';
if (!localStorage.getItem(COLLISION_RECOVERY_KEY)) {
  const verifiedMap = new Map();
  initialRawData.forEach(r => verifiedMap.set(Number(r.id), r));

  // Filter out deleted student IDs
  students = students.filter(st => st && !deletedStudentIds[String(st.id)]);

  students.forEach(st => {
    const raw = verifiedMap.get(Number(st.id));
    if (raw) {
      st.name = raw.name;
      st.remaining = raw.remaining;
      st.saturdayRemaining = raw.saturdayRemaining;
      if (raw.phone && !st.phone) st.phone = raw.phone;
      if (!st.checkInHistory || st.checkInHistory.length === 0) {
        st.checkInHistory = raw.checkInHistory || [];
      }
      // Enforce rule: only monthly courses have a cutoff date; per-session/saturday have NO cutoff date ('-')
      if (st.courseType === 'monthly') {
        st.nextRenewal = (st.nextRenewal && /^\d{4}-\d{2}-\d{2}$/.test(st.nextRenewal))
          ? st.nextRenewal
          : calculateMonthlyNextRenewal(st.startDate);
      } else {
        st.nextRenewal = '-';
      }
    }
  });

  // Ensure all 44 active students (including #55 มาเตโอ, #56 น้องจามิน, #57 นี๊บ) exist
  initialRawData.forEach(raw => {
    if (!deletedStudentIds[String(raw.id)] && !students.some(s => Number(s.id) === Number(raw.id))) {
      students.push({
        ...raw,
        parentName: '',
        parentRelation: '',
        nextRenewal: raw.courseType === 'monthly' ? calculateMonthlyNextRenewal(raw.startDate) : '-',
        remarkOat: '',
        remarkOak: '',
        vJump: null,
        vJumpHistory: [],
        longJump: null,
        longJumpHistory: [],
        checkInHistory: raw.checkInHistory || [],
        _updatedAt: Date.now()
      });
    }
  });

  students.sort((a, b) => Number(a.id) - Number(b.id));
  syncSiblingState(students);
  localStorage.setItem('dbo_students_v14', JSON.stringify(students));
  localStorage.setItem(COLLISION_RECOVERY_KEY, 'true');
} else {
  // Always ensure non-monthly students have nextRenewal: '-' and deleted students are filtered out
  students = students.filter(st => st && !deletedStudentIds[String(st.id)]);
  students.forEach(st => {
    // Heal stale cached negative quota on parent device if no authoritative coach action set it
    if (Number(st.id) !== 17 && (st.remaining || 0) < 0 && !st._lastCoachActionAt) {
      const raw = initialRawData.find(r => Number(r.id) === Number(st.id));
      if (raw && raw.remaining >= 0) {
        st.remaining = raw.remaining;
      }
    }
    if (st.courseType === 'monthly') {
      if (!st.nextRenewal || !/^\d{4}-\d{2}-\d{2}$/.test(st.nextRenewal)) {
        st.nextRenewal = calculateMonthlyNextRenewal(st.startDate);
      }
    } else {
      st.nextRenewal = '-';
    }
  });
}

// Ensure student timestamps are normalized to real time so new coach edits are strictly authoritative
const nowBaseline = Date.now();
let hasTsAdjusted = false;
students.forEach(st => {
  if ((st._updatedAt || 0) > nowBaseline + 1000) {
    st._updatedAt = nowBaseline - 60000;
    hasTsAdjusted = true;
  }
});
if (hasTsAdjusted) {
  localStorage.setItem('dbo_students_v14', JSON.stringify(students));
}

// Automatic Reset of Mock Metrics & Boilerplate Remarks across all students
if (!localStorage.getItem('dbo_metrics_reset_v2')) {
  students.forEach(s => {
    s.remarkOat = '';
    s.remarkOak = '';
    s.vJump = null;
    s.vJumpHistory = [];
    s.longJump = null;
    s.longJumpHistory = [];
    s.isRealSportsMetrics = false;
  });
  localStorage.setItem('dbo_students_v14', JSON.stringify(students));
  localStorage.setItem('dbo_metrics_reset_v2', 'true');
}

let loggedInStudent = null;
try {
  loggedInStudent = JSON.parse(sessionStorage.getItem('dbo_tab_parent_logged')) || JSON.parse(localStorage.getItem('dbo_parent_logged_v14')) || null;
} catch (e) {
  loggedInStudent = null;
}
if (loggedInStudent && !localStorage.getItem('dbo_parent_logged_metrics_reset_v2')) {
  loggedInStudent.remarkOat = '';
  loggedInStudent.remarkOak = '';
  loggedInStudent.vJump = null;
  loggedInStudent.vJumpHistory = [];
  loggedInStudent.longJump = null;
  loggedInStudent.longJumpHistory = [];
  loggedInStudent.isRealSportsMetrics = false;
  localStorage.setItem('dbo_parent_logged_v14', JSON.stringify(loggedInStudent));
  localStorage.setItem('dbo_parent_logged_metrics_reset_v2', 'true');
}

let isCoachAuth = localStorage.getItem('dbo_is_coach_v14') === 'true';
let currentStaff = JSON.parse(localStorage.getItem('dbo_current_staff')) || (isCoachAuth ? AUTHORIZED_STAFF['0933199119'] : null);
let currentCoachFilter = 'all';

// Pending Slips Queue for Admin Verification
let pendingSlips = JSON.parse(localStorage.getItem('dbo_pending_slips_v14')) || [];

// Parent Account Registrations (Awaiting Coach Approval)
let parentRegistrations = JSON.parse(localStorage.getItem('dbo_parent_registrations_v14')) || [];

// Daily Attendance Registry
let dailyAttendance = JSON.parse(localStorage.getItem('dbo_daily_attendance_v14')) || {};
if (typeof defaultSeededDailyAttendance !== 'undefined' && defaultSeededDailyAttendance) {
  Object.keys(defaultSeededDailyAttendance).forEach(dk => {
    if (!dailyAttendance[dk]) {
      dailyAttendance[dk] = defaultSeededDailyAttendance[dk];
    }
  });
  localStorage.setItem('dbo_daily_attendance_v14', JSON.stringify(dailyAttendance));
}

// Teaching & Attendance Records (DBO Academy Style - All 7 Reconciled Records)
let teachingRecords = JSON.parse(localStorage.getItem('dbo_teaching_records_v19')) || [];
if (typeof defaultSeededTeachingRecords !== 'undefined' && Array.isArray(defaultSeededTeachingRecords)) {
  const existingRecMap = new Map();
  teachingRecords.forEach(r => { if (r && r.id) existingRecMap.set(r.id, r); });
  defaultSeededTeachingRecords.forEach(seedRec => {
    if (seedRec && seedRec.id) {
      // Repair any mojibake or missing records
      const ex = existingRecMap.get(seedRec.id);
      if (!ex || (ex.coach && ex.coach.includes('?')) || !ex.slot) {
        existingRecMap.set(seedRec.id, seedRec);
      }
    }
  });
  teachingRecords = Array.from(existingRecMap.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  localStorage.setItem('dbo_teaching_records_v19', JSON.stringify(teachingRecords));
}

// Export Data to CSV
function exportDataToCSV() {
  let csv = "\uFEFFลำดับ,ชื่อนักเรียน,เบอร์โทรศัพท์,ประเภทคอร์ส,วันเริ่มเรียน,วันตัดรอบถัดไป,โควต้าปกติ,โควตาวันเสาร์,หมายเหตุ\n";
  students.forEach((s, idx) => {
    let typeName = s.courseType === 'monthly' ? 'รายเดือน' : (s.courseType === 'saturday' ? 'วันเสาร์ 4 ครั้ง' : (s.courseType === 'both' ? 'ทั้งปกติและเสาร์' : 'ปกติ 10 ครั้ง'));
    csv += `"${idx + 1}","${s.name}","${s.phone}","${typeName}","${s.startDate || '-'}","${s.nextRenewal || '-'}","${s.remaining || 0}","${s.saturdayRemaining || 0}","${(s.remark || '').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `DBO_Students_Backup_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('ส่งออกไฟล์ข้อมูล CSV เรียบร้อยแล้ว');
}

// Export Full Database JSON
function exportDatabaseJSON() {
  const fullDb = {
    exportedAt: new Date().toISOString(),
    version: APP_VERSION,
    students,
    dailyAttendance,
    parentRegistrations,
    pendingSlips,
    teachingRecords,
    weeklySchedule,
    assistantCoaches,
    calendarDayOverrides
  };
  const blob = new Blob([JSON.stringify(fullDb, null, 2)], { type: 'application/json' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `DBO_Academy_FullDB_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('สำรองฐานข้อมูลระบบ JSON เรียบร้อยแล้ว');
}

// Import Full Database JSON
function importDatabaseJSON(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.students && Array.isArray(imported.students)) {
        if (!confirm(`ต้องการกู้คืนฐานข้อมูล (${imported.students.length} คน) เข้าสู่ระบบใช่หรือไม่?\n* ข้อมูลปัจจุบันจะถูกแทนที่ด้วยไฟล์สำรองนี้`)) return;
        applyIncomingState(imported, 'กู้คืนฐานข้อมูลจากไฟล์สำรองสำเร็จ');
        saveState(true, 'กู้คืนฐานข้อมูลจากไฟล์สำรอง');
        showToast(`กู้คืนฐานข้อมูลสำเร็จ (${imported.students.length} คน)`);
      } else {
        showToast('รูปแบบไฟล์สำรองไม่ถูกต้อง');
      }
    } catch (err) {
      showToast('อ่านไฟล์ JSON ไม่สำเร็จ: ' + err.message);
    }
  };
  reader.readAsText(input.files[0]);
}

// Reload state from LocalStorage
function reloadStateFromStorage() {
  try {
    students = JSON.parse(localStorage.getItem('dbo_students_v14')) || students;
    dailyAttendance = JSON.parse(localStorage.getItem('dbo_daily_attendance_v14')) || dailyAttendance;
    teachingRecords = JSON.parse(localStorage.getItem('dbo_teaching_records_v19')) || teachingRecords;
    parentRegistrations = JSON.parse(localStorage.getItem('dbo_parent_registrations_v14')) || parentRegistrations;
    pendingSlips = JSON.parse(localStorage.getItem('dbo_pending_slips_v14')) || pendingSlips;
    calendarDayOverrides = JSON.parse(localStorage.getItem('dbo_calendar_overrides_v1')) || calendarDayOverrides;
    if (typeof refreshAllViews === 'function') refreshAllViews();
  } catch (e) {
    console.log('Reload storage error:', e);
  }
}
