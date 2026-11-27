// ========================================================
// DBO Basketball Academy - Parent Portal & Registration
// (Dashboard, Sports Metrics, Child Stats, RSVP, Account Linking, Course Application)
// ========================================================

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMeasurementHistory(history, currentValue, element) {
  if (!element) return;
  if (currentValue === null) {
    element.textContent = 'รอผลทดสอบ';
    return;
  }
  const byDate = new Map();
  for (const measurement of history || []) {
    const value = Number(measurement?.val);
    if (isAttendanceDateKey(measurement?.dateKey) && value > 0) byDate.set(measurement.dateKey, value);
  }
  const dated = [...byDate].sort(([a], [b]) => a.localeCompare(b)).slice(-3);
  if (dated.length < 2) {
    element.textContent = 'ล่าสุด ' + currentValue + ' ซม.';
    return;
  }
  const format = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', timeZone: 'Asia/Bangkok' });
  element.textContent = dated.map(([dateKey, value]) => format.format(new Date(dateKey + 'T12:00:00Z')) + ' · ' + value + ' ซม.').join(' → ');
}

function renderParentView(matchedList) {
  const loginBox = document.getElementById('parent-login-box');
  const dashBox = document.getElementById('parent-dashboard');
  const coachPortalBox = document.getElementById('coach-active-portal-box');
  const renewNav = document.getElementById('nav-renew-payment');
  const renewMNav = document.getElementById('nav-m-renew-payment');
  const dailyNav = document.getElementById('nav-daily-attendance');
  const dailyMNav = document.getElementById('nav-m-daily-attendance');
  const regNav = document.getElementById('nav-register-new');
  const regMNav = document.getElementById('nav-m-register-new');
  const calNav = document.getElementById('nav-calendar');
  const calMNav = document.getElementById('nav-m-calendar');

  const renewGate = document.getElementById('renew-locked-gate');
  const renewContent = document.getElementById('renew-content');

  const mPortalLabel = document.querySelector('#nav-m-parent-portal span');
  const mPortalIcon = document.querySelector('#nav-m-parent-portal i');

  // State 1: Coach Logged In
  if (isCoachAuth && currentStaff) {
    if (loginBox) loginBox.classList.add('hidden');
    if (dashBox) dashBox.classList.add('hidden');
    if (coachPortalBox) {
      coachPortalBox.classList.remove('hidden');
      document.getElementById('staffHomeDate').textContent = new Intl.DateTimeFormat('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
      const nameEl = document.getElementById('coachPortalStaffName');
      if (nameEl) nameEl.innerText = `${currentStaff.fullName} (${currentStaff.role})`;
    }

    if (mPortalLabel) mPortalLabel.innerText = 'หน้าหลัก';
    if (mPortalIcon) mPortalIcon.setAttribute('data-lucide', 'home');

    if (renewNav) renewNav.classList.add('hidden');
    if (renewMNav) renewMNav.classList.add('hidden');
    if (dailyNav) dailyNav.classList.remove('hidden');
    if (dailyMNav) dailyMNav.classList.remove('hidden');
    if (calNav) calNav.classList.remove('hidden');
    if (calMNav) calMNav.classList.remove('hidden');
    if (regNav) regNav.classList.remove('hidden');
    if (regMNav) regMNav.classList.remove('hidden');

    lucide.createIcons();
    return;
  }

  // State 2: Not Logged In
  if (!loggedInStudent) {
    if (loginBox) loginBox.classList.remove('hidden');
    if (dashBox) dashBox.classList.add('hidden');
    if (coachPortalBox) coachPortalBox.classList.add('hidden');

    if (mPortalLabel) mPortalLabel.innerText = 'เข้าสู่ระบบ';
    if (mPortalIcon) mPortalIcon.setAttribute('data-lucide', 'user');

    if (renewNav) renewNav.classList.add('hidden');
    if (renewMNav) renewMNav.classList.add('hidden');
    if (dailyNav) dailyNav.classList.remove('hidden');
    if (dailyMNav) dailyMNav.classList.remove('hidden');
    if (calNav) calNav.classList.remove('hidden');
    if (calMNav) calMNav.classList.remove('hidden');
    if (regNav) regNav.classList.remove('hidden');
    if (regMNav) regMNav.classList.remove('hidden');

    if (renewGate) renewGate.classList.remove('hidden');
    if (renewContent) renewContent.classList.add('hidden');
    lucide.createIcons();
    return;
  }

  // State 3: Parent Logged In
  if (loginBox) loginBox.classList.add('hidden');
  if (coachPortalBox) coachPortalBox.classList.add('hidden');
  if (dashBox) dashBox.classList.remove('hidden');

  if (mPortalLabel) mPortalLabel.innerText = `น้อง${loggedInStudent.name}`;
  if (mPortalIcon) mPortalIcon.setAttribute('data-lucide', 'user');

  if (renewNav) renewNav.classList.remove('hidden');
  if (renewMNav) renewMNav.classList.remove('hidden');
  if (dailyNav) dailyNav.classList.remove('hidden');
  if (dailyMNav) dailyMNav.classList.remove('hidden');
  if (calNav) calNav.classList.remove('hidden');
  if (calMNav) calMNav.classList.remove('hidden');
  if (regNav) regNav.classList.remove('hidden');
  if (regMNav) regMNav.classList.remove('hidden');

  if (renewGate) renewGate.classList.add('hidden');
  if (renewContent) renewContent.classList.remove('hidden');

  // Populate Student Details
  document.getElementById('dash-avatar').innerText = loggedInStudent.name.charAt(0);
  document.getElementById('dash-student-name').innerText = `น้อง ${loggedInStudent.name}`;
  document.getElementById('dash-student-id').innerText = `ID: #${loggedInStudent.id}`;
  document.getElementById('dash-parent-phone').innerText = loggedInStudent.phone;

  // Hero Widget Name & Description
  const heroNameEl = document.getElementById('hero-student-name');
  const heroDescEl = document.getElementById('hero-course-desc');
  if (heroNameEl) heroNameEl.innerText = `น้อง ${loggedInStudent.name}`;
  if (heroDescEl) {
    if (loggedInStudent.courseType === 'monthly') heroDescEl.innerText = 'แพ็กเกจรายเดือนสม่ำเสมอ (ซ้อม 2 วัน/สัปดาห์) • สนามเตชะวิทย์';
    else if (loggedInStudent.courseType === 'saturday') heroDescEl.innerText = 'คอร์สวันเสาร์ 4 ครั้ง Coach Oat (16:00-17:30 น.) • สนามเตชะวิทย์';
    else heroDescEl.innerText = 'คอร์สปกติ 10 ครั้ง (จ./อ./พฤ. 17:30-19:30 น.) • สนามเตชะวิทย์';
  }

  // Sibling Bar & Shared Course Handler
  const sibBox = document.getElementById('siblingSelectorBox');
  const sibSelect = document.getElementById('siblingSelect');
  const sibBadge = document.getElementById('dash-sibling-badge');
  const sibSharedNotice = document.getElementById('siblingSharedQuotaNotice');
  const sibSharedDesc = document.getElementById('siblingSharedDesc');
  const sibQuickPills = document.getElementById('siblingQuickPills');

  const familySiblings = getLinkedStudents(loggedInStudent);

  if (familySiblings.length > 1) {
    if (sibBox) sibBox.classList.remove('hidden');
    if (sibSelect) {
      sibSelect.innerHTML = familySiblings.map(s => `
        <option value="${s.id}" ${s.id === loggedInStudent.id ? 'selected' : ''}>น้อง ${escapeHtml(s.name)} (${s.remaining !== undefined ? s.remaining : 0} ครั้ง)</option>
      `).join('');
    }

    if (sibBadge) {
      sibBadge.classList.remove('hidden');
      sibBadge.textContent = `พี่น้อง ${familySiblings.length} คน`;
    }

    if (sibSharedDesc) sibSharedDesc.textContent = 'แตะชื่อเพื่อสลับดูข้อมูล';
    if (sibQuickPills) {
      sibQuickPills.innerHTML = familySiblings.map(s => {
        const isCurrent = s.id === loggedInStudent.id;
        const remCount = s.remaining !== undefined ? s.remaining : 0;
        return `
          <button type="button" onclick="switchSibling(${s.id})" aria-pressed="${isCurrent}" class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isCurrent ? 'bg-nike-ink text-white ring-2 ring-dbo-gold shadow-2xs' : 'bg-nike-cloud border border-nike-hairlineSoft text-nike-ink hover:bg-purple-100/70'}">
            <span class="flex items-center gap-2 min-w-0">
              <span class="w-5 h-5 rounded-full ${isCurrent ? 'bg-dbo-gold text-nike-ink' : 'bg-white text-nike-ink border border-nike-hairlineSoft'} flex items-center justify-center text-[10px] font-extrabold flex-shrink-0">${escapeHtml(s.name.charAt(0))}</span>
              <span class="truncate">น้อง ${escapeHtml(s.name)}</span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono ${isCurrent ? 'bg-white/15 text-dbo-gold' : 'bg-white text-nike-mute border border-nike-hairlineSoft'} flex-shrink-0">${remCount} ครั้ง</span>
          </button>
        `;
      }).join('');
    }
  } else {
    if (sibBox) sibBox.classList.add('hidden');
    if (sibBadge) sibBadge.classList.add('hidden');
    if (sibSharedNotice) sibSharedNotice.classList.add('hidden');
  }

  // Dynamic Class Day Status Banner
  try {
    const nowD = new Date(getTodayDateKey() + 'T12:00:00Z');
    const dayW = nowD.getUTCDay();
    const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const thaiYear = nowD.getUTCFullYear() + 543;
    const formattedDate = `${thaiDays[dayW]}ที่ ${nowD.getUTCDate()} ${thaiMonths[nowD.getUTCMonth()]} ${thaiYear}`;

    const pDateLabel = document.getElementById('parentTodayDateLabel');
    const headingEl = document.getElementById('parentClassStatusHeading');
    const dotEl = document.getElementById('parentClassDot');
    const normalActions = document.getElementById('hasNormalClassActions');
    const noClassBox = document.getElementById('noClassNoticeBox');

    const todayKey = (typeof getTodayDateKey === 'function') ? getTodayDateKey() : '';
    const todayOverride = (typeof calendarDayOverrides !== 'undefined' && calendarDayOverrides[todayKey]) ? calendarDayOverrides[todayKey] : null;

    let scheduleNote = '';
    if (todayOverride && todayOverride.status === 'canceled') {
      const cancelReason = todayOverride.reason ? ` (${todayOverride.reason})` : '';
      scheduleNote = `🚫 วันนี้งดคลาสการฝึกซ้อม${cancelReason}`;
      if (headingEl) headingEl.innerText = '⚠️ วันนี้งดคลาสฝึกซ้อม (DBO Academy)';
      if (dotEl) dotEl.className = 'w-2.5 h-2.5 rounded-full bg-rose-500';
      if (normalActions) normalActions.classList.add('hidden');
      if (noClassBox) {
        noClassBox.classList.remove('hidden');
        noClassBox.innerHTML = `
          <div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5">
            <span class="font-bold flex items-center gap-1.5 text-rose-700">
              <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-600"></i>
              <span>วันนี้นัดงดคลาสการฝึกซ้อม</span>
            </span>
            <p class="leading-relaxed">${todayOverride.reason ? 'เหตุผล: ' + escapeHtml(todayOverride.reason) : 'ทางอคาเดมี่ของดการฝึกซ้อมในวันนี้ ผู้ปกครองไม่ต้องแจ้งลาครับ ขอบคุณครับ'}</p>
          </div>
        `;
      }
    } else if (todayOverride && todayOverride.status === 'normal') {
      scheduleNote = 'คลาสปกติ 17:30 - 19:30 น. ณ ยิมเตชะวิทย์ (โค้ชยืนยันเปิดซ้อม)';
      if (headingEl) headingEl.innerText = 'คลาสฝึกซ้อมประจำวัน (ยืนยันเปิดซ้อม)';
      if (dotEl) dotEl.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
      if (normalActions) normalActions.classList.remove('hidden');
      if (noClassBox) noClassBox.classList.add('hidden');
    } else if (dayW === 1 || dayW === 2 || dayW === 4) {
      scheduleNote = 'คลาสปกติ 17:30 - 19:30 น. ณ ยิมเตชะวิทย์';
      if (headingEl) headingEl.innerText = 'คลาสฝึกซ้อมประจำวัน (เปิดซ้อมปกติ)';
      if (dotEl) dotEl.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
      if (normalActions) normalActions.classList.remove('hidden');
      if (noClassBox) noClassBox.classList.add('hidden');
    } else if (dayW === 6) {
      scheduleNote = 'คลาสวันเสาร์ Basic Coach Oat 16:00 - 17:30 น. ณ ยิมเตชะวิทย์';
      if (headingEl) headingEl.innerText = 'คลาสวันเสาร์ Coach Oat (เปิดซ้อมปกติ)';
      if (dotEl) dotEl.className = 'w-2.5 h-2.5 rounded-full bg-indigo-600';
      if (normalActions) normalActions.classList.remove('hidden');
      if (noClassBox) noClassBox.classList.add('hidden');
    } else {
      scheduleNote = 'วันนี้ไม่มีคลาส';
      if (headingEl) headingEl.innerText = 'วันนี้ไม่มีคลาส';
      if (dotEl) dotEl.className = 'w-2.5 h-2.5 rounded-full bg-slate-400';
      if (normalActions) normalActions.classList.add('hidden');
      if (noClassBox) noClassBox.classList.remove('hidden');
    }

    if (pDateLabel) pDateLabel.innerText = `${formattedDate} • ${scheduleNote}`;
  } catch (e) {
    console.log('Calendar banner err:', e);
  }

  // Next Class Highlights
  try {
    const nextTitleEl = document.getElementById('dash-next-class-title');
    const nextTopicEl = document.getElementById('dash-next-class-topic');
    const dayW = new Date().getDay();
    if (dayW === 1) {
      if (nextTitleEl) nextTitleEl.innerText = 'อังคารนี้ (17:30 - 19:30 น.)';
      if (nextTopicEl) nextTopicEl.innerText = 'Passing Vision & Basketball IQ (โค้ชโอ๊ค & โค้ชโอ๊ต)';
    } else if (dayW === 2 || dayW === 3) {
      if (nextTitleEl) nextTitleEl.innerText = 'พฤหัสบดีนี้ (17:30 - 19:30 น.)';
      if (nextTopicEl) nextTopicEl.innerText = 'Shooting Mechanics & Game Simulation (โค้ชโอ๊ต & โค้ชโอ๊ค)';
    } else if (dayW === 4 || dayW === 5) {
      if (nextTitleEl) nextTitleEl.innerText = 'เสาร์นี้ (16:00 - 17:30 น.)';
      if (nextTopicEl) nextTopicEl.innerText = 'Basic Coach Oat (Agility & Coordination)';
    } else {
      if (nextTitleEl) nextTitleEl.innerText = 'จันทร์หน้า (17:30 - 19:30 น.)';
      if (nextTopicEl) nextTopicEl.innerText = 'Fundamental Dribbling & Movement (โค้ชโอ๊ต & โค้ชโอ๊ค)';
    }
  } catch (e) {}

  // Coach Remarks
  const oatRemarkEl = document.getElementById('dash-coach-oat-remark');
  const oakRemarkEl = document.getElementById('dash-coach-oak-remark');
  if (oatRemarkEl) {
    oatRemarkEl.innerHTML = (loggedInStudent.remarkOat && loggedInStudent.remarkOat.trim()) 
      ? escapeHtml(loggedInStudent.remarkOat)
      : '<span class="text-slate-400 italic">อยู่ระหว่างการประเมินพัฒนาการโดยโค้ชโอ๊ต</span>';
  }
  if (oakRemarkEl) {
    oakRemarkEl.innerHTML = (loggedInStudent.remarkOak && loggedInStudent.remarkOak.trim()) 
      ? escapeHtml(loggedInStudent.remarkOak)
      : '<span class="text-slate-400 italic">อยู่ระหว่างการประเมินพัฒนาการโดยโค้ชโอ๊ค</span>';
  }

  // Sports Science Metrics
  const vJumpVal = (loggedInStudent.vJump && Number(loggedInStudent.vJump) > 0) ? Number(loggedInStudent.vJump) : null;
  const longJumpVal = (loggedInStudent.longJump && Number(loggedInStudent.longJump) > 0) ? Number(loggedInStudent.longJump) : null;

  const vJumpEl = document.getElementById('dash-vjump-val');
  const vJumpBar = document.getElementById('dash-vjump-bar');
  const vJumpHistEl = document.getElementById('dash-vjump-history');
  const vJumpDiff = document.getElementById('dash-vjump-diff');

  if (vJumpEl) vJumpEl.innerText = vJumpVal !== null ? vJumpVal : '-';
  if (vJumpBar) vJumpBar.style.width = vJumpVal !== null ? Math.min(100, Math.round((vJumpVal / 60) * 100)) + '%' : '0%';
  renderMeasurementHistory(loggedInStudent.vJumpHistory, vJumpVal, vJumpHistEl);
  if (vJumpDiff) {
    vJumpDiff.innerText = vJumpVal !== null ? `${vJumpVal} ซม.` : 'รอทดสอบ';
  }

  const longJumpEl = document.getElementById('dash-longjump-val');
  const longJumpBar = document.getElementById('dash-longjump-bar');
  const longJumpHistEl = document.getElementById('dash-longjump-history');
  const longJumpDiff = document.getElementById('dash-longjump-diff');

  if (longJumpEl) longJumpEl.innerText = longJumpVal !== null ? longJumpVal : '-';
  if (longJumpBar) longJumpBar.style.width = longJumpVal !== null ? Math.min(100, Math.round((longJumpVal / 220) * 100)) + '%' : '0%';
  renderMeasurementHistory(loggedInStudent.longJumpHistory, longJumpVal, longJumpHistEl);
  if (longJumpDiff) {
    longJumpDiff.innerText = longJumpVal !== null ? `${longJumpVal} ซม.` : 'รอทดสอบ';
  }

  renderParentClassmatesList();

  // Course Type Badge
  const typeBadge = document.getElementById('dash-student-type');
  const maxQuotaEl = document.getElementById('dash-max-quota');
  const periodEl = document.getElementById('dash-course-period');

  if (loggedInStudent.courseType === 'monthly') {
    const mStatus = getMonthlyCycleStatus(loggedInStudent);
    typeBadge.innerText = 'แพ็กเกจรายเดือน (2 วัน/สัปดาห์)';
    typeBadge.className = 'px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
    maxQuotaEl.innerText = `วัน (ตัดรอบ ${mStatus.cutoffThaiShort})`;
    periodEl.innerText = `เริ่มรอบ ${mStatus.startThaiShort} • ตัดรอบถัดไป ${mStatus.cutoffThaiFull}`;
  } else if (loggedInStudent.courseType === 'saturday') {
    typeBadge.innerText = 'คอร์สวันเสาร์ 4 ครั้ง (Coach Oat)';
    typeBadge.className = 'px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300';
    maxQuotaEl.innerText = '/ 4 ครั้ง';
    periodEl.innerText = 'ไม่มีวันตัดรอบ • เรียนให้ครบจำนวนครั้ง (เสาร์ 16:00-17:30 น.)';
  } else if (loggedInStudent.courseType === 'both') {
    typeBadge.innerText = 'คอร์สปกติ 10 ครั้ง + วันเสาร์';
    typeBadge.className = 'px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300';
    maxQuotaEl.innerText = '/ 10 ครั้ง';
    periodEl.innerText = 'ไม่มีวันตัดรอบ • เรียนให้ครบตามจำนวนครั้ง';
  } else {
    typeBadge.innerText = 'คอร์สปกติ 10 ครั้ง';
    typeBadge.className = 'px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300';
    maxQuotaEl.innerText = '/ 10 ครั้ง';
    periodEl.innerText = 'ไม่มีวันตัดรอบ • เรียนให้ครบจำนวนครั้ง (จ./อ./พฤ.)';
  }

  document.getElementById('renewingStudentName').innerText = `น้อง ${loggedInStudent.name}`;
  document.getElementById('renewingStudentPhone').innerText = loggedInStudent.phone;
  document.getElementById('slipStudentName').value = loggedInStudent.name;

  // Remaining Quota & Dynamic Progress Percentage (Matches exact student quota or monthly cutoff)
  const isSaturday = loggedInStudent.courseType === 'saturday';
  const rem = isSaturday
    ? (loggedInStudent.saturdayRemaining !== undefined ? loggedInStudent.saturdayRemaining : (loggedInStudent.remaining || 0))
    : (loggedInStudent.remaining !== undefined ? loggedInStudent.remaining : 0);
  const totalQuota = isSaturday ? 4 : 10;

  const remNumEl = document.getElementById('dash-remaining-number');
  const badgeStatusEl = document.getElementById('dash-badge-status');
  const progBarEl = document.getElementById('dash-progress-bar');
  const progPctEl = document.getElementById('dash-progress-pct');
  const renewNoticeEl = document.getElementById('dash-renew-notice');

  if (loggedInStudent.courseType === 'monthly') {
    const mStatus = getMonthlyCycleStatus(loggedInStudent);
    const daysDisplay = Math.max(0, mStatus.daysLeft);
    const monthPct = mStatus.isDue ? 0 : Math.max(5, Math.min(100, Math.round((daysDisplay / 30) * 100)));

    if (progPctEl) progPctEl.innerText = `${monthPct}%`;
    if (!mStatus.isDue) {
      if (remNumEl) {
        remNumEl.innerText = daysDisplay;
        remNumEl.className = 'text-4xl sm:text-5xl font-black text-nike-ink font-mono tracking-tight';
      }
      if (badgeStatusEl) {
        badgeStatusEl.innerText = 'อยู่ในรอบรายเดือน';
        badgeStatusEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-[#007D48]/10 text-[#007D48] border border-[#007D48]/20';
      }
      if (progBarEl) {
        progBarEl.style.width = monthPct + '%';
        progBarEl.className = 'h-2 rounded-full bg-[#007D48] transition-all duration-500';
      }
      if (renewNoticeEl) {
        renewNoticeEl.innerText = `ตัดรอบวันที่ ${mStatus.cutoffThaiFull} (จะแจ้งเตือนเมื่อถึงวันตัดรอบ)`;
      }
    } else {
      if (remNumEl) {
        remNumEl.innerText = 0;
        remNumEl.className = 'text-4xl sm:text-5xl font-black text-[#D30005] font-mono tracking-tight';
      }
      if (badgeStatusEl) {
        badgeStatusEl.innerText = 'ครบกำหนดตัดรอบ';
        badgeStatusEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-[#D30005]/10 text-[#D30005] border border-[#D30005]/20';
      }
      if (progBarEl) {
        progBarEl.style.width = '0%';
        progBarEl.className = 'h-2 rounded-full bg-[#D30005] transition-all duration-500';
      }
      if (renewNoticeEl) {
        renewNoticeEl.innerText = `ครบรอบตัดยอดวันที่ ${mStatus.cutoffThaiFull} แล้ว กรุณาสมัครต่อรอบใหม่`;
      }
    }
  } else {
    const calcPct = Math.max(0, Math.min(100, Math.round((rem / totalQuota) * 100)));

    if (progPctEl) {
      progPctEl.innerText = `${calcPct}%`;
    }

    if (rem > 3) {
      if (remNumEl) {
        remNumEl.innerText = rem;
        remNumEl.className = 'text-4xl sm:text-5xl font-black text-nike-ink font-mono tracking-tight';
      }
      if (badgeStatusEl) {
        badgeStatusEl.innerText = 'พร้อมเรียน';
        badgeStatusEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-[#007D48]/10 text-[#007D48] border border-[#007D48]/20';
      }
      if (progBarEl) {
        progBarEl.style.width = calcPct + '%';
        progBarEl.className = 'h-2 rounded-full bg-[#007D48] transition-all duration-500';
      }
      if (renewNoticeEl) renewNoticeEl.innerText = `เหลือ ${rem} ครั้ง (ไม่มีวันตัดรอบ)`;
    } else if (rem >= 1 && rem <= 3) {
      if (remNumEl) {
        remNumEl.innerText = rem;
        remNumEl.className = 'text-4xl sm:text-5xl font-black text-amber-700 font-mono tracking-tight';
      }
      if (badgeStatusEl) {
        badgeStatusEl.innerText = rem === 1 ? 'เหลือ 1 ครั้ง' : 'ใกล้หมด';
        badgeStatusEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300';
      }
      if (progBarEl) {
        progBarEl.style.width = calcPct + '%';
        progBarEl.className = 'h-2 rounded-full bg-amber-500 transition-all duration-500';
      }
      if (renewNoticeEl) renewNoticeEl.innerText = `เหลือ ${rem} ครั้ง แนะนำต่อคอร์สใหม่เมื่อเรียนครบ`;
    } else {
      if (remNumEl) {
        remNumEl.innerText = rem;
        remNumEl.className = 'text-4xl sm:text-5xl font-black text-[#D30005] font-mono tracking-tight';
      }
      if (badgeStatusEl) {
        badgeStatusEl.innerText = rem === 0 ? 'หมดสิทธิ์' : `เกินสิทธิ์ (${Math.abs(rem)} ครั้ง)`;
        badgeStatusEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-[#D30005]/10 text-[#D30005] border border-[#D30005]/20';
      }
      if (progBarEl) {
        progBarEl.style.width = '0%';
        progBarEl.className = 'h-2 rounded-full bg-[#D30005] transition-all duration-500';
      }
      if (progPctEl) {
        progPctEl.innerText = '0%';
      }
      if (renewNoticeEl) renewNoticeEl.innerText = 'เรียนครบจำนวนครั้งแล้ว กรุณาต่อคอร์สใหม่';
    }
  }

  const historyTbody = document.getElementById('dash-history-tbody');
  const student = loggedInStudent;
  const history = new Map();
  for (const [dateKey, records] of Object.entries(dailyAttendance)) {
    const entry = records?.[student.id];
    if (!isAttendanceDateKey(dateKey) || !entry || !['attending', 'leave'].includes(entry.status)) continue;
    history.set(dateKey, { ...entry, deduction: entry.status === 'attending' && entry.updatedBy && entry.updatedBy !== 'parent' ? 1 : 0 });
  }
  const legacyDates = { '5/11/26': '2026-11-05', '3/11/26': '2026-11-03', '1/11/26': '2026-11-01', '29/10': '2026-10-29' };
  for (const [key, mark] of Object.entries(student.records || {})) {
    const dateKey = legacyDates[key] || key;
    if (!isAttendanceDateKey(dateKey) || history.has(dateKey) || !['/', '//', 'ลา'].includes(mark)) continue;
    history.set(dateKey, { status: mark === 'ลา' ? 'leave' : 'attending', deduction: mark === '//' ? 2 : mark === '/' ? 1 : 0 });
  }

  const dateFormat = new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'medium' });
  const dates = [...history.keys()].sort((a, b) => b.localeCompare(a));
  historyTbody.innerHTML = dates.map(dateKey => {
    const entry = history.get(dateKey);
    const date = new Date(dateKey + 'T12:00:00Z');
    const training = getTrainingDay(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const label = entry.status === 'leave' ? 'แจ้งลา' : entry.updatedBy === 'parent' ? 'ยืนยันมาเรียน' : 'มาเรียน';
    return `<tr>
      <td data-label="วันที่ฝึกซ้อม" class="px-3 py-2">${dateFormat.format(date)}</td>
      <td data-label="คลาส" class="px-3 py-2">${escapeHtml(entry.slot || training.title || 'รอบซ้อม')}</td>
      <td data-label="สถานะ" class="px-3 py-2">${label}</td>
      <td data-label="ตัดโควต้า" class="px-3 py-2">${entry.deduction ? '−' + entry.deduction + ' ครั้ง' : '0'}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="4" class="px-3 py-4 text-nike-mute">ยังไม่มีประวัติเข้าเรียน</td></tr>';
  const latest = document.getElementById('dash-latest-practice');
  const latestDate = dates.find(dateKey => dateKey <= getTodayDateKey() && history.get(dateKey).status === 'attending' && history.get(dateKey).updatedBy !== 'parent');
  const advice = document.getElementById('dash-coach-advice');
  if (advice) {
    const remarks = [loggedInStudent.remarkOat, loggedInStudent.remarkOak].filter(remark => typeof remark === 'string' && remark.trim());
    advice.hidden = !remarks.length;
    advice.querySelector('p').textContent = remarks.join(' · ');
  }
  if (latest) latest.textContent = latestDate ? 'ซ้อมล่าสุด ' + dateFormat.format(new Date(latestDate + 'T12:00:00Z')) : 'ยังไม่มีบันทึกการซ้อม';
  updateParentTodayStatusUI();
  renderLivePeers();
  switchParentCategory(activeParentCategory);
  lucide.createIcons();
}

let activeParentCategory = 'history';

function switchParentCategory(category) {
  activeParentCategory = category || 'history';
  const categories = ['history', 'growth', 'classmates', 'schedule'];
  categories.forEach(cat => {
    const btn = document.getElementById(`pcat-btn-${cat}`);
    const panel = document.getElementById(`parentCatPanel-${cat}`);
    if (cat === activeParentCategory) {
      if (btn) {
        btn.className = 'pcat-pill active flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-nike-ink text-white transition-all cursor-pointer flex-shrink-0 active:scale-95 shadow-none';
      }
      if (panel) panel.classList.remove('hidden');
    } else {
      if (btn) {
        btn.className = 'pcat-pill inactive flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-nike-cloud hover:bg-neutral-200 text-nike-ink border border-nike-hairlineSoft transition-all cursor-pointer flex-shrink-0 active:scale-95';
      }
      if (panel) panel.classList.add('hidden');
    }
  });

  if (activeParentCategory === 'classmates' && typeof renderParentClassmatesList === 'function') {
    renderParentClassmatesList();
  }
  lucide.createIcons();
}

function renderLivePeers() {
  const peerContainer = document.getElementById('todayPeerList');
  if (!peerContainer) return;
  peerContainer.innerHTML = '';

  const todayKey = getTodayDateKey();
  const records = dailyAttendance[todayKey] || {};
  const attending = students.filter(st => records[st.id] && records[st.id].status === 'attending');

  if (attending.length === 0) {
    peerContainer.innerHTML = '<span class="text-xs text-slate-400 italic py-1">ยังไม่มีเพื่อนร่วมชั้นแจ้งลงชื่อเข้าเรียนในวันนี้ (จะแสดงรายชื่ออัตโนมัติเมื่อมีผู้ปกครองแจ้งลงชื่อหรือโค้ชเช็คชื่อ)</span>';
    return;
  }

  attending.forEach(p => {
    const span = document.createElement('span');
    span.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200";
    span.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> น้อง ${p.name}`;
    peerContainer.appendChild(span);
  });
}

function openRsvpModal(dateKey = getTodayDateKey()) {
  const modal = document.getElementById('rsvpModal');
  document.getElementById('rsvpDateInput').value = dateKey;
  modal.classList.remove('hidden');
}
function closeRsvpModal() { document.getElementById('rsvpModal').classList.add('hidden'); }

function handleRsvpSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('rsvpDateInput').value;
  const slot = document.getElementById('rsvpTimeSlot').value;
  if (!setTodayAttendanceFromParent('attending', '', date, slot)) {
    if (!loggedInStudent) closeRsvpModal();
    return;
  }
  closeRsvpModal();
  showToast(`แจ้งเข้าเรียนวันที่ ${date} (${slot}) ให้ทีมโค้ชทราบเรียบร้อยครับ`);
}

function openLeaveModal(dateKey = getTodayDateKey()) {
  const modal = document.getElementById('leaveModal');
  document.getElementById('leaveDateInput').value = dateKey;
  modal.classList.remove('hidden');
}
function closeLeaveModal() { document.getElementById('leaveModal').classList.add('hidden'); }

function handleLeaveSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('leaveDateInput').value;
  const reason = document.getElementById('leaveReasonInput').value || 'แจ้งลาเรียน';
  if (!setTodayAttendanceFromParent('leave', reason, date)) {
    if (!loggedInStudent) closeLeaveModal();
    return;
  }
  closeLeaveModal();
  showToast(`บันทึกการลาวันที่ ${date} (${reason}) เรียบร้อย โดยไม่ตัดโควต้าครับ`);
}

function setTodayAttendanceFromParent(status, leaveReason = '', dateKey = getTodayDateKey(), slot = '') {
  if (!loggedInStudent) {
    showToast('กรุณาเข้าสู่ระบบก่อนแจ้งสถานะการเข้าเรียนครับ');
    switchTab('parent-portal');
    return;
  }

  if (!isAttendanceDateKey(dateKey)) {
    showToast('กรุณาเลือกวันที่ให้ถูกต้อง');
    return false;
  }
  if (!dailyAttendance[dateKey]) dailyAttendance[dateKey] = {};
  const existing = dailyAttendance[dateKey][loggedInStudent.id];
  if (existing && existing.updatedBy && existing.updatedBy !== 'parent') {
    showToast('โค้ชบันทึกสถานะของรอบนี้แล้ว');
    return false;
  }

  const nowTime = new Date().toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' }) + ' น.';

  dailyAttendance[dateKey][loggedInStudent.id] = {
    studentId: loggedInStudent.id,
    name: loggedInStudent.name,
    status,
    dateKey,
    slot,
    leaveReason: leaveReason || (status === 'leave' ? 'แจ้งลาเรียน' : ''),
    time: nowTime,
    updatedBy: 'parent',
    updatedAt: Date.now()
  };

  saveState(true, `ผู้ปกครองแจ้ง${status === 'attending' ? 'มาเรียน' : 'ลา'}: น้อง ${loggedInStudent.name}`, true);

  // Real-time broadcast to all coach devices via MQTT & BroadcastChannel
  const parentAttPayload = {
    senderId: window.dboClientId,
    type: 'PARENT_ATTENDANCE_EVENT',
    studentId: loggedInStudent.id,
    studentName: loggedInStudent.name,
    status: status,
    leaveReason: leaveReason || (status === 'leave' ? 'แจ้งลาเรียน' : ''),
    time: nowTime,
    dateKey,
    slot
  };

  if (typeof publishToMqttBrokers === 'function') {
    publishToMqttBrokers(REALTIME_SYNC_TOPIC, parentAttPayload);
  }
  if (window.dboRealtimeBC) {
    try {
      window.dboRealtimeBC.postMessage(parentAttPayload);
    } catch (e) {}
  }

  // Real Native Push to Coach Devices outside app
  if (typeof sendCloudWebPush === 'function') {
    sendCloudWebPush({
      targetRole: 'coach',
      title: status === 'attending' ? `🏀 น้อง ${loggedInStudent.name} แจ้งเข้าเรียน` : `📝 น้อง ${loggedInStudent.name} ขอลาเรียน`,
      body: status === 'attending' 
        ? `ผู้ปกครองแจ้งเข้าเรียนวันที่ ${dateKey} (${nowTime}) • น้อง ${loggedInStudent.name}`
        : `ผู้ปกครองแจ้งขอลาวันที่ ${dateKey}: ${leaveReason || 'ลาเรียน'} (${nowTime}) • น้อง ${loggedInStudent.name}`,
      tag: `parent-status-${loggedInStudent.id}-${Date.now()}`
    });
  }

  renderParentView();
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
  playNotificationChime();

  if (status === 'attending') {
    showToast(`ยืนยันเข้าเรียนวันที่ ${dateKey} ของน้อง ${loggedInStudent.name} เรียบร้อยแล้ว`);
    triggerTelegramPush(`น้อง ${loggedInStudent.name} ยืนยันเข้าเรียนวันที่ ${dateKey} (${nowTime})`, 'DBO Attendance Check-in');
  } else {
    showToast(`แจ้งลาเรียนของน้อง ${loggedInStudent.name} เรียบร้อย`);
    triggerTelegramPush(`น้อง ${loggedInStudent.name} แจ้งลาวันที่ ${dateKey}: ${leaveReason || 'ลาเรียน'}`, 'DBO Leave Notice');
  }
  return true;
}

function updateParentTodayStatusUI() {
  if (!loggedInStudent) return;
  const todayKey = getTodayDateKey();
  const record = dailyAttendance[todayKey] ? dailyAttendance[todayKey][loggedInStudent.id] : null;

  const badge = document.getElementById('parentTodayStatusBadge');
  if (!badge) return;

  if (!record || record.status === 'unchecked') {
    badge.className = 'px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5';
    badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> ยังไม่ได้ระบุสถานะ';
  } else if (record.status === 'attending') {
    badge.className = 'px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5';
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ยืนยันเข้าเรียนแล้ว (${record.time})`;
  } else if (record.status === 'leave') {
    badge.className = 'px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5';
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> แจ้งลา: ${record.leaveReason || 'ลาเรียน'} (${record.time})`;
  }
}

function renderParentClassmatesList() {
  const todayKey = getTodayDateKey();
  const records = dailyAttendance[todayKey] || {};

  const attendingListEl = document.getElementById('parentAttendingList');
  const leaveListEl = document.getElementById('parentLeaveList');
  const attendingCountEl = document.getElementById('parentAttendingCount');
  const leaveCountEl = document.getElementById('parentLeaveCount');

  if (!attendingListEl || !leaveListEl) return;

  const attending = [];
  const leave = [];

  students.forEach(st => {
    const att = records[st.id];
    if (att && att.status === 'attending') {
      attending.push({ ...st, time: att.time });
    } else if (att && att.status === 'leave') {
      leave.push({ ...st, reason: att.leaveReason, time: att.time });
    }
  });

  if (attendingCountEl) attendingCountEl.innerText = `${attending.length} คน`;
  if (leaveCountEl) leaveCountEl.innerText = `${leave.length} คน`;

  if (attending.length === 0) {
    attendingListEl.innerHTML = '<span class="text-[11px] text-slate-400 italic">ยังไม่มีเพื่อนลงทะเบียนวันนี้ (เป็นคนแรกได้เลย!)</span>';
  } else {
    attendingListEl.innerHTML = attending.map(st => `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white text-emerald-950 border border-emerald-300 shadow-2xs">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>น้อง ${st.name}</span>
        ${st.time ? `<span class="text-[10px] text-emerald-600 font-normal">(${st.time})</span>` : ''}
      </span>
    `).join('');
  }

  if (leave.length === 0) {
    leaveListEl.innerHTML = '<span class="text-[11px] text-slate-400 italic">ไม่มีเพื่อนแจ้งลาในรอบนี้</span>';
  } else {
    leaveListEl.innerHTML = leave.map(st => `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white text-amber-950 border border-amber-300 shadow-2xs">
        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
        <span>น้อง ${st.name}</span>
        <span class="text-[10px] text-amber-700 font-normal">(${st.reason || 'ลา'})</span>
      </span>
    `).join('');
  }
}

function openParentLinkModal(prefilledPhone = '') {
  populateLinkStudentDropdown();
  const phoneInput = document.getElementById('linkParentPhone');
  if (prefilledPhone && phoneInput) {
    phoneInput.value = prefilledPhone;
  }
  document.getElementById('parentLinkModal').classList.remove('hidden');
  lucide.createIcons();
}

function closeParentLinkModal() {
  document.getElementById('parentLinkModal').classList.add('hidden');
}

function populateLinkStudentDropdown() {
  const select = document.getElementById('linkStudentSelect');
  if (!select) return;
  select.innerHTML = '<option value="">-- แตะเพื่อเลือกชื่อน้อง --</option>';

  const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name, 'th'));
  sorted.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    const phoneLabel = s.phone ? '(ผูกเบอร์แล้ว)' : '(รอผูกเบอร์)';
    opt.innerText = `น้อง ${s.name} ${phoneLabel}`;
    select.appendChild(opt);
  });

  const otherOpt = document.createElement('option');
  otherOpt.value = 'other';
  otherOpt.innerText = '+ น้องยังไม่มีในรายชื่อ (พิมพ์ระบุเอง)';
  select.appendChild(otherOpt);
}

