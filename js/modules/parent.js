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
      const nameEl = document.getElementById('coachPortalStaffName');
      if (nameEl) nameEl.innerText = `${currentStaff.fullName} (${currentStaff.role})`;
    }

    if (mPortalLabel) mPortalLabel.innerText = 'แผงโค้ช';
    if (mPortalIcon) mPortalIcon.setAttribute('data-lucide', 'shield-check');

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
  const heroSharedPill = document.getElementById('hero-shared-pill');
  if (heroNameEl) heroNameEl.innerText = `น้อง ${loggedInStudent.name}`;
  if (heroDescEl) {
    if (loggedInStudent.courseType === 'monthly') heroDescEl.innerText = 'แพ็กเกจรายเดือนสม่ำเสมอ (ซ้อม 2 วัน/สัปดาห์) • สนามเตชะวิทย์';
    else if (loggedInStudent.courseType === 'saturday') heroDescEl.innerText = 'คอร์สวันเสาร์ 4 ครั้ง Coach Oat (16:00-18:00 น.) • สนามเตชะวิทย์';
    else heroDescEl.innerText = 'คอร์สปกติ 10 ครั้ง (จ./อ./พฤ. 17:30-19:30 น.) • สนามเตชะวิทย์';
  }

  // Sibling Bar & Shared Course Handler
  const sibBox = document.getElementById('siblingSelectorBox');
  const sibSelect = document.getElementById('siblingSelect');
  const sibBadge = document.getElementById('dash-sibling-badge');
  const sibSharedNotice = document.getElementById('siblingSharedQuotaNotice');
  const sibSharedTag = document.getElementById('siblingSharedTag');
  const sibSharedDesc = document.getElementById('siblingSharedDesc');
  const sibQuickPills = document.getElementById('siblingQuickPills');

  const currentCleanPhone = (loggedInStudent.phone || '').replace(/[^\d]/g, '');
  const familySiblings = students.filter(s => {
    if (s.siblingGroupId && loggedInStudent.siblingGroupId && s.siblingGroupId === loggedInStudent.siblingGroupId) return true;
    const sPhone = (s.phone || '').replace(/[^\d]/g, '');
    return (currentCleanPhone && sPhone === currentCleanPhone);
  });

  if (familySiblings.length > 1) {
    if (sibBox) sibBox.classList.remove('hidden');
    if (sibSelect) {
      sibSelect.innerHTML = familySiblings.map(s => `
        <option value="${s.id}" ${s.id === loggedInStudent.id ? 'selected' : ''}>น้อง ${s.name} (${s.remaining !== undefined ? s.remaining : 0} ครั้ง)</option>
      `).join('');
    }

    const isSharedPool = (loggedInStudent.siblingMode === 'shared') || (loggedInStudent.siblingGroupId && loggedInStudent.siblingGroupId.startsWith('sib_') && ['sib_boston_harden', 'sib_manta_matang', 'sib_inthach_thawin'].includes(loggedInStudent.siblingGroupId));
    
    if (sibBadge) {
      sibBadge.classList.remove('hidden');
      sibBadge.innerText = isSharedPool ? 'ครอบครัวพี่น้อง (ใช้โควต้าร่วมกัน)' : 'ครอบครัวพี่น้อง (จ่ายแยกคอร์ส)';
    }

    if (heroSharedPill) {
      if (isSharedPool) heroSharedPill.classList.remove('hidden');
      else heroSharedPill.classList.add('hidden');
    }

    if (sibSharedNotice) {
      sibSharedNotice.classList.remove('hidden');
      const otherNames = familySiblings.map(s => s.name).join(' & ');
      if (isSharedPool) {
        if (sibSharedTag) sibSharedTag.innerText = 'นับ 10 ครั้งร่วมกัน';
        if (sibSharedDesc) sibSharedDesc.innerHTML = `บ้านน้อง <strong>${otherNames}</strong> เป็นพี่น้องกันและใช้โควต้าคอร์ส 10 ครั้งร่วมกัน หากน้องคนใดเข้าเรียนหรือโค้ชตัดสิทธิ์ โควต้าจะลดและคงเหลือเท่ากันทั้งสองคนครับ`;
      } else {
        if (sibSharedTag) sibSharedTag.innerText = 'เบอร์เดียว ดูได้ทั้งพี่น้อง';
        if (sibSharedDesc) sibSharedDesc.innerHTML = `บ้านน้อง <strong>${otherNames}</strong> เป็นพี่น้องกันแต่จ่ายแยกคอร์ส สามารถใช้เบอร์เดียวล็อกอินเพื่อสลับดูสิทธิ์ของแต่ละคนได้อย่างสะดวกสบายครับ`;
      }
      if (sibQuickPills) {
        sibQuickPills.innerHTML = familySiblings.map(s => `
          <button type="button" onclick="switchSibling(${s.id})" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${s.id === loggedInStudent.id ? 'bg-purple-600 text-white shadow-2xs' : 'bg-white border border-purple-200 text-purple-900 hover:bg-purple-100'} transition cursor-pointer">
            น้อง ${s.name} (${s.remaining} ครั้ง)
          </button>
        `).join('');
      }
    }
  } else {
    if (sibBox) sibBox.classList.add('hidden');
    if (sibBadge) sibBadge.classList.add('hidden');
    if (sibSharedNotice) sibSharedNotice.classList.add('hidden');
    if (heroSharedPill) heroSharedPill.classList.add('hidden');
  }

  // Dynamic Class Day Status Banner
  try {
    const nowD = new Date();
    const dayW = nowD.getDay();
    const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const thaiYear = nowD.getFullYear() + 543;
    const formattedDate = `${thaiDays[dayW]}ที่ ${nowD.getDate()} ${thaiMonths[nowD.getMonth()]} ${thaiYear}`;

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
      scheduleNote = 'คลาสวันเสาร์ Basic Coach Oat 16:00 - 18:00 น. ณ ยิมเตชะวิทย์';
      if (headingEl) headingEl.innerText = 'คลาสวันเสาร์ Coach Oat (เปิดซ้อมปกติ)';
      if (dotEl) dotEl.className = 'w-2.5 h-2.5 rounded-full bg-indigo-600';
      if (normalActions) normalActions.classList.remove('hidden');
      if (noClassBox) noClassBox.classList.add('hidden');
    } else {
      scheduleNote = 'วันนี้ไม่มีคลาสเรียนรวม (วันพักฟื้นร่างกาย / นัดซ้อม Private)';
      if (headingEl) headingEl.innerText = 'วันนี้ไม่มีคลาสเรียนรวม';
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
      if (nextTitleEl) nextTitleEl.innerText = 'เสาร์นี้ (16:00 - 18:00 น.)';
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
  if (vJumpHistEl) {
    if (vJumpVal !== null) {
      if (loggedInStudent.vJumpHistory && loggedInStudent.vJumpHistory.length > 0) {
        vJumpHistEl.innerText = loggedInStudent.vJumpHistory.map(h => `${h.val}`).join(' ➔ ') + ` ซม.`;
      } else {
        vJumpHistEl.innerText = `${vJumpVal} ซม.`;
      }
    } else {
      vJumpHistEl.innerText = 'รอการทดสอบสมรรถภาพ';
    }
  }
  if (vJumpDiff) {
    vJumpDiff.innerText = vJumpVal !== null ? `${vJumpVal} ซม.` : 'รอทดสอบ';
  }

  const longJumpEl = document.getElementById('dash-longjump-val');
  const longJumpBar = document.getElementById('dash-longjump-bar');
  const longJumpHistEl = document.getElementById('dash-longjump-history');
  const longJumpDiff = document.getElementById('dash-longjump-diff');

  if (longJumpEl) longJumpEl.innerText = longJumpVal !== null ? longJumpVal : '-';
  if (longJumpBar) longJumpBar.style.width = longJumpVal !== null ? Math.min(100, Math.round((longJumpVal / 220) * 100)) + '%' : '0%';
  if (longJumpHistEl) {
    if (longJumpVal !== null) {
      if (loggedInStudent.longJumpHistory && loggedInStudent.longJumpHistory.length > 0) {
        longJumpHistEl.innerText = loggedInStudent.longJumpHistory.map(h => `${h.val}`).join(' ➔ ') + ` ซม.`;
      } else {
        longJumpHistEl.innerText = `${longJumpVal} ซม.`;
      }
    } else {
      longJumpHistEl.innerText = 'รอการทดสอบสมรรถภาพ';
    }
  }
  if (longJumpDiff) {
    longJumpDiff.innerText = longJumpVal !== null ? `${longJumpVal} ซม.` : 'รอทดสอบ';
  }

  renderParentClassmatesList();

  // Course Type Badge
  const typeBadge = document.getElementById('dash-student-type');
  const maxQuotaEl = document.getElementById('dash-max-quota');
  const periodEl = document.getElementById('dash-course-period');

  if (loggedInStudent.courseType === 'monthly') {
    typeBadge.innerText = 'แพ็กเกจรายเดือน (2 วัน/สัปดาห์)';
    typeBadge.className = 'px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
    maxQuotaEl.innerText = '/ เดือนนี้';
    periodEl.innerText = `ตัดรอบทุกวันที่ ${loggedInStudent.startDate ? loggedInStudent.startDate.split('-')[2] : '1'} ของเดือน`;
  } else if (loggedInStudent.courseType === 'saturday') {
    typeBadge.innerText = 'คอร์สวันเสาร์ 4 ครั้ง (Coach Oat)';
    typeBadge.className = 'px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300';
    maxQuotaEl.innerText = '/ 4 ครั้ง';
    periodEl.innerText = 'เรียนเฉพาะวันเสาร์ 16:00-18:00 น.';
  } else {
    typeBadge.innerText = 'คอร์สปกติ 10 ครั้ง';
    typeBadge.className = 'px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300';
    maxQuotaEl.innerText = '/ 10 ครั้ง';
    periodEl.innerText = 'คอร์ส 10 ครั้ง (จ./อ./พฤ.)';
  }

  document.getElementById('renewingStudentName').innerText = `น้อง ${loggedInStudent.name}`;
  document.getElementById('renewingStudentPhone').innerText = loggedInStudent.phone;
  document.getElementById('slipStudentName').value = loggedInStudent.name;

  // Remaining Quota
  const rem = loggedInStudent.remaining;
  const remNumEl = document.getElementById('dash-remaining-number');
  const badgeStatusEl = document.getElementById('dash-badge-status');
  const progBarEl = document.getElementById('dash-progress-bar');
  const renewNoticeEl = document.getElementById('dash-renew-notice');

  const totalQuota = loggedInStudent.courseType === 'saturday' ? 4 : (loggedInStudent.courseType === 'monthly' ? 8 : 10);

  if (rem > 3) {
    if (remNumEl) {
      remNumEl.innerText = rem;
      remNumEl.className = 'text-3xl sm:text-4xl font-semibold text-slate-900 font-mono tracking-tight';
    }
    if (badgeStatusEl) {
      badgeStatusEl.innerText = 'พร้อมเรียน';
      badgeStatusEl.className = 'px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
    const pct = Math.min(100, Math.max(0, (rem / totalQuota) * 100));
    if (progBarEl) {
      progBarEl.style.width = pct + '%';
      progBarEl.className = 'h-1.5 rounded-full bg-emerald-600';
    }
    if (renewNoticeEl) renewNoticeEl.innerText = `เหลือ ${rem} ครั้ง`;
  } else if (rem >= 1 && rem <= 3) {
    if (remNumEl) {
      remNumEl.innerText = rem;
      remNumEl.className = 'text-3xl sm:text-4xl font-semibold text-amber-700 font-mono tracking-tight';
    }
    if (badgeStatusEl) {
      badgeStatusEl.innerText = 'ใกล้หมด';
      badgeStatusEl.className = 'px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200';
    }
    const pct = (rem / totalQuota) * 100;
    if (progBarEl) {
      progBarEl.style.width = pct + '%';
      progBarEl.className = 'h-1.5 rounded-full bg-amber-500';
    }
    if (renewNoticeEl) renewNoticeEl.innerText = `เหลือ ${rem} ครั้ง แนะนำต่อคอร์สใหม่`;
  } else {
    if (remNumEl) {
      remNumEl.innerText = rem;
      remNumEl.className = 'text-3xl sm:text-4xl font-semibold text-rose-700 font-mono tracking-tight';
    }
    if (badgeStatusEl) {
      badgeStatusEl.innerText = rem === 0 ? 'หมดสิทธิ์' : `เกินสิทธิ์ (${Math.abs(rem)} ครั้ง)`;
      badgeStatusEl.className = 'px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200';
    }
    if (progBarEl) {
      progBarEl.style.width = '0%';
      progBarEl.className = 'h-1.5 rounded-full bg-rose-500';
    }
    if (renewNoticeEl) renewNoticeEl.innerText = 'กรุณาต่อคอร์สใหม่เพื่อรักษาสิทธิ์';
  }

  // History Table
  const historyTbody = document.getElementById('dash-history-tbody');
  const recs = loggedInStudent.records || {};
  let rowsHtml = '';
  
  const todayKey = getTodayDateKey();
  const todayAtt = dailyAttendance[todayKey] ? dailyAttendance[todayKey][loggedInStudent.id] : null;
  if (todayAtt && (todayAtt.status === 'attending' || todayAtt.status === 'leave')) {
    const nowD = new Date();
    const thaiM = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const todayThaiStr = `วันนี้ (${nowD.getDate()} ${thaiM[nowD.getMonth()]} ${nowD.getFullYear() + 543})`;
    rowsHtml += `
      <tr class="bg-emerald-50/50 hover:bg-emerald-50 transition border-b border-emerald-100">
        <td class="py-2.5 px-3.5 font-mono text-xs font-semibold text-emerald-950">${todayThaiStr}</td>
        <td class="py-2.5 px-3.5 text-xs text-slate-800">คลาสปกติ (17:30-19:30 น.)</td>
        <td class="py-2.5 px-3.5 text-center">
          ${todayAtt.status === 'attending' 
            ? '<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ยืนยันเข้าเรียนแล้ว</span>' 
            : `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> ลา: ${todayAtt.leaveReason || 'ลาเรียน'}</span>`}
        </td>
        <td class="py-2.5 px-3.5 text-center text-xs font-mono font-medium text-slate-700">${todayAtt.status === 'attending' ? '-1 ครั้ง' : '0'}</td>
      </tr>
    `;
  }

  const pastDates = [
    { label: '5 พ.ย. 2569', classType: 'คลาสปกติ (17:30-19:30 น.)', key: '5/11/26' },
    { label: '3 พ.ย. 2569', classType: 'คลาสปกติ (17:30-19:30 น.)', key: '3/11/26' },
    { label: '1 พ.ย. 2569', classType: 'คลาส Basic กับ Coach Oat', key: '1/11/26' },
    { label: '29 ต.ค. 2569', classType: 'คลาสปกติ (17:30-19:30 น.)', key: '29/10' }
  ];

  pastDates.forEach(d => {
    const val = recs[d.key];
    const isPresent = (val === '/' || val === '//');
    const isLeave = (val === 'ลา');
    
    let statusBadge = '<span class="text-slate-400 font-mono">-</span>';
    if (isPresent) {
      statusBadge = '<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> มาเรียน (/)</span>';
    } else if (isLeave) {
      statusBadge = '<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> ลาเรียน</span>';
    }

    const deduct = isPresent ? (val === '//' ? '-2 ครั้ง' : '-1 ครั้ง') : '0';

    rowsHtml += `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-2.5 px-3.5 font-mono text-xs font-medium text-slate-700">${d.label}</td>
        <td class="py-2.5 px-3.5 text-xs text-slate-800">${d.classType}</td>
        <td class="py-2.5 px-3.5 text-center">${statusBadge}</td>
        <td class="py-2.5 px-3.5 text-center text-xs font-mono text-slate-500">${deduct}</td>
      </tr>
    `;
  });

  historyTbody.innerHTML = rowsHtml;
  updateParentTodayStatusUI();
  renderLivePeers();
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

function openRsvpModal() {
  const modal = document.getElementById('rsvpModal');
  document.getElementById('rsvpDateInput').value = new Date().toISOString().split('T')[0];
  modal.classList.remove('hidden');
}
function closeRsvpModal() { document.getElementById('rsvpModal').classList.add('hidden'); }

function handleRsvpSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('rsvpDateInput').value;
  const slot = document.getElementById('rsvpTimeSlot').value;
  closeRsvpModal();
  setTodayAttendanceFromParent('attending');
  showToast(`แจ้งเข้าเรียนวันที่ ${date} (${slot}) ให้ทีมโค้ชทราบเรียบร้อยครับ`);
}

function openLeaveModal() {
  const modal = document.getElementById('leaveModal');
  document.getElementById('leaveDateInput').value = new Date().toISOString().split('T')[0];
  modal.classList.remove('hidden');
}
function closeLeaveModal() { document.getElementById('leaveModal').classList.add('hidden'); }

function handleLeaveSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('leaveDateInput').value;
  const reason = document.getElementById('leaveReasonInput').value || 'แจ้งลาเรียน';
  closeLeaveModal();
  setTodayAttendanceFromParent('leave', reason);
  showToast(`บันทึกการลาวันที่ ${date} (${reason}) เรียบร้อย โดยไม่ตัดโควต้าครับ`);
}

