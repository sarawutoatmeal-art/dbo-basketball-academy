// ========================================================
// DBO Basketball Academy - Attendance & Teaching Records
// (Roll Call Sessions, History Modal, Daily Attendance Board, DBO Academy Records)
// ========================================================

function getTodayDateKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

let activeAttendanceDate = getTodayDateKey();

function ensureHistoricalDatesSeeded() {
  const mapping = [
    { key: '2026-11-05', sheetKey: '5/11/26', time: '17:30 น.' },
    { key: '2026-11-03', sheetKey: '3/11/26', time: '17:30 น.' },
    { key: '2026-10-29', sheetKey: '29/10', time: '17:30 น.' }
  ];

  let modified = false;
  mapping.forEach(m => {
    if (!dailyAttendance[m.key] || Object.keys(dailyAttendance[m.key]).length === 0) {
      dailyAttendance[m.key] = {};
      (students || []).forEach(s => {
        if (s.records && s.records[m.sheetKey]) {
          const val = s.records[m.sheetKey];
          if (val === '/') {
            dailyAttendance[m.key][s.id] = {
              studentId: s.id,
              name: s.name,
              status: 'attending',
              time: m.time,
              updatedBy: 'ประวัติเดิม (บันทึกอคาเดมี่)',
              dateKey: m.key,
              courseType: s.courseType || 'regular'
            };
            modified = true;
          } else if (val === 'ลา') {
            dailyAttendance[m.key][s.id] = {
              studentId: s.id,
              name: s.name,
              status: 'leave',
              time: m.time,
              updatedBy: 'ประวัติเดิม (บันทึกอคาเดมี่)',
              dateKey: m.key,
              leaveReason: 'แจ้งลา'
            };
            modified = true;
          }
        }
      });
    }
  });

  if (modified) {
    localStorage.setItem('dbo_daily_attendance_v14', JSON.stringify(dailyAttendance));
  }
}

function updateSessionDateDisplay() {
  const dateKey = activeAttendanceDate || getTodayDateKey();
  const dateInput = document.getElementById('coachAttendanceDateInput');
  if (dateInput) dateInput.value = dateKey;

  const parts = dateKey.split('-');
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const dayW = d.getDay();
  const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const thaiYear = d.getFullYear() + 543;

  const isToday = (dateKey === getTodayDateKey());
  const dateBadge = document.getElementById('coachSessionDateBadge');
  if (dateBadge) {
    if (isToday) {
      dateBadge.className = 'px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1';
      dateBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> รอบวันนี้';
    } else {
      dateBadge.className = 'px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200';
      dateBadge.innerText = 'รอบวันที่เลือก';
    }
  }

  let scheduleText = 'รอบพิเศษ / ซ้อมเดี่ยว (Private)';
  let scheduleColor = 'bg-slate-100 text-slate-800 border-slate-200';
  if (dayW === 1 || dayW === 2 || dayW === 4) {
    scheduleText = 'คลาสปกติ 17:30 - 19:30 น. (2 ชม.)';
    scheduleColor = 'bg-amber-100 text-amber-900 border-amber-300';
  } else if (dayW === 6) {
    scheduleText = 'คลาสวันเสาร์ Basic Coach Oat 16:00 - 17:30 น. (1.5 ชม.)';
    scheduleColor = 'bg-indigo-100 text-indigo-900 border-indigo-300';
  }
  const scheduleBadge = document.getElementById('coachSessionScheduleBadge');
  if (scheduleBadge) {
    scheduleBadge.className = `px-2 py-0.5 rounded-full text-[10px] font-bold border ${scheduleColor}`;
    scheduleBadge.innerText = scheduleText;
  }

  const titleEl = document.getElementById('coachSessionDateTitle');
  if (titleEl) {
    titleEl.innerText = `${thaiDays[dayW]}ที่ ${d.getDate()} ${thaiMonthsShort[d.getMonth()]} ${thaiYear}`;
  }

  const records = dailyAttendance[dateKey] || {};
  const attendingList = Object.values(records).filter(r => r && r.status === 'attending');
  const leaveList = Object.values(records).filter(r => r && r.status === 'leave');
  const total = (students || []).length;
  const unchecked = Math.max(0, total - attendingList.length - leaveList.length);

  const elAttending = document.getElementById('sessionAttendingCount');
  const elLeave = document.getElementById('sessionLeaveCount');
  const elUnchecked = document.getElementById('sessionUncheckedCount');
  const elTotal = document.getElementById('sessionTotalCount');

  if (elAttending) elAttending.innerText = attendingList.length;
  if (elLeave) elLeave.innerText = leaveList.length;
  if (elUnchecked) elUnchecked.innerText = unchecked;
  if (elTotal) elTotal.innerText = total;

  const subAtt = document.getElementById('submitPanelAttendingCount');
  const subLeave = document.getElementById('submitPanelLeaveCount');
  const subUnch = document.getElementById('submitPanelUncheckedCount');
  if (subAtt) subAtt.innerText = attendingList.length;
  if (subLeave) subLeave.innerText = leaveList.length;
  if (subUnch) subUnch.innerText = unchecked;

  if (typeof updateSubmitBarUI === 'function') updateSubmitBarUI();
}

