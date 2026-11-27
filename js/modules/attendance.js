// ========================================================
// DBO Basketball Academy - Attendance & Teaching Records
// (Roll Call Sessions, History Modal, Daily Attendance Board, DBO Academy Records)
// ========================================================

const attendanceDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit'
});

function getTodayDateKey(date = new Date()) {
  const parts = Object.fromEntries(attendanceDateFormatter.formatToParts(date).map(part => [part.type, part.value]));
  return parts.year + '-' + parts.month + '-' + parts.day;
}

function isAttendanceDateKey(key) {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const date = new Date(key + 'T12:00:00Z');
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === key;
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
  if (modal.firstElementChild) modal.firstElementChild.scrollTop = 0;
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
        <p class="font-bold text-slate-600">ยังไม่มีประวัติเข้าเรียน</p>
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
    item.className = 'card-clean history-entry';
    item.innerHTML = `
      <div class="history-entry-heading">
        <h4>${formattedDate}${isToday ? ' · วันนี้' : ''}</h4>
        <p>${scheduleNote}</p>
      </div>
      <div class="history-entry-counts">
        <span class="text-emerald-800">มาเรียน <strong>${attending.length}</strong></span>
        <span class="text-amber-800">ลา <strong>${leave.length}</strong></span>
      </div>
      <details>
        <summary>รายชื่อผู้มาเรียน</summary>
        <div class="flex flex-wrap gap-1.5 pt-2">
          ${attending.map(a => `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              น้อง ${a.name}
              ${a.time ? `<span class="text-[10px] text-emerald-600 font-mono">(${a.time})</span>` : ''}
            </span>
          `).join('') || '<span class="text-xs text-slate-400 italic">ไม่มีข้อมูลผู้มาเรียน</span>'}
        </div>
      </details>
      <div class="history-entry-actions">
        <button type="button" onclick="jumpToDateForRollCall('${dk}')" class="btn-touch bg-nike-ink text-white">
          <i data-lucide="calendar"></i><span>เปิดรอบ</span>
        </button>
        <button type="button" onclick="copyDailyAttendanceLineSummary('${dk}')" class="btn-touch bg-nike-cloud text-nike-ink" title="คัดลอกสรุปสำหรับส่ง LINE">
          <i data-lucide="copy"></i><span>คัดลอกสรุป</span>
        </button>
      </div>
    `;
    listContainer.appendChild(item);
  });
  lucide.createIcons();
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

async function copyTeachingRecordSummary(recordId) {
  if (!isCoachAuth) return;
  const record = teachingRecords.find(item => item.id === recordId);
  if (!record || !isAttendanceDateKey(record.date)) return;
  const date = new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'long' }).format(new Date(record.date + 'T12:00:00Z'));
  const text = [
    'สรุปหลังซ้อม DBO · ' + date,
    record.slot,
    'มาเรียน ' + (record.attendingStudents?.length || 0) + ' คน · ลา ' + (record.leaveStudents?.length || 0) + ' คน',
    record.topic ? 'หัวข้อซ้อม: ' + record.topic : ''
  ].filter(Boolean).join('\n');
  try {
    await navigator.clipboard.writeText(text);
    showToast('คัดลอกสรุปหลังซ้อมแล้ว');
  } catch {
    window.prompt('คัดลอกสรุปหลังซ้อม', text);
  }
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
function buildAttendanceWeeks(recordsByDate, today) {
  const shortDate = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', timeZone: 'Asia/Bangkok' });
  const anchor = new Date(getTodayDateKey(today) + 'T12:00:00Z');
  const dateAt = offset => new Date(anchor.valueOf() + offset * 86400000);
  return Array.from({ length: 4 }, (_, index) => {
    const firstDay = -27 + index * 7;
    const start = dateAt(firstDay);
    const end = dateAt(firstDay + 6);
    let attendance = 0;
    let recorded = false;
    for (let offset = 0; offset < 7; offset++) {
      const date = dateAt(firstDay + offset);
      const key = getTodayDateKey(date);
      const entries = Object.values(recordsByDate[key] || {});
      recorded ||= entries.some(entry => entry?.status === 'attending' || entry?.status === 'leave');
      attendance += entries.filter(entry => entry?.status === 'attending').length;
    }
    return { label: shortDate.format(start), period: shortDate.format(start) + ' – ' + shortDate.format(end), attendance, recorded };
  });
}

