// ========================================================
// DBO Basketball Academy - Schedule & Calendar Module
// (Weekly Timetable, Master Monthly Calendar Grid, Day Schedule Modal)
// ========================================================

let currentCalendarMode = 'monthly';

function setCalendarMode(mode) {
  currentCalendarMode = mode;
  const wView = document.getElementById('calWeeklyView');
  const mView = document.getElementById('calMonthlyView');
  const btnW = document.getElementById('btnCalWeekly');
  const btnM = document.getElementById('btnCalMonthly');

  if (mode === 'weekly') {
    if (wView) wView.classList.remove('hidden');
    if (mView) mView.classList.add('hidden');
    if (btnW) btnW.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-white text-dbo-navy shadow-xs transition-all';
    if (btnM) btnM.className = 'px-3 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 transition-all';
    renderWeeklyScheduleView();
  } else {
    if (wView) wView.classList.add('hidden');
    if (mView) mView.classList.remove('hidden');
    if (btnM) btnM.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-white text-dbo-navy shadow-xs transition-all';
    if (btnW) btnW.className = 'px-3 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 transition-all';
    renderMasterCalendarGrid();
  }
  lucide.createIcons();
}

function renderMasterCalendar() {
  setCalendarMode(currentCalendarMode);
}

function renderWeeklyScheduleView() {
  const container = document.getElementById('weeklyScheduleCardsContainer');
  if (!container) return;
  const days = [
    { key: 'mon', dayName: 'วันจันทร์', time: '17:30 - 19:30 น.', color: 'amber', badge: 'คลาสปกติ 10 ครั้ง / รายเดือน' },
    { key: 'tue', dayName: 'วันอังคาร', time: '17:30 - 19:30 น.', color: 'amber', badge: 'คลาสปกติ 10 ครั้ง / รายเดือน' },
    { key: 'thu', dayName: 'วันพฤหัสบดี', time: '17:30 - 19:30 น.', color: 'amber', badge: 'คลาสปกติ 10 ครั้ง / รายเดือน' },
    { key: 'sat', dayName: 'วันเสาร์', time: '16:00 - 17:30 น.', color: 'indigo', badge: 'Basic Coach Oat (4 ครั้ง)' }
  ];

  container.innerHTML = days.map(d => {
    const item = (weeklySchedule && weeklySchedule[d.key]) || defaultWeeklySchedule[d.key];
    const isIndigo = d.color === 'indigo';
    const borderClass = isIndigo ? 'border-indigo-200 bg-indigo-50/40' : 'border-amber-200 bg-amber-50/40';
    const textClass = isIndigo ? 'text-indigo-950' : 'text-amber-950';
    const badgeClass = isIndigo ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-amber-100 text-amber-800 border-amber-200';
    const coachBadge = isIndigo ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white';

    return `
      <div class="card-clean p-4 sm:p-5 rounded-2xl border ${borderClass} space-y-3 shadow-2xs">
        <div class="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${isIndigo ? 'bg-indigo-600' : 'bg-amber-500'}"></span>
              <h4 class="text-sm sm:text-base font-bold ${textClass}">${d.dayName}</h4>
            </div>
            <p class="text-xs font-mono font-medium text-slate-500 mt-0.5">เวลา: ${d.time}</p>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}">${d.badge}</span>
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-semibold text-slate-500">โค้ชผู้สอน:</span>
            <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold ${coachBadge} shadow-2xs">${item.coaches}</span>
          </div>
          <div>
            <span class="text-xs font-semibold text-slate-500 block mb-1">หัวข้อฝึกซ้อมประจำวัน:</span>
            <p class="text-xs text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
              ${item.topic}
            </p>
          </div>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

function openEditScheduleModal() {
  const modal = document.getElementById('editScheduleModal');
  if (!modal) return;
  const mon = (weeklySchedule && weeklySchedule.mon) || defaultWeeklySchedule.mon;
  const tue = (weeklySchedule && weeklySchedule.tue) || defaultWeeklySchedule.tue;
  const thu = (weeklySchedule && weeklySchedule.thu) || defaultWeeklySchedule.thu;
  const sat = (weeklySchedule && weeklySchedule.sat) || defaultWeeklySchedule.sat;

  const cM = document.getElementById('schCoachMon');
  const tM = document.getElementById('schTopicMon');
  const cT = document.getElementById('schCoachTue');
  const tT = document.getElementById('schTopicTue');
  const cTh = document.getElementById('schCoachThu');
  const tTh = document.getElementById('schTopicThu');
  const cS = document.getElementById('schCoachSat');
  const tS = document.getElementById('schTopicSat');

  if (cM) cM.value = mon.coaches;
  if (tM) tM.value = mon.topic;
  if (cT) cT.value = tue.coaches;
  if (tT) tT.value = tue.topic;
  if (cTh) cTh.value = thu.coaches;
  if (tTh) tTh.value = thu.topic;
  if (cS) cS.value = sat.coaches;
  if (tS) tS.value = sat.topic;

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeEditScheduleModal() {
  const modal = document.getElementById('editScheduleModal');
  if (modal) modal.classList.add('hidden');
}

function saveWeeklyScheduleData() {
  weeklySchedule = {
    mon: {
      coaches: (document.getElementById('schCoachMon')?.value || '').trim() || defaultWeeklySchedule.mon.coaches,
      topic: (document.getElementById('schTopicMon')?.value || '').trim() || defaultWeeklySchedule.mon.topic
    },
    tue: {
      coaches: (document.getElementById('schCoachTue')?.value || '').trim() || defaultWeeklySchedule.tue.coaches,
      topic: (document.getElementById('schTopicTue')?.value || '').trim() || defaultWeeklySchedule.tue.topic
    },
    thu: {
      coaches: (document.getElementById('schCoachThu')?.value || '').trim() || defaultWeeklySchedule.thu.coaches,
      topic: (document.getElementById('schTopicThu')?.value || '').trim() || defaultWeeklySchedule.thu.topic
    },
    sat: {
      coaches: (document.getElementById('schCoachSat')?.value || '').trim() || defaultWeeklySchedule.sat.coaches,
      topic: (document.getElementById('schTopicSat')?.value || '').trim() || defaultWeeklySchedule.sat.topic
    }
  };

  saveState(true, 'แก้ไขตารางฝึกซ้อมและโค้ชผู้สอน');
  renderWeeklyScheduleView();
  closeEditScheduleModal();
  showToast('บันทึกตารางฝึกซ้อมและโค้ชประจำสัปดาห์สำเร็จ');
}

let currentCalModalDateKey = '';
let currentCalModalChoice = 'normal';
let [currentMasterCalYear, currentMasterCalMonth] = getTodayDateKey().split('-').map(Number);

function stepMasterCalendarMonth(step) {
  currentMasterCalMonth += step;
  if (currentMasterCalMonth > 12) {
    currentMasterCalMonth = 1;
    currentMasterCalYear += 1;
  } else if (currentMasterCalMonth < 1) {
    currentMasterCalMonth = 12;
    currentMasterCalYear -= 1;
  }
  renderMasterCalendarGrid();
}

function jumpToCurrentMasterCalendarMonth() {
  [currentMasterCalYear, currentMasterCalMonth] = getTodayDateKey().split('-').map(Number);
  renderMasterCalendarGrid();
}

async function syncGoogleCalendarData() {
  const icon = document.getElementById('iconSyncGCal');
  const btn = document.getElementById('btnSyncGCal');
  if (btn) btn.disabled = true;
  if (icon) icon.classList.add('animate-spin');

  try {
    if (typeof pullStateFromCloudApi === 'function') {
      await pullStateFromCloudApi();
    }
  } catch (err) {
    console.error('Error syncing Google Calendar state:', err);
  } finally {
    renderMasterCalendarGrid();
    if (typeof renderCourtExpenseStatement === 'function') renderCourtExpenseStatement();
    if (typeof showToast === 'function') showToast('🔄 ซิงค์ข้อมูลกับ Google Calendar เรียบร้อย');
    setTimeout(() => {
      const activeIcon = document.getElementById('iconSyncGCal');
      if (activeIcon) activeIcon.classList.remove('animate-spin');
      if (btn) btn.disabled = false;
    }, 600);
  }
}

function getTrainingDay(date) {
  const weekday = date.getDay();
  const dateKey = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  const override = calendarDayOverrides[dateKey];
  const isNormal = [1, 2, 4].includes(weekday) || override?.status === 'normal';
  const isSaturday = weekday === 6;
  const identity = { dateKey, weekday, isNormal, isSaturday };
  if (override?.status === 'canceled') return { ...identity, kind: 'canceled', title: 'งดคลาส' };
  if (override?.isCustom) return { ...identity, kind: 'special', title: override.title || override.topic || 'คลาสพิเศษ', time: override.time };
  if (isSaturday) return { ...identity, kind: 'saturday', title: 'คลาสวันเสาร์', time: '16:00–17:30 น.' };
  if (isNormal) return { ...identity, kind: 'regular', title: 'คลาสปกติ', time: override?.time || '17:30–19:30 น.' };
  return identity;
}

function renderNextTraining() {
  const card = document.getElementById('nextTrainingCard');
  if (!card) return;
  const today = new Date(getTodayDateKey() + 'T12:00:00');
  for (let offset = 1; offset <= 31; offset++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const session = getTrainingDay(date);
    if (!session.kind || session.kind === 'canceled') continue;

    document.getElementById('nextTrainingDay').textContent = date.getDate();
    document.getElementById('nextTrainingMonth').textContent = new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(date);
    document.getElementById('nextTrainingTitle').textContent = session.title;
    document.getElementById('nextTrainingTime').textContent = session.time || '';
    const dateLabel = new Intl.DateTimeFormat('th-TH', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
    card.setAttribute('aria-label', ['รอบซ้อมถัดไป', dateLabel, session.title, session.time].filter(Boolean).join(' · '));
    card.onclick = () => openCalendarDayModal(date.getDate(), session.weekday, session.isSaturday, session.isNormal, session.dateKey, true);
    card.classList.remove('hidden');
    return;
  }
  card.classList.add('hidden');
}

function renderTrainingWeek() {
  const week = document.getElementById('trainingWeek');
  if (!week) return;
  const today = new Date(getTodayDateKey() + 'T12:00:00');
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (today.getDay() + 6) % 7);
  const weekdays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const dateLabel = new Intl.DateTimeFormat('th-TH', { dateStyle: 'full' });
  week.replaceChildren();
  for (let offset = 0; offset < 7; offset++) {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset);
    const session = getTrainingDay(date);
    const control = document.createElement('button');
    control.type = 'button';
    control.setAttribute('aria-label', [dateLabel.format(date), session.title, session.time].filter(Boolean).join(' · '));
    if (session.kind) control.dataset.classStatus = session.kind;
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) control.setAttribute('aria-current', 'date');

    const weekday = document.createElement('span');
    weekday.textContent = weekdays[session.weekday];
    const number = document.createElement('strong');
    number.textContent = date.getDate();
    control.append(weekday, number);
    control.onclick = () => openCalendarDayModal(date.getDate(), session.weekday, session.isSaturday, session.isNormal, session.dateKey, session.dateKey >= getTodayDateKey());
    week.appendChild(control);
  }
}

function renderMasterCalendarGrid() {
  const grid = document.getElementById('masterCalendarGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const labelEl = document.getElementById('calCurrentMonthLabel');
  const monthNames = (typeof THAI_MONTHS_NAMES !== 'undefined') ? THAI_MONTHS_NAMES : [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  if (labelEl) {
    labelEl.innerText = `${monthNames[currentMasterCalMonth - 1]} ${currentMasterCalYear + 543}`;
  }

  const totalDays = new Date(currentMasterCalYear, currentMasterCalMonth, 0).getDate();
  const firstDayDateObj = new Date(currentMasterCalYear, currentMasterCalMonth - 1, 1);
  const startDayOfWeek = firstDayDateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Check today's date
  const todayKey = getTodayDateKey();

  const slots = Math.ceil((startDayOfWeek + totalDays) / 7) * 7;
  for (let slot = 0; slot < slots; slot++) {
    const day = slot + 1 - startDayOfWeek;
    if (day < 1 || day > totalDays) {
      const neighbor = document.createElement('div');
      neighbor.className = 'calendar-date-placeholder';
      neighbor.setAttribute('aria-hidden', 'true');
      neighbor.textContent = new Date(currentMasterCalYear, currentMasterCalMonth - 1, day).getDate();
      grid.appendChild(neighbor);
      continue;
    }
    const date = new Date(currentMasterCalYear, currentMasterCalMonth - 1, day);
    const session = getTrainingDay(date);
    const isToday = session.dateKey === todayKey;

    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'calendar-date';
    if (isToday) cell.setAttribute('aria-current', 'date');
    cell.setAttribute('aria-label', [session.dateKey, session.title, session.time].filter(Boolean).join(' · '));
    cell.title = session.title;
    const dateNumber = document.createElement('span');
    dateNumber.className = 'calendar-date-number';
    dateNumber.textContent = day;
    cell.appendChild(dateNumber);
    if (session.kind) {
      const dot = document.createElement('span');
      dot.className = 'calendar-date-dot';
      dot.dataset.classStatus = session.kind;
      dot.setAttribute('aria-hidden', 'true');
      cell.appendChild(dot);
    }

    cell.onclick = () => {
      openCalendarDayModal(day, session.weekday, session.isSaturday, session.isNormal, session.dateKey);
    };

    grid.appendChild(cell);
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openCalendarDayModal(day, dayOfWeek, isSat, isNormal, dateKey, showAttendanceActions = true) {
  const modal = document.getElementById('calendarDayModal');
  if (!modal) return;
  const dKey = dateKey || `${currentMasterCalYear}-${String(currentMasterCalMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  currentCalModalDateKey = dKey;

  const dot = document.getElementById('calModalDayDot');
  const title = document.getElementById('calModalTitle');
  const time = document.getElementById('calModalTime');
  const coach = document.getElementById('calModalCoach');
  const topic = document.getElementById('calModalTopic');
  const cancelAlert = document.getElementById('calModalCancelAlert');
  const cancelReasonText = document.getElementById('calModalCancelReasonText');
  const coachPanel = document.getElementById('calModalCoachPanel');
  const parentActionBox = document.getElementById('calModalParentActionBox');
  const reasonInput = document.getElementById('calModalReasonInput');

  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const dayName = dayNames[dayOfWeek] || '';
  const monthNames = (typeof THAI_MONTHS_NAMES !== 'undefined') ? THAI_MONTHS_NAMES : [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const parts = dKey.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  title.innerText = `วัน${dayName}ที่ ${d} ${monthNames[m - 1]} ${y + 543}`;

  const override = (typeof calendarDayOverrides !== 'undefined' && calendarDayOverrides[dKey]) ? calendarDayOverrides[dKey] : null;
  const isCanceled = (override && override.status === 'canceled');

  const safeEscape = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  };

  if (isCanceled) {
    if (dot) dot.className = 'w-3 h-3 rounded-full bg-rose-500';
    if (cancelAlert) {
      cancelAlert.classList.remove('hidden');
      if (cancelReasonText) cancelReasonText.innerText = override.reason ? `เหตุผล: ${override.reason}` : 'ทางอคาเดมี่ของดการฝึกซ้อมในวันนี้ ขอบคุณครับ';
    }
    if (time) time.innerText = 'งดการฝึกซ้อมประจำวัน';
    if (coach) coach.innerText = `แจ้งโดย ${override.updatedBy || 'ทีมโค้ช'}`;
    if (topic) topic.innerHTML = `<span class="text-rose-700 font-bold">งดคลาส:</span> ${safeEscape(override.reason || 'พักฟื้นร่างกายหรือติดภารกิจ')}`;
    if (parentActionBox) parentActionBox.classList.add('hidden');
  } else {
    if (cancelAlert) cancelAlert.classList.add('hidden');
    if (parentActionBox) parentActionBox.classList.toggle('hidden', !showAttendanceActions || dKey < getTodayDateKey());

    if (override?.isCustom) {
      if (dot) dot.className = 'w-3 h-3 rounded-full bg-purple-600';
      if (time) time.innerText = override.time || 'ตามนัด';
      if (coach) coach.innerText = override.updatedBy || 'ทีมโค้ช';
      if (topic) topic.innerText = override.title || override.topic || 'คลาสพิเศษ';
    } else if (isSat) {
      if (dot) dot.className = 'w-3 h-3 rounded-full bg-indigo-600';
      if (time) time.innerText = '16:00 - 17:30 น. (คลาสวันเสาร์)';
      if (coach) coach.innerText = 'โค้ชโอ๊ต (Head Coach)';
      if (topic) topic.innerHTML = '<strong>พื้นฐานกับโค้ชโอ๊ต</strong> · ฝึกความคล่องตัว การประสานงาน และกล้ามเนื้อมัดเล็ก';
    } else if (isNormal || (override && override.status === 'normal')) {
      if (dot) dot.className = 'w-3 h-3 rounded-full bg-amber-500';
      if (time) time.innerText = override?.time || '17:30 - 19:30 น. (คลาสปกติ)';
      if (dayOfWeek === 1) {
        if (coach) coach.innerText = 'โค้ชโอ๊ต & โค้ชโอ๊ค';
        if (topic) topic.innerHTML = '<strong>เลี้ยงบอลพื้นฐาน</strong> · ทรงตัว เลี้ยงสองมือ เปลี่ยนทิศ และฝึกฟุตเวิร์ก';
      } else if (dayOfWeek === 2) {
        if (coach) coach.innerText = 'โค้ชโอ๊ค & โค้ชโอ๊ต';
        if (topic) topic.innerHTML = '<strong>จ่ายบอลและอ่านเกม</strong> · เว้นระยะ เจาะแล้วจ่าย ฟุตเวิร์กเกมรับ และเล่น 2 ต่อ 1 / 3 ต่อ 2';
      } else {
        if (coach) coach.innerText = 'โค้ชโอ๊ต & โค้ชโอ๊ค';
        if (topic) topic.innerHTML = '<strong>ชู้ตและจบสกอร์</strong> · ฟอร์มยิง เลย์อัพ รับแรงกดดัน และเล่น 3 ต่อ 3';
      }
    } else {
      if (dot) dot.className = 'w-3 h-3 rounded-full bg-slate-300';
      if (time) time.innerText = 'ไม่มีรอบฝึกซ้อมประจำวัน';
      if (coach) coach.innerText = 'พักการฝึกซ้อม หรือจอง Private Class';
      if (topic) topic.innerHTML = 'วันนี้ไม่มีคลาส';
    }
  }

  // Coach Controls Setup
  const isCoach = (typeof isCoachAuth !== 'undefined' && isCoachAuth) || (typeof currentStaff !== 'undefined' && currentStaff);
  if (coachPanel) {
    if (isCoach) {
      coachPanel.classList.remove('hidden');
      const initialChoice = isCanceled ? 'canceled' : 'normal';
      if (reasonInput) reasonInput.value = (override && override.reason) || '';
      setCalModalStatusChoice(initialChoice);
    } else {
      coachPanel.classList.add('hidden');
    }
  }

  modal.classList.remove('hidden');
  if (modal.firstElementChild) modal.firstElementChild.scrollTop = 0;
  lucide.createIcons();
}

function setCalModalStatusChoice(choice) {
  currentCalModalChoice = choice;
  const btnNormal = document.getElementById('btnCalSetNormal');
  const btnCanceled = document.getElementById('btnCalSetCanceled');
  const reasonBox = document.getElementById('calModalReasonBox');
  const isCanceled = choice === 'canceled';
  btnNormal?.setAttribute('aria-pressed', String(!isCanceled));
  btnCanceled?.setAttribute('aria-pressed', String(isCanceled));
  reasonBox?.classList.toggle('hidden', !isCanceled);
}

function saveCalModalClassOverride() {
  if (!currentCalModalDateKey) return;
  const reasonInput = document.getElementById('calModalReasonInput');
  const reason = reasonInput ? reasonInput.value.trim() : '';
  const status = currentCalModalChoice || 'normal';
  const staffName = (typeof currentStaff !== 'undefined' && currentStaff) ? currentStaff.name : 'ทีมโค้ช';

  if (!calendarDayOverrides) calendarDayOverrides = {};
  calendarDayOverrides[currentCalModalDateKey] = {
    status,
    reason: status === 'canceled' ? reason : '',
    time: status === 'canceled' ? '' : 'ปกติ',
    updatedBy: staffName,
    updatedAt: Date.now()
  };

  localStorage.setItem('dbo_calendar_overrides_v1', JSON.stringify(calendarDayOverrides));

  // Broadcast to Cloud API & MQTT & BC
  const actionText = status === 'canceled' ? `โค้ช${staffName} สั่งงดคลาสวันที่ ${currentCalModalDateKey}` : `โค้ช${staffName} ยืนยันมีคลาสตามปกติวันที่ ${currentCalModalDateKey}`;
  if (typeof saveState === 'function') {
    saveState(true, actionText);
  }
  if (typeof broadcastCoachClassStatus === 'function') {
    broadcastCoachClassStatus(currentCalModalDateKey, status, reason);
  }

  showToast(`บันทึกสถานะคลาสวันที่ ${currentCalModalDateKey} เรียบร้อย (${status === 'canceled' ? 'งดคลาส' : 'มีคลาสปกติ'})`);
  renderMasterCalendarGrid();
  if (typeof renderCourtExpenseStatement === 'function') renderCourtExpenseStatement();
  if (typeof renderParentView === 'function') renderParentView();
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
  closeCalendarDayModal();
}

function closeCalendarDayModal() {
  const modal = document.getElementById('calendarDayModal');
  if (modal) modal.classList.add('hidden');
}
