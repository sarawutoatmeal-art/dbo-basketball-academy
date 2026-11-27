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
  renderWeeklyScheduleView();
}

function getDefaultDayCurriculum(dayOfWeek) {
  const ws = (typeof weeklySchedule !== 'undefined' && weeklySchedule) ? weeklySchedule : {};
  const def = (typeof defaultWeeklySchedule !== 'undefined' && defaultWeeklySchedule) ? defaultWeeklySchedule : {
    mon: { coaches: 'โค้ชโอ๊ต & โค้ชโอ๊ค', topic: 'Fundamental Dribbling & Ball Handling (ทักษะการเลี้ยงบอล การทรงตัว และ Footwork)' },
    tue: { coaches: 'โค้ชโอ๊ค & โค้ชโอ๊ต', topic: 'Passing Vision, Defense & Basketball IQ (การส่งบอล การอ่านเกมรับ และ 2v1 / 3v2)' },
    thu: { coaches: 'โค้ชโอ๊ต & โค้ชโอ๊ค', topic: 'Shooting Mechanics & Team Game Simulation (จัดระเบียบฟอร์มยิงและทีมเวิร์ค 3v3 / 5v5)' },
    sat: { coaches: 'โค้ชโอ๊ต (Head Coach)', topic: 'Basic Coach Oat — พื้นฐานความคล่องตัว การประสานงานร่างกาย และทักษะเฉพาะตัว' }
  };
  if (dayOfWeek === 1) return ws.mon || def.mon;
  if (dayOfWeek === 2) return ws.tue || def.tue;
  if (dayOfWeek === 4) return ws.thu || def.thu;
  if (dayOfWeek === 6) return ws.sat || def.sat;
  return { coaches: 'โค้ชโอ๊ต & โค้ชโอ๊ค', topic: 'ฝึกซ้อมทักษะบาสเกตบอลและทีมเวิร์ค DBO' };
}

function getDayCurriculumDetails(dateKey, dayOfWeek) {
  const override = (typeof calendarDayOverrides !== 'undefined' && calendarDayOverrides && calendarDayOverrides[dateKey])
    ? calendarDayOverrides[dateKey]
    : null;
  const base = getDefaultDayCurriculum(dayOfWeek);
  const topic = (override && override.topic && override.topic.trim())
    ? override.topic.trim()
    : ((override && override.title && override.isCustom) ? override.title.trim() : (base ? base.topic : ''));
  const coaches = (override && override.coaches && override.coaches.trim())
    ? override.coaches.trim()
    : (base ? base.coaches : 'โค้ชโอ๊ต & โค้ชโอ๊ค');
  return {
    topic,
    coaches,
    hasDailyCustomTopic: Boolean(override && override.topic && override.topic.trim())
  };
}

function getNextTrainingSessionDetails() {
  const todayStr = (typeof getTodayDateKey === 'function') ? getTodayDateKey() : new Date().toISOString().slice(0, 10);
  const today = new Date(todayStr + 'T12:00:00');
  const dayNames = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  const monthShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  for (let offset = 0; offset <= 31; offset++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const session = getTrainingDay(date);
    if (!session.kind || session.kind === 'canceled') continue;
    const cur = getDayCurriculumDetails(session.dateKey, session.weekday);
    const prefix = offset === 0 ? 'วันนี้ · ' : offset === 1 ? 'พรุ่งนี้ · ' : '';
    return {
      dateKey: session.dateKey,
      weekday: session.weekday,
      dateLabel: `${prefix}${dayNames[session.weekday]}ที่ ${date.getDate()} ${monthShort[date.getMonth()]}`,
      time: session.time || (session.isSaturday ? '16:00 - 17:30 น.' : '17:30 - 19:30 น.'),
      title: session.title,
      topic: cur.topic,
      coaches: cur.coaches
    };
  }
  return null;
}