function renderAttendanceTrend() {
  const bars = document.getElementById('attendanceTrendBars');
  const empty = document.getElementById('attendanceTrendEmpty');
  if (!bars || !empty) return;

  const weeks = buildAttendanceWeeks(dailyAttendance, new Date());
  const hasRecords = weeks.some(week => week.recorded);
  bars.classList.toggle('hidden', !hasRecords);
  empty.classList.toggle('hidden', hasRecords);
  bars.replaceChildren();
  if (!hasRecords) return;

  const maxAttendance = Math.max(1, ...weeks.map(week => week.attendance));
  for (const week of weeks) {
    const item = document.createElement('li');
    item.setAttribute('aria-label', week.period + (week.recorded ? ' · ' + week.attendance + ' ครั้ง' : ' · ยังไม่มีบันทึก'));
    const value = document.createElement('strong');
    value.textContent = week.recorded ? week.attendance : '–';
    const track = document.createElement('span');
    track.className = 'attendance-trend-track';
    track.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('span');
    fill.style.setProperty('--attendance-share', (week.attendance / maxAttendance) * 100 + '%');
    track.appendChild(fill);
    const label = document.createElement('span');
    label.textContent = week.label;
    item.append(value, track, label);
    bars.appendChild(item);
  }
}

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
  document.getElementById('homeAttendingCount').textContent = attending.length;
  document.getElementById('homeLeaveCount').textContent = leave.length;
  document.getElementById('homeUnconfirmedCount').textContent = unconfirmed.length;
  if (isCoachAuth) renderAttendanceTrend();

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
        <div class="flex flex-wrap gap-1.5 p-1">
          ${attendingChips}
        </div>
        ${leaveStudents.length > 0 ? `
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block pt-1">รายชื่อนักเรียนที่แจ้งลา:</span>
          <div class="flex flex-wrap gap-1.5 p-1">
            ${leaveChips}
          </div>
        ` : ''}
      </div>

      <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" onclick="openEditTeachingRecordModal('${rec.id}')" class="btn-touch px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition cursor-pointer shadow-2xs">
            <i data-lucide="edit-3" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>ดูหรือแก้ไข</span>
          </button>
          <button type="button" onclick="copyTeachingRecordSummary('${rec.id}')" class="btn-touch px-3 bg-nike-cloud text-nike-ink flex gap-2">
            <i data-lucide="copy"></i><span>สรุปหลังซ้อม</span>
          </button>
          <button type="button" onclick="resendTeachingRecordNotifications('${rec.id}')" class="btn-touch px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition cursor-pointer" title="ส่งการแจ้งเตือนไปยังเครื่องผู้ปกครองอีกครั้ง">
            <i data-lucide="bell-ring" class="w-3.5 h-3.5 text-slate-500"></i>
            <span>แจ้งผู้ปกครองอีกครั้ง</span>
          </button>
        </div>

        <button type="button" onclick="deleteTeachingRecord('${rec.id}')" class="btn-touch px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 flex items-center gap-1 transition cursor-pointer" title="ลบ Record นี้ และคืนสิทธิ์ให้นักเรียน">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          <span>ลบและคืนสิทธิ์</span>
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