function setTodayAttendanceFromParent(status, leaveReason = '') {
  if (!loggedInStudent) {
    showToast('กรุณาเข้าสู่ระบบก่อนแจ้งสถานะการเข้าเรียนครับ');
    switchTab('parent-portal');
    return;
  }

  const todayKey = getTodayDateKey();
  if (!dailyAttendance[todayKey]) dailyAttendance[todayKey] = {};

  const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

  dailyAttendance[todayKey][loggedInStudent.id] = {
    studentId: loggedInStudent.id,
    name: loggedInStudent.name,
    status: status,
    leaveReason: leaveReason || (status === 'leave' ? 'แจ้งลาเรียน' : ''),
    time: nowTime,
    updatedBy: 'parent',
    updatedAt: Date.now()
  };

  saveState(true, `ผู้ปกครองแจ้ง${status === 'attending' ? 'มาเรียน' : 'ลา'}: น้อง ${loggedInStudent.name}`, true);

  // Real-time broadcast to all coach devices via MQTT
  if (typeof publishToMqttBrokers === 'function') {
    publishToMqttBrokers(REALTIME_SYNC_TOPIC, {
      senderId: window.dboClientId,
      type: 'PARENT_ATTENDANCE_EVENT',
      studentId: loggedInStudent.id,
      studentName: loggedInStudent.name,
      status: status,
      leaveReason: leaveReason || (status === 'leave' ? 'แจ้งลาเรียน' : ''),
      time: nowTime,
      dateKey: todayKey
    });
  }

  updateParentTodayStatusUI();
  renderParentClassmatesList();
  if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
  playNotificationChime();

  if (status === 'attending') {
    showToast(`ยืนยันการเข้าเรียนวันนี้ของน้อง ${loggedInStudent.name} เรียบร้อยแล้ว`);
    triggerTelegramPush(`น้อง ${loggedInStudent.name} ยืนยันเข้าเรียนคลาสวันนี้ (${nowTime})`, 'DBO Attendance Check-in');
  } else {
    showToast(`แจ้งลาเรียนของน้อง ${loggedInStudent.name} เรียบร้อย`);
    triggerTelegramPush(`น้อง ${loggedInStudent.name} แจ้งขอลาหยุดวันนี้: ${leaveReason || 'ลาเรียน'}`, 'DBO Leave Notice');
  }
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
    const rem = s.remaining !== undefined ? s.remaining : 0;
    const phoneLabel = s.phone ? '(ผูกเบอร์แล้ว)' : `(คงเหลือ ${rem} ครั้ง • รอผูกเบอร์)`;
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

      <div class="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
        <button onclick="rejectParentRegistration('${reg.id}')" class="btn-touch px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
          ปฏิเสธ
        </button>
        <button onclick="approveParentRegistration('${reg.id}')" class="btn-touch px-3.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs flex items-center gap-1.5 transition-colors">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          <span>อนุมัติ & ผูกเบอร์อัตโนมัติ</span>
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
      nextRenewal: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
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
function handleCourseTypeChange(val) {
  const privateGroup = document.getElementById('privateClassGroup');
  const hint = document.getElementById('monthlyRenewalHint');
  
  if (val === 'private') {
    if (privateGroup) privateGroup.classList.remove('hidden');
    if (hint) hint.innerText = '* คลาสส่วนตัว กำหนดช่วงเวลาและเลือกโค้ชได้ตามต้องการ ระบบคำนวณยอดชำระตามชั่วโมงจริง';
  } else {
    if (privateGroup) privateGroup.classList.add('hidden');
    if (hint) {
      if (val === 'monthly') {
        hint.innerText = '* แพ็กเกจรายเดือนจะเริ่มนับวันแรกที่เรียน และตัดรอบในวันเดิมของเดือนถัดไป';
      } else {
        hint.innerText = '* ระบบจะบันทึกวันเริ่มเรียนเพื่อใช้นับรอบคอร์สอย่างเป็นระบบ';
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
  const courseType = document.getElementById('regCourseType').value;
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
  const courseType = document.getElementById('regCourseType').value;
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
  switchTab('parent-portal');
}
