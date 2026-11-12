// ========================================================
// DBO Basketball Academy - Application State Store
// ========================================================

// 1. Core State Variables
let weeklySchedule = JSON.parse(localStorage.getItem('dbo_weekly_schedule_v16')) || defaultWeeklySchedule;
let assistantCoaches = JSON.parse(localStorage.getItem('dbo_assistant_coaches_v14')) || defaultAssistantCoaches;
let coachRosterViewMode = (window.innerWidth < 768) ? 'cards' : (localStorage.getItem('dbo_roster_view_mode_v2') || 'cards');

let students = JSON.parse(localStorage.getItem('dbo_students_v14')) || null;
if (!students) {
  students = initialRawData.map(s => ({
    ...s,
    phone: s.id === 1 ? '081-234-5678' : '',
    parentName: s.id === 1 ? 'ผู้ปกครองน้องอิฐ (บัญชีทดสอบ)' : '',
    parentRelation: s.id === 1 ? 'บิดา/มารดา' : '',
    remarkOat: '',
    remarkOak: '',
    vJump: null,
    vJumpHistory: [],
    longJump: null,
    longJumpHistory: []
  }));
  syncSiblingState(students);
  localStorage.setItem('dbo_students_v14', JSON.stringify(students));
} else {
  // Fix student names in local state to match factual updates (อินธัช & ธาวิน)
  const st44 = students.find(s => s.id === 44);
  if (st44) st44.name = 'อินธัช';
  const st45 = students.find(s => s.id === 45);
  if (st45 && (st45.name === 'นาวิน' || st45.name === 'ธาวิน')) st45.name = 'ธาวิน';
  const st10 = students.find(s => s.id === 10);
  if (st10) st10.name = 'ไวล์แฟรงค์';
  const st15 = students.find(s => s.id === 15);
  if (st15 && (st15.name === 'ฮาร์เด้น' || st15.name === 'ฮาเด้น')) st15.name = 'ฮาเด้น';

  students.forEach(s => {
    if (s.id === 1 && !s.phone) {
      s.phone = '081-234-5678';
      s.parentName = 'ผู้ปกครองน้องอิฐ (บัญชีทดสอบ)';
    } else if (s.phone && s.id !== 1 && (s.phone.startsWith('08000000') || s.phone === '0898765432')) {
      s.phone = '';
    }
    if (s.remaining === undefined) s.remaining = 0;
    if (s.saturdayRemaining === undefined) s.saturdayRemaining = 0;
  });
  syncSiblingState(students);
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
    s._updatedAt = Date.now();
  });
  localStorage.setItem('dbo_students_v14', JSON.stringify(students));
  localStorage.setItem('dbo_metrics_reset_v2', 'true');
}

let loggedInStudent = JSON.parse(localStorage.getItem('dbo_parent_logged_v14')) || null;
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

// Teaching & Attendance Records (Techawit School TWS Style)
let teachingRecords = JSON.parse(localStorage.getItem('dbo_teaching_records_v19')) || [
  {
    id: 'rec_20261105_1700',
    date: '2026-11-05',
    slot: 'คลาสปกติ 17:00 - 18:30 น.',
    coach: 'โค้ชโอ๊ต (Head Coach)',
    topic: 'ฝึกซ้อม Shooting Form, Footwork & Fast Break 3v3',
    attendingCount: 14,
    leaveCount: 22,
    attendingStudents: [
      { id: 6, name: 'ไทม์' }, { id: 7, name: 'พัช' }, { id: 8, name: 'แอร์บัส' },
      { id: 10, name: 'ไวล์แฟรงค์' }, { id: 17, name: 'ชาลี' }, { id: 18, name: 'พีต้า' },
      { id: 24, name: 'แอร์เมส' }, { id: 27, name: 'มาตังค์' }, { id: 39, name: 'Nada' },
      { id: 40, name: 'August' }, { id: 44, name: 'อินธัช' }, { id: 46, name: 'ธีร์' },
      { id: 47, name: 'มังกร' }, { id: 50, name: 'ณฌา' }
    ],
    leaveStudents: [
      { id: 1, name: 'อิฐ' }, { id: 2, name: 'ซับ' }, { id: 3, name: 'ขุนศึก' },
      { id: 4, name: 'ต้นบุญ' }, { id: 5, name: 'ต้นพุด' }, { id: 9, name: 'วินแฟลค' }
    ],
    createdAt: 1793876400000,
    updatedAt: 1793876400000
  },
  {
    id: 'rec_20261103_1700',
    date: '2026-11-03',
    slot: 'คลาสปกติ 17:00 - 18:30 น.',
    coach: 'โค้ชโอ๊ค',
    topic: 'การเลี้ยงบอล Hand Switching, Layup ทรงตัว และ Defense Shuffling',
    attendingCount: 16,
    leaveCount: 20,
    attendingStudents: [
      { id: 2, name: 'ซับ' }, { id: 8, name: 'แอร์บัส' }, { id: 10, name: 'ไวล์แฟรงค์' },
      { id: 17, name: 'ชาลี' }, { id: 20, name: 'แอนฟิลด์' }, { id: 24, name: 'แอร์เมส' },
      { id: 27, name: 'มาตังค์' }, { id: 37, name: 'Phupa' }, { id: 42, name: 'L J' },
      { id: 47, name: 'มังกร' }, { id: 48, name: 'T J' }
    ],
    leaveStudents: [
      { id: 1, name: 'อิฐ' }, { id: 3, name: 'ขุนศึก' }, { id: 4, name: 'ต้นบุญ' },
      { id: 5, name: 'ต้นพุด' }, { id: 6, name: 'ไทม์' }, { id: 7, name: 'พัช' }
    ],
    createdAt: 1793703600000,
    updatedAt: 1793703600000
  }
];

// Cross-Device Cloud Sync Metadata & Submit Tracking
let deletedStudentIds = JSON.parse(localStorage.getItem('dbo_deleted_students_v16')) || {};
let processedSlipIds = JSON.parse(localStorage.getItem('dbo_processed_slips_v16')) || {};
let lastSubmittedAt = parseInt(localStorage.getItem('dbo_last_submitted_at_v16') || '0', 10);
let lastSubmittedBy = localStorage.getItem('dbo_last_submitted_by_v16') || '';
let pendingSessionChanges = 0;

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
    assistantCoaches
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
    if (typeof refreshAllViews === 'function') refreshAllViews();
  } catch (e) {
    console.log('Reload storage error:', e);
  }
}
