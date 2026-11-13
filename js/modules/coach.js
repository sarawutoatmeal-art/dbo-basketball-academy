// ========================================================
// DBO Basketball Academy - Coach Management & Roster Controller
// (Roster Table/Cards, Edit/Add Student, Adjust Quotas, Slip Approval, Assistant Coaches)
// ========================================================

let activeCoachSubTab = 'roster';

function setCoachRosterViewMode(mode) {
  coachRosterViewMode = mode;
  localStorage.setItem('dbo_roster_view_mode_v2', mode);
  const btnCards = document.getElementById('btnViewCards');
  const btnTable = document.getElementById('btnViewTable');
  const cardsEl = document.getElementById('coachRosterMobileCards');
  const tableEl = document.getElementById('coachRosterDesktopTable');

  if (mode === 'cards') {
    if (cardsEl) cardsEl.classList.remove('hidden');
    if (tableEl) tableEl.classList.add('hidden');
    if (btnCards) btnCards.className = 'px-2.5 py-1 rounded-md font-medium text-xs transition flex items-center gap-1 bg-white text-slate-900 shadow-2xs';
    if (btnTable) btnTable.className = 'px-2.5 py-1 rounded-md font-medium text-xs transition flex items-center gap-1 text-slate-600 hover:text-slate-900';
  } else {
    if (cardsEl) cardsEl.classList.add('hidden');
    if (tableEl) tableEl.classList.remove('hidden');
    if (btnCards) btnCards.className = 'px-2.5 py-1 rounded-md font-medium text-xs transition flex items-center gap-1 text-slate-600 hover:text-slate-900';
    if (btnTable) btnTable.className = 'px-2.5 py-1 rounded-md font-medium text-xs transition flex items-center gap-1 bg-white text-slate-900 shadow-2xs';
  }
}

function filterCoachCategory(cat) {
  currentCoachFilter = cat;
  const cats = ['all', 'regular', 'monthly', 'saturday', 'low'];
  cats.forEach(c => {
    const btn = document.getElementById(`btn-filter-${c}`);
    if (!btn) return;
    if (c === cat) {
      if (c === 'low') {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white border border-rose-600 shadow-2xs transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer';
      } else {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white shadow-2xs transition-colors flex-shrink-0 cursor-pointer';
      }
    } else {
      if (c === 'low') {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer';
      } else {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex-shrink-0 cursor-pointer';
      }
    }
  });
  renderCoachRosterTable();
}

function switchCoachSubTab(subTab) {
  activeCoachSubTab = subTab;
  const rosterSec = document.getElementById('coachRosterViewSection');
  const recordsSec = document.getElementById('coachRecordsViewSection');
  const btnRoster = document.getElementById('coachSubTabRoster');
  const btnRecords = document.getElementById('coachSubTabRecords');

  if (subTab === 'records') {
    if (rosterSec) rosterSec.classList.add('hidden');
    if (recordsSec) recordsSec.classList.remove('hidden');
    if (btnRecords) {
      btnRecords.className = 'btn-touch px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-slate-900 text-white shadow-2xs';
    }
    if (btnRoster) {
      btnRoster.className = 'btn-touch px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100';
    }
    if (typeof renderTeachingRecordsList === 'function') renderTeachingRecordsList();
  } else {
    if (recordsSec) recordsSec.classList.add('hidden');
    if (rosterSec) rosterSec.classList.remove('hidden');
    if (btnRoster) {
      btnRoster.className = 'btn-touch px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-slate-900 text-white shadow-2xs';
    }
    if (btnRecords) {
      btnRecords.className = 'btn-touch px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100';
    }
    renderCoachRosterTable();
  }
  lucide.createIcons();
}