function openNewTeachingRecordModal(dateKey = activeAttendanceDate || getTodayDateKey()) {
  if (!isCoachAuth) return;
  const modal = document.getElementById('teachingRecordModal');
  if (!modal) return;

  document.getElementById('editingRecordId').value = '';
  document.getElementById('recordModalTitle').innerText = 'เช็กชื่อรอบใหม่';
  
  document.getElementById('recordDateInput').value = dateKey;

  const coachSelect = document.getElementById('recordCoachSelect');
  if (coachSelect && currentStaff) {
    coachSelect.value = currentStaff.role.includes('ผู้ช่วย') ? 'ผู้ช่วยโค้ช (Assistant)' : (currentStaff.name.includes('โอ๊ค') ? 'โค้ชโอ๊ค' : 'โค้ชโอ๊ต (Head Coach)');
  }

  selectTeachingSlot(dateKey);
  if (openExistingTeachingSlot(dateKey)) return;

  document.getElementById('recordTopicInput').value = '';
  document.getElementById('recordStudentSearchInput').value = '';

  populateRecordChecklist(getPendingAttendanceForSlot(dateKey));

  modal.classList.remove('hidden');
  modal.firstElementChild.scrollTop = 0;
  lucide.createIcons();
}

function selectTeachingSlot(dateKey) {
  const date = new Date(dateKey + 'T12:00:00Z');
  const slot = document.getElementById('recordSlotSelect');
  slot.selectedIndex = date.getUTCDay() === 6 ? 2 : 0;
}

function getPendingAttendanceForSlot(dateKey) {
  const slot = normalizeTeachingSlot(document.getElementById('recordSlotSelect').value);
  return Object.fromEntries(Object.entries(dailyAttendance[dateKey] || {}).filter(([, entry]) =>
    entry?.updatedBy === 'parent' && (!entry.slot || normalizeTeachingSlot(entry.slot) === slot)
  ));
}

function openExistingTeachingSlot(dateKey) {
  const slot = normalizeTeachingSlot(document.getElementById('recordSlotSelect').value);
  const existing = teachingRecords.find(record => record.date === dateKey && normalizeTeachingSlot(record.slot) === slot);
  if (!existing) return false;
  openEditTeachingRecordModal(existing.id);
  return true;
}

function changeTeachingRecordSlot() {
  if (document.getElementById('editingRecordId').value) return;
  const dateKey = document.getElementById('recordDateInput').value;
  if (!isAttendanceDateKey(dateKey) || openExistingTeachingSlot(dateKey)) return;
  populateRecordChecklist(getPendingAttendanceForSlot(dateKey));
  filterRecordStudents(document.getElementById('recordStudentSearchInput').value);
  lucide.createIcons();
}

function changeTeachingRecordDate() {
  if (document.getElementById('editingRecordId').value) return;
  const dateKey = document.getElementById('recordDateInput').value;
  if (!isAttendanceDateKey(dateKey)) return;
  selectTeachingSlot(dateKey);
  changeTeachingRecordSlot();
}