function setSessionDateToToday() {
  activeAttendanceDate = getTodayDateKey();
  updateSessionDateDisplay();
  if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
}

function stepSessionDate(daysOffset) {
  const parts = (activeAttendanceDate || getTodayDateKey()).split('-');
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  activeAttendanceDate = `${year}-${month}-${day}`;
  updateSessionDateDisplay();
  if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
}

function changeCoachAttendanceDate(val) {
  if (!val) return;
  activeAttendanceDate = val;
  updateSessionDateDisplay();
  if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
}

function openAttendanceHistoryModal() {
  const modal = document.getElementById('attendanceHistoryModal');
  if (!modal) return;
  renderAttendanceHistoryModal();
  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeAttendanceHistoryModal() {
  const modal = document.getElementById('attendanceHistoryModal');
  if (modal) modal.classList.add('hidden');
}

function renderAttendanceHistoryModal() {
  const listContainer = document.getElementById('attendanceHistoryList');
  if (!listContainer) return;

  ensureHistoricalDatesSeeded();

  const allDateKeys = Object.keys(dailyAttendance).sort((a, b) => b.localeCompare(a));
  
  let totalSessions = allDateKeys.length;
  let totalAttendances = 0;

  allDateKeys.forEach(dk => {
    const recs = dailyAttendance[dk] || {};
    const attCount = Object.values(recs).filter(r => r.status === 'attending').length;
    totalAttendances += attCount;
  });

  const avgPerSession = totalSessions > 0 ? (totalAttendances / totalSessions).toFixed(1) : '0';

  const elTotalSessions = document.getElementById('histTotalSessions');
  const elTotalAtt = document.getElementById('histTotalAttendances');
  const elAvg = document.getElementById('histAvgPerSession');
  if (elTotalSessions) elTotalSessions.innerText = `${totalSessions} รอบ`;
  if (elTotalAtt) elTotalAtt.innerText = `${totalAttendances} ครั้ง`;
  if (elAvg) elAvg.innerText = `${avgPerSession} คน`;

  if (allDateKeys.length === 0) {
    listContainer.innerHTML = `
      <div class="p-8 text-center text-slate-400 space-y-2">
        <i data-lucide="calendar-x-2" class="w-10 h-10 mx-auto text-slate-300"></i>
        <p class="font-bold text-slate-600">ยังไม่มีประวัติการเช็คชื่อที่ถูกบันทึก</p>
        <p class="text-xs">เมื่อโค้ชเช็คชื่อเข้าฝึกซ้อม ข้อมูลสถิติรายวันจะถูกรวบรวมไว้ที่นี่อัตโนมัติ</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  listContainer.innerHTML = '';
  allDateKeys.forEach(dk => {
    const recs = dailyAttendance[dk] || {};
    const attending = Object.values(recs).filter(r => r.status === 'attending');
    const leave = Object.values(recs).filter(r => r.status === 'leave');

    const parts = dk.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const dayW = d.getDay();
    const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const thaiYear = d.getFullYear() + 543;
    const formattedDate = `${thaiDays[dayW]}ที่ ${d.getDate()} ${thaiMonths[d.getMonth()]} ${thaiYear}`;

    let scheduleNote = (dayW === 6) ? 'คลาสวันเสาร์ Basic Coach Oat (16:00 - 18:00 น.)' : ((dayW === 1 || dayW === 2 || dayW === 4) ? 'คลาสปกติ 17:30 - 19:30 น.' : 'รอบฝึกซ้อม');
    const isToday = (dk === getTodayDateKey());

    const item = document.createElement('div');
    item.className = "card-clean p-4 rounded-xl border border-slate-200 bg-white space-y-3";
    item.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-slate-900 text-sm sm:text-base">${formattedDate}</h4>
            ${isToday ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">วันนี้</span>' : ''}
          </div>
          <span class="text-xs text-slate-500 font-medium">${scheduleNote}</span>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            มาเรียน ${attending.length} คน
          </span>
          <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            ลา ${leave.length} คน
          </span>
          <button type="button" onclick="jumpToDateForRollCall('${dk}')" class="btn-touch px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1 cursor-pointer">
            <i data-lucide="calendar" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>เปิดรอบเช็คชื่อ</span>
          </button>
          <button type="button" onclick="copyDailyAttendanceLineSummary('${dk}')" class="btn-touch px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 cursor-pointer" title="คัดลอกสรุปส่งไลน์กลุ่ม">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>ก๊อปส่งไลน์</span>
          </button>
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs text-slate-600">
          <span class="font-bold text-emerald-800">รายชื่อนักเรียนที่มาเรียน (${attending.length} คน):</span>
          <button type="button" onclick="toggleHistoryAttendeeList('histAttList_${dk}')" class="text-indigo-600 hover:underline text-[11px] font-semibold cursor-pointer">
            ดู/ซ่อนรายชื่อ
          </button>
        </div>
        <div id="histAttList_${dk}" class="flex flex-wrap gap-1.5 pt-1">
          ${attending.map(a => `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              น้อง ${a.name}
              ${a.time ? `<span class="text-[10px] text-emerald-600 font-mono">(${a.time})</span>` : ''}
            </span>
          `).join('') || '<span class="text-xs text-slate-400 italic">ไม่มีข้อมูลผู้มาเรียน</span>'}
        </div>
      </div>
    `;
    listContainer.appendChild(item);
  });
  lucide.createIcons();
}