function renderCoachRosterTable() {
  const tbody = document.getElementById('coachRosterTbody');
  const cardsContainer = document.getElementById('coachRosterMobileCards');
  if (!tbody && !cardsContainer) return;
  const search = (document.getElementById('coachSearchInput').value || '').trim().toLowerCase();
  
  if (tbody) tbody.innerHTML = '';
  if (cardsContainer) cardsContainer.innerHTML = '';

  const cAll = students.length;
  const cReg = students.filter(s => s.courseType === 'regular' || s.courseType === 'both' || !s.courseType).length;
  const cSat = students.filter(s => s.courseType === 'saturday' || s.courseType === 'both').length;
  const cMon = students.filter(s => s.courseType === 'monthly').length;
  const cLow = students.filter(s => {
    if (s.courseType === 'saturday') {
      return (s.saturdayRemaining !== undefined ? s.saturdayRemaining : 0) <= 1;
    }
    if (s.courseType === 'both') {
      return (s.remaining !== undefined ? s.remaining : 0) <= 1 || (s.saturdayRemaining !== undefined ? s.saturdayRemaining : 0) <= 1;
    }
    return (s.remaining !== undefined ? s.remaining : 0) <= 1;
  }).length;

  const cntAll = document.getElementById('count-all');
  const cntReg = document.getElementById('count-regular');
  const cntMon = document.getElementById('count-monthly');
  const cntSat = document.getElementById('count-saturday');
  const cntLow = document.getElementById('count-low');
  if (cntAll) cntAll.innerText = cAll;
  if (cntReg) cntReg.innerText = cReg;
  if (cntMon) cntMon.innerText = cMon;
  if (cntSat) cntSat.innerText = cSat;
  if (cntLow) cntLow.innerText = cLow;

  let filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search) || (s.phone || '').includes(search) || String(s.id).includes(search);
    if (!matchSearch) return false;
    if (currentCoachFilter === 'all') return true;
    if (currentCoachFilter === 'regular') return s.courseType === 'regular' || s.courseType === 'both' || !s.courseType;
    if (currentCoachFilter === 'saturday') return s.courseType === 'saturday' || s.courseType === 'both';
    if (currentCoachFilter === 'monthly') return s.courseType === 'monthly';
    if (currentCoachFilter === 'low') {
      if (s.courseType === 'saturday') {
        return (s.saturdayRemaining !== undefined ? s.saturdayRemaining : 0) <= 1;
      }
      if (s.courseType === 'both') {
        return (s.remaining !== undefined ? s.remaining : 0) <= 1 || (s.saturdayRemaining !== undefined ? s.saturdayRemaining : 0) <= 1;
      }
      return (s.remaining !== undefined ? s.remaining : 0) <= 1;
    }
    return true;
  });

  if (currentCoachFilter === 'low') {
    // Sort lowest/most overdue quota first so coach sees urgency immediately
    filtered.sort((a, b) => {
      const remA = a.courseType === 'saturday' ? (a.saturdayRemaining || 0) : (a.remaining || 0);
      const remB = b.courseType === 'saturday' ? (b.saturdayRemaining || 0) : (b.remaining || 0);
      return remA - remB;
    });
  }

  const isAsst = currentStaff && currentStaff.isAssistant;

  filtered.forEach(s => {
    const isSaturdayFilter = (currentCoachFilter === 'saturday');
    const rem = isSaturdayFilter ? (s.saturdayRemaining || 0) : (s.remaining || 0);
    
    let remBadge = '';
    if (isSaturdayFilter || s.courseType === 'saturday') {
      const satRem = s.saturdayRemaining || 0;
      const colorCls = satRem > 1 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : (satRem === 1 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200 font-bold');
      remBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${colorCls} inline-block">${satRem} / 4 ครั้ง (เสาร์)</span>`;
    } else if (s.courseType === 'both') {
      const regRem = s.remaining || 0;
      const satRem = s.saturdayRemaining || 0;
      const regColor = regRem > 1 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : (regRem === 1 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200 font-bold');
      const satColor = satRem > 1 ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : (satRem === 1 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200 font-bold');
      remBadge = `
        <div class="flex flex-col gap-0.5 items-end">
          <span class="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${regColor}">ปกติ: ${regRem} ครั้ง</span>
          <span class="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${satColor}">เสาร์: ${satRem} ครั้ง</span>
        </div>
      `;
    } else {
      const colorCls = rem > 3 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : (rem >= 1 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200 font-bold');
      remBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${colorCls} inline-block">${rem} ครั้ง</span>`;
    }

    let typeBadge = '';
    if (s.courseType === 'both') typeBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">ปกติ + เสาร์</span>`;
    else if (s.courseType === 'monthly') typeBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">รายเดือน</span>`;
    else if (s.courseType === 'saturday') typeBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">วันเสาร์ (4 ครั้ง)</span>`;
    else typeBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">ปกติ 10 ครั้ง</span>`;

    // 1. Desktop Table
    if (tbody) {
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-50 transition";
      
      tr.innerHTML = `
        <td class="py-2.5 px-3 text-center text-xs text-slate-400 font-mono font-medium">${s.id}</td>
        <td class="py-2.5 px-3">
          <div class="flex items-center gap-1.5 flex-wrap">
            <strong onclick="openEditStudentModal(${s.id})" class="text-xs sm:text-sm font-bold text-dbo-navy hover:text-indigo-600 cursor-pointer" title="คลิกเพื่อแก้ไข">น้อง ${s.name}</strong>
            <span class="sm:hidden">${typeBadge}</span>
          </div>
          ${s.phone ? `<span class="font-mono text-slate-500 text-xs flex items-center gap-1 pt-0.5"><i data-lucide="phone" class="w-3 h-3 text-slate-400"></i> ${maskPhone(s.phone)}</span>` : `<span class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 mt-0.5"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> รอผูกเบอร์</span>`}
        </td>
        <td class="py-2.5 px-3 hidden sm:table-cell">${typeBadge}</td>
        <td class="py-2.5 px-3 hidden md:table-cell">
          <span class="text-xs text-slate-600 block">${s.startDate || '-'}</span>
          ${s.nextRenewal ? `<span class="text-[10px] text-emerald-700 font-medium">รอบต่อ: ${s.nextRenewal}</span>` : ''}
        </td>
        <td class="py-2.5 px-3 text-center whitespace-nowrap">${remBadge}</td>
        <td class="py-2.5 px-3 text-center">
          <div class="inline-flex items-center gap-1">
            <button type="button" onclick="openEditStudentModal(${s.id})" title="แก้ไขชื่อ / สิทธิ์ / ข้อมูล" class="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              <span>แก้ไข</span>
            </button>
            ${!isAsst ? `
            <button type="button" onclick="coachDeleteStudent(${s.id})" title="ลบชื่อ" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>` : ''}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // 2. Mobile Cards
    if (cardsContainer) {
      const card = document.createElement('div');
      card.className = "card-clean p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-all shadow-2xs";

      card.innerHTML = `
        <div class="flex items-center justify-between gap-2.5">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
              #${s.id}
            </span>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h4 onclick="openEditStudentModal(${s.id})" class="font-bold text-dbo-navy hover:text-indigo-600 text-sm leading-tight truncate cursor-pointer">น้อง ${s.name}</h4>
                ${typeBadge}
              </div>
              <div class="flex items-center gap-2 pt-0.5 text-xs text-slate-500">
                ${s.phone ? `<span class="font-mono text-slate-500 flex items-center gap-1"><i data-lucide="phone" class="w-3 h-3 text-slate-400"></i> ${maskPhone(s.phone)}</span>` : `<span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> รอผูกเบอร์</span>`}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <div class="text-right">
              ${remBadge}
            </div>
            <button type="button" onclick="openEditStudentModal(${s.id})" class="btn-touch px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer" title="แก้ไขข้อมูล & ปรับสิทธิ์">
              <i data-lucide="edit-3" class="w-3.5 h-3.5 text-slate-500"></i>
              <span>แก้ไข</span>
            </button>
            ${!isAsst ? `
            <button type="button" onclick="coachDeleteStudent(${s.id})" title="ลบชื่อ" class="btn-touch p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>` : ''}
          </div>
        </div>
      `;
      cardsContainer.appendChild(card);
    }
  });
  lucide.createIcons();
}

function coachCheckInAction(studentId, delta, target = 'regular') {
  const student = students.find(s => s.id === studentId);
  if (!student) return;

  const staffName = currentStaff ? currentStaff.name : 'โค้ชโอ๊ต';
  const sessionDateKey = activeAttendanceDate || getTodayDateKey();
  const isToday = (sessionDateKey === getTodayDateKey());
  const now = new Date();
  const timeStr = isToday ? (now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.') : 'บันทึกในรอบ';

  const parts = sessionDateKey.split('-');
  const sessionD = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const formattedSessionThai = `${sessionD.getDate()} ${thaiMonthsShort[sessionD.getMonth()]} ${sessionD.getFullYear() + 543}`;

  if (target === 'saturday') {
    student.saturdayRemaining = (student.saturdayRemaining || 0) + delta;
  } else {
    student.remaining = (student.remaining || 0) + delta;
  }
  student._updatedAt = Date.now();

  if (!student.checkInHistory) student.checkInHistory = [];
  student.checkInHistory.unshift({
    date: `${formattedSessionThai} (${timeStr})`,
    sessionDate: sessionDateKey,
    type: target === 'saturday' ? 'คลาสวันเสาร์ Basic Coach Oat' : 'คลาสปกติ 2 ชม. (จ./อ./พฤ.)',
    coach: staffName,
    status: 'เช็คชื่อเข้าฝึกซ้อมเรียบร้อย',
    remaining: target === 'saturday' ? student.saturdayRemaining : student.remaining,
    action: delta < 0 ? 'ตัดโควต้า -1 ครั้ง' : `ปรับโควต้า +${delta}`
  });

  if (!dailyAttendance[sessionDateKey]) dailyAttendance[sessionDateKey] = {};
  dailyAttendance[sessionDateKey][student.id] = {
    studentId: student.id,
    name: student.name,
    status: 'attending',
    time: timeStr,
    updatedBy: staffName,
    dateKey: sessionDateKey,
    courseType: target,
    note: `เช็คชื่อโดย ${staffName}`,
    updatedAt: Date.now()
  };

  const curRemAfter = (target === 'saturday') ? student.saturdayRemaining : student.remaining;
  saveState(true, `เช็คชื่อน้อง ${student.name} (เหลือ ${curRemAfter} ครั้ง)`);
  if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
  renderCoachRosterTable();
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();

  if (loggedInStudent && loggedInStudent.id === studentId) {
    loggedInStudent = student;
    if (typeof ensureHistoricalDatesSeeded === 'function') ensureHistoricalDatesSeeded();
    if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
    if (typeof renderParentView === 'function') renderParentView();
  }

  const courseName = (target === 'saturday') ? 'คลาสวันเสาร์ Basic Coach Oat' : 'คลาสปกติ';
  const curRem = (target === 'saturday') ? student.saturdayRemaining : student.remaining;
  const msg = `น้อง ${student.name} เช็คชื่อเข้าฝึกซ้อม${courseName}เรียบร้อยแล้วครับ! (โควต้าคงเหลือ: ${curRem} ครั้ง)`;
  
  // Real-time broadcast to Parent devices via MQTT
  if (typeof publishToMqttBrokers === 'function') {
    publishToMqttBrokers(REALTIME_SYNC_TOPIC, {
      senderId: window.dboClientId,
      type: 'COACH_CHECKIN_EVENT',
      coachName: staffName,
      dateKey: sessionDateKey,
      attendingStudents: [{ id: student.id, name: student.name, remaining: curRemAfter }],
      leaveStudents: [],
      timeStr: timeStr
    });
  }

  if (isToday) {
    triggerTelegramPush(`🏀 ${msg}`, 'การเช็คชื่อเข้าฝึกซ้อม (Live Push)');
    sendSystemNotification('🏀 DBO Academy เช็คชื่อเข้าเรียน', {
      body: msg,
      icon: 'assets/images/app-icon-192.png'
    });
  }
  showToast(`เช็คชื่อน้อง ${student.name} (${formattedSessionThai}) สำเร็จ`);
}

function coachAdjustQuota(studentId, delta, target = 'regular') {
  const student = students.find(s => s.id === studentId);
  if (!student) return;

  const staffName = currentStaff ? currentStaff.name : 'ทีมงาน';
  const now = new Date();
  const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
  const dateStr = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

  if (target === 'saturday') {
    student.saturdayRemaining = (student.saturdayRemaining || 0) + delta;
    showToast(`ปรับโควตาวันเสาร์น้อง ${student.name} เป็น ${student.saturdayRemaining} ครั้ง`);
  } else {
    student.remaining = (student.remaining || 0) + delta;
    showToast(`ปรับโควตาปกติน้อง ${student.name} เป็น ${student.remaining} ครั้ง`);
  }

  if (!student.checkInHistory) student.checkInHistory = [];
  student.checkInHistory.unshift({
    date: `${dateStr} (${timeStr})`,
    type: target === 'saturday' ? 'คลาสวันเสาร์' : 'คลาสปกติ',
    coach: staffName,
    status: `ปรับโควต้า (${delta > 0 ? '+' + delta : delta})`,
    remaining: target === 'saturday' ? student.saturdayRemaining : student.remaining,
    action: `${delta > 0 ? '+' + delta : delta} ครั้ง`
  });

  student._updatedAt = Date.now();
  const newQuota = target === 'saturday' ? student.saturdayRemaining : student.remaining;
  saveState(true, `ปรับโควตาน้อง ${student.name} (เหลือ ${newQuota} ครั้ง)`);
  renderCoachRosterTable();
  if (loggedInStudent && loggedInStudent.id === studentId) {
    loggedInStudent = student;
    if (typeof ensureHistoricalDatesSeeded === 'function') ensureHistoricalDatesSeeded();
    if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
    if (typeof renderParentView === 'function') renderParentView();
  }
}

function coachDeleteStudent(studentId) {
  const student = students.find(s => s.id === studentId);
  if (!student) return;
  if (!confirm(`คุณต้องการลบชื่อ "น้อง ${student.name}" (${student.phone || 'ยังไม่ได้ผูกเบอร์'}) ออกจากระบบใช่หรือไม่?\n* ผู้ปกครองจะไม่สามารถล็อกอินเข้าดูข้อมูลได้อีกต่อไป`)) {
    return;
  }

  deletedStudentIds[String(studentId)] = Date.now();
  students = students.filter(s => s.id !== studentId);
  saveState(true, `ลบข้อมูลน้อง ${student.name}`);
  renderCoachRosterTable();

  if (loggedInStudent && loggedInStudent.id === studentId) {
    appLogout();
  }
  showToast(`ลบข้อมูลน้อง ${student.name} ออกจากระบบเรียบร้อยแล้ว`);
}

function coachUndoCheckIn(studentId, target = 'regular') {
  const student = students.find(s => s.id === studentId);
  if (!student) return;

  const nowTs = Date.now();
  const sessionDateKey = activeAttendanceDate || getTodayDateKey();
  if (target === 'saturday') {
    student.saturdayRemaining = (student.saturdayRemaining || 0) + 1;
  } else {
    student.remaining = (student.remaining || 0) + 1;
  }
  student._updatedAt = nowTs;
  syncSharedSiblingQuota(student, target);

  if (!dailyAttendance[sessionDateKey]) dailyAttendance[sessionDateKey] = {};
  dailyAttendance[sessionDateKey][student.id] = {
    studentId: student.id,
    name: student.name,
    status: 'unchecked',
    updatedAt: nowTs
  };

  if (student.checkInHistory) {
    const idx = student.checkInHistory.findIndex(h => h.sessionDate === sessionDateKey || (h.date && h.date.includes(sessionDateKey)));
    if (idx !== -1) {
      student.checkInHistory.splice(idx, 1);
    }
  }

  saveState(true, `คืนสิทธิ์น้อง ${student.name} (+1 ครั้ง)`);
  if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
  renderCoachRosterTable();
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
  if (loggedInStudent && loggedInStudent.id === studentId) {
    loggedInStudent = student;
    if (typeof ensureHistoricalDatesSeeded === 'function') ensureHistoricalDatesSeeded();
    if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
    if (typeof renderParentView === 'function') renderParentView();
  }
  showToast(`คืนสิทธิ์น้อง ${student.name} (+1 ครั้ง) เรียบร้อยแล้ว`);
}

function coachClearAttendanceRecord(studentId) {
  const sessionDateKey = activeAttendanceDate || getTodayDateKey();
  if (dailyAttendance[sessionDateKey] && dailyAttendance[sessionDateKey][studentId]) {
    dailyAttendance[sessionDateKey][studentId] = {
      studentId: studentId,
      status: 'unchecked',
      updatedAt: Date.now()
    };
    saveState(true, 'ล้างสถานะเช็คชื่อ');
    if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
    renderCoachRosterTable();
    if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
    showToast(`ล้างสถานะเช็คชื่อรอบนี้เรียบร้อยแล้ว`);
  }
}

// Student Modal Edit / Add
function stepModalQuota(inputId, delta) {
  const el = document.getElementById(inputId);
  if (!el) return;
  const cur = parseInt(el.value, 10) || 0;
  el.value = cur + delta;
}

function setModalQuotaExact(inputId, val) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.value = parseInt(val, 10) || 0;
}

function openAddNewStudentModal() {
  document.getElementById('studentFormModalTitle').innerText = 'เพิ่มนักเรียนใหม่เข้าสู่ระบบ';
  document.getElementById('modalStudentId').value = '';
  document.getElementById('modalStudentName').value = '';
  document.getElementById('modalStudentPhone').value = '';
  document.getElementById('modalStudentCourseType').value = 'regular';
  document.getElementById('modalStudentStartDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('modalStudentRemaining').value = 10;
  const satRemEl = document.getElementById('modalStudentSaturdayRemaining');
  if (satRemEl) satRemEl.value = 0;
  document.getElementById('modalStudentRemark').value = 'นักเรียนใหม่';
  const rOat = document.getElementById('modalStudentRemarkOat');
  const rOak = document.getElementById('modalStudentRemarkOak');
  const vJ = document.getElementById('modalStudentVJump');
  const lJ = document.getElementById('modalStudentLongJump');
  if (rOat) rOat.value = '';
  if (rOak) rOak.value = '';
  if (vJ) vJ.value = '';
  if (lJ) lJ.value = '';
  document.getElementById('studentFormModal').classList.remove('hidden');
  lucide.createIcons();
}

function openEditStudentModal(studentId) {
  const student = students.find(s => s.id === studentId);
  if (!student) return;

  document.getElementById('studentFormModalTitle').innerText = `แก้ไขชื่อ & ปรับสิทธิ์น้อง ${student.name}`;
  document.getElementById('modalStudentId').value = student.id;
  document.getElementById('modalStudentName').value = student.name;
  document.getElementById('modalStudentPhone').value = student.phone || '';
  document.getElementById('modalStudentCourseType').value = student.courseType || 'regular';
  document.getElementById('modalStudentStartDate').value = student.startDate || '';
  document.getElementById('modalStudentRemaining').value = student.remaining !== undefined ? student.remaining : 0;
  const satRemEl = document.getElementById('modalStudentSaturdayRemaining');
  if (satRemEl) {
    satRemEl.value = student.saturdayRemaining !== undefined ? student.saturdayRemaining : 0;
  }
  document.getElementById('modalStudentRemark').value = student.remark || '';
  
  const rOat = document.getElementById('modalStudentRemarkOat');
  const rOak = document.getElementById('modalStudentRemarkOak');
  const vJ = document.getElementById('modalStudentVJump');
  const lJ = document.getElementById('modalStudentLongJump');
  if (rOat) rOat.value = student.remarkOat || '';
  if (rOak) rOak.value = student.remarkOak || '';
  if (vJ) vJ.value = student.vJump || '';
  if (lJ) lJ.value = student.longJump || '';

  document.getElementById('studentFormModal').classList.remove('hidden');
  lucide.createIcons();
}

function closeStudentModal() {
  document.getElementById('studentFormModal').classList.add('hidden');
}

function handleSaveStudent(e) {
  e.preventDefault();
  const idVal = document.getElementById('modalStudentId').value;
  const name = document.getElementById('modalStudentName').value.trim();
  const phone = document.getElementById('modalStudentPhone').value.trim();
  const courseType = document.getElementById('modalStudentCourseType').value;
  const startDate = document.getElementById('modalStudentStartDate').value;
  const remaining = parseInt(document.getElementById('modalStudentRemaining').value, 10) || 0;
  const satRemInput = document.getElementById('modalStudentSaturdayRemaining');
  const saturdayRemaining = satRemInput ? (parseInt(satRemInput.value, 10) || 0) : 0;
  const remark = document.getElementById('modalStudentRemark').value.trim();
  
  const rOat = (document.getElementById('modalStudentRemarkOat').value || '').trim();
  const rOak = (document.getElementById('modalStudentRemarkOak').value || '').trim();
  const vJVal = parseInt(document.getElementById('modalStudentVJump').value, 10) || 0;
  const lJVal = parseInt(document.getElementById('modalStudentLongJump').value, 10) || 0;

  const staffName = currentStaff ? currentStaff.name : 'ทีมโค้ช';
  let quotaDeducted = false;

  if (idVal) {
    const student = students.find(s => s.id === parseInt(idVal, 10));
    if (student) {
      const oldRem = student.remaining || 0;
      const oldSatRem = student.saturdayRemaining || 0;
      if (remaining < oldRem || saturdayRemaining < oldSatRem) {
        quotaDeducted = true;
      }

      student.name = name;
      student.phone = phone;
      student.courseType = courseType;
      student.startDate = startDate;
      student.remaining = remaining;
      student.saturdayRemaining = saturdayRemaining;
      student.remark = remark;
      student.remarkOat = rOat;
      student.remarkOak = rOak;
      student.isRealSportsMetrics = !!(rOat || rOak || vJVal > 0 || lJVal > 0);

      Object.keys(dailyAttendance).forEach(dk => {
        if (dailyAttendance[dk] && dailyAttendance[dk][student.id]) {
          dailyAttendance[dk][student.id].name = name;
        }
      });

      if (remaining !== oldRem || saturdayRemaining !== oldSatRem) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
        const dateStr = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
        if (!student.checkInHistory) student.checkInHistory = [];
        student.checkInHistory.unshift({
          date: `${dateStr} (${timeStr})`,
          type: courseType === 'saturday' ? 'คลาสวันเสาร์' : 'คลาสปกติ',
          coach: staffName,
          status: `ปรับสิทธิ์โดย ${staffName}`,
          remaining: courseType === 'saturday' ? saturdayRemaining : remaining,
          action: `ตั้งค่าสิทธิ์: ปกติ ${remaining} ครั้ง${courseType === 'both' || courseType === 'saturday' ? `, เสาร์ ${saturdayRemaining} ครั้ง` : ''}`
        });
      }

      if (vJVal > 0) {
        if (!student.vJumpHistory) student.vJumpHistory = [];
        if (vJVal !== student.vJump) {
          const nowD = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
          student.vJumpHistory.push({ date: nowD, val: vJVal });
        }
        student.vJump = vJVal;
      } else {
        student.vJump = null;
        student.vJumpHistory = [];
      }

      if (lJVal > 0) {
        if (!student.longJumpHistory) student.longJumpHistory = [];
        if (lJVal !== student.longJump) {
          const nowD = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
          student.longJumpHistory.push({ date: nowD, val: lJVal });
        }
        student.longJump = lJVal;
      } else {
        student.longJump = null;
        student.longJumpHistory = [];
      }

      if (courseType === 'monthly' && startDate) {
        const parts = startDate.split('-');
        student.nextRenewal = `วันที่ ${parts[2]} ของเดือนถัดไป`;
      }
      student._updatedAt = Date.now();
    }
    showToast(`บันทึกการแก้ไขข้อมูลน้อง ${name} เรียบร้อย`);
  } else {
    const maxId = students.reduce((m, s) => Math.max(m, Number(s.id) || 0), 0);
    const newStudent = {
      id: maxId + 1,
      name: name,
      phone: phone,
      courseType: courseType,
      startDate: startDate,
      nextRenewal: courseType === 'monthly' && startDate ? `วันที่ ${startDate.split('-')[2]} ของเดือนถัดไป` : '-',
      remaining: remaining,
      saturdayRemaining: saturdayRemaining,
      records: {},
      remark: remark || 'เพิ่มโดยทีมโค้ช',
      remarkOat: rOat || '',
      remarkOak: rOak || '',
      vJump: vJVal > 0 ? vJVal : null,
      vJumpHistory: vJVal > 0 ? [{ date: 'แรกเข้า', val: vJVal }] : [],
      longJump: lJVal > 0 ? lJVal : null,
      longJumpHistory: lJVal > 0 ? [{ date: 'แรกเข้า', val: lJVal }] : [],
      isRealSportsMetrics: !!(rOat || rOak || vJVal > 0 || lJVal > 0),
      _updatedAt: Date.now()
    };
    students.unshift(newStudent);
    showToast(`เพิ่มนักเรียนน้อง ${name} เข้าสู่ระบบสำเร็จ`);
  }

  saveState(true, `บันทึกการแก้ไขข้อมูลน้อง ${name}`);

  if (quotaDeducted) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    const dateKey = (typeof getTodayDateKey === 'function') ? getTodayDateKey() : now.toISOString().split('T')[0];
    const checkinPayload = {
      senderId: window.dboClientId,
      type: 'COACH_CHECKIN_EVENT',
      coachName: staffName,
      dateKey: dateKey,
      timeStr: timeStr,
      attendingStudents: [{
        id: parseInt(idVal, 10),
        name: name,
        remaining: (courseType === 'saturday') ? saturdayRemaining : remaining
      }],
      leaveStudents: []
    };
    if (window.dboRealtimeBC) {
      try { window.dboRealtimeBC.postMessage(checkinPayload); } catch (e) {}
    }
    if (typeof publishToMqttBrokers === 'function') {
      publishToMqttBrokers(REALTIME_SYNC_TOPIC, checkinPayload);
    }
  }

  closeStudentModal();
  renderCoachRosterTable();
  if (loggedInStudent && loggedInStudent.id === parseInt(idVal, 10)) {
    loggedInStudent = students.find(s => s.id === loggedInStudent.id);
    if (typeof ensureHistoricalDatesSeeded === 'function') ensureHistoricalDatesSeeded();
    if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
    if (typeof renderParentView === 'function') renderParentView();
  }
}

// Slip verification queue
function renderPendingSlips() {
  const sec = document.getElementById('pendingSlipSection');
  const container = document.getElementById('pendingSlipList');
  const badgeCount = document.getElementById('pendingCount');
  if (!container || !badgeCount) return;

  badgeCount.innerText = pendingSlips.length;
  if (pendingSlips.length === 0) {
    if (sec) sec.classList.add('hidden');
    return;
  }
  if (sec) sec.classList.remove('hidden');

  container.innerHTML = '';
  pendingSlips.forEach(item => {
    const div = document.createElement('div');
    div.className = "p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs";
    
    let typeText = item.courseType === 'monthly' ? 'รายเดือน (2,790 บ.)' : (item.courseType === 'saturday' ? 'วันเสาร์ (1,500/1,690 บ.)' : '10 ครั้ง (3,990 บ.)');

    div.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center font-mono text-xs border border-slate-200 flex-shrink-0">
          ฿
        </div>
        <div>
          <div class="flex items-center gap-2">
            <strong class="text-xs sm:text-sm font-semibold text-slate-900">น้อง ${item.studentName}</strong>
            <span class="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">${typeText}</span>
          </div>
          <p class="text-[11px] text-slate-500 mt-0.5">
            ผปค: ${item.parentName} (${item.phone}) • ยอดโอน: <strong class="font-semibold text-slate-800">${item.amount.toLocaleString()} บาท</strong> • ${item.date}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <a href="${item.slipImage}" target="_blank" class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1 transition-colors">
          <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-500"></i> <span>ตรวจสลิป</span>
        </a>
        <button onclick="approveSlip('${item.id}')" class="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs flex items-center gap-1.5 transition-colors">
          <i data-lucide="check" class="w-3.5 h-3.5"></i> <span>อนุมัติ & เพิ่มสิทธิ์</span>
        </button>
        <button onclick="rejectSlip('${item.id}')" class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
          ปฏิเสธ
        </button>
      </div>
    `;
    container.appendChild(div);
  });
  lucide.createIcons();
}

function approveSlip(slipId) {
  const itemIndex = pendingSlips.findIndex(s => s.id === slipId);
  if (itemIndex === -1) return;
  const item = pendingSlips[itemIndex];

  let existing = students.find(s => s.phone.replace(/[-\s]/g, '') === item.phone.replace(/[-\s]/g, '') || s.name.toLowerCase() === item.studentName.toLowerCase());
  const quotaAdd = item.courseType === 'saturday' ? 4 : (item.courseType === 'monthly' ? 8 : 10);

  if (existing) {
    existing.remaining = (existing.remaining || 0) + quotaAdd;
    existing.courseType = item.courseType;
    existing._updatedAt = Date.now();
    if (item.courseType === 'monthly') {
      existing.startDate = new Date().toISOString().split('T')[0];
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      existing.nextRenewal = d.toISOString().split('T')[0];
    }
  } else {
    const maxId = students.reduce((m, s) => Math.max(m, Number(s.id) || 0), 0);
    const newStudent = {
      id: maxId + 1,
      name: item.studentName,
      fullName: item.fullName || `ด.ช. ${item.studentName}`,
      phone: item.phone,
      school: item.school || 'โรงเรียนทั่วไป',
      courseType: item.courseType,
      startDate: item.startDate || new Date().toISOString().split('T')[0],
      nextRenewal: item.courseType === 'monthly' ? new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] : '-',
      remaining: quotaAdd,
      records: {},
      remark: `อนุมัติผ่านสลิป ${item.amount} บาท เข้าสู่ระบบอย่างเป็นทางการ`,
      _updatedAt: Date.now()
    };
    students.unshift(newStudent);
  }

  processedSlipIds[String(slipId)] = Date.now();
  pendingSlips.splice(itemIndex, 1);
  saveState(true, `อนุมัติสลิปและเพิ่มสิทธิ์น้อง ${item.studentName}`);
  renderPendingSlips();
  renderCoachRosterTable();
  showToast(`อนุมัติสลิปและเพิ่มสิทธิ์ให้ "น้อง ${item.studentName}" เรียบร้อย!`);
}

function rejectSlip(slipId) {
  if (!confirm('ต้องการปฏิเสธสลิปนี้ใช่หรือไม่?')) return;
  processedSlipIds[String(slipId)] = Date.now();
  pendingSlips = pendingSlips.filter(s => s.id !== slipId);
  saveState(true, 'ปฏิเสธสลิปโอนเงิน');
  renderPendingSlips();
  showToast('ปฏิเสธสลิปแล้ว');
}

function selectRenewPackage(name, price) {
  document.getElementById('selectedPackageName').value = name;
  document.getElementById('selectedPackagePrice').value = price;
  const el = document.getElementById('renewCheckoutSection');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    showToast(`เลือกแพ็กเกจ ${name} (${price}.-) สแกน QR และแนบสลิปด้านล่าง`);
  }
}

function copyAccountNum() {
  navigator.clipboard.writeText('1502795631');
  showToast('คัดลอกเลขบัญชี 150-2-79563-1 แล้ว');
}

function previewSlip(input) {
  if (input.files && input.files[0]) {
    document.getElementById('slipFileLabel').innerText = `✓ แนบไฟล์แล้ว: ${input.files[0].name}`;
  }
}

function handleSlipSubmit(e) {
  e.preventDefault();
  const pkg = document.getElementById('selectedPackageName').value;
  const price = parseInt(document.getElementById('selectedPackagePrice').value);
  const sName = document.getElementById('slipStudentName').value.trim();

  const newSlip = {
    id: 'slip-' + Date.now(),
    studentName: sName,
    parentName: `ผู้ปกครองน้อง ${sName}`,
    phone: loggedInStudent ? loggedInStudent.phone : '-',
    courseType: pkg.includes('รายเดือน') ? 'monthly' : (pkg.includes('เสาร์') ? 'saturday' : 'regular'),
    amount: price,
    slipImage: 'assets/images/kbank-qr.jpg',
    date: new Date().toLocaleDateString('th-TH') + ' (ต่อคอร์ส)',
    school: loggedInStudent ? loggedInStudent.school : 'ทั่วไป',
    status: 'รอตรวจสอบ'
  };

  pendingSlips.unshift(newSlip);
  saveState();
  renderPendingSlips();

  showToast(`ส่งหลักฐานชำระเงิน ${price} บาท สำเร็จ! อยู่ระหว่างรอทีมงานตรวจสลิป`);
  switchTab('parent-portal');
}

// Assistant Coach Management
function updateAssistantDutyUI() {
  if (!currentStaff || !currentStaff.isAssistant) return;
  const asst = assistantCoaches.find(a => a.id === currentStaff.id) || assistantCoaches[0];
  const countEl = document.getElementById('asstDutyCountThisMonth');
  const statusEl = document.getElementById('asstTodayDutyStatus');
  const btnStart = document.getElementById('btnAsstStartDuty');
  const btnEnd = document.getElementById('btnAsstEndDuty');

  const count = (asst.workLogs || []).length;
  if (countEl) countEl.innerText = count;

  const todayKey = getTodayDateKey();
  const todayLog = (asst.workLogs || []).find(l => l.dateKey === todayKey);

  if (statusEl) {
    if (!todayLog) {
      statusEl.innerHTML = 'สถานะวันนี้: <span class="inline-flex items-center gap-1.5 font-medium text-slate-500"><span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span> ยังไม่ได้ลงชื่อเริ่มสอน</span>';
      if (btnStart) btnStart.disabled = false;
      if (btnEnd) btnEnd.disabled = true;
    } else if (todayLog.status === 'in_progress') {
      statusEl.innerHTML = `สถานะวันนี้: <span class="inline-flex items-center gap-1.5 font-medium text-emerald-700"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ลงชื่อเริ่มสอนแล้ว (${todayLog.startTime})</span>`;
      if (btnStart) btnStart.disabled = true;
      if (btnEnd) btnEnd.disabled = false;
    } else {
      statusEl.innerHTML = `สถานะวันนี้: <span class="inline-flex items-center gap-1.5 font-medium text-slate-700"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> สิ้นสุดการสอนแล้ว (${todayLog.startTime} - ${todayLog.endTime})</span>`;
      if (btnStart) btnStart.disabled = true;
      if (btnEnd) btnEnd.disabled = true;
    }
  }
}

function handleAssistantDutyAction(action) {
  if (!currentStaff || !currentStaff.isAssistant) return;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
  const dateStr = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  const todayKey = getTodayDateKey();

  const asst = assistantCoaches.find(a => a.id === currentStaff.id) || assistantCoaches[0];
  if (!asst.workLogs) asst.workLogs = [];

  let todayLog = asst.workLogs.find(l => l.dateKey === todayKey);

  if (action === 'start') {
    if (!todayLog) {
      todayLog = {
        id: 'duty_' + Date.now(),
        dateKey: todayKey,
        dateStr: dateStr,
        startTime: timeStr,
        endTime: '',
        status: 'in_progress',
        className: 'คลาสซ้อม DBO Academy'
      };
      asst.workLogs.unshift(todayLog);
    } else {
      todayLog.startTime = timeStr;
      todayLog.status = 'in_progress';
    }
    showToast(`${asst.name} ลงชื่อเริ่มสอนเวลา ${timeStr} เรียบร้อยแล้ว`);
    triggerTelegramPush(`${asst.name} ลงชื่อเข้าสอนในสนาม เวลา ${timeStr}`, 'Assistant Coach Duty Check-in');
  } else if (action === 'end') {
    if (!todayLog) {
      todayLog = {
        id: 'duty_' + Date.now(),
        dateKey: todayKey,
        dateStr: dateStr,
        startTime: timeStr,
        endTime: timeStr,
        status: 'completed',
        className: 'คลาสซ้อม DBO Academy'
      };
      asst.workLogs.unshift(todayLog);
    } else {
      todayLog.endTime = timeStr;
      todayLog.status = 'completed';
    }
    showToast(`บันทึกสิ้นสุดการสอนเวลา ${timeStr} เรียบร้อยแล้ว`);
    triggerTelegramPush(`${asst.name} บันทึกสิ้นสุดการสอน เวลา ${timeStr}`, 'Assistant Coach Duty Completed');
  }

  asst.updatedAt = Date.now();
  saveState(true, `ผู้ช่วยโค้ช ${asst.name} บันทึกเวลาสอน`);
  updateCoachStateUI();
}

function openAssistantCoachModal() {
  const asst1 = assistantCoaches[0] || { name: 'ผู้ช่วยโค้ชคนที่ 1', phone: '0900000001', workLogs: [] };
  const asst2 = assistantCoaches[1] || { name: 'ผู้ช่วยโค้ชคนที่ 2', phone: '0900000002', workLogs: [] };

  const n1 = document.getElementById('asstName1');
  const p1 = document.getElementById('asstPhone1');
  const n2 = document.getElementById('asstName2');
  const p2 = document.getElementById('asstPhone2');
  if (n1) n1.value = asst1.name;
  if (p1) p1.value = asst1.phone;
  if (n2) n2.value = asst2.name;
  if (p2) p2.value = asst2.phone;

  const count1 = (asst1.workLogs || []).length;
  const count2 = (asst2.workLogs || []).length;

  const b1 = document.getElementById('asstSummary1Badge');
  const b2 = document.getElementById('asstSummary2Badge');
  if (b1) b1.innerText = `สอนไปแล้ว ${count1} ครั้ง`;
  if (b2) b2.innerText = `สอนไปแล้ว ${count2} ครั้ง`;

  const prev1 = document.getElementById('asstLog1Preview');
  if (prev1) {
    if (count1 === 0) prev1.innerHTML = 'ยังไม่มีประวัติการลงชื่อเข้าสอนในรอบเดือนนี้';
    else prev1.innerHTML = asst1.workLogs.slice(0, 4).map(l => `<div class="py-0.5">• ${l.dateStr}: ${l.startTime} - ${l.endTime || 'กำลังสอน'} (${l.status === 'completed' ? 'สิ้นสุดการสอน' : 'กำลังสอน'})</div>`).join('');
  }

  const prev2 = document.getElementById('asstLog2Preview');
  if (prev2) {
    if (count2 === 0) prev2.innerHTML = 'ยังไม่มีประวัติการลงชื่อเข้าสอนในรอบเดือนนี้';
    else prev2.innerHTML = asst2.workLogs.slice(0, 4).map(l => `<div class="py-0.5">• ${l.dateStr}: ${l.startTime} - ${l.endTime || 'กำลังสอน'} (${l.status === 'completed' ? 'สิ้นสุดการสอน' : 'กำลังสอน'})</div>`).join('');
  }

  document.getElementById('assistantCoachModal').classList.remove('hidden');
  lucide.createIcons();
}

function closeAssistantCoachModal() {
  document.getElementById('assistantCoachModal').classList.add('hidden');
}

function saveAssistantCoachesData() {
  const n1 = (document.getElementById('asstName1').value || '').trim() || 'ผู้ช่วยโค้ชคนที่ 1';
  const p1 = (document.getElementById('asstPhone1').value || '').trim();
  const n2 = (document.getElementById('asstName2').value || '').trim() || 'ผู้ช่วยโค้ชคนที่ 2';
  const p2 = (document.getElementById('asstPhone2').value || '').trim();

  if (!assistantCoaches[0]) assistantCoaches[0] = { id: 'asst_1', role: 'ผู้ช่วยโค้ช', workLogs: [] };
  if (!assistantCoaches[1]) assistantCoaches[1] = { id: 'asst_2', role: 'ผู้ช่วยโค้ช', workLogs: [] };

  assistantCoaches[0].name = n1;
  assistantCoaches[0].phone = p1;
  assistantCoaches[0].updatedAt = Date.now();
  assistantCoaches[1].name = n2;
  assistantCoaches[1].phone = p2;
  assistantCoaches[1].updatedAt = Date.now();

  saveState(true, 'อัปเดตข้อมูลผู้ช่วยโค้ช');
  closeAssistantCoachModal();
  showToast('บันทึกข้อมูลเบอร์ผู้ช่วยโค้ชเรียบร้อยแล้ว');
}