function handleLinkStudentChange(val) {
  const otherBox = document.getElementById('linkOtherStudentBox');
  const otherInput = document.getElementById('linkOtherStudentName');
  if (!otherBox || !otherInput) return;
  if (val === 'other') {
    otherBox.classList.remove('hidden');
    otherInput.required = true;
  } else {
    otherBox.classList.add('hidden');
    otherInput.required = false;
  }
}

function handleParentLinkSubmit(e) {
  e.preventDefault();
  const rawPhone = document.getElementById('linkParentPhone').value.replace(/[-\s]/g, '').trim();
  const parentName = document.getElementById('linkParentName').value.trim();
  const relation = document.getElementById('linkRelation').value;
  const selectVal = document.getElementById('linkStudentSelect').value;
  const otherName = document.getElementById('linkOtherStudentName').value.trim();
  const note = document.getElementById('linkNote').value.trim();

  if (!rawPhone || rawPhone.length < 9) {
    showToast('กรุณาระบุเบอร์โทรศัพท์มือถือที่ถูกต้อง (9-10 หลัก)');
    return;
  }

  if (AUTHORIZED_STAFF[rawPhone]) {
    showToast('เบอร์นี้เป็นเบอร์สำหรับทีมโค้ช/แอดมิน กรุณาล็อกอินที่หน้าหลักโดยตรง');
    closeParentLinkModal();
    return;
  }

  let studentId = null;
  let studentName = '';
  let matchedStudent = null;

  if (selectVal === 'other') {
    if (!otherName) {
      showToast('กรุณาระบุชื่อของน้องด้วยครับ');
      return;
    }
    studentName = otherName;
  } else {
    studentId = parseInt(selectVal, 10);
    const st = students.find(s => s.id === studentId);
    if (!st) {
      showToast('กรุณาเลือกชื่อน้องในรายชื่อครับ');
      return;
    }
    matchedStudent = st;
    studentName = st.name;
  }

  const nowTs = Date.now();
  const canAutoBind = matchedStudent && (!matchedStudent.phone || matchedStudent.phone.replace(/[^\d]/g, '') === rawPhone);

  const newReg = {
    id: 'reg-' + nowTs,
    phone: rawPhone,
    parentName: parentName,
    relation: relation,
    studentId: studentId,
    studentName: studentName,
    status: canAutoBind ? 'approved' : 'pending',
    note: note,
    updatedAt: nowTs,
    createdAt: new Date().toISOString(),
    createdDateStr: 'วันนี้ ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
  };

  if (canAutoBind) {
    matchedStudent.phone = rawPhone;
    matchedStudent.parentName = parentName;
    matchedStudent.parentRelation = relation;
    matchedStudent._updatedAt = nowTs;
    syncSiblingState(students);
    saveState(true, `ผูกเบอร์ผู้ปกครองน้อง ${matchedStudent.name} อัตโนมัติ`, true);
    closeParentLinkModal();
    handleParentPhoneLogin(null, rawPhone);
    return;
  }

  parentRegistrations.unshift(newReg);
  saveState(true, `ขอลงทะเบียนผูกเบอร์: ${parentName} -> น้อง ${studentName}`);
  closeParentLinkModal();
  renderParentRegistrations();

  playNotificationChime();
  triggerTelegramPush(`📝 มีคำขอผูกเบอร์ใหม่: คุณ ${parentName} (${relation}) เบอร์ ${rawPhone} ขอนำเบอร์ผูกกับ "น้อง ${studentName}"`, 'คำขอลงทะเบียนผู้ปกครอง');
  showToast('ส่งคำขอลงทะเบียนผูกเบอร์เรียบร้อยแล้ว! โค้ชโอ๊ตจะทำการอนุมัติข้อมูลให้ทันทีครับ');

  const inputEl = document.getElementById('parentPhoneInput');
  if (inputEl) inputEl.value = rawPhone;
  handleParentPhoneLogin(null, rawPhone);
}