function toggleHistoryAttendeeList(elId) {
  const el = document.getElementById(elId);
  if (el) el.classList.toggle('hidden');
}

function jumpToDateForRollCall(dateKey) {
  activeAttendanceDate = dateKey;
  updateSessionDateDisplay();
  if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
  closeAttendanceHistoryModal();
  switchTab('coach-roster');
  showToast(`สลับไปยังรอบเช็คชื่อวันที่ ${dateKey} เรียบร้อยแล้ว`);
}

function copyDailyAttendanceLineSummary(dateKey) {
  const recs = dailyAttendance[dateKey] || {};
  const attending = Object.values(recs).filter(r => r.status === 'attending');
  const leave = Object.values(recs).filter(r => r.status === 'leave');

  const parts = dateKey.split('-');
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const thaiYear = d.getFullYear() + 543;
  const formattedDate = `${thaiDays[d.getDay()]}ที่ ${d.getDate()} ${thaiMonths[d.getMonth()]} ${thaiYear}`;

  let text = `🏀 สรุปเช็คชื่อการฝึกซ้อม DBO Basketball Academy\n`;
  text += `📅 ประจำ${formattedDate}\n`;
  text += `------------------------------------\n`;
  text += `✅ มาเรียน (${attending.length} คน):\n`;
  if (attending.length === 0) {
    text += `- ไม่มีข้อมูลผู้มาเรียน\n`;
  } else {
    attending.forEach((a, idx) => {
      text += `${idx + 1}. น้อง ${a.name} ${a.time ? `(${a.time})` : ''}\n`;
    });
  }

  text += `\n⚠️ แจ้งลา (${leave.length} คน):\n`;
  if (leave.length === 0) {
    text += `- ไม่มี\n`;
  } else {
    leave.forEach((l, idx) => {
      text += `${idx + 1}. น้อง ${l.name} (${l.leaveReason || 'ลาเรียน'})\n`;
    });
  }

  text += `------------------------------------\n`;
  text += `สถาบัน DBO Basketball Academy`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`คัดลอกสรุปเช็คชื่อวันที่ ${dateKey} สำหรับส่งไลน์กลุ่มเรียบร้อยแล้ว!`);
    }).catch(() => {
      prompt('คัดลอกข้อความสรุปด้านล่างนี้ได้เลยครับ:', text);
    });
  } else {
    prompt('คัดลอกข้อความสรุปด้านล่างนี้ได้เลยครับ:', text);
  }
}

