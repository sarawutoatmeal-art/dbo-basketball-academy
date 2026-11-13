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
    { key: 'sat', dayName: 'วันเสาร์', time: '16:00 - 18:00 น.', color: 'indigo', badge: 'Basic Coach Oat (4 ครั้ง)' }
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

function renderMasterCalendarGrid() {
  const grid = document.getElementById('masterCalendarGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const totalDays = 30;
  const startDayOfWeek = 0; // Sun

  for (let day = 1; day <= totalDays; day++) {
    const dayOfWeek = (startDayOfWeek + (day - 1)) % 7; 
    const isNormalClass = (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4);
    const isSaturdayCoachOat = (dayOfWeek === 6);
    const dateKey = `2026-11-${String(day).padStart(2, '0')}`;
    const override = (typeof calendarDayOverrides !== 'undefined' && calendarDayOverrides[dateKey]) ? calendarDayOverrides[dateKey] : null;
    const isCanceled = (override && override.status === 'canceled');
    const isConfirmedNormal = (override && override.status === 'normal');

    let cellClass = 'bg-white border-slate-100 text-slate-400';
    let badge = '';
    let dotHtml = '';

    if (isCanceled) {
      cellClass = 'bg-rose-50/90 border-rose-300 text-rose-950 hover:bg-rose-100 shadow-2xs';
      badge = `<span class="text-[9px] font-bold text-rose-700 bg-rose-100 px-1 py-0.5 rounded text-center truncate border border-rose-200">🚫 งดคลาส</span>`;
      dotHtml = '<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>';
    } else if (isSaturdayCoachOat) {
      cellClass = 'bg-indigo-50/80 border-indigo-200 text-indigo-950 hover:bg-indigo-100/60';
      badge = `<span class="text-[9px] font-bold text-indigo-700 bg-indigo-100/80 px-1 py-0.5 rounded text-center truncate">16:00</span>`;
      dotHtml = '<span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>';
    } else if (isNormalClass || isConfirmedNormal) {
      cellClass = 'bg-amber-50/70 border-amber-200 text-amber-950 hover:bg-amber-100/60';
      badge = `<span class="text-[9px] font-bold text-amber-800 bg-amber-100/80 px-1 py-0.5 rounded text-center truncate">17:30</span>`;
      dotHtml = '<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>';
    }

    const cell = document.createElement('div');
    cell.className = `p-1 sm:p-2 rounded-xl border min-h-[50px] sm:min-h-[64px] flex flex-col justify-between transition-all cursor-pointer ${cellClass}`;

    cell.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold font-mono ${isCanceled ? 'text-rose-700 font-extrabold' : (isSaturdayCoachOat ? 'text-indigo-700' : (isNormalClass || isConfirmedNormal ? 'text-amber-900' : 'text-slate-400'))}">${day}</span>
        ${dotHtml}
      </div>
      <div class="mt-1 flex justify-center">${badge}</div>
    `;

    cell.onclick = () => {
      openCalendarDayModal(day, dayOfWeek, isSaturdayCoachOat, isNormalClass, dateKey);
    };

    grid.appendChild(cell);
  }
}

function openCalendarDayModal(day, dayOfWeek, isSat, isNormal, dateKey) {
  const modal = document.getElementById('calendarDayModal');
  if (!modal) return;
  const dKey = dateKey || `2026-11-${String(day).padStart(2, '0')}`;
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
  title.innerText = `วัน${dayName}ที่ ${day} พ.ย. 2569`;

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
    if (topic) topic.innerHTML = `<span class="text-rose-700 font-bold">⚠️ วันนี้งดคลาสการฝึกซ้อม:</span> ${safeEscape(override.reason || 'พักฟื้นร่างกายหรือติดภารกิจ')}`;
    if (parentActionBox) parentActionBox.classList.add('hidden');
  } else {
    if (cancelAlert) cancelAlert.classList.add('hidden');
    if (parentActionBox) parentActionBox.classList.remove('hidden');

    if (isSat) {
      if (dot) dot.className = 'w-3 h-3 rounded-full bg-indigo-600';
      if (time) time.innerText = '16:00 - 18:00 น. (คลาสวันเสาร์)';
      if (coach) coach.innerText = 'โค้ชโอ๊ต (Head Coach)';
      if (topic) topic.innerHTML = '<strong>คลาส Basic Coach Oat:</strong> วิทยาศาสตร์การกีฬาสำหรับเด็ก การเคลื่อนไหว ความคล่องตัว (Agility Speed Ladder) การประสานงานร่างกาย และเสริมสร้างกล้ามเนื้อมัดเล็ก';
    } else if (isNormal || (override && override.status === 'normal')) {
      if (dot) dot.className = 'w-3 h-3 rounded-full bg-amber-500';
      if (time) time.innerText = '17:30 - 19:30 น. (คลาสปกติ)';
      if (dayOfWeek === 1) {
        if (coach) coach.innerText = 'โค้ชโอ๊ต & โค้ชโอ๊ค';
        if (topic) topic.innerHTML = '<strong>Fundamental Dribbling:</strong> ทักษะการทรงตัว บาสเกตบอลฟันดาเมนทัล สปีดเลี้ยงบอลสองมือ Footwork การเปลี่ยนทิศทาง และสมรรถภาพร่างกาย';
      } else if (dayOfWeek === 2) {
        if (coach) coach.innerText = 'โค้ชโอ๊ค & โค้ชโอ๊ต';
        if (topic) topic.innerHTML = '<strong>Passing Vision & IQ:</strong> การอ่านจังหวะในสนาม Spacing การจ่ายบอลแบบ Drive & Kick ฟุตเวิร์กเกมรับ และการตัดสินใจ 2 on 1 / 3 on 2';
      } else {
        if (coach) coach.innerText = 'โค้ชโอ๊ต & โค้ชโอ๊ค';
        if (topic) topic.innerHTML = '<strong>Shooting Mechanics & Game:</strong> ฟอร์มการยิงลูก Finishing under pressure การเลย์อัพใต้แป้น และสถานการณ์จำลอง 3 on 3';
      }
    } else {
      if (dot) dot.className = 'w-3 h-3 rounded-full bg-slate-300';
      if (time) time.innerText = 'ไม่มีรอบฝึกซ้อมประจำวัน';
      if (coach) coach.innerText = 'พักการฝึกซ้อม หรือจอง Private Class';
      if (topic) topic.innerHTML = 'วันนี้ไม่มีคลาสเรียนรวม หากต้องการฝึกซ้อมเดี่ยวหรือกลุ่มพิเศษ สามารถจอง Private Class ในเมนูรับสมัครเรียนได้ครับ';
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
  lucide.createIcons();
}

function setCalModalStatusChoice(choice) {
  currentCalModalChoice = choice;
  const btnNormal = document.getElementById('btnCalSetNormal');
  const btnCanceled = document.getElementById('btnCalSetCanceled');
  const reasonBox = document.getElementById('calModalReasonBox');
  const badge = document.getElementById('calModalCoachBadge');

  if (choice === 'canceled') {
    if (btnCanceled) {
      btnCanceled.className = 'btn-touch py-1.5 px-2 rounded-xl text-xs font-bold bg-rose-600 text-white flex items-center justify-center gap-1 shadow-xs border border-rose-500';
    }
    if (btnNormal) {
      btnNormal.className = 'btn-touch py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 hover:text-emerald-300 flex items-center justify-center gap-1 border border-slate-700';
    }
    if (reasonBox) reasonBox.classList.remove('hidden');
    if (badge) {
      badge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-950 text-rose-300 border border-rose-800';
      badge.innerText = 'งดคลาสวันนี้';
    }
  } else {
    if (btnNormal) {
      btnNormal.className = 'btn-touch py-1.5 px-2 rounded-xl text-xs font-bold bg-emerald-600 text-white flex items-center justify-center gap-1 shadow-xs border border-emerald-500';
    }
    if (btnCanceled) {
      btnCanceled.className = 'btn-touch py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 hover:text-rose-300 flex items-center justify-center gap-1 border border-slate-700';
    }
    if (reasonBox) reasonBox.classList.add('hidden');
    if (badge) {
      badge.className = 'text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-emerald-400 border border-slate-700';
      badge.innerText = 'มีคลาสปกติ';
    }
  }
  lucide.createIcons();
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
  if (typeof renderParentView === 'function') renderParentView();
  closeCalendarDayModal();
}

function closeCalendarDayModal() {
  const modal = document.getElementById('calendarDayModal');
  if (modal) modal.classList.add('hidden');
}