function openEditTeachingRecordModal(recordId) {
  if (!isCoachAuth) return;
  const modal = document.getElementById('teachingRecordModal');
  if (!modal) return;

  const rec = teachingRecords.find(r => r.id === recordId);
  if (!rec) return;

  document.getElementById('editingRecordId').value = rec.id;
  document.getElementById('recordModalTitle').innerText = `แก้ไขรอบซ้อม (${rec.date})`;
  document.getElementById('recordDateInput').value = rec.date || getTodayDateKey();
  
  const slotSelect = document.getElementById('recordSlotSelect');
  if (slotSelect && rec.slot) {
    if (!Array.from(slotSelect.options).some(option => option.value === rec.slot)) {
      slotSelect.add(new Option(rec.slot, rec.slot));
    }
    slotSelect.value = rec.slot;
  }

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
  modal.firstElementChild.scrollTop = 0;
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
  const sorted = [...students].sort((a, b) => {
    const nameA = (a.name || '').replace(/^น้อง\s*/, '').trim();
    const nameB = (b.name || '').replace(/^น้อง\s*/, '').trim();
    return nameA.localeCompare(nameB, 'th');
  });

  sorted.forEach(s => {
    const cleanName = (s.name || '').replace(/^น้อง\s*/, '').trim();
    const row = document.createElement('div');
    row.className = "record-student-row flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition border-b border-slate-50";
    row.setAttribute('data-student-id', s.id);
    row.setAttribute('data-student-name', cleanName.toLowerCase());

    const currentStatus = (stateMap[s.id] && stateMap[s.id].status) || 'absent';
    row.dataset.status = ['attending', 'leave'].includes(currentStatus) ? currentStatus : 'absent';
    const rem = s.remaining !== undefined ? s.remaining : 0;
    const quotaColor = rem > 3 ? 'text-emerald-700' : (rem >= 1 ? 'text-amber-700' : 'text-rose-700 font-bold');

    row.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0 pr-2">
        <span class="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          ${s.id}
        </span>
        <div class="min-w-0">
          <strong class="text-xs sm:text-sm font-bold text-slate-900 block truncate">น้อง ${cleanName}</strong>
          <span class="text-[10px] text-slate-500 font-mono">
            คงเหลือ: <span class="${quotaColor}">${rem} ครั้ง</span> ${s.saturdayRemaining ? `• เสาร์: ${s.saturdayRemaining}` : ''}
          </span>
        </div>
      </div>

      <div class="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs flex-shrink-0">
        <button type="button" onclick="setRecordStudentStatus(${s.id}, 'attending')" data-record-status="attending" aria-pressed="${row.dataset.status === 'attending'}" class="btn-touch record-status-button">
          มาเรียน
        </button>
        <button type="button" onclick="setRecordStudentStatus(${s.id}, 'leave')" data-record-status="leave" aria-pressed="${row.dataset.status === 'leave'}" class="btn-touch record-status-button">
          ลา
        </button>
        <button type="button" onclick="setRecordStudentStatus(${s.id}, 'absent')" data-record-status="absent" aria-pressed="${row.dataset.status === 'absent'}" class="btn-touch record-status-button">
          ยังไม่ระบุ
        </button>
      </div>
    `;

    container.appendChild(row);
  });

  updateRecordModalCounts();
}

function setRecordStudentStatus(studentId, status, updateCounts = true) {
  const row = document.querySelector(`.record-student-row[data-student-id="${studentId}"]`);
  if (!row) return;
  row.dataset.status = status;
  for (const button of row.querySelectorAll('[data-record-status]')) {
    button.setAttribute('aria-pressed', String(button.dataset.recordStatus === status));
  }
  if (updateCounts) updateRecordModalCounts();
}

function filterRecordStudents(query) {
  const rawQ = (query || '').trim().toLowerCase();
  const cleanQ = rawQ.replace(/^น้อง\s*/, '').trim();
  const rows = document.querySelectorAll('.record-student-row');
  rows.forEach(r => {
    const sName = (r.getAttribute('data-student-name') || '').toLowerCase();
    const cleanSName = sName.replace(/^น้อง\s*/, '').trim();
    const sId = r.getAttribute('data-student-id') || '';
    if (!rawQ || cleanSName.includes(cleanQ) || sName.includes(rawQ) || sId === rawQ || sId === cleanQ) {
      r.classList.remove('hidden');
    } else {
      r.classList.add('hidden');
    }
  });
}

function recordSelectAllAttending() {
  students.forEach(s => setRecordStudentStatus(s.id, 'attending', false));
  updateRecordModalCounts();
}

function recordClearAllAttendance() {
  students.forEach(s => setRecordStudentStatus(s.id, 'absent', false));
  updateRecordModalCounts();
}

function updateRecordModalCounts() {
  let attending = 0;
  let leave = 0;
  let absent = 0;

  for (const row of document.querySelectorAll('.record-student-row')) {
    if (row.dataset.status === 'attending') attending++;
    else if (row.dataset.status === 'leave') leave++;
    else absent++;
  }

  const elAtt = document.getElementById('recordModalAttendingCount');
  const elLeave = document.getElementById('recordModalLeaveCount');
  const elAbsent = document.getElementById('recordModalAbsentCount');
  if (elAtt) elAtt.innerText = attending;
  if (elLeave) elLeave.innerText = leave;
  if (elAbsent) elAbsent.innerText = absent;
}

function getRecordQuotaField(slot) {
  return (slot || '').includes('วันเสาร์') ? 'saturday' : 'regular';
}

function normalizeTeachingSlot(slot) {
  if (['คลาสปกติ 17:00 - 18:30 น.', '17:30 - 19:30 น. (คลาสปกติ)'].includes(slot)) return 'คลาสปกติ 17:30 - 19:30 น.';
  if (slot === '16:00 - 17:30 น. (คลาสวันเสาร์ Coach Oat)') return 'คลาสวันเสาร์ Team DBO 16:00 - 17:30 น.';
  return slot || '';
}

function getRecordQuotaChanges(previous, next) {
  const changes = new Map();
  for (const [record, delta] of [[previous, 1], [next, -1]]) {
    if (!record) continue;
    const course = getRecordQuotaField(record.slot);
    for (const studentId of new Set((record.attendingStudents || []).map(entry => String(entry.id)))) {
      const key = studentId + ':' + course;
      const change = changes.get(key) || { studentId, course, delta: 0 };
      change.delta += delta;
      changes.set(key, change);
    }
  }
  return [...changes.values()].filter(change => change.delta !== 0);
}

function updateRecordedAttendance(previous, next, time) {
  if (previous) {
    const entries = dailyAttendance[previous.date] || {};
    for (const person of [...(previous.attendingStudents || []), ...(previous.leaveStudents || [])]) {
      const entry = entries[person.id];
      if (entry?.recordId === previous.id || (entry && !entry.recordId && entry.updatedBy === previous.coach)) {
        const other = teachingRecords.find(record => record.id !== previous.id && record.date === previous.date &&
          [...(record.attendingStudents || []), ...(record.leaveStudents || [])].some(student => String(student.id) === String(person.id)));
        if (other) {
          const present = (other.attendingStudents || []).some(student => String(student.id) === String(person.id));
          entries[person.id] = { ...entry, status: present ? 'attending' : 'leave', recordId: other.id, updatedBy: other.coach, slot: other.slot };
        } else {
          delete entries[person.id];
        }
      }
    }
  }
  if (!next) return;
  dailyAttendance[next.date] ||= {};
  for (const [status, people] of [['attending', next.attendingStudents], ['leave', next.leaveStudents]]) {
    for (const person of people) {
      dailyAttendance[next.date][person.id] = {
        studentId: person.id, name: person.name, status, time,
        recordId: next.id, dateKey: next.date, slot: next.slot,
        updatedBy: next.coach, updatedAt: next.updatedAt
      };
    }
  }
}

async function saveTeachingRecordFromModal() {
  if (!isCoachAuth || document.getElementById('teachingRecordModal').classList.contains('hidden')) return;
  const editingId = document.getElementById('editingRecordId').value;
  const dateVal = document.getElementById('recordDateInput').value;
  const slotVal = document.getElementById('recordSlotSelect').value;
  const coachVal = document.getElementById('recordCoachSelect').value;
  const topicVal = document.getElementById('recordTopicInput').value.trim();
  const sendPushCheckbox = document.getElementById('recordSendPushCheckbox');
  const sendPush = sendPushCheckbox ? sendPushCheckbox.checked : true;

  if (!isAttendanceDateKey(dateVal) || !slotVal) {
    showToast('เลือกวันที่และรอบซ้อม');
    return;
  }

  const targetField = getRecordQuotaField(slotVal);
  const nowTs = Date.now();
  const existing = teachingRecords.find(record => record.date === dateVal && normalizeTeachingSlot(record.slot) === normalizeTeachingSlot(slotVal));
  const previousRecord = editingId ? teachingRecords.find(record => record.id === editingId) : null;
  if ((editingId && !previousRecord) || (existing && existing.id !== editingId)) {
    showToast('รอบนี้มีบันทึกอยู่แล้ว เปิดรายการเดิมเพื่อแก้ไข');
    return;
  }

  const studentById = new Map(students.map(student => [String(student.id), student]));
  const attending = [];
  const leave = [];
  for (const row of document.querySelectorAll('.record-student-row')) {
    const student = studentById.get(row.dataset.studentId);
    if (!student) continue;
    const entry = { id: student.id, name: student.name };
    if (row.dataset.status === 'attending') attending.push(entry);
    else if (row.dataset.status === 'leave') leave.push(entry);
  }

  const savedRecord = {
    id: previousRecord?.id || ('rec_' + dateVal.replace(/-/g, '') + '_' + nowTs.toString(36)),
    createdAt: previousRecord?.createdAt || nowTs,
    date: dateVal,
    slot: slotVal,
    coach: coachVal,
    topic: topicVal,
    attendingCount: attending.length,
    leaveCount: leave.length,
    attendingStudents: attending,
    leaveStudents: leave,
    updatedAt: nowTs
  };
  for (const change of getRecordQuotaChanges(previousRecord, savedRecord)) {
    const student = studentById.get(change.studentId);
    if (!student) continue;
    const field = change.course === 'saturday' ? 'saturdayRemaining' : 'remaining';
    student[field] = (Number(student[field]) || 0) + change.delta;
    student._updatedAt = nowTs;
    student._lastCoachActionAt = nowTs;
    student._isCoachAuthoritative = true;
    syncSharedSiblingQuota(student, change.course);
  }

  if (previousRecord) teachingRecords = teachingRecords.map(record => record.id === previousRecord.id ? savedRecord : record);
  else teachingRecords.unshift(savedRecord);
  const nowTimeStr = new Date(nowTs).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' }) + ' น.';
  updateRecordedAttendance(previousRecord, savedRecord, nowTimeStr);

  if (sendPush) {
    attending.forEach((a, i) => {
      const st = students.find(s => s.id === a.id);
      const remAfter = st ? (targetField === 'saturday' ? st.saturdayRemaining : st.remaining) : 0;
      setTimeout(() => {
        notifyAttendanceCheckIn(a.name, coachVal, nowTimeStr, remAfter, a.id);
      }, i * 200);
    });

    leave.forEach((l, i) => {
      setTimeout(() => {
        if (typeof notifyAttendanceLeave === 'function') {
          notifyAttendanceLeave(l.name, coachVal, nowTimeStr, l.id);
        }
      }, (attending.length + i) * 200);
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

  showToast(`บันทึกแล้ว · มาเรียน ${attending.length} คน · ลา ${leave.length} คน`);
}

function deleteTeachingRecord(recordId) {
  if (!isCoachAuth) return;
  const rec = teachingRecords.find(r => r.id === recordId);
  if (!rec) return;

  const count = (rec.attendingStudents || []).length;
  if (!confirm(`คุณต้องการลบ Record การสอนวันที่ "${rec.date}" (${rec.slot}) ใช่หรือไม่?\n\n* ระบบจะคืนสิทธิ์ (+1 ครั้ง) ให้กับนักเรียนที่มาเรียนในรอบนี้ทั้งหมด ${count} คนอัตโนมัติ`)) {
    return;
  }

  const nowTs = Date.now();
  for (const change of getRecordQuotaChanges(rec, null)) {
    const student = students.find(item => String(item.id) === change.studentId);
    if (!student) continue;
    const field = change.course === 'saturday' ? 'saturdayRemaining' : 'remaining';
    student[field] = (Number(student[field]) || 0) + change.delta;
    student._updatedAt = nowTs;
    student._lastCoachActionAt = nowTs;
    student._isCoachAuthoritative = true;
    syncSharedSiblingQuota(student, change.course);
  }

  teachingRecords = teachingRecords.filter(r => r.id !== recordId);
  updateRecordedAttendance(rec, null);
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
      notifyAttendanceCheckIn(a.name, rec.coach || 'โค้ชโอ๊ต', '17:00 น.', rem, a.id);
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
