// ========================================================
// DBO Basketball Academy - Comprehensive Bilingual (TH/EN), PDPA Consent,
// Athlete U-Age Competition Classifier, Multi-Device Logout & Slip Receipt
// ========================================================

let currentAppLang = localStorage.getItem('dbo_app_lang_v1') || 'th';

const DBO_NICKNAMES_EN = {
  'บอสตัน': 'Boston',
  'ฮาเด้น': 'Harden',
  'ต้นพุด': 'Tonphut',
  'ซับ': 'Sub',
  'ไทม์': 'Time',
  'พัช': 'Patch',
  'แอร์บัส': 'Airbus',
  'วินแฟลค': 'Winflag',
  'ไวล์แฟรงค์': 'Wildfrank',
  'ดลย์': 'Don',
  'อคิณ': 'Akin',
  'ชัทเตอร์': 'Shutter',
  'ไม้เอก': 'Mai-ek',
  'จัสติน': 'Justin',
  'พีต้า': 'Peta',
  'มาร์ค': 'Mark',
  'แอร์เมส': 'Hermes',
  'มาตังค์': 'Matang',
  'มันตา': 'Manta',
  'ข้าวตั้ง': 'Khaotang',
  'สรา': 'Sara',
  'เป็นหนึ่ง': 'Pennueng',
  'อินธัช': 'Inthach',
  'กั๊ตจัง': 'Gatchan',
  'ชิต้า': 'Cheetah',
  'เจ้านาย': 'Jaonai',
  'ภีม': 'Pheme',
  'เดล': 'Dale',
  'คิน': 'Kin',
  'คุณ': 'Khun',
  'คุณคูณ': 'Khunkoon',
  'เปรม': 'Prem',
  'ก๊วยเจ๋ง': 'Guojing',
  'ปกป้อง': 'Pokpong',
  'เจคอบ': 'Jacob',
  'ซิดนีย์': 'Sydney',
  'ภีมมี่': 'Pheemmy',
  'เต็งหนึ่ง': 'Tengnueng',
  'เจ้าขุน': 'Jaokhun'
};

function getStudentDisplayName(name, isEn) {
  if (!name) return '';
  const clean = String(name).replace(/^น้อง\s*/, '').trim();
  if (!isEn) return `น้อง ${clean}`;
  return DBO_NICKNAMES_EN[clean] || clean;
}