function renderParentRegistrations() {
  const sec = document.getElementById('parentApprovalSection');
  const container = document.getElementById('parentPendingList');
  const countEl = document.getElementById('parentPendingCount');
  if (!container || !countEl) return;

  const pending = parentRegistrations.filter(r => r.status === 'pending');
  countEl.innerText = pending.length;

  if (pending.length === 0) {
    if (sec) sec.classList.add('hidden');
    return;
  }
  if (sec) sec.classList.remove('hidden');

  container.innerHTML = '';
  pending.forEach(reg => {
    const div = document.createElement('div');
    div.className = "p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3";
    div.innerHTML = `
      <div class="space-y-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">รออนุมัติ</span>
          <strong class="text-xs sm:text-sm font-semibold text-slate-900">${reg.parentName} (${reg.relation})</strong>
          <span class="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1"><i data-lucide="phone" class="w-3 h-3 text-slate-400"></i> ${reg.phone}</span>
        </div>
        <p class="text-xs text-slate-600">
          ขอนำเบอร์ผูกกับ: <strong class="text-slate-900 font-semibold">น้อง ${reg.studentName}</strong> ${reg.note ? `• หมายเหตุ: ${reg.note}` : ''}
        </p>
        <span class="text-[10px] text-slate-400 font-mono">ลงทะเบียน: ${reg.createdDateStr}</span>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2 max-w-full">
        <button onclick="rejectParentRegistration('${reg.id}')" class="btn-touch px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
          ปฏิเสธ
        </button>
        <button onclick="approveParentRegistration('${reg.id}')" class="btn-touch px-3.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs flex items-center gap-1.5 transition-colors">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          <span>อนุมัติและผูกเบอร์</span>
        </button>
      </div>
    `;
    container.appendChild(div);
  });
  lucide.createIcons();
}