function buildWeeklyScheduleCardsHtml(allowCoachEditButton = true) {
  const isCoach = Boolean((typeof isCoachAuth !== 'undefined' && isCoachAuth) || (typeof currentStaff !== 'undefined' && currentStaff));
  const days = [
    { key: 'mon', dayName: 'วันจันทร์', time: '17:30 - 19:30 น.', color: 'amber', badge: 'คลาสปกติ 10 ครั้ง / รายเดือน' },
    { key: 'tue', dayName: 'วันอังคาร', time: '17:30 - 19:30 น.', color: 'amber', badge: 'คลาสปกติ 10 ครั้ง / รายเดือน' },
    { key: 'thu', dayName: 'วันพฤหัสบดี', time: '17:30 - 19:30 น.', color: 'amber', badge: 'คลาสปกติ 10 ครั้ง / รายเดือน' },
    { key: 'sat', dayName: 'วันเสาร์', time: '16:00 - 17:30 น.', color: 'indigo', badge: 'Basic Coach Oat (4 ครั้ง)' }
  ];

  const safeEsc = (str) => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);

  return days.map(d => {
    const item = (weeklySchedule && weeklySchedule[d.key]) || defaultWeeklySchedule[d.key];
    const isIndigo = d.color === 'indigo';
    const borderClass = isIndigo ? 'border-indigo-200 bg-indigo-50/40' : 'border-[#DEB95B] bg-[#FBF4DD]/40';
    const textClass = isIndigo ? 'text-indigo-950' : 'text-[#241044]';
    const badgeClass = isIndigo ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-[#FBF4DD] text-[#241044] border-[#DEB95B]';
    const coachBadge = isIndigo ? 'bg-indigo-600 text-white' : 'bg-[#241044] text-[#DEB95B]';

    return `
      <div class="card-clean p-4 sm:p-5 rounded-2xl border ${borderClass} space-y-3 shadow-2xs">
        <div class="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5 flex-wrap">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${isIndigo ? 'bg-indigo-600' : 'bg-[#DEB95B]'}"></span>
              <h4 class="text-sm sm:text-base font-extrabold ${textClass}">${d.dayName}</h4>
            </div>
            <p class="text-xs font-mono font-medium text-slate-500 mt-0.5">เวลา: ${d.time}</p>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}">${d.badge}</span>
            ${(isCoach && allowCoachEditButton) ? `<button type="button" onclick="openEditScheduleModal()" class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#241044] text-[#DEB95B] border border-[#DEB95B] hover:bg-[#38196B] cursor-pointer">✏️ แก้ไข</button>` : ''}
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-semibold text-slate-500">โค้ชผู้สอน:</span>
            <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold ${coachBadge} shadow-2xs">${safeEsc(item.coaches)}</span>
          </div>
          <div>
            <span class="text-xs font-semibold text-slate-500 block mb-1">เนื้อหาการสอน / หัวข้อฝึกซ้อม:</span>
            <p class="text-xs text-slate-800 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/80">
              ${safeEsc(item.topic)}
            </p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderWeeklyScheduleView() {
  const isCoach = Boolean((typeof isCoachAuth !== 'undefined' && isCoachAuth) || (typeof currentStaff !== 'undefined' && currentStaff));
  const editBtn = document.getElementById('btnEditWeeklySchedule');
  if (editBtn) {
    editBtn.classList.toggle('hidden', !isCoach);
  }

  const themeBox = document.getElementById('weeklyThemeDisplayBanner');
  if (themeBox) {
    const themeText = (weeklySchedule && weeklySchedule.weekTheme) ? weeklySchedule.weekTheme.trim() : '';
    if (themeText) {
      themeBox.classList.remove('hidden');
      const span = document.getElementById('weeklyThemeDisplayText');
      if (span) span.textContent = themeText;
    } else {
      themeBox.classList.add('hidden');
    }
  }

  const container = document.getElementById('weeklyScheduleCardsContainer');
  if (container) {
    container.innerHTML = buildWeeklyScheduleCardsHtml(true);
  }

  const parentList = document.getElementById('parentWeeklyCurriculumList');
  if (parentList) {
    parentList.innerHTML = buildWeeklyScheduleCardsHtml(false);
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openEditScheduleModal() {
  const modal = document.getElementById('editScheduleModal');
  if (!modal) return;
  const mon = (weeklySchedule && weeklySchedule.mon) || defaultWeeklySchedule.mon;
  const tue = (weeklySchedule && weeklySchedule.tue) || defaultWeeklySchedule.tue;
  const thu = (weeklySchedule && weeklySchedule.thu) || defaultWeeklySchedule.thu;
  const sat = (weeklySchedule && weeklySchedule.sat) || defaultWeeklySchedule.sat;

  const wTheme = document.getElementById('schWeekTheme');
  const cM = document.getElementById('schCoachMon');
  const tM = document.getElementById('schTopicMon');
  const cT = document.getElementById('schCoachTue');
  const tT = document.getElementById('schTopicTue');
  const cTh = document.getElementById('schCoachThu');
  const tTh = document.getElementById('schTopicThu');
  const cS = document.getElementById('schCoachSat');
  const tS = document.getElementById('schTopicSat');

  if (wTheme) wTheme.value = (weeklySchedule && weeklySchedule.weekTheme) || '';
  if (cM) cM.value = mon.coaches;
  if (tM) tM.value = mon.topic;
  if (cT) cT.value = tue.coaches;
  if (tT) tT.value = tue.topic;
  if (cTh) cTh.value = thu.coaches;
  if (tTh) tTh.value = thu.topic;
  if (cS) cS.value = sat.coaches;
  if (tS) tS.value = sat.topic;

  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeEditScheduleModal() {
  const modal = document.getElementById('editScheduleModal');
  if (modal) modal.classList.add('hidden');
}

function saveWeeklyScheduleData() {
  weeklySchedule = {
    weekTheme: (document.getElementById('schWeekTheme')?.value || '').trim(),
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

  localStorage.setItem('dbo_weekly_schedule_v16', JSON.stringify(weeklySchedule));
  if (typeof saveState === 'function') {
    saveState(true, 'แก้ไขเนื้อหาการสอนและโค้ชประจำสัปดาห์');
  }
  renderWeeklyScheduleView();
  if (typeof renderNextTraining === 'function') renderNextTraining();
  if (typeof renderParentView === 'function') renderParentView();
  closeEditScheduleModal();
  if (typeof showToast === 'function') showToast('บันทึกเนื้อหาการสอนประจำสัปดาห์สำเร็จ (ซิงค์ทุกเครื่องแล้ว)');
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
  const dayCurr = getDayCurriculumDetails(dKey, dayOfWeek);

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
      if (coach) coach.innerText = override.coaches || override.updatedBy || 'ทีมโค้ช';
      if (topic) topic.innerText = override.topic || override.title || 'คลาสพิเศษ';
    } else if (isSat) {
      if (dot) dot.className = 'w-3 h-3 rounded-full bg-indigo-600';
      if (time) time.innerText = '16:00 - 17:30 น. (คลาสวันเสาร์)';
      if (coach) coach.innerText = dayCurr.coaches || 'โค้ชโอ๊ต (Head Coach)';
      if (topic) topic.innerHTML = safeEscape(dayCurr.topic);
    } else if (isNormal || (override && override.status === 'normal')) {
      if (dot) dot.className = 'w-3 h-3 rounded-full bg-amber-500';
      if (time) time.innerText = (override?.time && override.time !== 'ปกติ') ? override.time : '17:30 - 19:30 น. (คลาสปกติ)';
      if (coach) coach.innerText = dayCurr.coaches || 'โค้ชโอ๊ต & โค้ชโอ๊ค';
      if (topic) topic.innerHTML = safeEscape(dayCurr.topic);
    } else {
      if (dot) dot.className = 'w-3 h-3 rounded-full bg-slate-300';
      if (time) time.innerText = 'ไม่มีรอบฝึกซ้อมประจำวัน';
      if (coach) coach.innerText = (override && override.coaches) ? override.coaches : 'พักการฝึกซ้อม หรือจอง Private Class';
      if (topic) topic.innerHTML = (override && override.topic) ? safeEscape(override.topic) : 'วันนี้ไม่มีคลาส (โค้ชสามารถเปิดคลาสและกำหนดเนื้อหาการสอนได้)';
    }
  }

  // Coach Controls Setup (Edit Daily Teaching Content + Class Status)
  const isCoach = (typeof isCoachAuth !== 'undefined' && isCoachAuth) || (typeof currentStaff !== 'undefined' && currentStaff);
  const topicInput = document.getElementById('calModalTopicInput');
  const coachInput = document.getElementById('calModalCoachInput');
  if (coachPanel) {
    if (isCoach) {
      coachPanel.classList.remove('hidden');
      const initialChoice = isCanceled ? 'canceled' : 'normal';
      if (reasonInput) reasonInput.value = (override && override.reason) || '';
      if (topicInput) topicInput.value = (override && override.topic) ? override.topic : (dayCurr.topic || '');
      if (coachInput) coachInput.value = (override && override.coaches) ? override.coaches : (dayCurr.coaches || 'โค้ชโอ๊ต & โค้ชโอ๊ค');
      setCalModalStatusChoice(initialChoice);
    } else {
      coachPanel.classList.add('hidden');
    }
  }

  modal.classList.remove('hidden');
  if (modal.firstElementChild) modal.firstElementChild.scrollTop = 0;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setCalModalStatusChoice(choice) {
  currentCalModalChoice = choice;
  const btnNormal = document.getElementById('btnCalSetNormal');
  const btnCanceled = document.getElementById('btnCalSetCanceled');
  const reasonBox = document.getElementById('calModalReasonBox');
  const curriculumBox = document.getElementById('calModalCurriculumEditBox');
  const isCanceled = choice === 'canceled';
  btnNormal?.setAttribute('aria-pressed', String(!isCanceled));
  btnCanceled?.setAttribute('aria-pressed', String(isCanceled));
  reasonBox?.classList.toggle('hidden', !isCanceled);
  curriculumBox?.classList.toggle('hidden', isCanceled);
}

function saveCalModalClassOverride() {
  if (!currentCalModalDateKey) return;
  const reasonInput = document.getElementById('calModalReasonInput');
  const topicInput = document.getElementById('calModalTopicInput');
  const coachInput = document.getElementById('calModalCoachInput');
  const reason = reasonInput ? reasonInput.value.trim() : '';
  const customTopic = topicInput ? topicInput.value.trim() : '';
  const customCoaches = coachInput ? coachInput.value.trim() : '';
  const status = currentCalModalChoice || 'normal';
  const staffName = (typeof currentStaff !== 'undefined' && currentStaff) ? currentStaff.name : 'ทีมโค้ช';

  if (!calendarDayOverrides) calendarDayOverrides = {};
  const prev = calendarDayOverrides[currentCalModalDateKey] || {};
  calendarDayOverrides[currentCalModalDateKey] = {
    ...prev,
    status,
    reason: status === 'canceled' ? reason : '',
    topic: status === 'canceled' ? (prev.topic || '') : customTopic,
    coaches: status === 'canceled' ? (prev.coaches || '') : customCoaches,
    time: status === 'canceled' ? '' : (prev.time && prev.time !== 'ปกติ' ? prev.time : '17:30 - 19:30 น.'),
    updatedBy: staffName,
    updatedAt: Date.now()
  };

  localStorage.setItem('dbo_calendar_overrides_v1', JSON.stringify(calendarDayOverrides));

  const actionText = status === 'canceled'
    ? `โค้ช${staffName} สั่งงดคลาสวันที่ ${currentCalModalDateKey}`
    : `โค้ช${staffName} อัปเดตเนื้อหาการสอนวันที่ ${currentCalModalDateKey}`;
  if (typeof saveState === 'function') {
    saveState(true, actionText);
  }
  if (typeof broadcastCoachClassStatus === 'function') {
    broadcastCoachClassStatus(currentCalModalDateKey, status, reason);
  }

  showToast(`บันทึกเนื้อหาการสอนและสถานะคลาสวันที่ ${currentCalModalDateKey} เรียบร้อย`);
  renderMasterCalendarGrid();
  renderWeeklyScheduleView();
  if (typeof renderNextTraining === 'function') renderNextTraining();
  if (typeof renderCourtExpenseStatement === 'function') renderCourtExpenseStatement();
  if (typeof renderParentView === 'function') renderParentView();
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
  closeCalendarDayModal();
}

function closeCalendarDayModal() {
  const modal = document.getElementById('calendarDayModal');
  if (modal) modal.classList.add('hidden');
}
