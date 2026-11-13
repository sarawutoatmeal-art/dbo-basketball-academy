// ========================================================
// DBO Basketball Academy - Court Rental & Monthly Expense Module
// (Court Rate Calculation, Monthly Statement for School, Google Calendar Integration)
// ========================================================

const COURT_RATE_PER_HOUR = 500; // 500 THB/hr
const THAI_MONTHS_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];
const THAI_DAYS_NAMES = [
  'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
];

let courtSelectedYear = 2026;
let courtSelectedMonth = 11; // 1-12 (Default: พฤศจิกายน 2569)
let activeEditCourtDateKey = '';

// Convert Baht number to Thai Baht text (เช่น "หนึ่งหมื่นห้าพันสองร้อยห้าสิบบาทถ้วน")
function thaiBahtText(num) {
  if (num === 0 || isNaN(num)) return 'ศูนย์บาทถ้วน';
  const digits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  let str = Math.floor(Math.abs(num)).toString();
  let result = '';
  let len = str.length;

  for (let i = 0; i < len; i++) {
    let digit = parseInt(str.charAt(i), 10);
    let pos = len - i - 1;
    if (digit !== 0) {
      if (pos === 0 && digit === 1 && len > 1) {
        result += 'เอ็ด';
      } else if (pos === 1 && digit === 2) {
        result += 'ยี่สิบ';
      } else if (pos === 1 && digit === 1) {
        result += 'สิบ';
      } else {
        result += digits[digit] + units[pos];
      }
    }
  }
  return result + 'บาทถ้วน';
}

// Generate data for a specific month
function getCourtMonthData(year, month) {
  const totalDays = new Date(year, month, 0).getDate();
  const list = [];
  let totalActiveDays = 0;
  let totalCanceledDays = 0;
  let totalHours = 0;
  let grandTotal = 0;

  for (let d = 1; d <= totalDays; d++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayName = THAI_DAYS_NAMES[dayOfWeek];

    const isWeekdayClass = (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4); // จ., อ., พฤ.
    const isSaturdayClass = (dayOfWeek === 6); // ส.
    const isRegularScheduled = isWeekdayClass || isSaturdayClass;

    const override = (typeof calendarDayOverrides !== 'undefined' && calendarDayOverrides[dateKey]) 
      ? calendarDayOverrides[dateKey] 
      : null;

    let isIncluded = isRegularScheduled || (override && override.isCustom);
    if (!isIncluded && !override) continue;

    let type = isSaturdayClass ? 'saturday' : (isWeekdayClass ? 'regular' : 'custom');
    let title = isSaturdayClass 
      ? 'คลาสวันเสาร์ DBO (1.5 ชม.)' 
      : (isWeekdayClass ? 'คลาสปกติ DBO (2 ชม.)' : 'คลาสพิเศษ / ไพรเวท');
    let defaultHours = isSaturdayClass ? 1.5 : (isWeekdayClass ? 2.0 : 1.0);
    let time = isSaturdayClass ? '16:00 - 17:30 น.' : (isWeekdayClass ? '17:30 - 19:30 น.' : '17:00 - 18:00 น.');
    let hours = defaultHours;
    let rate = COURT_RATE_PER_HOUR;
    let status = 'normal';
    let reason = '';
    let updatedBy = '';

    if (override) {
      if (override.status === 'canceled') {
        status = 'canceled';
        hours = 0;
        title = 'งดคลาส';
        reason = override.reason || 'งดคลาสฝึกซ้อม';
      } else if (override.status === 'private') {
        status = 'private';
        hours = parseFloat(override.hours !== undefined ? override.hours : defaultHours);
        title = override.title || 'คลาสไพรเวท DBO';
        time = override.time || time;
        reason = override.reason || '';
      } else if (override.status === 'normal' || override.status === 'custom') {
        status = 'normal';
        hours = parseFloat(override.hours !== undefined ? override.hours : defaultHours);
        if (override.title) title = override.title;
        if (override.time) time = override.time;
        reason = override.reason || '';
      }
      updatedBy = override.updatedBy || '';
    }

    const amount = (status === 'canceled') ? 0 : Math.round(hours * rate);

    if (status === 'canceled') {
      totalCanceledDays++;
    } else {
      totalActiveDays++;
      totalHours += hours;
      grandTotal += amount;
    }

    list.push({
      dateKey,
      day: d,
      dayOfWeek,
      dayName,
      title,
      type,
      time,
      hours,
      rate,
      amount,
      status,
      reason,
      updatedBy,
      hasOverride: !!override
    });
  }

  return {
    year,
    month,
    monthName: THAI_MONTHS_NAMES[month - 1],
    thaiYear: year + 543,
    list,
    totalActiveDays,
    totalCanceledDays,
    totalHours,
    grandTotal,
    grandTotalWords: thaiBahtText(grandTotal)
  };
}