function approveParentRegistration(regId) {
  const reg = parentRegistrations.find(r => r.id === regId);
  if (!reg) return;
  const nowTs = Date.now();

  let st = null;
  if (reg.studentId) {
    st = students.find(s => s.id === reg.studentId);
  }
  if (!st) {
    st = students.find(s => s.name === reg.studentName);
  }

  if (st) {
    st.phone = reg.phone;
    st.parentName = reg.parentName;
    st.parentRelation = reg.relation;
    st._updatedAt = nowTs;
  } else {
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id || 0)) + 1 : 1;
    const newSt = {
      id: newId,
      name: reg.studentName,
      phone: reg.phone,
      parentName: reg.parentName,
      parentRelation: reg.relation,
      courseType: 'regular',
      startDate: new Date().toISOString().split('T')[0],
      nextRenewal: '-',
      records: {},
      remaining: 10,
      saturdayRemaining: 0,
      remark: 'สมัครใหม่ผ่านการอนุมัติผู้ปกครอง',
      _updatedAt: nowTs
    };
    students.push(newSt);
    st = newSt;
  }

  reg.status = 'approved';
  reg.approvedBy = currentStaff ? currentStaff.title : 'โค้ช';
  reg.approvedAt = new Date().toISOString();
  reg.updatedAt = nowTs;

  saveState(true, `อนุมัติเบอร์ผู้ปกครองน้อง ${reg.studentName}`, true);
  renderParentRegistrations();
  if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
  showToast(`อนุมัติเบอร์ ${reg.phone} ผูกกับน้อง ${reg.studentName} เรียบร้อยแล้ว`);
  triggerTelegramPush(`โค้ชอนุมัติเบอร์ ${reg.phone} ผูกกับน้อง ${reg.studentName} เรียบร้อย ผู้ปกครองเข้าสู่ระบบได้ทันที`, 'DBO Academy Admin');
  playNotificationChime();
}