const DBO_I18N_DICT = {
  th: {
    // Nav
    nav_home_login: 'เข้าสู่ระบบ',
    nav_home_coach: 'หน้าหลัก',
    nav_calendar: 'ปฏิทิน',
    nav_calendar_full: 'ปฏิทิน & ตารางซ้อม',
    nav_today_class: 'คลาสวันนี้',
    nav_renew: 'ต่อคอร์ส',
    nav_register: 'สมัครเรียนใหม่',
    nav_coach_board: 'Coach Board',
    nav_coach_panel: 'แผงโค้ช',

    // Header & Status
    header_demo_badge: 'จำลองระบบเสมือนจริง (Demo Playground)',
    header_notify_on: 'แจ้งเตือนเปิดอยู่',
    header_notify_enable: 'เปิดรับแจ้งเตือน',
    header_install: 'ติดตั้งแอป',
    header_online: 'ออนไลน์',
    header_offline: 'ออฟไลน์',

    // Login
    login_title: 'เข้าสู่ระบบผู้ปกครอง & โค้ช',
    login_subtitle: 'กรอกเบอร์โทรศัพท์มือถือที่ผูกกับนักเรียน',
    login_phone_label: 'เบอร์โทรศัพท์มือถือ',
    login_btn: 'เข้าสู่ระบบ',
    login_link_btn: 'ผูกเบอร์กับนักเรียน (ต้องยืนยันตัวตน/รอโค้ชอนุมัติ)',
    login_today_btn: 'ดูตารางและคลาสวันนี้',
    login_new_prompt: 'สนใจสมัครเรียนบาสเกตบอลใหม่? ',
    login_new_link: 'กดสมัครเรียนที่นี่',

    // Student Dashboard & Quota
    student_info_heading: 'ข้อมูลนักเรียน',
    athlete_modal_btn: 'ข้อมูลนักกีฬา / รุ่นอายุแข่งขัน (U)',
    remaining_quota_label: 'สิทธิ์คงเหลือ',
    ready_for_practice: 'พร้อมเข้าฝึกซ้อม',
    quota_exhausted: 'เรียนครบจำนวนครั้งแล้ว',
    sessions_unit: 'ครั้ง',
    btn_renew_course: 'ต่อคอร์ส',
    course_regular_10: 'คอร์สปกติ 10 ครั้ง',
    course_saturday_4: 'คอร์สวันเสาร์ 4 ครั้ง',
    course_both: 'คอร์สปกติ 10 + เสาร์ 4',
    course_monthly: 'แพ็กเกจรายเดือนสม่ำเสมอ',
    parent_phone_prefix: 'ผปค: ',
    last_practice_prefix: 'ซ้อมล่าสุด ',
    no_practice_yet: 'ยังไม่มีบันทึกการซ้อม',

    // Family / Sibling
    family_account_label: 'สลับดูข้อมูลพี่น้อง (บัญชีครอบครัว)',
    family_separate_desc: 'สิทธิ์แยกตามนักเรียน',
    sibling_count_badge: 'พี่น้อง',
    sibling_modal_title: 'เลือกข้อมูลบุตรหลาน',
    sibling_modal_subtitle: 'เข้าสู่ระบบบัญชีครอบครัว DBO',
    sibling_modal_prompt: 'เบอร์โทรนี้ผูกข้อมูลนักเรียนไว้หลายคน กรุณากดเลือกบุตรหลานที่ต้องการเข้าดูข้อมูล:',
    btn_switch_sibling: 'สลับคน',
    close_btn: 'ปิดหน้าต่าง',
    quota_remaining_child: 'สิทธิ์คงเหลือ: ',
    btn_renew_for_prefix: 'ต่อคอร์ส ',
    btn_attend_prefix: 'ยืนยันมาเรียน',
    btn_leave_prefix: 'แจ้งลาเรียน',
    showing_history_for: 'กำลังดูประวัติ',
    tap_to_view_history: 'กดดูประวัติ',
    quota_remaining_label: 'คงเหลือ',
    selected_badge: 'กำลังเลือก',
    select_btn: 'เลือก',
    btn_athlete_info: 'ข้อมูลนักกีฬา',

    // Today's Practice Card
    daily_practice_heading: 'คลาสฝึกซ้อมประจำวัน',
    status_unspecified: 'ยังไม่ได้ระบุสถานะ',
    status_attending: '✓ มาเรียนวันนี้',
    status_leave: 'แจ้งลา',
    btn_attend_today: 'แจ้งเข้าเรียนวันนี้',
    btn_leave_today: 'แจ้งขอลาเรียน',
    no_class_today: 'วันนี้ไม่มีคลาส',
    class_canceled: 'วันนี้นัดงดคลาสการฝึกซ้อม',

    // Category Tabs
    cat_history: 'ประวัติเข้าเรียน',
    cat_growth: 'พัฒนาการ & สมรรถภาพ',
    cat_classmates: 'เพื่อนร่วมคลาส',
    cat_schedule: 'ตารางซ้อม',

    // History Table
    history_heading: 'บันทึกการเช็คชื่อเข้าฝึกซ้อม',
    history_subtitle: 'แสดง 1 บรรทัดต่อ 1 วัน • เรียลไทม์',
    col_date: 'วันที่ซ้อม',
    col_class: 'คลาส',
    col_status: 'สถานะ',
    col_deduct: 'หักสิทธิ์',
    col_balance: 'คงเหลือ',
    status_present: 'มาเรียน',
    status_excused: 'แจ้งลา',
    status_rsvp: 'แจ้งมา',
    class_regular: 'คลาสปกติ',
    class_saturday: 'คลาสเสาร์',
    no_history_records: 'ยังไม่มีประวัติเข้าเรียน',
    remaining_balance_prefix: 'เหลือ ',
    renew_notice_expired: 'เรียนครบจำนวนครั้งแล้ว กรุณาต่อคอร์สใหม่',
    renew_notice_ok: 'ไม่มีวันตัดรอบ • เรียนให้ครบจำนวนครั้ง (จ./อ./พฤ.)',

    // Growth & Fitness Tab
    athlete_info_heading: 'ข้อมูลนักกีฬาสำหรับส่งแข่งขัน & PDPA',
    athlete_edit_btn: 'แก้ไขข้อมูลนักกีฬา / วันเกิด',
    real_name_label: 'ชื่อ-นามสกุลจริง',
    birthdate_label: 'วันเกิด & รุ่นอายุ',
    citizen_id_label: 'เลขบัตรประชาชน (ส่งแข่ง)',
    pdpa_status_label: 'สถานะความยินยอม PDPA',
    pdpa_accepted: '✓ ยินยอมแล้ว (มีบันทึก Log)',
    pdpa_pending: 'รอยืนยัน PDPA',
    coach_oat_title: 'โค้ชโอ๊ต (Head Coach)',
    coach_oak_title: 'โค้ชโอ๊ค (Head Coach)',
    oat_specialty: 'บาสเกตบอล & Game IQ',
    oak_specialty: 'สมรรถภาพ & Footwork',
    eval_pending_oat: 'อยู่ระหว่างการประเมินพัฒนาการโดยโค้ชโอ๊ต',
    eval_pending_oak: 'อยู่ระหว่างการประเมินพัฒนาการโดยโค้ชโอ๊ค',
    sports_science_heading: 'การทดสอบสมรรถภาพทางกาย (Sports Science)',
    vjump_title: 'Vertical Jump (กระโดดสูง)',
    longjump_title: 'Long Jump (กระโดดไกล)',
    cm_unit: 'ซม.',
    pending_test: 'รอทดสอบ',

    // Classmates Tab
    classmates_attending_title: 'เพื่อนร่วมคลาสที่มาเรียนวันนี้',
    classmates_leave_title: 'เพื่อนร่วมคลาสที่แจ้งลาวันนี้',
    no_classmates_attending: 'ยังไม่มีเพื่อนร่วมคลาสยืนยันมาเรียน',
    no_classmates_leave: 'ไม่มีเพื่อนร่วมคลาสแจ้งลา',

    // Calendar & Curriculum
    curriculum_heading: 'หัวข้อฝึกซ้อมประจำสัปดาห์ (Weekly Training Curriculum)',
    view_curriculum_btn: 'ดูหัวข้อฝึกซ้อม',
    hide_curriculum_btn: 'ซ่อนหัวข้อ',
    training_topic_label: 'หัวข้อซ้อม:',
    coaches_label: 'โค้ชผู้ฝึกสอน:',
    time_prefix: 'เวลา: ',
    gym_techawit: 'โรงยิม รร.เตชะวิทย์',
    cal_btn_weekly: 'รายสัปดาห์',
    cal_btn_monthly: 'รายเดือน',
    cal_today_btn: 'วันนี้',
    cal_legend_regular: 'คลาสปกติ (จ./อ./พฤ. 17:30–19:30)',
    cal_legend_saturday: 'คลาสวันเสาร์ (16:00–17:30)',
    cal_legend_canceled: 'งดคลาส',
    cal_legend_private: 'ไพรเวท/พิเศษ',

    // Coach Board
    board_mode_full: 'เต็มสนาม (Full Court)',
    board_mode_half: 'ครึ่งสนาม 3x3 (แนวนอนเต็มจอ)',
    board_tool_move: 'ขยับหมาก',
    board_tool_arrow: 'ลูกศรวิ่ง/ส่ง',
    board_tool_line_pass: 'ส่งบอล (เส้นประ)',
    board_tool_dribble: 'เลี้ยงบอล',
    board_tool_line_dribble: 'เคลื่อนที่/วิ่ง',
    board_tool_screen: 'สกรีน',
    board_tool_line_screen: 'สกรีน (เส้นตัว T)',
    board_tool_pen: 'วาดอิสระ',
    board_undo: 'ย้อนกลับ',
    board_tool_undo: 'ย้อนกลับ',
    board_clear: 'ล้างเส้น',
    board_tool_clear: 'ล้างเส้นวาด',
    board_reset: 'รีเซ็ต',
    board_tool_reset: 'รีเซ็ตตำแหน่ง',
    board_add_cone: '+ กรวย',
    board_tool_cone: 'เพิ่มกรวยฝึก',
    board_tool_export: 'บันทึกรูปแผน',
    board_change_def_color: 'เปลี่ยนสีหมาก X:',
    board_drawer_colors: 'สีหมาก & สีเส้น',
    board_drawer_presets: 'แผนสำเร็จรูป',
    board_drawer_lineup: 'ชื่อนักเรียน (1–5)',
    board_drawer_saves: 'บันทึกแผน',
    board_tokens_o: 'ทีมบุก (น้ำเงิน)',
    board_tokens_d: 'ทีมรับ (ส้ม)',

    // Auth & Logout
    logout_this_device: 'ออกจากระบบเครื่องนี้',
    logout_all_devices: 'ออกจากระบบทุกเครื่อง (Logout All Devices)',

    // Bank & Payment Details
    bank_account_holder: 'นายศราวุธ สระแกทอง',
    bank_account_holder_short: 'ชื่อบัญชี: ศราวุธ สระแกทอง',
    bank_account_name_label: 'ชื่อบัญชี:',
    bank_account_num_label: 'เลขที่บัญชี:',
    bank_name_label: 'ธนาคาร:',
    bank_kbank: 'กสิกรไทย (KBANK)',
    btn_copy: 'คัดลอก',
    renew_sibling_picker_title: 'เลือกบุตรหลานที่ต้องการต่อคอร์สเรียน (ป้องกันการต่อคอร์สผิดคน)',
    package_selected_label: 'แพ็กเกจที่เลือก',
    amount_transfer_label: 'ยอดที่ต้องโอน (บาท)',
    slip_upload_label: 'แนบสลิปโอนเงิน (ภาพถ่าย / PDF)',

    // Accordion History
    history_tap_view: 'แตะเพื่อดูประวัติ',
    history_tap_hide: 'แตะเพื่อซ่อน',
    history_th_date: 'วันที่ซ้อม',
    history_th_class: 'คลาส',
    history_th_status: 'สถานะ',
    history_th_deduct: 'หักสิทธิ์',
    history_th_remain: 'คงเหลือ',

    // Calendar & Buttons
    btn_sync_calendar: 'ซิงค์ปฏิทิน',
    btn_google_calendar: 'Google Calendar',
    btn_download_ical: 'ดาวน์โหลด iCal (.ics)',
    cal_header_title: 'ปฏิทินฝึกซ้อม',
    cal_header_subtitle: 'ตารางฝึกซ้อมประจำสัปดาห์ & ปฏิทิน Google Calendar',
    cal_cur_month_btn: 'เดือนปัจจุบัน',

    // Curriculum
    weekly_curriculum_main_title: 'หัวข้อฝึกซ้อมประจำสัปดาห์ (Weekly Training Curriculum)',
    weekly_focus_title: '🎯 เป้าหมายการฝึกซ้อมประจำสัปดาห์:',
    edit_weekly_schedule_btn: 'แก้ไขเนื้อหาการสอนประจำสัปดาห์',

    // Registration Form
    reg_title: 'สมัครเรียน',
    reg_subtitle: 'คลาสที่โรงเรียนเตชะวิทย์',
    reg_choose_course: 'เลือกคอร์ส',
    reg_course_regular: 'คอร์สปกติ 10 ครั้ง',
    reg_course_regular_time: 'จ. / อ. / พฤ. · 17:30–19:30 น.',
    reg_price_regular: '4,290 บาท',
    reg_course_sat: 'คอร์สวันเสาร์ 4 ครั้ง',
    reg_course_sat_time: 'โค้ชโอ๊ต · 16:00–17:30 น.',
    reg_price_sat: '1,690 บาท',
    reg_course_monthly: 'แพ็กเกจรายเดือน',
    reg_course_monthly_desc: 'ซ้อม 2 วันต่อสัปดาห์',
    reg_price_monthly: '2,790 บาท/เดือน',
    reg_course_private: 'คลาสส่วนตัว',
    reg_course_private_desc: 'เลือกเวลาและโค้ชได้',
    reg_price_private: 'คิดตามเวลา',
    reg_fullname_label: 'ชื่อ - นามสกุล นักเรียน *',
    reg_nickname_label: 'ชื่อเล่นน้อง *',
    reg_birthdate_label: 'วัน/เดือน/ปีเกิด *',
    reg_age_label: 'อายุ (ปี)',
    reg_school_label: 'โรงเรียนปัจจุบัน *',
    reg_referral_check: 'มีคนแนะนำมาเป็นคนภายใน DBO Academy (รับส่วนลดพิเศษ)',
    reg_referral_desc: 'สมาชิกแนะนำ: รับสิทธิ์ส่วนลดคอร์สปกติเหลือ 3,990.- / วันเสาร์เหลือ 1,500.- ทันที',
    reg_parent_name_label: 'ชื่อผู้ปกครอง',
    reg_phone_label: 'เบอร์โทรศัพท์ (ใช้ล็อกอินระบบ) *',
    reg_start_date_label: 'วันที่ต้องการเริ่มเรียนวันแรก *',
    reg_monthly_hint: '* สำหรับรายเดือน ระบบจะตัดรอบการต่อคอร์สในวันเดิมของเดือนถัดไปให้อัตโนมัติ',
    reg_total_pay_label: 'ยอดชำระที่ต้องโอน:',
    reg_slip_label: 'แนบสลิปโอนเงิน *',
    reg_slip_tap_label: 'แตะเพื่อแนบรูปสลิป',
    reg_slip_hint: 'เมื่อแอดมิน (โค้ชโอ๊ต/โค้ชโอ๊ค/ไอริส/ออม) ตรวจสอบสลิป จะเปิดบัญชีให้ทันที',
    reg_submit_btn: 'ยืนยันการสมัคร & ส่งสลิปโอนเงิน',
    reg_school_quick_btn: 'เตชะวิทย์',
    bank_kbank_full: 'ธนาคารกสิกรไทย (KBANK)',

    // Today's Board & Status
    daily_board_title: "คลาสวันนี้ (Today's Training Session)",
    gym_badge: '📍 โรงยิม รร.เตชะวิทย์',
    daily_stat_attending: 'มาเรียน / ยืนยันแล้ว (คน)',
    daily_stat_leave: 'แจ้งลาหยุด (คน)',
    daily_stat_unconfirmed: 'รอยืนยันเข้าเรียน (คน)',
    header_notify_badge: 'เปิดแจ้งเตือน',
    daily_btn_stats: 'ยอดรายวัน',
    daily_btn_leave: 'แจ้งขอลา',
    daily_btn_attend: 'ยืนยันเข้าเรียน',
    daily_section_attending: 'ยืนยันมาเรียน',
    daily_section_leave: 'รายชื่อน้องที่แจ้งขอลาหยุดวันนี้',
    daily_section_other: 'นักเรียนท่านอื่นในคอร์ส',
    daily_btn_toggle_all: 'แสดงรายชื่อทั้งหมด',
    daily_class_location_hint: 'คลาสมาตรฐาน ยิมเตชะวิทย์',
    daily_leave_notified_hint: 'แจ้งล่วงหน้าเรียบร้อย',
    people_unit: 'คน'
  },
  en: {
    // Nav
    nav_home_login: 'Sign In',
    nav_home_coach: 'Home',
    nav_calendar: 'Calendar',
    nav_calendar_full: 'Calendar & Schedule',
    nav_today_class: "Today's Class",
    nav_renew: 'Renew Course',
    nav_register: 'Enroll New',
    nav_coach_board: 'Coach Board',
    nav_coach_panel: 'Coach Admin',

    // Header & Status
    header_demo_badge: 'Simulated Sandbox (Demo Playground)',
    header_notify_on: 'Alerts Active',
    header_notify_enable: 'Enable Alerts',
    header_install: 'Install App',
    header_online: 'Online',
    header_offline: 'Offline',

    // Login
    login_title: 'Parent & Coach Sign In',
    login_subtitle: 'Enter mobile number linked to athlete account',
    login_phone_label: 'Mobile Phone Number',
    login_btn: 'Sign In',
    login_link_btn: 'Link Phone to Student (Requires Verification)',
    login_today_btn: "View Today's Class Board",
    login_new_prompt: 'New to DBO Basketball Academy? ',
    login_new_link: 'Enroll New Student Here',

    // Student Dashboard & Quota
    student_info_heading: 'Athlete Profile & Dashboard',
    athlete_modal_btn: 'Athlete Profile / Age Group (U)',
    remaining_quota_label: 'REMAINING SESSIONS',
    ready_for_practice: 'Ready for Practice',
    quota_exhausted: 'Course completed. Please renew.',
    sessions_unit: 'Sessions',
    btn_renew_course: 'Renew Course',
    course_regular_10: 'Regular Course (10 Sessions)',
    course_saturday_4: 'Saturday Course (4 Sessions)',
    course_both: 'Regular 10 + Saturday 4',
    course_monthly: 'Monthly Membership Package',
    parent_phone_prefix: 'Parent: ',
    last_practice_prefix: 'Last practice: ',
    no_practice_yet: 'No practice records yet',

    // Family / Sibling
    family_account_label: 'Switch Sibling (Family Account)',
    family_separate_desc: 'Quotas tracked separately per athlete',
    sibling_count_badge: 'Siblings',
    sibling_modal_title: 'Select Student Profile',
    sibling_modal_subtitle: 'DBO Family Account Login',
    sibling_modal_prompt: 'This phone number is linked to multiple students. Please select which student to view:',
    btn_switch_sibling: 'Switch',
    close_btn: 'Close Window',
    quota_remaining_child: 'Remaining: ',
    btn_renew_for_prefix: 'Renew for ',
    btn_attend_prefix: 'Confirm Attend',
    btn_leave_prefix: 'Request Leave',
    showing_history_for: 'Viewing records for',
    tap_to_view_history: 'View records for',
    quota_remaining_label: 'Remaining',
    selected_badge: 'Selected',
    select_btn: 'Select',
    btn_athlete_info: 'Athlete Profile',

    // Today's Practice Card
    daily_practice_heading: 'Daily Training Session',
    status_unspecified: 'Status Not Specified',
    status_attending: '✓ Attending Today',
    status_leave: 'Excused / Leave',
    btn_attend_today: 'Confirm Attending Today',
    btn_leave_today: 'Request Leave / Absence',
    no_class_today: 'No Class Scheduled Today',
    class_canceled: 'Class Canceled Today',

    // Category Tabs
    cat_history: 'Attendance History',
    cat_growth: 'Growth & Fitness',
    cat_classmates: 'Classmates',
    cat_schedule: 'Schedule',

    // History Table
    history_heading: 'Attendance Log & Quota History',
    history_subtitle: '1 line per day • Real-time',
    col_date: 'Date',
    col_class: 'Class',
    col_status: 'Status',
    col_deduct: 'Used',
    col_balance: 'Balance',
    status_present: 'Present',
    status_excused: 'Excused',
    status_rsvp: 'RSVP',
    class_regular: 'Regular Class',
    class_saturday: 'Saturday Class',
    no_history_records: 'No attendance records yet',
    remaining_balance_prefix: 'Bal: ',
    renew_notice_expired: 'Course completed. Please renew course.',
    renew_notice_ok: 'No expiration date • Complete all sessions (Mon/Tue/Thu)',

    // Growth & Fitness Tab
    athlete_info_heading: 'Athlete Tournament Profile & PDPA',
    athlete_edit_btn: 'Edit Athlete Info / Birthday',
    real_name_label: 'Full Legal Name',
    birthdate_label: 'Birth Date & Age Group',
    citizen_id_label: 'Citizen ID / Passport',
    pdpa_status_label: 'PDPA Consent Status',
    pdpa_accepted: '✓ Consented (Audit Logged)',
    pdpa_pending: 'Pending Consent',
    coach_oat_title: 'Coach Oat (Head Coach)',
    coach_oak_title: 'Coach Oak (Head Coach)',
    oat_specialty: 'Basketball & Game IQ',
    oak_specialty: 'Fitness & Footwork',
    eval_pending_oat: 'Currently undergoing assessment by Coach Oat',
    eval_pending_oak: 'Currently undergoing assessment by Coach Oak',
    sports_science_heading: 'Physical Fitness Assessment (Sports Science)',
    vjump_title: 'Vertical Jump',
    longjump_title: 'Long Jump',
    cm_unit: 'cm',
    pending_test: 'Pending Test',

    // Classmates Tab
    classmates_attending_title: 'Classmates Attending Today',
    classmates_leave_title: 'Classmates on Leave Today',
    no_classmates_attending: 'No classmates confirmed attending yet',
    no_classmates_leave: 'No classmates on leave today',

    // Calendar & Curriculum
    curriculum_heading: 'Weekly Training Curriculum',
    view_curriculum_btn: 'View Drill Topics',
    hide_curriculum_btn: 'Hide Drill Topics',
    training_topic_label: 'Drill Topic:',
    coaches_label: 'Coaches:',
    time_prefix: 'Time: ',
    gym_techawit: 'Techawit School Gymnasium',
    cal_btn_weekly: 'Weekly View',
    cal_btn_monthly: 'Monthly View',
    cal_today_btn: 'Today',
    cal_legend_regular: 'Regular (Mon/Tue/Thu 5:30–7:30 PM)',
    cal_legend_saturday: 'Saturday (4:00–5:30 PM)',
    cal_legend_canceled: 'Canceled',
    cal_legend_private: 'Private/Special',

    // Coach Board
    board_mode_full: 'Full Court',
    board_mode_half: 'Half Court 3x3 (Full Width)',
    board_tool_move: 'Move Tokens',
    board_tool_arrow: 'Movement / Pass',
    board_tool_line_pass: 'Pass Ball (Dashed)',
    board_tool_dribble: 'Dribble',
    board_tool_line_dribble: 'Player Movement',
    board_tool_screen: 'Screen',
    board_tool_line_screen: 'Screen (T-Line)',
    board_tool_pen: 'Freehand Pen',
    board_undo: 'Undo',
    board_tool_undo: 'Undo',
    board_clear: 'Clear',
    board_tool_clear: 'Clear Drawings',
    board_reset: 'Reset',
    board_tool_reset: 'Reset Positions',
    board_add_cone: '+ Cone',
    board_tool_cone: 'Add Cone',
    board_tool_export: 'Export Image',
    board_change_def_color: 'Defense Token Color:',
    board_drawer_colors: 'Colors',
    board_drawer_presets: 'Preset Plays',
    board_drawer_lineup: 'Roster Lineup',
    board_drawer_saves: 'Saved Plays',
    board_tokens_o: 'Offense (Blue)',
    board_tokens_d: 'Defense (Orange)',

    // Auth & Logout
    logout_this_device: 'Sign Out (This Device)',
    logout_all_devices: 'Sign Out of All Devices',

    // Bank & Payment Details
    bank_account_holder: 'Mr. Sarawut Sakaethong',
    bank_account_holder_short: 'Account Name: Sarawut Sakaethong',
    bank_account_name_label: 'Account Name:',
    bank_account_num_label: 'Account Number:',
    bank_name_label: 'Bank:',
    bank_kbank: 'Kasikornbank (KBANK)',
    btn_copy: 'Copy',
    renew_sibling_picker_title: 'Select student to renew course (prevents incorrect renewal)',
    package_selected_label: 'Selected Package',
    amount_transfer_label: 'Transfer Amount (THB)',
    slip_upload_label: 'Attach Payment Slip (Photo / PDF)',

    // Accordion History
    history_tap_view: 'Tap to view history',
    history_tap_hide: 'Tap to collapse',
    history_th_date: 'Date',
    history_th_class: 'Class',
    history_th_status: 'Status',
    history_th_deduct: 'Deduction',
    history_th_remain: 'Balance',

    // Calendar & Buttons
    btn_sync_calendar: 'Sync Calendar',
    btn_google_calendar: 'Google Calendar',
    btn_download_ical: 'Download iCal (.ics)',
    cal_header_title: 'Training Schedule',
    cal_header_subtitle: 'Weekly Training Schedule & Google Calendar',
    cal_cur_month_btn: 'Current Month',

    // Curriculum
    weekly_curriculum_main_title: 'Weekly Training Curriculum',
    weekly_focus_title: '🎯 Weekly Training Focus:',
    edit_weekly_schedule_btn: 'Edit Weekly Curriculum',

    // Registration Form
    reg_title: 'Enroll / Register',
    reg_subtitle: 'Basketball training at Techawit School Gymnasium',
    reg_choose_course: 'Select Course',
    reg_course_regular: 'Regular Course (10 Sessions)',
    reg_course_regular_time: 'Mon / Tue / Thu · 5:30–7:30 PM',
    reg_price_regular: '4,290 THB',
    reg_course_sat: 'Saturday Course (4 Sessions)',
    reg_course_sat_time: 'Coach Oat · 4:00–5:30 PM',
    reg_price_sat: '1,690 THB',
    reg_course_monthly: 'Monthly Membership',
    reg_course_monthly_desc: 'Practice 2 days per week',
    reg_price_monthly: '2,790 THB/Month',
    reg_course_private: 'Private Coaching',
    reg_course_private_desc: 'Flexible time & personalized coach',
    reg_price_private: 'Custom Hourly Rate',
    reg_fullname_label: 'Student Full Name *',
    reg_nickname_label: 'Nickname *',
    reg_birthdate_label: 'Date of Birth *',
    reg_age_label: 'Age (Years)',
    reg_school_label: 'Current School *',
    reg_referral_check: 'Referred by active DBO Academy member (Discount applied)',
    reg_referral_desc: 'Referral benefit: Regular course discounted to 3,990.- / Saturday to 1,500.-',
    reg_parent_name_label: 'Parent Name',
    reg_phone_label: 'Mobile Phone (Used for login) *',
    reg_start_date_label: 'Requested Start Date *',
    reg_monthly_hint: '* For monthly packages, billing cycles renew automatically on the same calendar day next month.',
    reg_total_pay_label: 'Total Amount Due:',
    reg_slip_label: 'Attach Payment Slip *',
    reg_slip_tap_label: 'Tap to upload payment slip photo',
    reg_slip_hint: 'Account activates immediately once verified by coaching staff.',
    reg_submit_btn: 'Submit Enrollment & Transfer Slip',
    reg_school_quick_btn: 'Techawit',
    bank_kbank_full: 'Kasikornbank (KBANK)',

    // Today's Board & Status
    daily_board_title: "Today's Training Session",
    gym_badge: '📍 Techawit School Gymnasium',
    daily_stat_attending: 'Attending / Confirmed',
    daily_stat_leave: 'On Leave',
    daily_stat_unconfirmed: 'Pending Confirmation',
    header_notify_badge: 'Alerts Active',
    daily_btn_stats: 'Daily Stats',
    daily_btn_leave: 'Request Leave',
    daily_btn_attend: 'Confirm Attendance',
    daily_section_attending: 'Confirmed Attending',
    daily_section_leave: 'Students on Leave Today',
    daily_section_other: 'Other Students in Course',
    daily_btn_toggle_all: 'Show All Students',
    daily_class_location_hint: 'Standard Class · Techawit Gym',
    daily_leave_notified_hint: 'Notified in Advance',
    people_unit: 'students'
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
  if (typeof renderMasterCalendarGrid === 'function') renderMasterCalendarGrid();
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
    if (txt) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = txt;
      } else if (txt.includes('<') && txt.includes('>')) {
        el.innerHTML = txt;
      } else {
        el.textContent = txt;
      }
    }
  });

  // Update localized placeholders
  const phMap = {
    'regFullName': isEn ? 'e.g. Alex Smith' : 'เช่น ด.ช. ธนกร พัฒนาดี',
    'regNickName': isEn ? 'e.g. Alex' : 'เช่น น้องเจเจ',
    'regAge': isEn ? 'e.g. 10 years' : 'เช่น 10 ปี',
    'regSchool': isEn ? 'e.g. Techawit School...' : 'เช่น โรงเรียนเตชะวิทย์...',
    'regParentName': isEn ? 'e.g. Parent Name' : 'เช่น คุณแม่ธนกร',
    'regParentPhone': isEn ? '08x-xxx-xxxx (10 digits)' : '08x-xxx-xxxx (10 หลัก)',
    'parentPhoneInput': isEn ? 'e.g. 081-234-5678' : 'เช่น 081-234-5678'
  };
  Object.entries(phMap).forEach(([id, ph]) => {
    const inp = document.getElementById(id);
    if (inp) inp.placeholder = ph;
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

  // Top Bar elements
  const demoBadge = document.querySelector('.demo-banner span');
  if (demoBadge) demoBadge.textContent = tLang('header_demo_badge');
  const installAppBtn = document.querySelector('#btnOpenInstallModal span');
  if (installAppBtn) installAppBtn.textContent = tLang('header_install');

  // Login Box
  const loginH1 = document.querySelector('#parent-login-box .workspace-title h1');
  if (loginH1) loginH1.textContent = tLang('login_title');
  const loginP = document.querySelector('#parent-login-box .workspace-title p');
  if (loginP) loginP.textContent = tLang('login_subtitle');
  const loginPhoneLabel = document.querySelector('label[for="loginPhone"]');
  if (loginPhoneLabel) loginPhoneLabel.textContent = tLang('login_phone_label');
  const loginBtnSpan = document.querySelector('#btnLoginSubmit span');
  if (loginBtnSpan) loginBtnSpan.textContent = tLang('login_btn');
  const loginLinkBtnSpan = document.querySelector('#btnOpenLinkModal span');
  if (loginLinkBtnSpan) loginLinkBtnSpan.textContent = tLang('login_link_btn');
  const loginTodaySpan = document.querySelector('#btnLoginViewTodayBoard span');
  if (loginTodaySpan) loginTodaySpan.textContent = tLang('login_today_btn');

  // Dashboard static cards & headers
  const studentHeading = document.querySelector('[data-i18n="student_info_heading"]');
  if (studentHeading) studentHeading.textContent = tLang('student_info_heading');
  const athleteModalBtnSpan = document.querySelector('[data-i18n="athlete_modal_btn"]');
  if (athleteModalBtnSpan) athleteModalBtnSpan.textContent = tLang('athlete_modal_btn');

  // Quota card labels
  const quotaHeaderLabel = document.querySelector('.player-quota .text-nike-ink.uppercase');
  if (quotaHeaderLabel) quotaHeaderLabel.textContent = tLang('remaining_quota_label');
  const quotaUnitLabel = document.querySelector('.player-quota .text-sm.font-bold.text-nike-mute');
  if (quotaUnitLabel) quotaUnitLabel.textContent = tLang('sessions_unit');

  // Attendance history table headers
  const historyHeaders = document.querySelectorAll('#parentCatPanel-history thead th');
  if (historyHeaders.length >= 5) {
    historyHeaders[0].textContent = tLang('history_th_date');
    historyHeaders[1].textContent = tLang('history_th_class');
    historyHeaders[2].textContent = tLang('history_th_status');
    historyHeaders[3].textContent = tLang('history_th_deduct');
    historyHeaders[4].textContent = tLang('history_th_remain');
  }

  // Attendance history accordion hint
  const accHint = document.getElementById('parentHistoryAccordionHint');
  if (accHint) {
    const accBody = document.getElementById('parentHistoryAccordionBody');
    const isAccOpen = accBody && !accBody.classList.contains('hidden');
    accHint.textContent = isAccOpen ? tLang('history_tap_hide') : tLang('history_tap_view');
  }

  // Sibling Course Renew Picker Title
  const renewSibTitle = document.querySelector('#renewSiblingPickerTitle span');
  if (renewSibTitle) renewSibTitle.textContent = tLang('renew_sibling_picker_title');

  // Sibling Modal Static Labels
  const sibModalH2 = document.querySelector('#siblingSelectModal [data-i18n="sibling_modal_title"]');
  if (sibModalH2) sibModalH2.textContent = tLang('sibling_modal_title');
  const sibModalSub = document.querySelector('#siblingSelectModal [data-i18n="sibling_modal_subtitle"]');
  if (sibModalSub) sibModalSub.textContent = tLang('sibling_modal_subtitle');
  const sibModalCloseBtn = document.querySelector('#siblingSelectModal [data-i18n="close_btn"]');
  if (sibModalCloseBtn) sibModalCloseBtn.textContent = tLang('close_btn');

  // Bank Info Labels
  const bankHolderEl = document.querySelector('[data-i18n="bank_account_holder"]');
  if (bankHolderEl) bankHolderEl.textContent = tLang('bank_account_holder');
  const bankHolderShortEl = document.querySelector('[data-i18n="bank_account_holder_short"]');
  if (bankHolderShortEl) bankHolderShortEl.textContent = tLang('bank_account_holder_short');
  const bankAccountNameLabel = document.querySelector('[data-i18n="bank_account_name_label"]');
  if (bankAccountNameLabel) bankAccountNameLabel.textContent = tLang('bank_account_name_label');

  // Calendar Header for Parents & Public
  const calTabH2 = document.getElementById('calendarTabHeaderTitle');
  if (calTabH2 && (typeof currentStaff === 'undefined' || !currentStaff || !isCoachAuth || currentStaff.isAssistant)) {
    calTabH2.textContent = tLang('cal_header_title');
  }
  const calTabSub = document.getElementById('calendarTabHeaderSubtitle');
  if (calTabSub && (typeof currentStaff === 'undefined' || !currentStaff || !isCoachAuth || currentStaff.isAssistant)) {
    calTabSub.textContent = tLang('cal_header_subtitle');
  }
  const btnSubViewGCalSpan = document.querySelector('#btnSubViewGCal span');
  if (btnSubViewGCalSpan) btnSubViewGCalSpan.textContent = tLang('cal_header_title');

  // Curriculum Main Section Heading
  const currHeadingSpan = document.querySelector('#weeklyScheduleCardsContainer')?.previousElementSibling?.previousElementSibling?.querySelector('h3 span');
  if (currHeadingSpan) currHeadingSpan.textContent = tLang('weekly_curriculum_main_title');
  const editWkBtnSpan = document.querySelector('#btnEditWeeklySchedule span');
  if (editWkBtnSpan) editWkBtnSpan.textContent = tLang('edit_weekly_schedule_btn');

  // Calendar toggle buttons
  const btnCalW = document.getElementById('btnCalWeekly');
  if (btnCalW) btnCalW.textContent = tLang('cal_btn_weekly');
  const btnCalM = document.getElementById('btnCalMonthly');
  if (btnCalM) btnCalM.textContent = tLang('cal_btn_monthly');
  const btnCalToday = document.getElementById('btnCalToday');
  if (btnCalToday) btnCalToday.textContent = tLang('cal_today_btn');

  // Coach Board tools
  const boardHalfBtn = document.getElementById('btnCourtHalf');
  if (boardHalfBtn) {
    const halfSpan = boardHalfBtn.querySelector('span');
    if (halfSpan) halfSpan.textContent = tLang('board_mode_half');
  }
  const boardFullBtn = document.getElementById('btnCourtFull');
  if (boardFullBtn) {
    const fullSpan = boardFullBtn.querySelector('span');
    if (fullSpan) fullSpan.textContent = tLang('board_mode_full');
  }
  const exportBtn = document.getElementById('btnExportPlay');
  if (exportBtn) {
    const expSpan = exportBtn.querySelector('span');
    if (expSpan) expSpan.textContent = tLang('board_tool_export');
  }
  const resetTokensBtn = document.getElementById('btnResetTokens');
  if (resetTokensBtn) {
    const resSpan = resetTokensBtn.querySelector('span');
    if (resSpan) resSpan.textContent = tLang('board_tool_reset');
  }
  const undoBtn = document.getElementById('btnUndoDraw');
  if (undoBtn) {
    const uSpan = undoBtn.querySelector('span');
    if (uSpan) uSpan.textContent = tLang('board_tool_undo');
  }
  const clearBtn = document.getElementById('btnClearDraw');
  if (clearBtn) {
    const cSpan = clearBtn.querySelector('span');
    if (cSpan) cSpan.textContent = tLang('board_tool_clear');
  }

  // Single-child card action buttons
  const renewSingleBtn = document.querySelector('.player-quota button[onclick*="renew-payment"] span');
  if (renewSingleBtn) renewSingleBtn.textContent = tLang('btn_renew_course');
  const attendSingleBtn = document.querySelector('#hasNormalClassActions button[onclick*="attending"] span');
  if (attendSingleBtn) attendSingleBtn.textContent = tLang('btn_attend_today');
  const leaveSingleBtn = document.querySelector('#hasNormalClassActions button[onclick*="openLeaveModal"] span');
  if (leaveSingleBtn) leaveSingleBtn.textContent = tLang('btn_leave_today');

  // Category Tab Headings
  const classmateHeadings = document.querySelectorAll('#parentCatPanel-classmates h4 span:last-child');
  if (classmateHeadings.length >= 2) {
    classmateHeadings[0].textContent = tLang('classmates_attending_title');
    classmateHeadings[1].textContent = tLang('classmates_leave_title');
  }

  // Sports science title
  const ssHeading = document.querySelector('#parentCatPanel-growth h4 span:last-child');
  if (ssHeading) ssHeading.textContent = tLang('sports_science_heading');

  // Calendar legend
  const calLegends = document.querySelectorAll('.calendar-legend li span:last-child');
  if (calLegends.length >= 4) {
    calLegends[0].innerHTML = `<strong>${isEn ? 'Regular' : 'คลาสปกติ'}</strong> ${isEn ? '(Mon/Tue/Thu 5:30–7:30 PM)' : '(จ./อ./พฤ. 17:30–19:30)'}`;
    calLegends[1].innerHTML = `<strong>${isEn ? 'Saturday' : 'คลาสวันเสาร์'}</strong> ${isEn ? '(4:00–5:30 PM)' : '(16:00–17:30)'}`;
    calLegends[2].innerHTML = `<strong>${tLang('cal_legend_canceled')}</strong>`;
    calLegends[3].innerHTML = `<strong>${tLang('cal_legend_private')}</strong>`;
  }

  // Push Notification Badge
  const pushBadge = document.getElementById('pushStatusBadge');
  if (pushBadge) {
    if (pushBadge.textContent.includes('แจ้งเตือน') || pushBadge.textContent.includes('Alerts')) {
      pushBadge.textContent = isEn ? 'Alerts Active' : 'เปิดแจ้งเตือนแล้ว';
    }
  }

  // Calculate Fee Display in Registration
  if (typeof calculateFee === 'function') {
    calculateFee();
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ========================================================
// 2. Athlete Age & U-Category Calculator (U8/U10/U12/U14/U16/U18)
// ========================================================
function calculateAthleteAgeAndUCategory(student) {
  const isEn = typeof currentAppLang !== 'undefined' && currentAppLang === 'en';
  if (!student) return { age: null, uCategory: isEn ? 'Birthday Pending' : 'ยังไม่ระบุวันเกิด', birthYear: null };
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
    return { age: null, uCategory: isEn ? 'Birthday Pending' : 'รอระบุวันเกิด', birthYear: null };
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
