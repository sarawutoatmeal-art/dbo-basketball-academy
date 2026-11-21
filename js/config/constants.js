// ========================================================
// DBO Basketball Academy - Configuration & Constants
// ========================================================

const APP_VERSION = 'v21.0';

// Detect Test / Demo Environment (localhost / 127.0.0.1 / ?demo=1)
// Strictly isolates Demo MQTT & Storage so testing never collides with Production data
const IS_TEST_DEMO_ENV = (typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('demo') ||
  window.location.search.includes('demo=1')
));

const REALTIME_SYNC_TOPIC = IS_TEST_DEMO_ENV
  ? 'dbo_test_demo_sandbox/realtime_sync_v2'
  : 'dbo_academy/realtime_sync_v2';
const CLOUD_STATE_TOPIC = IS_TEST_DEMO_ENV
  ? 'dbo_test_demo_sandbox/retained_db_state'
  : 'dbo_basketball_academy/v16/retained_db_state';
const CLOUD_EVENT_TOPIC = IS_TEST_DEMO_ENV
  ? 'dbo_test_demo_sandbox/live_events'
  : 'dbo_basketball_academy/v16/live_events';

// ========================================================
// Monthly Course Cycle & Cutoff Helpers
// Rule: Per-session (regular/saturday/both) have NO cutoff date (nextRenewal: '-')
//       Monthly course cuts off on the exact same date of the next month (e.g. Nov 20 -> Dec 20)
//       and only alerts to renew when reaching the cutoff date.
// ========================================================
function calculateMonthlyNextRenewal(startDateStr) {
  let baseStr = startDateStr;
  if (!baseStr || !/^\d{4}-\d{2}-\d{2}$/.test(baseStr)) {
    const now = new Date();
    baseStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  const parts = baseStr.split('-').map(Number);
  const y = parts[0];
  const m = parts[1]; // 1..12
  const d = parts[2]; // 1..31

  const nextYear = (m === 12) ? (y + 1) : y;
  const nextMonth = (m === 12) ? 1 : (m + 1);
  const maxDayInNextMonth = new Date(nextYear, nextMonth, 0).getDate();
  const clampedDay = Math.min(d, maxDayInNextMonth);

  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
}

function formatThaiDateShort(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '-';
  const parts = dateStr.split('-').map(Number);
  const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const buddhistYearShort = String(parts[0] + 543).slice(-2);
  return `${parts[2]} ${thaiMonthsShort[parts[1] - 1]} ${buddhistYearShort}`;
}

function formatThaiDateFull(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '-';
  const parts = dateStr.split('-').map(Number);
  const thaiMonthsFull = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  return `${parts[2]} ${thaiMonthsFull[parts[1] - 1]} ${parts[0] + 543}`;
}

function getMonthlyCycleStatus(student, refDateStr = null) {
  const now = new Date();
  const todayStr = refDateStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const startDateStr = (student && student.startDate && /^\d{4}-\d{2}-\d{2}$/.test(student.startDate))
    ? student.startDate
    : todayStr;
  const cutoffDateStr = (student && student.nextRenewal && /^\d{4}-\d{2}-\d{2}$/.test(student.nextRenewal))
    ? student.nextRenewal
    : calculateMonthlyNextRenewal(startDateStr);

  const tParts = todayStr.split('-').map(Number);
  const cParts = cutoffDateStr.split('-').map(Number);
  const todayMs = new Date(tParts[0], tParts[1] - 1, tParts[2], 0, 0, 0).getTime();
  const cutoffMs = new Date(cParts[0], cParts[1] - 1, cParts[2], 0, 0, 0).getTime();
  const daysLeft = Math.round((cutoffMs - todayMs) / (1000 * 60 * 60 * 24));
  // Alert to renew ONLY when reaching or passing the cutoff date (e.g. 20 Dec)
  const isDue = (daysLeft <= 0);

  return {
    startDateStr,
    cutoffDateStr,
    startThaiShort: formatThaiDateShort(startDateStr),
    startThaiFull: formatThaiDateFull(startDateStr),
    cutoffThaiShort: formatThaiDateShort(cutoffDateStr),
    cutoffThaiFull: formatThaiDateFull(cutoffDateStr),
    daysLeft,
    isDue
  };
}

// Official Academy Authorized Staff (Head Coaches & Coordinators)
const AUTHORIZED_STAFF = {
  '0933199119': {
    id: 'coach_oat',
    name: 'โค้ชโอ๊ต',
    fullName: 'โค้ชโอ๊ต',
    role: 'Head Coach',
    title: 'โค้ชโอ๊ต (Head Coach)',
    phone: '093-319-9119',
    badge: 'Head Coach',
    desc: 'หัวหน้าผู้ฝึกสอน (Head Coach) และผู้ดูแลระบบ'
  },
  '0952974593': {
    id: 'coach_oak',
    name: 'โค้ชโอ๊ค',
    fullName: 'โค้ชโอ๊ค',
    role: 'Head Coach',
    title: 'โค้ชโอ๊ค (Head Coach)',
    phone: '095-297-4593',
    badge: 'Head Coach',
    desc: 'หัวหน้าผู้ฝึกสอน (Head Coach) และผู้ดูแลระบบ'
  },
  '0803745694': {
    id: 'admin_iris',
    name: 'ไอริส',
    fullName: 'คุณไอริส (แอดมิน)',
    role: 'ฝ่ายประสานงานดูแลระบบ',
    title: 'คุณไอริส (แอดมิน)',
    phone: '080-374-5694',
    badge: 'ฝ่ายประสานงานดูแลระบบ',
    desc: 'ฝ่ายประสานงานดูแลระบบ ตรวจสอบสลิปโอนเงิน และประสานงานผู้ปกครอง'
  },
  '0946365206': {
    id: 'admin_aom',
    name: 'ออม',
    fullName: 'คุณออม (แอดมิน)',
    role: 'ฝ่ายประสานงานดูแลระบบ',
    title: 'คุณออม (แอดมิน)',
    phone: '094-636-5206',
    badge: 'ฝ่ายประสานงานดูแลระบบ',
    desc: 'ฝ่ายประสานงานดูแลระบบ ตรวจสอบสลิปโอนเงิน และประสานงานผู้ปกครอง'
  }
};

// Default Assistant Coaches
const defaultAssistantCoaches = [
  {
    id: 'asst_1',
    name: 'ผู้ช่วยโค้ชคนที่ 1',
    phone: '0900000001',
    role: 'ผู้ช่วยโค้ช',
    badge: 'ผู้ช่วยโค้ช',
    desc: 'ผู้ช่วยฝึกสอนในสนาม บันทึกเวลาสอน เช็คชื่อนักเรียน และวัดสมรรถภาพทางกาย',
    isAssistant: true,
    workLogs: []
  },
  {
    id: 'asst_2',
    name: 'ผู้ช่วยโค้ชคนที่ 2',
    phone: '0900000002',
    role: 'ผู้ช่วยโค้ช',
    badge: 'ผู้ช่วยโค้ช',
    desc: 'ผู้ช่วยฝึกสอนในสนาม บันทึกเวลาสอน เช็คชื่อนักเรียน และวัดสมรรถภาพทางกาย',
    isAssistant: true,
    workLogs: []
  }
];

// Sibling Definitions
const SIBLING_DEFINITIONS = [
  // 1. Shared course (10 times pool shared together)
  { id: 'sib_boston_harden', names: ['บอสตัน', 'ฮาเด้น'], mode: 'shared', desc: 'บอสตัน & ฮาเด้น (นับโควต้า 10 ครั้งร่วมกัน)' },
  { id: 'sib_manta_matang', names: ['มันตา', 'มาตังค์'], mode: 'shared', desc: 'มันตา & มาตังค์ (นับโควต้า 10 ครั้งร่วมกัน)' },
  { id: 'sib_inthach_thawin', names: ['อินธัช', 'ธาวิน'], mode: 'shared', desc: 'อินธัช & ธาวิน (นับโควต้า 10 ครั้งร่วมกัน)' },
  // 2. Separate course (Linked to same parent phone, separate quota)
  { id: 'sib_winflag_wildfrank', names: ['วินแฟลค', 'ไวล์แฟรงค์'], mode: 'separate', desc: 'วินแฟลค & ไวล์แฟรงค์ (พี่น้อง จ่ายแยกคอร์ส)' },
  { id: 'sib_hermes_airbus', names: ['แอร์เมส', 'แอร์บัส'], mode: 'separate', desc: 'แอร์เมส & แอร์บัส (พี่น้อง จ่ายแยกคอร์ส)' },
  { id: 'sib_japan_jr', names: ['Japan', 'JR.'], mode: 'separate', desc: 'Japan & JR. (พี่น้อง จ่ายแยกคอร์ส)' }
];

// Default Weekly Training Schedule
const defaultWeeklySchedule = {
  mon: {
    coaches: 'โค้ชโอ๊ต & โค้ชโอ๊ค',
    topic: 'Fundamental Dribbling & Sports Science Movement — การทรงตัว (Balance & Core), สปีดการเลี้ยงบอลสองมือ, Footwork การเปลี่ยนทิศทาง และเสริมสร้างกล้ามเนื้อมัดเล็ก'
  },
  tue: {
    coaches: 'โค้ชโอ๊ค & โค้ชโอ๊ต',
    topic: 'Passing Vision, Basketball IQ & Defensive Footwork — วิสัยทัศน์การส่งบอล, การอ่านพื้นที่ในสนาม (Spacing), ฟุตเวิร์กเกมรับ (Defensive slides) และการตัดสินใจ 2 on 1'
  },
  thu: {
    coaches: 'โค้ชโอ๊ต & โค้ชโอ๊ค',
    topic: 'Shooting Mechanics & Game Simulation — ฟอร์มการยิงบาส (Arc & Release Point), การเข้าทำแต้ม Finishing under pressure และจำลองสถานการณ์แข่งจริง Scrimmage'
  },
  sat: {
    coaches: 'โค้ชโอ๊ต (Head Coach)',
    topic: 'Sports Science Motor Skills & Agility — วิทยาศาสตร์การกีฬาสำหรับเด็ก ฝึกระบบประสาทสัมพันธ์ (Coordination), ความคล่องตัวด้วย Speed Ladders & Cones และสร้างความมั่นใจ'
  }
};