function rejectParentRegistration(regId) {
  const reg = parentRegistrations.find(r => r.id === regId);
  if (!reg) return;
  if (!confirm(`ต้องการปฏิเสธคำขอของ ${reg.parentName} ใช่หรือไม่?`)) return;

  reg.status = 'rejected';
  reg.updatedAt = Date.now();
  saveState(true, 'ปฏิเสธคำขอผูกเบอร์', true);
  renderParentRegistrations();
  showToast('ปฏิเสธคำขอเรียบร้อย');
}

// Course type changes & fee calculations
function getRegistrationCourseType() {
  return document.querySelector('#regCourseType input:checked').value;
}

function handleCourseTypeChange(val) {
  const privateGroup = document.getElementById('privateClassGroup');
  const hint = document.getElementById('monthlyRenewalHint');
  const startInput = document.getElementById('regStartDate');
  
  if (val === 'private') {
    if (privateGroup) privateGroup.classList.remove('hidden');
    if (hint) hint.innerText = '* คลาสส่วนตัว กำหนดช่วงเวลาและเลือกโค้ชได้ตามต้องการ ระบบคำนวณยอดชำระตามชั่วโมงจริง';
  } else {
    if (privateGroup) privateGroup.classList.add('hidden');
    if (hint) {
      if (val === 'monthly') {
        const startVal = (startInput && startInput.value) ? startInput.value : '';
        const cutoffStr = calculateMonthlyNextRenewal(startVal);
        const cutoffThai = formatThaiDateFull(cutoffStr);
        hint.className = 'text-[11px] font-semibold text-emerald-700';
        hint.innerText = `* แพ็กเกจรายเดือน: จะตัดรอบในวันเดียวกันของเดือนถัดไป (${cutoffThai}) และแจ้งเตือนให้สมัครใหม่เมื่อถึงวันตัดรอบ`;
      } else {
        hint.className = 'text-[11px] text-slate-500';
        hint.innerText = '* คอร์สรายครั้ง / วันเสาร์ ไม่มีวันตัดรอบ — เรียนให้ครบตามจำนวนครั้งให้หมดไปก็พอ';
      }
    }
  }
  calculateFee();
}

