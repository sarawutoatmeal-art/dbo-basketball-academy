// ========================================================
// DBO Basketball Academy - Configuration & Constants
// ========================================================

const APP_VERSION = 'v20.0';
const REALTIME_SYNC_TOPIC = 'dbo_academy/realtime_sync_v2';
const CLOUD_STATE_TOPIC = 'dbo_basketball_academy/v16/retained_db_state';
const CLOUD_EVENT_TOPIC = 'dbo_basketball_academy/v16/live_events';

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