// Daily Attendance Board
function renderDailyAttendanceBoard() {
  const todayKey = getTodayDateKey();
  const records = dailyAttendance[todayKey] || {};

  const attendingListEl = document.getElementById('boardAttendingList');
  const leaveListEl = document.getElementById('boardLeaveList');
  const unconfirmedListEl = document.getElementById('boardUnconfirmedList');

  const attendingCountEl = document.getElementById('boardAttendingCount');
  const leaveCountEl = document.getElementById('boardLeaveCount');
  const unconfirmedCountEl = document.getElementById('boardUnconfirmedCount');

  const attendingBadge = document.getElementById('boardAttendingBadge');
  const leaveBadge = document.getElementById('boardLeaveBadge');
  const unconfirmedBadge = document.getElementById('boardUnconfirmedBadge');

  if (!attendingListEl || !leaveListEl || !unconfirmedListEl) return;

  const attending = [];
  const leave = [];
  const unconfirmed = [];

  students.forEach(st => {
    const att = records[st.id];
    if (att && att.status === 'attending') {
      attending.push({ ...st, time: att.time });
    } else if (att && att.status === 'leave') {
      leave.push({ ...st, reason: att.leaveReason, time: att.time });
    } else {
      unconfirmed.push(st);
    }
  });

  if (attendingCountEl) attendingCountEl.innerText = attending.length;
  if (leaveCountEl) leaveCountEl.innerText = leave.length;
  if (unconfirmedCountEl) unconfirmedCountEl.innerText = unconfirmed.length;

  if (attendingBadge) attendingBadge.innerText = attending.length;
  if (leaveBadge) leaveBadge.innerText = leave.length;
  if (unconfirmedBadge) unconfirmedBadge.innerText = unconfirmed.length;

  attendingListEl.innerHTML = '';
  if (attending.length === 0) {
    attendingListEl.innerHTML = `
      <div class="col-span-full p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        ยังไม่มีผู้ยืนยันเข้าเรียนวันนี้ แตะ "ยืนยันเข้าเรียนวันนี้" ด้านบนได้เลยครับ
      </div>
    `;
  } else {
    attending.forEach(st => {
      const div = document.createElement('div');
      div.className = "p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-2.5 shadow-2xs hover:bg-emerald-100/60 transition";
      div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
          ${st.name.charAt(0)}
        </div>
        <div class="min-w-0 flex-1">
          <strong class="text-xs sm:text-sm font-bold text-slate-900 block truncate">น้อง ${st.name}</strong>
          <span class="text-[10px] text-emerald-700 font-medium block">
            ${st.time ? `ยืนยัน: ${st.time}` : 'ยืนยันแล้ว'}
          </span>
        </div>
      `;
      attendingListEl.appendChild(div);
    });
  }

  leaveListEl.innerHTML = '';
  if (leave.length === 0) {
    leaveListEl.innerHTML = `
      <div class="col-span-full p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        ไม่มีรายการแจ้งลาในวันนี้
      </div>
    `;
  } else {
    leave.forEach(st => {
      const div = document.createElement('div');
      div.className = "p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-2 shadow-2xs";
      div.innerHTML = `
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-6 h-6 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
            ${st.name.charAt(0)}
          </span>
          <div class="min-w-0">
            <span class="text-xs font-bold text-slate-800 block truncate">น้อง ${st.name}</span>
            <span class="text-[10px] text-amber-700 block truncate">${st.reason || 'ลาหยุด'}</span>
          </div>
        </div>
        <span class="text-[10px] font-mono text-slate-400 flex-shrink-0">${st.time || ''}</span>
      `;
      leaveListEl.appendChild(div);
    });
  }

  unconfirmedListEl.innerHTML = '';
  unconfirmed.forEach(st => {
    const span = document.createElement('span');
    span.className = "px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200";
    span.innerText = `น้อง ${st.name}`;
    unconfirmedListEl.appendChild(span);
  });

  if (typeof renderParentClassmatesList === 'function') renderParentClassmatesList();
  lucide.createIcons();
}

function toggleUnconfirmedList() {
  const el = document.getElementById('boardUnconfirmedList');
  const btn = document.getElementById('btnToggleUnconfirmed');
  if (!el || !btn) return;
  if (el.classList.contains('hidden')) {
    el.classList.remove('hidden');
    btn.innerText = 'ซ่อนรายชื่อ';
  } else {
    el.classList.add('hidden');
    btn.innerText = 'แสดงรายชื่อทั้งหมด';
  }
}

// DBO Basketball Academy - Post-Training & Attendance Records
function renderTeachingRecordsList(filterMonth = null) {
  const container = document.getElementById('teachingRecordsList');
  const countEl = document.getElementById('totalTeachingRecordsCount');
  if (!container) return;

  let records = [...teachingRecords];
  if (filterMonth) {
    records = records.filter(r => r.date && r.date.startsWith(filterMonth));
  }

  if (countEl) countEl.innerText = records.length;

  if (records.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-400 space-y-3 bg-white rounded-2xl border border-slate-200">
        <i data-lucide="clipboard-list" class="w-12 h-12 mx-auto text-slate-300"></i>
        <div>
          <p class="font-bold text-slate-700 text-sm">ยังไม่มีรายการบันทึกการสอน (No Training Records)</p>
          <p class="text-xs text-slate-500 mt-1">กดปุ่ม "+ บันทึกเช็คชื่อใหม่ (New Record)" ด้านบน เพื่อบันทึกการฝึกซ้อมและเช็คชื่อนักเรียน</p>
        </div>
        <button type="button" onclick="openNewTeachingRecordModal()" class="btn-touch px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs inline-flex items-center gap-1.5 cursor-pointer">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>+ สร้าง New Record แรก</span>
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = '';
  records.forEach((rec) => {
    const card = document.createElement('div');
    card.className = "card-clean p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs";

    const parts = (rec.date || '').split('-');
    let dateStr = rec.date;
    let dayOfWeekName = '';
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
      const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      dayOfWeekName = thaiDays[d.getDay()] || '';
      dateStr = `${dayOfWeekName}ที่ ${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
    }

    const attendingStudents = rec.attendingStudents || [];
    const leaveStudents = rec.leaveStudents || [];

    const getCleanStudentName = (st) => {
      if (!st) return 'นักเรียน';
      const match = students.find(s => s && Number(s.id) === Number(st.id));
      if (match && match.name && !match.name.includes('?')) return match.name;
      if (st.name && !st.name.includes('?')) return st.name;
      return match ? match.name : (st.name || 'นักเรียน');
    };

    const cleanSlot = (!rec.slot || rec.slot.includes('?') || rec.slot.includes('17:00 - 18:30')) ? 'คลาสปกติ 17:30 - 19:30 น.' : rec.slot;
    const cleanCoach = (!rec.coach || rec.coach.includes('?')) ? 'โค้ชโอ๊ต (Head Coach)' : rec.coach;

    const attendingChips = attendingStudents.map(st => `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>น้อง ${getCleanStudentName(st)}</span>
      </span>
    `).join('') || '<span class="text-xs text-slate-400 italic">ไม่มีนักเรียนมาเรียน</span>';

    const leaveChips = leaveStudents.map(st => `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>น้อง ${getCleanStudentName(st)} (ลา)</span>
      </span>
    `).join('');

    card.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 font-bold">
            <i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <strong class="text-sm sm:text-base font-bold text-slate-900">${dateStr}</strong>
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">${cleanSlot}</span>
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">โค้ช: ${cleanCoach}</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              ${rec.topic ? `หัวข้อฝึกซ้อม: <strong class="text-slate-800 font-semibold">${rec.topic}</strong>` : 'บันทึกการฝึกซ้อมและเช็คชื่อประจำวัน DBO Academy'}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span> มาเรียน ${attendingStudents.length} คน
          </span>
          ${leaveStudents.length > 0 ? `
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span> ลา ${leaveStudents.length} คน
            </span>
          ` : ''}
        </div>
      </div>

      <div class="space-y-1.5">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">รายชื่อนักเรียนที่เช็คชื่อเข้าเรียน:</span>
        <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
          ${attendingChips}
        </div>
        ${leaveStudents.length > 0 ? `
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block pt-1">รายชื่อนักเรียนที่แจ้งลา:</span>
          <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
            ${leaveChips}
          </div>
        ` : ''}
      </div>

      <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          <button type="button" onclick="openEditTeachingRecordModal('${rec.id}')" class="btn-touch px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition cursor-pointer shadow-2xs">
            <i data-lucide="edit-3" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>✏️ ดู / แก้ไข Record นี้</span>
          </button>
          <button type="button" onclick="resendTeachingRecordNotifications('${rec.id}')" class="btn-touch px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition cursor-pointer" title="ส่งการแจ้งเตือนไปยังเครื่องผู้ปกครองอีกครั้ง">
            <i data-lucide="bell-ring" class="w-3.5 h-3.5 text-slate-500"></i>
            <span>📢 ส่งแจ้งเตือน ผปค ซ้ำ</span>
          </button>
        </div>

        <button type="button" onclick="deleteTeachingRecord('${rec.id}')" class="btn-touch px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 flex items-center gap-1 transition cursor-pointer" title="ลบ Record นี้ และคืนสิทธิ์ให้นักเรียน">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          <span>ลบ Record (คืนสิทธิ์)</span>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
  lucide.createIcons();
}

function filterTeachingRecordsByMonth(monthVal) {
  renderTeachingRecordsList(monthVal);
}

function resetRecordMonthFilter() {
  const el = document.getElementById('filterRecordMonth');
  if (el) el.value = '';
  renderTeachingRecordsList();
}

function openNewTeachingRecordModal() {
  const modal = document.getElementById('teachingRecordModal');
  if (!modal) return;

  document.getElementById('editingRecordId').value = '';
  document.getElementById('recordModalTitle').innerText = 'บันทึกการสอน & เช็คชื่อเข้าเรียน (New Record)';
  
  const todayKey = activeAttendanceDate || getTodayDateKey();
  document.getElementById('recordDateInput').value = todayKey;

  const coachSelect = document.getElementById('recordCoachSelect');
  if (coachSelect && currentStaff) {
    coachSelect.value = currentStaff.role.includes('ผู้ช่วย') ? 'ผู้ช่วยโค้ช (Assistant)' : (currentStaff.name.includes('โอ๊ค') ? 'โค้ชโอ๊ค' : 'โค้ชโอ๊ต (Head Coach)');
  }

  const parts = todayKey.split('-');
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const slotSelect = document.getElementById('recordSlotSelect');
  if (slotSelect) {
    if (d.getDay() === 6) slotSelect.value = 'คลาสวันเสาร์ Basic Coach Oat 09:00 - 10:30 น.';
    else slotSelect.value = 'คลาสปกติ 17:00 - 18:30 น.';
  }

  document.getElementById('recordTopicInput').value = '';
  document.getElementById('recordStudentSearchInput').value = '';

  const existingDay = dailyAttendance[todayKey] || {};
  populateRecordChecklist(existingDay);

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function openEditTeachingRecordModal(recordId) {
  const modal = document.getElementById('teachingRecordModal');
  if (!modal) return;

  const rec = teachingRecords.find(r => r.id === recordId);
  if (!rec) return;

  document.getElementById('editingRecordId').value = rec.id;
  document.getElementById('recordModalTitle').innerText = `แก้ไข Record การสอน (${rec.date})`;
  document.getElementById('recordDateInput').value = rec.date || getTodayDateKey();
  
  const slotSelect = document.getElementById('recordSlotSelect');
  if (slotSelect && rec.slot) slotSelect.value = rec.slot;

  const coachSelect = document.getElementById('recordCoachSelect');
  if (coachSelect && rec.coach) coachSelect.value = rec.coach;

  document.getElementById('recordTopicInput').value = rec.topic || '';
  document.getElementById('recordStudentSearchInput').value = '';

  const stateMap = {};
  (rec.attendingStudents || []).forEach(st => {
    stateMap[st.id] = { status: 'attending' };
  });
  (rec.leaveStudents || []).forEach(st => {
    stateMap[st.id] = { status: 'leave' };
  });

  populateRecordChecklist(stateMap);

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeTeachingRecordModal() {
  const modal = document.getElementById('teachingRecordModal');
  if (modal) modal.classList.add('hidden');
}

function populateRecordChecklist(stateMap = {}) {
  const container = document.getElementById('recordStudentChecklistContainer');
  if (!container) return;

  container.innerHTML = '';
  const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name, 'th'));

  sorted.forEach(s => {
    const row = document.createElement('div');
    row.className = "record-student-row flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition border-b border-slate-50";
    row.setAttribute('data-student-id', s.id);
    row.setAttribute('data-student-name', (s.name || '').toLowerCase());

    const currentStatus = (stateMap[s.id] && stateMap[s.id].status) || 'absent';
    const rem = s.remaining !== undefined ? s.remaining : 0;
    const quotaColor = rem > 3 ? 'text-emerald-700' : (rem >= 1 ? 'text-amber-700' : 'text-rose-700 font-bold');

    row.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0 pr-2">
        <span class="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          ${s.id}
        </span>
        <div class="min-w-0">
          <strong class="text-xs sm:text-sm font-bold text-slate-900 block truncate">น้อง ${s.name}</strong>
          <span class="text-[10px] text-slate-500 font-mono">
            คงเหลือ: <span class="${quotaColor}">${rem} ครั้ง</span> ${s.saturdayRemaining ? `• เสาร์: ${s.saturdayRemaining}` : ''}
          </span>
        </div>
      </div>

      <div class="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs flex-shrink-0">
        <button type="button" onclick="setRecordStudentStatus(${s.id}, 'attending')" id="btnStatus_${s.id}_attending" class="btn-touch px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${currentStatus === 'attending' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}">
          ✓ มา (-1)
        </button>
        <button type="button" onclick="setRecordStudentStatus(${s.id}, 'leave')" id="btnStatus_${s.id}_leave" class="btn-touch px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${currentStatus === 'leave' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}">
          ลา
        </button>
        <button type="button" onclick="setRecordStudentStatus(${s.id}, 'absent')" id="btnStatus_${s.id}_absent" class="btn-touch px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${currentStatus === 'absent' ? 'bg-slate-300 text-slate-800' : 'text-slate-500 hover:text-slate-900'}">
          ไม่มา
        </button>
      </div>
    `;

    container.appendChild(row);
  });

  updateRecordModalCounts();
}

function setRecordStudentStatus(studentId, status) {
  const btnAtt = document.getElementById(`btnStatus_${studentId}_attending`);
  const btnLeave = document.getElementById(`btnStatus_${studentId}_leave`);
  const btnAbsent = document.getElementById(`btnStatus_${studentId}_absent`);

  if (btnAtt) btnAtt.className = `btn-touch px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${status === 'attending' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`;
  if (btnLeave) btnLeave.className = `btn-touch px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${status === 'leave' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`;
  if (btnAbsent) btnAbsent.className = `btn-touch px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${status === 'absent' ? 'bg-slate-300 text-slate-800' : 'text-slate-500 hover:text-slate-900'}`;

  updateRecordModalCounts();
}

function filterRecordStudents(query) {
  const q = (query || '').trim().toLowerCase();
  const rows = document.querySelectorAll('.record-student-row');
  rows.forEach(r => {
    const sName = r.getAttribute('data-student-name') || '';
    const sId = r.getAttribute('data-student-id') || '';
    if (sName.includes(q) || sId.includes(q)) {
      r.classList.remove('hidden');
    } else {
      r.classList.add('hidden');
    }
  });
}

function recordSelectAllAttending() {
  students.forEach(s => setRecordStudentStatus(s.id, 'attending'));
}

function recordClearAllAttendance() {
  students.forEach(s => setRecordStudentStatus(s.id, 'absent'));
}

function updateRecordModalCounts() {
  let attending = 0;
  let leave = 0;
  let absent = 0;

  students.forEach(s => {
    const btnAtt = document.getElementById(`btnStatus_${s.id}_attending`);
    const btnLeave = document.getElementById(`btnStatus_${s.id}_leave`);
    if (btnAtt && btnAtt.classList.contains('bg-emerald-600')) attending++;
    else if (btnLeave && btnLeave.classList.contains('bg-amber-500')) leave++;
    else absent++;
  });

  const elAtt = document.getElementById('recordModalAttendingCount');
  const elLeave = document.getElementById('recordModalLeaveCount');
  const elAbsent = document.getElementById('recordModalAbsentCount');
  if (elAtt) elAtt.innerText = attending;
  if (elLeave) elLeave.innerText = leave;
  if (elAbsent) elAbsent.innerText = absent;
}

async function saveTeachingRecordFromModal() {
  const editingId = document.getElementById('editingRecordId').value;
  const dateVal = document.getElementById('recordDateInput').value;
  const slotVal = document.getElementById('recordSlotSelect').value;
  const coachVal = document.getElementById('recordCoachSelect').value;
  const topicVal = document.getElementById('recordTopicInput').value.trim();
  const sendPushCheckbox = document.getElementById('recordSendPushCheckbox');
  const sendPush = sendPushCheckbox ? sendPushCheckbox.checked : true;

  if (!dateVal) {
    showToast('กรุณาระบุวันที่สอน');
    return;
  }

  const nowTs = Date.now();
  const isSaturday = slotVal.includes('วันเสาร์');
  const targetField = isSaturday ? 'saturday' : 'regular';

  const attending = [];
  const leave = [];

  students.forEach(s => {
    const btnAtt = document.getElementById(`btnStatus_${s.id}_attending`);
    const btnLeave = document.getElementById(`btnStatus_${s.id}_leave`);
    if (btnAtt && btnAtt.classList.contains('bg-emerald-600')) {
      attending.push({ id: s.id, name: s.name });
    } else if (btnLeave && btnLeave.classList.contains('bg-amber-500')) {
      leave.push({ id: s.id, name: s.name });
    }
  });

  let previousRecord = null;
  if (editingId) {
    previousRecord = teachingRecords.find(r => r.id === editingId);
  }

  if (previousRecord) {
    const prevAttMap = new Set((previousRecord.attendingStudents || []).map(a => a.id));
    const newAttMap = new Set(attending.map(a => a.id));

    prevAttMap.forEach(sid => {
      if (!newAttMap.has(sid)) {
        const st = students.find(s => s.id === sid);
        if (st) {
          if (targetField === 'saturday') st.saturdayRemaining = (st.saturdayRemaining || 0) + 1;
          else st.remaining = (st.remaining || 0) + 1;
          st._updatedAt = nowTs;
          syncSharedSiblingQuota(st, targetField);
        }
      }
    });

    newAttMap.forEach(sid => {
      if (!prevAttMap.has(sid)) {
        const st = students.find(s => s.id === sid);
        if (st) {
          if (targetField === 'saturday') st.saturdayRemaining = (st.saturdayRemaining || 0) - 1;
          else st.remaining = (st.remaining || 0) - 1;
          st._updatedAt = nowTs;
          syncSharedSiblingQuota(st, targetField);
        }
      }
    });

    previousRecord.date = dateVal;
    previousRecord.slot = slotVal;
    previousRecord.coach = coachVal;
    previousRecord.topic = topicVal;
    previousRecord.attendingCount = attending.length;
    previousRecord.leaveCount = leave.length;
    previousRecord.attendingStudents = attending;
    previousRecord.leaveStudents = leave;
    previousRecord.updatedAt = nowTs;
  } else {
    attending.forEach(a => {
      const st = students.find(s => s.id === a.id);
      if (st) {
        if (targetField === 'saturday') st.saturdayRemaining = (st.saturdayRemaining || 0) - 1;
        else st.remaining = (st.remaining || 0) - 1;
        st._updatedAt = nowTs;
        syncSharedSiblingQuota(st, targetField);
      }
    });

    const newRecord = {
      id: 'rec_' + dateVal.replace(/-/g, '') + '_' + Date.now().toString(36),
      date: dateVal,
      slot: slotVal,
      coach: coachVal,
      topic: topicVal,
      attendingCount: attending.length,
      leaveCount: leave.length,
      attendingStudents: attending,
      leaveStudents: leave,
      createdAt: nowTs,
      updatedAt: nowTs
    };
    teachingRecords.unshift(newRecord);
  }

  dailyAttendance[dateVal] = {};
  const nowTimeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
  attending.forEach(a => {
    dailyAttendance[dateVal][a.id] = {
      studentId: a.id,
      name: a.name,
      status: 'attending',
      time: nowTimeStr,
      updatedBy: coachVal,
      dateKey: dateVal,
      updatedAt: nowTs
    };
  });
  leave.forEach(l => {
    dailyAttendance[dateVal][l.id] = {
      studentId: l.id,
      name: l.name,
      status: 'leave',
      time: nowTimeStr,
      leaveReason: 'แจ้งลาใน Record',
      updatedBy: coachVal,
      dateKey: dateVal,
      updatedAt: nowTs
    };
  });

  if (sendPush) {
    attending.forEach((a, i) => {
      const st = students.find(s => s.id === a.id);
      const remAfter = st ? (targetField === 'saturday' ? st.saturdayRemaining : st.remaining) : 0;
      setTimeout(() => {
        notifyAttendanceCheckIn(a.name, coachVal, nowTimeStr, remAfter);
      }, i * 200);
    });

    const checkinPayload = {
      senderId: window.dboClientId,
      type: 'COACH_CHECKIN_EVENT',
      coachName: coachVal,
      dateKey: dateVal,
      attendingStudents: attending.map(a => {
        const st = students.find(s => s.id === a.id);
        const remAfter = st ? (targetField === 'saturday' ? st.saturdayRemaining : st.remaining) : 0;
        return { id: a.id, name: a.name, remaining: remAfter };
      }),
      leaveStudents: leave.map(l => ({ id: l.id, name: l.name })),
      timeStr: nowTimeStr
    };

    // 1. Cross-tab instant BroadcastChannel
    if (window.dboRealtimeBC) {
      try { window.dboRealtimeBC.postMessage(checkinPayload); } catch (e) {}
    }

    // 2. Real-time broadcast to Parent devices via MQTT
    if (typeof publishToMqttBrokers === 'function') {
      publishToMqttBrokers(REALTIME_SYNC_TOPIC, checkinPayload);
    }
  }

  saveState(true, `บันทึกการสอน & เช็คชื่อ (${dateVal}): มาเรียน ${attending.length} คน`, true);
  closeTeachingRecordModal();
  renderTeachingRecordsList();
  if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
  updateSessionDateDisplay();
  renderDailyAttendanceBoard();
  if (loggedInStudent && typeof renderParentView === 'function') {
    renderParentView();
  }

  showToast(`บันทึก Record การสอนสำเร็จ (มาเรียน ${attending.length} คน, ลา ${leave.length} คน)`);
  triggerTelegramPush(`บันทึกการสอนรอบ ${dateVal} โดย ${coachVal}: มาเรียน ${attending.length} คน, ลา ${leave.length} คน • อัปเดตทุกเครื่องแล้ว`, 'DBO Post-Teaching Record');
}

function deleteTeachingRecord(recordId) {
  const rec = teachingRecords.find(r => r.id === recordId);
  if (!rec) return;

  const count = (rec.attendingStudents || []).length;
  if (!confirm(`คุณต้องการลบ Record การสอนวันที่ "${rec.date}" (${rec.slot}) ใช่หรือไม่?\n\n* ระบบจะคืนสิทธิ์ (+1 ครั้ง) ให้กับนักเรียนที่มาเรียนในรอบนี้ทั้งหมด ${count} คนอัตโนมัติ`)) {
    return;
  }

  const nowTs = Date.now();
  const isSaturday = (rec.slot || '').includes('วันเสาร์');
  const targetField = isSaturday ? 'saturday' : 'regular';

  (rec.attendingStudents || []).forEach(a => {
    const st = students.find(s => s.id === a.id);
    if (st) {
      if (targetField === 'saturday') st.saturdayRemaining = (st.saturdayRemaining || 0) + 1;
      else st.remaining = (st.remaining || 0) + 1;
      st._updatedAt = nowTs;
      syncSharedSiblingQuota(st, targetField);
    }
  });

  if (dailyAttendance[rec.date]) {
    delete dailyAttendance[rec.date];
  }

  teachingRecords = teachingRecords.filter(r => r.id !== recordId);
  saveState(true, `ลบ Record การสอนวันที่ ${rec.date} และคืนสิทธิ์นักเรียน`, true);
  renderTeachingRecordsList();
  if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
  updateSessionDateDisplay();
  renderDailyAttendanceBoard();

  showToast(`ลบ Record วันที่ ${rec.date} และคืนสิทธิ์ให้นักเรียนเรียบร้อยแล้ว`);
}

function resendTeachingRecordNotifications(recordId) {
  const rec = teachingRecords.find(r => r.id === recordId);
  if (!rec) return;

  const attendees = rec.attendingStudents || [];
  if (attendees.length === 0) {
    showToast('ไม่มีรายชื่อนักเรียนที่เช็คชื่อเข้าเรียนใน Record นี้');
    return;
  }

  attendees.forEach((a, i) => {
    const st = students.find(s => s.id === a.id);
    const rem = st ? st.remaining : 0;
    setTimeout(() => {
      notifyAttendanceCheckIn(a.name, rec.coach || 'โค้ชโอ๊ต', '17:00 น.', rem);
    }, i * 250);
  });

  // Real-time broadcast to Parent devices via MQTT
  if (typeof publishToMqttBrokers === 'function') {
    publishToMqttBrokers(REALTIME_SYNC_TOPIC, {
      senderId: window.dboClientId,
      type: 'COACH_CHECKIN_EVENT',
      coachName: rec.coach || 'โค้ชโอ๊ต',
      dateKey: rec.date,
      attendingStudents: attendees.map(a => {
        const st = students.find(s => s.id === a.id);
        return { id: a.id, name: a.name, remaining: st ? st.remaining : 0 };
      }),
      leaveStudents: (rec.leaveStudents || []).map(l => ({ id: l.id, name: l.name })),
      timeStr: '17:00 น.'
    });
  }

  showToast(`ส่งการแจ้งเตือนไปยังเครื่อง ผปค ของนักเรียนทั้ง ${attendees.length} คน เรียบร้อยแล้ว`);
}