function setPrivateDuration(dur) {
  const startInput = document.getElementById('privateStartTime');
  const endInput = document.getElementById('privateEndTime');
  if (!startInput || !endInput) return;
  const startVal = startInput.value || '16:00';
  const parts = startVal.split(':').map(Number);
  const h = isNaN(parts[0]) ? 16 : parts[0];
  const m = isNaN(parts[1]) ? 0 : parts[1];
  const totalMinutes = h * 60 + m + Math.round(dur * 60);
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  endInput.value = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  calculateFee();
}

function getPrivateHours() {
  const startInput = document.getElementById('privateStartTime');
  const endInput = document.getElementById('privateEndTime');
  if (!startInput || !endInput) return 2.0;
  const start = startInput.value || '16:00';
  const end = endInput.value || '18:00';
  const parts1 = start.split(':').map(Number);
  const parts2 = end.split(':').map(Number);
  const h1 = isNaN(parts1[0]) ? 16 : parts1[0];
  const m1 = isNaN(parts1[1]) ? 0 : parts1[1];
  const h2 = isNaN(parts2[0]) ? 18 : parts2[0];
  const m2 = isNaN(parts2[1]) ? 0 : parts2[1];
  let diffMin = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diffMin <= 0) diffMin += 24 * 60;
  const hours = Math.round((diffMin / 60) * 10) / 10;
  return hours > 0 ? hours : 2.0;
}