// Render the Court Expense Statement View
function renderCourtExpenseStatement() {
  const selectEl = document.getElementById('courtMonthSelect');
  if (selectEl) {
    populateCourtMonthSelect(selectEl);
  }

  const data = getCourtMonthData(courtSelectedYear, courtSelectedMonth);

  // Update KPIs
  const kpiActive = document.getElementById('kpiCourtActiveDays');
  const kpiCanceled = document.getElementById('kpiCourtCanceledDays');
  const kpiHours = document.getElementById('kpiCourtTotalHours');
  const kpiTotal = document.getElementById('kpiCourtGrandTotal');
  const kpiWords = document.getElementById('kpiCourtGrandTotalWords');
  const titleEl = document.getElementById('courtTableTitle');
  const footHours = document.getElementById('courtFootHours');
  const footTotal = document.getElementById('courtFootTotal');

  if (kpiActive) kpiActive.innerText = data.totalActiveDays;
  if (kpiCanceled) kpiCanceled.innerText = `งดคลาส ${data.totalCanceledDays} วัน (0 บ.)`;
  if (kpiHours) kpiHours.innerText = data.totalHours.toFixed(1);
  if (kpiTotal) kpiTotal.innerText = data.grandTotal.toLocaleString('th-TH');
  if (kpiWords) kpiWords.innerText = `(${data.grandTotalWords})`;
  if (titleEl) titleEl.innerText = `ตารางรายการใช้สนามประจำเดือน ${data.monthName} ${data.thaiYear}`;
  if (footHours) footHours.innerText = `${data.totalHours.toFixed(1)} ชม.`;
  if (footTotal) footTotal.innerText = `฿ ${data.grandTotal.toLocaleString('th-TH')}`;

  // Populate Table
  const tbody = document.getElementById('courtBreakdownTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (data.list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="p-6 text-center text-xs text-slate-400 bg-slate-50">
          ไม่มีรายการใช้สนามในเดือนนี้
        </td>
      </tr>
    `;
    return;
  }

  data.list.forEach((item, index) => {
    const tr = document.createElement('tr');
    const isCanceled = (item.status === 'canceled');
    const isPrivate = (item.status === 'private');

    if (isCanceled) {
      tr.className = "bg-rose-50/40 hover:bg-rose-50/70 transition border-b border-rose-100 text-rose-900";
    } else if (isPrivate) {
      tr.className = "bg-purple-50/40 hover:bg-purple-50/70 transition border-b border-purple-100";
    } else {
      tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
    }

    let statusBadge = '';
    if (isCanceled) {
      statusBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">❌ งดคลาส (0 บ.)</span>`;
    } else if (isPrivate) {
      statusBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">🟣 ไพรเวท</span>`;
    } else {
      statusBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">🟢 ใช้งานปกติ</span>`;
    }

    const dObj = new Date(courtSelectedYear, courtSelectedMonth - 1, item.day);
    const formattedDate = `${item.dayName}ที่ ${item.day} ${data.monthName}`;

    tr.innerHTML = `
      <td class="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">${index + 1}</td>
      <td class="py-2.5 px-3 font-semibold ${isCanceled ? 'line-through text-slate-400' : 'text-slate-900'}">
        ${formattedDate}
      </td>
      <td class="py-2.5 px-3 min-w-0">
        <span class="font-bold ${isCanceled ? 'line-through text-slate-400' : 'text-slate-800'} block truncate">${item.title}</span>
        <span class="text-[10px] text-slate-500 font-mono block">${item.time}${item.reason ? ` • <span class="text-rose-600 font-sans">${item.reason}</span>` : ''}</span>
      </td>
      <td class="py-2.5 px-3 text-center font-mono font-bold ${isCanceled ? 'text-slate-400 line-through' : 'text-indigo-700'}">
        ${item.hours.toFixed(1)}
      </td>
      <td class="py-2.5 px-3 text-right font-mono text-slate-500">
        ${isCanceled ? '-' : '500 บ.'}
      </td>
      <td class="py-2.5 px-3 text-right font-mono font-extrabold ${isCanceled ? 'text-slate-400 line-through' : 'text-emerald-700'}">
        ${isCanceled ? '0 บ.' : `฿ ${item.amount.toLocaleString('th-TH')}`}
      </td>
      <td class="py-2.5 px-3 text-center">${statusBadge}</td>
      <td class="py-2.5 px-3 text-right">
        <button type="button" onclick="openEditCourtDayModal('${item.dateKey}')" class="btn-touch px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs inline-flex items-center gap-1 transition cursor-pointer">
          <i data-lucide="edit-3" class="w-3 h-3 text-slate-500"></i>
          <span>ปรับแก้</span>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Populate the month dropdown
function populateCourtMonthSelect(selectEl) {
  const currentVal = `${courtSelectedYear}-${String(courtSelectedMonth).padStart(2, '0')}`;
  selectEl.innerHTML = '';

  // Generate range: Oct 2026 to Dec 2027
  const months = [];
  for (let m = 10; m <= 12; m++) months.push({ y: 2026, m });
  for (let m = 1; m <= 12; m++) months.push({ y: 2027, m });

  months.forEach(item => {
    const optVal = `${item.y}-${String(item.m).padStart(2, '0')}`;
    const opt = document.createElement('option');
    opt.value = optVal;
    opt.innerText = `${THAI_MONTHS_NAMES[item.m - 1]} ${item.y + 543}`;
    if (optVal === currentVal) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

function changeCourtMonth(val) {
  if (!val) return;
  const parts = val.split('-');
  courtSelectedYear = parseInt(parts[0], 10);
  courtSelectedMonth = parseInt(parts[1], 10);
  renderCourtExpenseStatement();
}

function stepCourtMonth(offset) {
  let m = courtSelectedMonth + offset;
  let y = courtSelectedYear;
  if (m < 1) { m = 12; y--; }
  else if (m > 12) { m = 1; y++; }
  courtSelectedYear = y;
  courtSelectedMonth = m;
  renderCourtExpenseStatement();
}

function jumpToCurrentCourtMonth() {
  const now = new Date();
  courtSelectedYear = now.getFullYear();
  courtSelectedMonth = now.getMonth() + 1;
  // Default to 2026 if system clock is 2026
  renderCourtExpenseStatement();
}

// Switch between Statement view and Google Calendar view
function setCalendarTabSubView(view) {
  const vStat = document.getElementById('subViewCourtStatement');
  const vGCal = document.getElementById('subViewGCal');
  const bStat = document.getElementById('btnSubViewStatement');
  const bGCal = document.getElementById('btnSubViewGCal');

  if (view === 'gcal') {
    if (vStat) vStat.classList.add('hidden');
    if (vGCal) vGCal.classList.remove('hidden');
    if (bGCal) {
      bGCal.className = 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white flex items-center gap-2 transition shadow-xs cursor-pointer';
    }
    if (bStat) {
      bStat.className = 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center gap-2 transition cursor-pointer';
    }
  } else {
    if (vGCal) vGCal.classList.add('hidden');
    if (vStat) vStat.classList.remove('hidden');
    if (bStat) {
      bStat.className = 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white flex items-center gap-2 transition shadow-xs cursor-pointer';
    }
    if (bGCal) {
      bGCal.className = 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center gap-2 transition cursor-pointer';
    }
    renderCourtExpenseStatement();
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ========================================================
// DAY EDIT MODAL (Normal, Canceled 0 THB, Private +500/hr)
// ========================================================
let currentCourtEditChoice = 'normal';

function openEditCourtDayModal(dateKey) {
  activeEditCourtDateKey = dateKey;
  const modal = document.getElementById('editCourtDayModal');
  if (!modal) return;

  const parts = dateKey.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  const dObj = new Date(y, m - 1, d);
  const dayName = THAI_DAYS_NAMES[dObj.getDay()];

  const titleEl = document.getElementById('editCourtModalDateTitle');
  if (titleEl) {
    titleEl.innerText = `${dayName}ที่ ${d} ${THAI_MONTHS_NAMES[m - 1]} ${y + 543}`;
  }

  const isSat = (dObj.getDay() === 6);
  const isWeekday = (dObj.getDay() === 1 || dObj.getDay() === 2 || dObj.getDay() === 4);
  const defaultHours = isSat ? 1.5 : (isWeekday ? 2.0 : 1.0);
  const defaultTime = isSat ? '16:00 - 17:30 น.' : (isWeekday ? '17:30 - 19:30 น.' : '17:00 - 18:00 น.');

  const override = (typeof calendarDayOverrides !== 'undefined' && calendarDayOverrides[dateKey]) 
    ? calendarDayOverrides[dateKey] 
    : null;

  const hoursInput = document.getElementById('editCourtHoursInput');
  const timeInput = document.getElementById('editCourtTimeInput');
  const reasonInput = document.getElementById('editCourtReasonInput');
  const titleInput = document.getElementById('editCourtTitleInput');

  if (override) {
    currentCourtEditChoice = override.status || 'normal';
    if (hoursInput) hoursInput.value = (override.hours !== undefined) ? override.hours : defaultHours;
    if (timeInput) timeInput.value = override.time || defaultTime;
    if (reasonInput) reasonInput.value = override.reason || '';
    if (titleInput) titleInput.value = override.title || '';
  } else {
    currentCourtEditChoice = 'normal';
    if (hoursInput) hoursInput.value = defaultHours;
    if (timeInput) timeInput.value = defaultTime;
    if (reasonInput) reasonInput.value = '';
    if (titleInput) titleInput.value = isSat ? 'คลาสวันเสาร์ DBO (1.5 ชม.)' : 'คลาสปกติ DBO (2 ชม.)';
  }

  setCourtModalChoice(currentCourtEditChoice);
  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setCourtModalChoice(choice) {
  currentCourtEditChoice = choice;
  const btnNorm = document.getElementById('btnCourtChoiceNormal');
  const btnCanc = document.getElementById('btnCourtChoiceCanceled');
  const btnPriv = document.getElementById('btnCourtChoicePrivate');
  const reasonBox = document.getElementById('courtModalReasonBox');
  const hoursBox = document.getElementById('courtModalHoursBox');
  const previewAmount = document.getElementById('courtModalPreviewAmount');

  if (btnNorm) btnNorm.className = (choice === 'normal') 
    ? 'py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 text-white flex items-center justify-center gap-1 shadow-xs border border-emerald-500'
    : 'py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center gap-1 border border-slate-200';

  if (btnCanc) btnCanc.className = (choice === 'canceled')
    ? 'py-2 px-3 rounded-xl text-xs font-bold bg-rose-600 text-white flex items-center justify-center gap-1 shadow-xs border border-rose-500'
    : 'py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center gap-1 border border-slate-200';

  if (btnPriv) btnPriv.className = (choice === 'private')
    ? 'py-2 px-3 rounded-xl text-xs font-bold bg-purple-600 text-white flex items-center justify-center gap-1 shadow-xs border border-purple-500'
    : 'py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center gap-1 border border-slate-200';

  if (reasonBox) {
    if (choice === 'canceled') reasonBox.classList.remove('hidden');
    else reasonBox.classList.add('hidden');
  }

  updateCourtModalPreviewCalculation();
}

function updateCourtModalPreviewCalculation() {
  const hoursInput = document.getElementById('editCourtHoursInput');
  const previewAmount = document.getElementById('courtModalPreviewAmount');
  if (!previewAmount) return;

  if (currentCourtEditChoice === 'canceled') {
    previewAmount.innerHTML = '<span class="text-rose-600 font-bold">0 บาท (งดคลาส ไม่คิดเงิน)</span>';
    return;
  }

  const h = hoursInput ? (parseFloat(hoursInput.value) || 0) : 2.0;
  const cost = Math.round(h * COURT_RATE_PER_HOUR);
  previewAmount.innerHTML = `<span class="text-emerald-700 font-extrabold font-mono">${cost.toLocaleString('th-TH')} บาท</span> <span class="text-[11px] text-slate-400 font-normal">(${h} ชม. x 500 บ.)</span>`;
}

function closeEditCourtDayModal() {
  const modal = document.getElementById('editCourtDayModal');
  if (modal) modal.classList.add('hidden');
  activeEditCourtDateKey = '';
}

function saveEditCourtDayModal() {
  if (!activeEditCourtDateKey) return;

  const hoursInput = document.getElementById('editCourtHoursInput');
  const timeInput = document.getElementById('editCourtTimeInput');
  const reasonInput = document.getElementById('editCourtReasonInput');
  const titleInput = document.getElementById('editCourtTitleInput');

  const hours = parseFloat(hoursInput ? hoursInput.value : 2.0) || 0;
  const time = (timeInput ? timeInput.value.trim() : '') || '17:30 - 19:30 น.';
  const reason = (reasonInput ? reasonInput.value.trim() : '');
  const title = (titleInput ? titleInput.value.trim() : '');
  const staffName = (typeof currentStaff !== 'undefined' && currentStaff) ? currentStaff.name : 'โค้ชโอ๊ต';

  if (!calendarDayOverrides) calendarDayOverrides = {};

  calendarDayOverrides[activeEditCourtDateKey] = {
    status: currentCourtEditChoice,
    hours: (currentCourtEditChoice === 'canceled') ? 0 : hours,
    ratePerHour: COURT_RATE_PER_HOUR,
    amount: (currentCourtEditChoice === 'canceled') ? 0 : Math.round(hours * COURT_RATE_PER_HOUR),
    time: time,
    title: title || (currentCourtEditChoice === 'canceled' ? 'งดคลาส' : (currentCourtEditChoice === 'private' ? 'คลาสไพรเวท DBO' : 'คลาสปกติ')),
    reason: reason,
    updatedBy: staffName,
    updatedAt: Date.now()
  };

  localStorage.setItem('dbo_calendar_overrides_v1', JSON.stringify(calendarDayOverrides));
  if (typeof saveState === 'function') {
    saveState(true, `ปรับปรุงสถานะสนามวันที่ ${activeEditCourtDateKey} (${currentCourtEditChoice === 'canceled' ? 'งดคลาส 0 บ.' : hours + ' ชม.'})`);
  }

  // Also broadcast live update
  if (typeof broadcastCoachClassStatus === 'function') {
    broadcastCoachClassStatus(activeEditCourtDateKey, currentCourtEditChoice, reason, time);
  }

  closeEditCourtDayModal();
  renderCourtExpenseStatement();
  if (typeof showToast === 'function') {
    showToast(`บันทึกข้อมูลสนามวันที่ ${activeEditCourtDateKey} เรียบร้อยแล้ว`);
  }
  if (typeof playNotificationChime === 'function') playNotificationChime();
}

function resetCourtDayToDefault(dateKey) {
  const dKey = dateKey || activeEditCourtDateKey;
  if (!dKey) return;
  if (calendarDayOverrides && calendarDayOverrides[dKey]) {
    delete calendarDayOverrides[dKey];
    localStorage.setItem('dbo_calendar_overrides_v1', JSON.stringify(calendarDayOverrides));
    if (typeof saveState === 'function') {
      saveState(true, `รีเซ็ตข้อมูลสนามวันที่ ${dKey} เป็นค่าเริ่มต้น`);
    }
  }
  closeEditCourtDayModal();
  renderCourtExpenseStatement();
  if (typeof showToast === 'function') showToast('รีเซ็ตข้อมูลสนามเป็นค่าเริ่มต้นเรียบร้อย');
}

// ========================================================
// ADD SPECIAL DAY / PRIVATE CLASS MODAL
// ========================================================
function openAddSpecialCourtDayModal() {
  const modal = document.getElementById('addSpecialCourtDayModal');
  if (!modal) return;

  const dateInput = document.getElementById('addSpecialDateInput');
  if (dateInput) {
    const today = new Date();
    const curYear = courtSelectedYear || today.getFullYear();
    const curMonth = String(courtSelectedMonth || (today.getMonth() + 1)).padStart(2, '0');
    dateInput.value = `${curYear}-${curMonth}-15`;
  }
  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeAddSpecialCourtDayModal() {
  const modal = document.getElementById('addSpecialCourtDayModal');
  if (modal) modal.classList.add('hidden');
}

function saveAddSpecialCourtDay() {
  const dateInput = document.getElementById('addSpecialDateInput');
  const titleInput = document.getElementById('addSpecialTitleInput');
  const hoursInput = document.getElementById('addSpecialHoursInput');
  const timeInput = document.getElementById('addSpecialTimeInput');
  const reasonInput = document.getElementById('addSpecialReasonInput');

  const dateKey = dateInput ? dateInput.value : '';
  if (!dateKey) {
    if (typeof showToast === 'function') showToast('กรุณาเลือกวันที่ก่อนครับ');
    return;
  }

  const title = (titleInput ? titleInput.value.trim() : '') || 'คลาสไพรเวท DBO';
  const hours = parseFloat(hoursInput ? hoursInput.value : 1.0) || 1.0;
  const time = (timeInput ? timeInput.value.trim() : '') || '17:00 - 18:00 น.';
  const reason = (reasonInput ? reasonInput.value.trim() : '');
  const staffName = (typeof currentStaff !== 'undefined' && currentStaff) ? currentStaff.name : 'โค้ชโอ๊ต';

  if (!calendarDayOverrides) calendarDayOverrides = {};

  calendarDayOverrides[dateKey] = {
    status: 'private',
    isCustom: true,
    hours: hours,
    ratePerHour: COURT_RATE_PER_HOUR,
    amount: Math.round(hours * COURT_RATE_PER_HOUR),
    time: time,
    title: title,
    reason: reason,
    updatedBy: staffName,
    updatedAt: Date.now()
  };

  localStorage.setItem('dbo_calendar_overrides_v1', JSON.stringify(calendarDayOverrides));
  if (typeof saveState === 'function') {
    saveState(true, `เพิ่มวันใช้งานสนามพิเศษวันที่ ${dateKey} (${hours} ชม.)`);
  }

  closeAddSpecialCourtDayModal();
  renderCourtExpenseStatement();
  if (typeof showToast === 'function') {
    showToast(`เพิ่มวันใช้สนามพิเศษวันที่ ${dateKey} สำเร็จ (${hours} ชม. = ${Math.round(hours * 500)} บ.)`);
  }
  if (typeof playNotificationChime === 'function') playNotificationChime();
}

// ========================================================
// PRINT FORMAL STATEMENT MODAL (A4 Attachment for School)
// ========================================================
function openPrintCourtStatementModal() {
  const modal = document.getElementById('printCourtStatementModal');
  if (!modal) return;

  const data = getCourtMonthData(courtSelectedYear, courtSelectedMonth);

  const printMonthLabel = document.getElementById('printDocMonthLabel');
  const printDocDate = document.getElementById('printDocCreatedDate');
  const printTableBody = document.getElementById('printDocTableBody');
  const printTotalDays = document.getElementById('printDocTotalDays');
  const printTotalHours = document.getElementById('printDocTotalHours');
  const printGrandTotal = document.getElementById('printDocGrandTotal');
  const printGrandTotalWords = document.getElementById('printDocGrandTotalWords');
  const printCoachSign = document.getElementById('printDocCoachSign');

  if (printMonthLabel) printMonthLabel.innerText = `${data.monthName} พ.ศ. ${data.thaiYear}`;
  if (printDocDate) {
    const now = new Date();
    printDocDate.innerText = `${now.getDate()} ${THAI_MONTHS_NAMES[now.getMonth()]} ${now.getFullYear() + 543}`;
  }
  if (printTotalDays) printTotalDays.innerText = `${data.totalActiveDays} วัน (งดคลาส ${data.totalCanceledDays} วัน)`;
  if (printTotalHours) printTotalHours.innerText = `${data.totalHours.toFixed(1)} ชั่วโมง`;
  if (printGrandTotal) printGrandTotal.innerText = `฿ ${data.grandTotal.toLocaleString('th-TH')}`;
  if (printGrandTotalWords) printGrandTotalWords.innerText = data.grandTotalWords;
  if (printCoachSign) {
    const staffName = (typeof currentStaff !== 'undefined' && currentStaff) ? currentStaff.fullName : 'โค้ช ศราวุฒิ (โค้ชโอ๊ต)';
    printCoachSign.innerText = staffName;
  }

  if (printTableBody) {
    printTableBody.innerHTML = '';
    data.list.forEach((item, index) => {
      const tr = document.createElement('tr');
      const isCanceled = (item.status === 'canceled');
      tr.className = "border-b border-slate-200 text-xs text-slate-800";
      tr.innerHTML = `
        <td class="py-2 px-2.5 text-center font-mono">${index + 1}</td>
        <td class="py-2 px-2.5 font-medium">${item.dayName}ที่ ${item.day} ${data.monthName}</td>
        <td class="py-2 px-2.5">
          <strong class="${isCanceled ? 'line-through text-slate-400' : 'text-slate-900'}">${item.title}</strong>
          <span class="block text-[11px] text-slate-500 font-mono">${item.time}${item.reason ? ` (${item.reason})` : ''}</span>
        </td>
        <td class="py-2 px-2.5 text-center font-mono ${isCanceled ? 'line-through text-slate-400' : ''}">${item.hours.toFixed(1)}</td>
        <td class="py-2 px-2.5 text-right font-mono">${isCanceled ? '-' : '500'}</td>
        <td class="py-2 px-2.5 text-right font-mono font-bold ${isCanceled ? 'line-through text-slate-400' : 'text-slate-900'}">
          ${isCanceled ? '0' : item.amount.toLocaleString('th-TH')}
        </td>
        <td class="py-2 px-2.5 text-center text-[11px]">
          ${isCanceled ? '<span class="text-rose-600 font-semibold">งดคลาส (0 บ.)</span>' : (item.status === 'private' ? '<span class="text-purple-700 font-semibold">ไพรเวท</span>' : '<span class="text-emerald-700 font-semibold">ปกติ</span>')}
        </td>
      `;
      printTableBody.appendChild(tr);
    });
  }

  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closePrintCourtStatementModal() {
  const modal = document.getElementById('printCourtStatementModal');
  if (modal) modal.classList.add('hidden');
}

function triggerPrintCourtDocument() {
  window.print();
}

// Copy Summary Text for Line / Email / School admin
function copyCourtSummaryText() {
  const data = getCourtMonthData(courtSelectedYear, courtSelectedMonth);
  let text = `🏀 สรุปค่าใช้จ่ายค่าเช่าสนาม DBO Basketball Academy\n`;
  text += `ประจำเดือน: ${data.monthName} ${data.thaiYear}\n`;
  text += `สถานที่: โรงยิมเนเซียม โรงเรียนเตชะวิทย์\n`;
  text += `อัตราค่าเช่าสนาม: 500 บาท / ชั่วโมง\n`;
  text += `-------------------------------------------\n`;
  text += `• วันที่ใช้สนามจริง: ${data.totalActiveDays} วัน\n`;
  if (data.totalCanceledDays > 0) {
    text += `• วันที่งดคลาส (ไม่คิดเงิน): ${data.totalCanceledDays} วัน\n`;
  }
  text += `• รวมเวลาใช้สนามทั้งหมด: ${data.totalHours.toFixed(1)} ชั่วโมง\n`;
  text += `• ยอดเงินรวมค่าเช่าสนามสุทธิ: ${data.grandTotal.toLocaleString('th-TH')} บาท\n`;
  text += `  (${data.grandTotalWords})\n`;
  text += `-------------------------------------------\n`;
  text += `รายละเอียดการใช้งาน:\n`;

  data.list.forEach((item, idx) => {
    if (item.status === 'canceled') {
      text += `${idx + 1}. ${item.dayName}ที่ ${item.day} ${data.monthName}: [งดคลาส] 0 บาท ${item.reason ? `(${item.reason})` : ''}\n`;
    } else {
      text += `${idx + 1}. ${item.dayName}ที่ ${item.day} ${data.monthName}: ${item.title} (${item.time}) = ${item.hours} ชม. x 500 บ. = ${item.amount.toLocaleString('th-TH')} บาท\n`;
    }
  });

  text += `\nผู้จัดทำ: DBO Basketball Academy (Start from 0 to No.1)\n`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') showToast('คัดลอกข้อความสรุปค่าเช่าสนามเรียบร้อยแล้ว');
    }).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  if (typeof showToast === 'function') showToast('คัดลอกข้อความสรุปค่าเช่าสนามเรียบร้อยแล้ว');
}

// Auto-initialize when calendar tab is switched or page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof renderCourtExpenseStatement === 'function') {
      renderCourtExpenseStatement();
    }
  }, 300);
});