function toggleReferralInput(checked) {
  const container = document.getElementById('regReferralInputContainer');
  const badge = document.getElementById('specialDiscountNotice');
  if (container) container.classList.toggle('hidden', !checked);
  if (badge) badge.classList.toggle('hidden', !checked);
  calculateFee();
}

function calculateFee() {
  const courseType = getRegistrationCourseType();
  const school = (document.getElementById('regSchool').value || '').trim();
  const isTechawit = school.includes('เตชะวิทย์') || school.toLowerCase().includes('techawit');
  const refCheck = document.getElementById('regReferralCheck');
  const hasReferral = refCheck ? refCheck.checked : false;

  const isSpecialDiscount = isTechawit || hasReferral;
  const display = document.getElementById('calculatedFeeDisplay');

  let amount = 4290;
  if (courseType === 'private') {
    const count = parseInt(document.getElementById('privateStudentCount').value) || 1;
    const hours = getPrivateHours();
    const ratePerHour = count >= 4 ? 325 : 400;
    amount = Math.round(ratePerHour * count * hours);

    const hoursDisp = document.getElementById('privateHoursDisplay');
    const rateDesc = document.getElementById('privateRateDescription');
    const subtotalDisp = document.getElementById('privateSubtotalDisplay');
    const startTime = document.getElementById('privateStartTime') ? document.getElementById('privateStartTime').value : '16:00';
    const endTime = document.getElementById('privateEndTime') ? document.getElementById('privateEndTime').value : '18:00';
    
    if (hoursDisp) hoursDisp.innerText = `${hours.toFixed(1)} ชั่วโมง (${startTime} - ${endTime})`;
    if (rateDesc) rateDesc.innerText = count >= 4 ? `กลุ่ม 4+ คน (${ratePerHour}.- / คน / ชม.)` : `กลุ่ม 1-3 คน (${ratePerHour}.- / คน / ชม.)`;
    if (subtotalDisp) subtotalDisp.innerText = `${amount.toLocaleString()} บาท (${count} คน × ${hours.toFixed(1)} ชม.)`;
  } else if (courseType === 'saturday') {
    amount = isSpecialDiscount ? 1500 : 1690;
  } else if (courseType === 'monthly') {
    amount = 2790;
  } else {
    amount = isSpecialDiscount ? 3990 : 4290;
  }

  if (display) {
    display.innerText = `${amount.toLocaleString()} บาท`;
  }
  return amount;
}

function setTechawitSchool() {
  const input = document.getElementById('regSchool');
  input.value = 'โรงเรียนเตชะวิทย์';
  checkTechawitSchool('โรงเรียนเตชะวิทย์');
  calculateFee();
}

function checkTechawitSchool(val) {
  const badge = document.getElementById('techawitDiscountBadge');
  if (val.includes('เตชะวิทย์') || val.toLowerCase().includes('techawit')) {
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
  calculateFee();
}

function calculateAge(birthDateString) {
  if (!birthDateString) return;
  const birth = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  document.getElementById('regAge').value = age > 0 ? age : 7;
}

let regSlipDataUrl = 'assets/images/kbank-qr.jpg';
function previewRegSlip(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      regSlipDataUrl = e.target.result;
      const label = document.getElementById('regSlipLabel');
      if (label) label.innerText = `แนบไฟล์สำเร็จ: ${input.files[0].name}`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function handleNewStudentRegister(e) {
  e.preventDefault();
  const nickName = document.getElementById('regNickName').value.trim();
  const fullName = document.getElementById('regFullName').value.trim();
  const phone = document.getElementById('regParentPhone').value.trim();
  const school = document.getElementById('regSchool').value.trim();
  const courseType = getRegistrationCourseType();
  const startDate = document.getElementById('regStartDate').value;
  const parentName = document.getElementById('regParentName').value.trim() || `ผู้ปกครองน้อง ${nickName}`;

  const amount = calculateFee();
  let extraDetail = '';
  if (courseType === 'private') {
    const coach = document.getElementById('privateCoachSelect').value;
    const startTime = document.getElementById('privateStartTime').value;
    const endTime = document.getElementById('privateEndTime').value;
    const hours = getPrivateHours();
    const count = document.getElementById('privateStudentCount').value;
    const pDate = document.getElementById('privateDate').value || '-';
    const pLoc = document.getElementById('privateLocation').value || 'โรงเรียนเตชะวิทย์';
    extraDetail = ` | โค้ช: ${coach} | วันที่: ${pDate} | เวลา: ${startTime} - ${endTime} (${hours} ชม.) | จำนวน: ${count} คน | สถานที่: ${pLoc}`;
  }

  const pendingItem = {
    id: 'new-app-' + Date.now(),
    studentName: nickName,
    fullName: fullName,
    parentName: parentName,
    phone: phone,
    school: school,
    courseType: courseType,
    startDate: startDate,
    amount: amount,
    slipImage: regSlipDataUrl,
    date: new Date().toLocaleDateString('th-TH') + extraDetail,
    status: 'รอตรวจสอบ'
  };

  pendingSlips.unshift(pendingItem);
  saveState();
  if (typeof renderPendingSlips === 'function') renderPendingSlips();

  playNotificationChime();
  triggerTelegramPush(`🎉 ได้รับใบสมัครใหม่: น้อง ${nickName} (${courseType === 'private' ? 'Private Class' : 'คอร์สเรียน'}) สลิป ${amount.toLocaleString()} บ.`, 'DBO Academy Roster');
  showToast(`ส่งใบสมัครและสลิปของ "น้อง ${nickName}" เรียบร้อย! ทีมงานจะตรวจสอบและอนุมัติระบบให้ทันที`);
  document.getElementById('newStudentForm').reset();
  handleCourseTypeChange(getRegistrationCourseType());
  switchTab('parent-portal');
}
