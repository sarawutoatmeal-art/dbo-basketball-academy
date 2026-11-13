// ========================================================
// DBO Basketball Academy - Realtime Cloud Sync & State Sync
// ========================================================

window.dboClientId = 'dbo_client_' + Math.random().toString(36).substring(2, 9);

function buildFullStateSnapshot() {
  return {
    updatedAt: Date.now(),
    lastSubmittedAt,
    lastSubmittedBy,
    deletedStudentIds,
    processedSlipIds,
    students,
    pendingSlips,
    parentRegistrations,
    dailyAttendance,
    teachingRecords,
    assistantCoaches,
    weeklySchedule,
    calendarDayOverrides
  };
}

async function pushStateToCloudApi(snapshot) {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: snapshot })
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.ok && json.data) {
        applyIncomingState(json.data, '', true);
      }
    }
  } catch (e) {
    // Offline or local file mode fallback
  }
}

function publishToMqttBrokers(topic, payloadObj, options = { qos: 1, retain: false }) {
  const msg = JSON.stringify(payloadObj);
  const clients = [window.realtimeMqttClient, window.backupMqttClient].filter(Boolean);
  clients.forEach(client => {
    try {
      if (client.connected) {
        client.publish(topic, msg, options);
      }
    } catch (e) {}
  });
}

function saveState(broadcastRemote = true, actionDesc = '', isExplicitSubmit = false) {
  localStorage.setItem('dbo_students_v14', JSON.stringify(students));
  localStorage.setItem('dbo_pending_slips_v14', JSON.stringify(pendingSlips));
  localStorage.setItem('dbo_parent_registrations_v14', JSON.stringify(parentRegistrations));
  localStorage.setItem('dbo_daily_attendance_v14', JSON.stringify(dailyAttendance));
  localStorage.setItem('dbo_teaching_records_v19', JSON.stringify(teachingRecords));
  localStorage.setItem('dbo_assistant_coaches_v14', JSON.stringify(assistantCoaches));
  localStorage.setItem('dbo_weekly_schedule_v16', JSON.stringify(weeklySchedule));
  localStorage.setItem('dbo_calendar_overrides_v1', JSON.stringify(calendarDayOverrides));
  localStorage.setItem('dbo_deleted_students_v16', JSON.stringify(deletedStudentIds));
  localStorage.setItem('dbo_processed_slips_v16', JSON.stringify(processedSlipIds));
  localStorage.setItem('dbo_last_submitted_at_v16', String(lastSubmittedAt));
  localStorage.setItem('dbo_last_submitted_by_v16', lastSubmittedBy);
  if (currentStaff) localStorage.setItem('dbo_current_staff', JSON.stringify(currentStaff));

  const snapshot = buildFullStateSnapshot();

  // 1. Cross-tab instant local broadcast
  if (window.dboRealtimeBC) {
    try {
      window.dboRealtimeBC.postMessage({
        type: 'STATE_CHANGED',
        actionDesc: actionDesc || 'มีการบันทึกข้อมูลล่าสุด',
        data: snapshot
      });
    } catch (e) { console.log('BC post error:', e); }
  }

  if (broadcastRemote) {
    // 2. Vercel Serverless Cloud Sync API
    pushStateToCloudApi(snapshot);

    // 3. Multi-device Retained Cloud MQTT Broadcast
    const clientId = window.dboClientId || 'dbo_peer';
    const payload = {
      senderId: clientId,
      type: 'REALTIME_STATE_UPDATE',
      isExplicitSubmit: !!isExplicitSubmit,
      actionDesc: actionDesc || 'มีการอัปเดตข้อมูล',
      timestamp: Date.now(),
      data: snapshot
    };
    publishToMqttBrokers(CLOUD_STATE_TOPIC, payload, { qos: 1, retain: true });
    publishToMqttBrokers(REALTIME_SYNC_TOPIC, payload, { qos: 1, retain: true });
    if (actionDesc) {
      publishToMqttBrokers(CLOUD_EVENT_TOPIC, {
        senderId: clientId,
        type: 'LIVE_NOTICE',
        actionDesc,
        timestamp: Date.now()
      }, { qos: 1, retain: false });
    }
  }
}

function markPendingCoachChange(desc = '') {
  pendingSessionChanges++;
  updateSubmitBarUI(desc);
}

function updateSubmitBarUI(lastChangeDesc = '') {
  const stickyBar = document.getElementById('coachStickySubmitBar');
  const stickyTitle = document.getElementById('stickySubmitTitle');
  const stickySub = document.getElementById('stickySubmitSubtitle');
  const statusText = document.getElementById('lastSubmitStatusText');

  if (stickyBar) {
    if (isCoachAuth && pendingSessionChanges > 0) {
      stickyBar.classList.remove('hidden');
      if (stickyTitle) stickyTitle.innerText = `มีรายการเช็คชื่อ/แก้ไขโควต้า ${pendingSessionChanges} รายการ รอกดยืนยัน Submit`;
      if (stickySub) stickySub.innerText = lastChangeDesc ? `ล่าสุด: ${lastChangeDesc} • กดยืนยันเพื่ออัปเดตทุกเครื่อง` : 'กดปุ่มยืนยันเพื่อส่งข้อมูลอัปเดตไปยังทุกเครื่องที่ออนไลน์';
    } else {
      stickyBar.classList.add('hidden');
    }
  }

  if (statusText) {
    if (pendingSessionChanges > 0) {
      statusText.className = 'text-[11px] text-amber-700 font-medium';
      statusText.innerText = `มีการแก้ไข ${pendingSessionChanges} รายการ — กรุณากดปุ่ม "ยืนยัน Submit ข้อมูล" เพื่อส่งอัปเดตไปยังทุกเครื่อง`;
    } else if (lastSubmittedAt > 0) {
      const d = new Date(lastSubmittedAt);
      const tStr = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' น.';
      statusText.className = 'text-[11px] text-emerald-700 font-medium';
      statusText.innerText = `ยืนยัน Submit ข้อมูลขึ้นระบบทุกเครื่องล่าสุดเมื่อ ${tStr}${lastSubmittedBy ? ' โดย ' + lastSubmittedBy : ''}`;
    } else {
      statusText.className = 'text-[11px] text-slate-500';
      statusText.innerText = 'เมื่อกดยืนยัน ระบบจะซิงค์จำนวนครั้งคงเหลือและรายชื่อเช็คชื่อไปยังเครื่องโค้ช สตาฟ และผู้ปกครองทุกคนทันที';
    }
  }
}

async function submitAndBroadcastAttendanceSession() {
  const nowTs = Date.now();
  const staffName = currentStaff ? currentStaff.name : 'โค้ชโอ๊ต';
  const sessionDateKey = activeAttendanceDate || getTodayDateKey();
  const records = dailyAttendance[sessionDateKey] || {};
  const attendingCount = Object.values(records).filter(r => r && r.status === 'attending').length;
  const leaveCount = Object.values(records).filter(r => r && r.status === 'leave').length;

  Object.values(records).forEach(r => {
    if (r && !r.updatedAt) r.updatedAt = nowTs;
  });
  students.forEach(s => {
    if (s && !s._updatedAt) s._updatedAt = nowTs - 500;
  });

  lastSubmittedAt = nowTs;
  lastSubmittedBy = staffName;
  pendingSessionChanges = 0;

  const btnBottom = document.getElementById('btnBottomSubmitSession');
  if (btnBottom) {
    btnBottom.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i><span>กำลังส่งข้อมูลไปยังทุกเครื่อง...</span>';
  }

  const summaryMsg = `${staffName} ยืนยัน Submit เช็คชื่อ (${sessionDateKey}): มาเรียน ${attendingCount} คน, ลา ${leaveCount} คน`;
  saveState(true, summaryMsg, true);
  if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
  updateSubmitBarUI();

  setTimeout(() => {
    if (btnBottom) {
      btnBottom.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i><span>ยืนยัน Submit ข้อมูลสำเร็จ (อัปเดตทุกเครื่องแล้ว)</span>';
      lucide.createIcons();
      setTimeout(() => {
        if (btnBottom) {
          btnBottom.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i><span>ยืนยัน Submit ข้อมูล (อัปเดตทุกเครื่อง)</span>';
          lucide.createIcons();
        }
      }, 3000);
    }
  }, 250);

  showToast(`ยืนยัน Submit ข้อมูลสำเร็จ — ซิงค์อัปเดตทุกเครื่องเรียบร้อย (มาเรียน ${attendingCount} คน, ลา ${leaveCount} คน)`);
  triggerTelegramPush(`ยืนยันการเช็คชื่อรอบ ${sessionDateKey} สำเร็จ: มาเรียน ${attendingCount} คน • ลา ${leaveCount} คน • อัปเดตโควต้าทุกเครื่องเรียบร้อย`, 'DBO Attendance Submitted');
  playNotificationChime();
  lucide.createIcons();
}

function broadcastCoachClassStatus(dateKey, status, reason = '', time = '') {
  const staffName = (typeof currentStaff !== 'undefined' && currentStaff) ? currentStaff.name : 'ทีมโค้ช';
  const payload = {
    senderId: window.dboClientId || 'dbo_peer',
    type: 'COACH_CLASS_STATUS_EVENT',
    dateKey,
    status,
    reason,
    time,
    coachName: staffName,
    updatedAt: Date.now()
  };

  if (window.dboRealtimeBC) {
    try {
      window.dboRealtimeBC.postMessage(payload);
    } catch (e) { console.log('BC post error:', e); }
  }

  if (window.realtimeMqttClient && window.realtimeMqttClient.connected) {
    try {
      window.realtimeMqttClient.publish(REALTIME_SYNC_TOPIC, JSON.stringify(payload), { qos: 1 });
    } catch (e) { console.log('MQTT broadcast class status error:', e); }
  }
}

function updateLiveDateBanner() {
  if (typeof renderParentView === 'function') renderParentView();
}

function applyIncomingState(incomingData, actionDesc = '') {
  if (!incomingData) return;
  let hasChanges = false;

  // 1. Merge deletedStudentIds & processedSlipIds
  if (incomingData.deletedStudentIds && typeof incomingData.deletedStudentIds === 'object') {
    Object.keys(incomingData.deletedStudentIds).forEach(k => {
      const ts = incomingData.deletedStudentIds[k];
      if (!deletedStudentIds[k] || ts > deletedStudentIds[k]) {
        deletedStudentIds[k] = ts;
        hasChanges = true;
      }
    });
    localStorage.setItem('dbo_deleted_students_v16', JSON.stringify(deletedStudentIds));
  }

  if (incomingData.processedSlipIds && typeof incomingData.processedSlipIds === 'object') {
    Object.keys(incomingData.processedSlipIds).forEach(k => {
      const ts = incomingData.processedSlipIds[k];
      if (!processedSlipIds[k] || ts > processedSlipIds[k]) {
        processedSlipIds[k] = ts;
        hasChanges = true;
      }
    });
    localStorage.setItem('dbo_processed_slips_v16', JSON.stringify(processedSlipIds));
  }

  // 2. Smart Record-by-Record Merge for Students
  if (incomingData.students && Array.isArray(incomingData.students)) {
    const studentMap = new Map();
    students.forEach(s => {
      if (s && s.id !== undefined && !deletedStudentIds[String(s.id)]) {
        studentMap.set(Number(s.id), s);
      }
    });

    incomingData.students.forEach(inc => {
      if (!inc || inc.id === undefined) return;
      if (!inc.isRealSportsMetrics) {
        inc.remarkOat = '';
        inc.remarkOak = '';
        inc.vJump = null;
        inc.vJumpHistory = [];
        inc.longJump = null;
        inc.longJumpHistory = [];
      }
      const sid = Number(inc.id);
      if (deletedStudentIds[String(sid)]) return;

      const existing = studentMap.get(sid);
      if (!existing) {
        studentMap.set(sid, inc);
        hasChanges = true;
      } else {
        const existingTs = existing._updatedAt || 0;
        const incTs = inc._updatedAt || 0;
        if (incTs > existingTs) {
          studentMap.set(sid, {
            ...existing,
            ...inc,
            phone: inc.phone || existing.phone || ''
          });
          hasChanges = true;
        } else if (incTs === existingTs) {
          if (inc.phone && !existing.phone) {
            existing.phone = inc.phone;
            hasChanges = true;
          }
          if ((inc.checkInHistory || []).length > (existing.checkInHistory || []).length) {
            existing.remaining = inc.remaining;
            existing.saturdayRemaining = inc.saturdayRemaining;
            existing.checkInHistory = inc.checkInHistory;
            hasChanges = true;
          }
          if (inc.remaining !== existing.remaining && incTs > 0) {
            existing.remaining = inc.remaining;
            hasChanges = true;
          }
        } else {
          if (inc.phone && !existing.phone) {
            existing.phone = inc.phone;
            hasChanges = true;
          }
        }
      }
    });

    const mergedList = Array.from(studentMap.values())
      .filter(s => !deletedStudentIds[String(s.id)])
      .sort((a, b) => Number(a.id) - Number(b.id));

    if (JSON.stringify(mergedList) !== JSON.stringify(students)) {
      students = mergedList;
      localStorage.setItem('dbo_students_v14', JSON.stringify(students));
      hasChanges = true;
    }
  }

  // 3. Merge Daily Attendance
  if (incomingData.dailyAttendance && typeof incomingData.dailyAttendance === 'object') {
    Object.keys(incomingData.dailyAttendance).forEach(dateKey => {
      if (!dailyAttendance[dateKey]) dailyAttendance[dateKey] = {};
      const incDay = incomingData.dailyAttendance[dateKey] || {};
      Object.keys(incDay).forEach(stId => {
        const incRec = incDay[stId];
        const curRec = dailyAttendance[dateKey][stId];
        if (!curRec) {
          if (incRec && incRec.status !== 'unchecked') {
            dailyAttendance[dateKey][stId] = incRec;
            hasChanges = true;
          }
        } else {
          const curTs = curRec.updatedAt || 0;
          const incTs = (incRec && incRec.updatedAt) || 0;
          if (incTs > curTs) {
            if (incRec.status === 'unchecked') {
              delete dailyAttendance[dateKey][stId];
            } else {
              dailyAttendance[dateKey][stId] = incRec;
            }
            hasChanges = true;
          } else if (curTs === 0 && incTs === 0 && JSON.stringify(curRec) !== JSON.stringify(incRec)) {
            dailyAttendance[dateKey][stId] = incRec;
            hasChanges = true;
          }
        }
      });
    });
    localStorage.setItem('dbo_daily_attendance_v14', JSON.stringify(dailyAttendance));
  }

  // 4. Merge Parent Registrations
  if (incomingData.parentRegistrations && Array.isArray(incomingData.parentRegistrations)) {
    const regMap = new Map();
    parentRegistrations.forEach(r => { if (r && r.id) regMap.set(r.id, r); });
    incomingData.parentRegistrations.forEach(inc => {
      if (!inc || !inc.id) return;
      const cur = regMap.get(inc.id);
      if (!cur || (inc.updatedAt || 0) >= (cur.updatedAt || 0)) {
        regMap.set(inc.id, inc);
        hasChanges = true;
      }
    });
    parentRegistrations = Array.from(regMap.values());
    localStorage.setItem('dbo_parent_registrations_v14', JSON.stringify(parentRegistrations));
  }

  // 5. Merge Pending Slips
  if (incomingData.pendingSlips && Array.isArray(incomingData.pendingSlips)) {
    const slipMap = new Map();
    pendingSlips.forEach(s => {
      if (s && s.id && !processedSlipIds[String(s.id)]) slipMap.set(s.id, s);
    });
    incomingData.pendingSlips.forEach(inc => {
      if (!inc || !inc.id || processedSlipIds[String(inc.id)]) return;
      if (!slipMap.has(inc.id)) {
        slipMap.set(inc.id, inc);
        hasChanges = true;
      }
    });
    pendingSlips = Array.from(slipMap.values());
    localStorage.setItem('dbo_pending_slips_v14', JSON.stringify(pendingSlips));
  }

  // 6. Merge Assistant Coaches
  if (incomingData.assistantCoaches && Array.isArray(incomingData.assistantCoaches)) {
    const asstMap = new Map();
    assistantCoaches.forEach(a => { if (a && a.id) asstMap.set(a.id, a); });
    incomingData.assistantCoaches.forEach(inc => {
      if (!inc || !inc.id) return;
      const cur = asstMap.get(inc.id);
      if (!cur || (inc.updatedAt || 0) > (cur.updatedAt || 0) || ((inc.workLogs || []).length > (cur.workLogs || []).length)) {
        asstMap.set(inc.id, inc);
        hasChanges = true;
      }
    });
    assistantCoaches = Array.from(asstMap.values());
    localStorage.setItem('dbo_assistant_coaches_v14', JSON.stringify(assistantCoaches));
  }

  // 7. Merge Weekly Schedule
  if (incomingData.weeklySchedule && typeof incomingData.weeklySchedule === 'object') {
    if (JSON.stringify(incomingData.weeklySchedule) !== JSON.stringify(weeklySchedule)) {
      weeklySchedule = incomingData.weeklySchedule;
      localStorage.setItem('dbo_weekly_schedule_v16', JSON.stringify(weeklySchedule));
      if (typeof renderWeeklyScheduleView === 'function') renderWeeklyScheduleView();
      hasChanges = true;
    }
  }

  // 8. Merge Teaching Records
  if (incomingData.teachingRecords && Array.isArray(incomingData.teachingRecords)) {
    const recMap = new Map();
    teachingRecords.forEach(r => { if (r && r.id) recMap.set(r.id, r); });
    incomingData.teachingRecords.forEach(inc => {
      if (!inc || !inc.id) return;
      const cur = recMap.get(inc.id);
      if (!cur || (inc.updatedAt || 0) >= (cur.updatedAt || 0)) {
        recMap.set(inc.id, inc);
        hasChanges = true;
      }
    });
    teachingRecords = Array.from(recMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    localStorage.setItem('dbo_teaching_records_v19', JSON.stringify(teachingRecords));
  }

  // 9. Merge Calendar Day Overrides (Class Canceled / Special Status)
  if (incomingData.calendarDayOverrides && typeof incomingData.calendarDayOverrides === 'object') {
    Object.keys(incomingData.calendarDayOverrides).forEach(dKey => {
      const incOv = incomingData.calendarDayOverrides[dKey];
      const curOv = calendarDayOverrides[dKey];
      if (!curOv || (incOv && (incOv.updatedAt || 0) >= (curOv.updatedAt || 0))) {
        calendarDayOverrides[dKey] = incOv;
        hasChanges = true;
      }
    });
    localStorage.setItem('dbo_calendar_overrides_v1', JSON.stringify(calendarDayOverrides));
    if (typeof renderMasterCalendarGrid === 'function') renderMasterCalendarGrid();
    if (typeof updateLiveDateBanner === 'function') updateLiveDateBanner();
  }

  if (hasChanges) {
    if (loggedInStudent) {
      const fresh = students.find(s => s.id === loggedInStudent.id);
      if (fresh) {
        loggedInStudent = fresh;
        localStorage.setItem('dbo_parent_logged_v14', JSON.stringify(loggedInStudent));
        if (typeof ensureHistoricalDatesSeeded === 'function') ensureHistoricalDatesSeeded();
        if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
        if (typeof renderParentView === 'function') renderParentView();
      }
    }

    refreshAllViews();

    if (actionDesc) {
      showToast(`อัปเดตข้อมูลล่าสุด: ${actionDesc}`);
      playNotificationChime();
    }
  }
}

async function pullStateFromCloudApi() {
  try {
    const res = await fetch('/api/sync?t=' + Date.now(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.ok) {
        if (json.state && json.state.students && json.state.students.length > 0) {
          applyIncomingState(json.state, '');
          updateRealtimeIndicator(true);
        } else {
          pushStateToCloudApi(buildFullStateSnapshot());
        }
      }
    }
  } catch (e) {
    // Ignore offline/local static errors
  }
}

function handleIncomingMqttMessage(topic, message) {
  if (topic === CLOUD_STATE_TOPIC || topic === REALTIME_SYNC_TOPIC || topic === CLOUD_EVENT_TOPIC) {
    try {
      const payload = JSON.parse(message.toString());
      if (!payload) return;
      const isSelf = (payload.senderId === window.dboClientId);

      // 1. Parent Attendance Update -> Notify Coach Devices
      if (payload.type === 'PARENT_ATTENDANCE_EVENT') {
        const stName = payload.studentName || 'นักเรียน';
        const isAttending = (payload.status === 'attending');
        const nowT = payload.time || 'เมื่อสักครู่';
        const reason = payload.leaveReason ? ` (${payload.leaveReason})` : '';

        const title = isAttending 
          ? '🏀 แจ้งเตือนโค้ช: มีนักเรียนแจ้งเข้าเรียน' 
          : '⚠️ แจ้งเตือนโค้ช: มีนักเรียนแจ้งลาหยุด';
        const bodyText = isAttending
          ? `ผู้ปกครองน้อง ${stName} แจ้งยืนยันเข้าเรียนคลาสวันนี้ (${nowT})`
          : `ผู้ปกครองน้อง ${stName} แจ้งลาหยุดคลาสวันนี้${reason} (${nowT})`;

        // Notify if user is coach or staff
        if (isCoachAuth || currentStaff) {
          if (typeof playNotificationChime === 'function') playNotificationChime();
          if (typeof sendSystemNotification === 'function') {
            sendSystemNotification(title, {
              body: bodyText,
              tag: `coach-parent-att-${payload.studentId}-${Date.now()}`,
              icon: 'assets/images/app-icon-192.png'
            });
          }
          if (typeof triggerTelegramPush === 'function') {
            triggerTelegramPush(bodyText, title);
          }
          if (typeof showToast === 'function') {
            showToast(bodyText);
          }
          if (typeof renderDailyAttendanceBoard === 'function') renderDailyAttendanceBoard();
          if (typeof renderCoachRosterTable === 'function') renderCoachRosterTable();
          if (typeof updateSessionDateDisplay === 'function') updateSessionDateDisplay();
        }
      }

      // 2. Coach Check-In Record -> Notify Parent Devices
      else if (payload.type === 'COACH_CHECKIN_EVENT') {
        if (loggedInStudent) {
          const siblingIds = (typeof getSiblingStudentIds === 'function') 
            ? getSiblingStudentIds(loggedInStudent.id) 
            : [loggedInStudent.id];

          const attMatch = (payload.attendingStudents || []).find(a => 
            a.id === loggedInStudent.id || siblingIds.includes(a.id) || a.name === loggedInStudent.name
          );
          const leaveMatch = (payload.leaveStudents || []).find(l => 
            l.id === loggedInStudent.id || siblingIds.includes(l.id) || l.name === loggedInStudent.name
          );

          if (attMatch) {
            const curRem = (attMatch.remaining !== undefined) ? attMatch.remaining : (loggedInStudent.remaining || 0);
            if (typeof notifyAttendanceCheckIn === 'function') {
              notifyAttendanceCheckIn(attMatch.name, payload.coachName || 'โค้ชโอ๊ต', payload.timeStr || '17:00 น.', curRem);
            }
          } else if (leaveMatch) {
            if (typeof sendSystemLockscreenNotification === 'function') {
              sendSystemLockscreenNotification({
                title: 'บันทึกการลาเรียบร้อย',
                subtitle: 'from DBO Academy',
                body: `น้อง ${leaveMatch.name} • บันทึกการลาโดย ${payload.coachName || 'โค้ช'} ไม่ตัดโควต้า`,
                tag: 'leave-' + leaveMatch.name
              });
            }
            if (typeof triggerTelegramPush === 'function') {
              triggerTelegramPush(`น้อง ${leaveMatch.name} บันทึกการลาโดย ${payload.coachName || 'ทีมโค้ช'} ในรอบ ${payload.dateKey}`, '⚠️ บันทึกการลาสำเร็จ');
            }
          }
        }
      }

      // 2.5 Coach Class Status Override (Canceled / Normal Class) -> Notify Parent Devices
      else if (payload.type === 'COACH_CLASS_STATUS_EVENT') {
        if (!calendarDayOverrides) calendarDayOverrides = {};
        calendarDayOverrides[payload.dateKey] = {
          status: payload.status,
          reason: payload.reason || '',
          time: payload.time || '',
          updatedBy: payload.coachName || 'โค้ช',
          updatedAt: payload.updatedAt || Date.now()
        };
        localStorage.setItem('dbo_calendar_overrides_v1', JSON.stringify(calendarDayOverrides));

        const isCanceled = (payload.status === 'canceled');
        const reasonText = payload.reason ? ` (${payload.reason})` : '';
        const sName = loggedInStudent ? `น้อง ${loggedInStudent.name}` : 'นักเรียน';

        if (isCanceled) {
          const title = '⚠️ แจ้งเตือนงดคลาส DBO Academy';
          const bodyText = `แจ้งผู้ปกครอง${sName}: วันที่ ${payload.dateKey} ทางอคาเดมี่ของดการฝึกซ้อม${reasonText} ขออภัยในความไม่สะดวกครับ`;
          if (typeof playNotificationChime === 'function') playNotificationChime();
          if (typeof sendSystemNotification === 'function') {
            sendSystemNotification(title, {
              body: bodyText,
              tag: `class-cancel-${payload.dateKey}-${Date.now()}`,
              icon: 'assets/images/app-icon-192.png'
            });
          }
          if (typeof triggerTelegramPush === 'function') triggerTelegramPush(bodyText, title);
          if (typeof showToast === 'function') showToast(bodyText);
        } else {
          const title = '🏀 แจ้งเตือนคลาสเรียน DBO Academy';
          const bodyText = `แจ้งผู้ปกครอง${sName}: ยืนยันมีคลาสตามปกติวันที่ ${payload.dateKey} ณ โรงยิมเตชะวิทย์`;
          if (typeof sendSystemNotification === 'function') {
            sendSystemNotification(title, {
              body: bodyText,
              tag: `class-normal-${payload.dateKey}-${Date.now()}`,
              icon: 'assets/images/app-icon-192.png'
            });
          }
          if (typeof triggerTelegramPush === 'function') triggerTelegramPush(bodyText, title);
          if (typeof showToast === 'function') showToast(bodyText);
        }

        if (typeof renderMasterCalendarGrid === 'function') renderMasterCalendarGrid();
        if (typeof updateLiveDateBanner === 'function') updateLiveDateBanner();
        if (typeof renderParentView === 'function') renderParentView();
      }

      // 3. Regular State Sync
      else if ((payload.type === 'REALTIME_STATE_UPDATE' || topic === CLOUD_STATE_TOPIC) && payload.data) {
        applyIncomingState(payload.data, isSelf ? '' : (payload.actionDesc || ''));
      } else if (payload.type === 'REQUEST_SYNC' && !isSelf) {
        const hasNewerData = isCoachAuth || students.some(s => (s._updatedAt || 0) > 0);
        if (hasNewerData) {
          publishToMqttBrokers(REALTIME_SYNC_TOPIC, {
            senderId: window.dboClientId,
            type: 'REALTIME_STATE_UPDATE',
            data: buildFullStateSnapshot()
          });
        }
      }
    } catch (err) {
      console.log('Realtime message handle error:', err);
    }
  }
}

function initRealtimeEngine() {
  // 1. Cross-tab Local BroadcastChannel
  try {
    if ('BroadcastChannel' in window) {
      window.dboRealtimeBC = new BroadcastChannel('dbo_academy_bus');
      window.dboRealtimeBC.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_CHANGED' && event.data.data) {
          applyIncomingState(event.data.data, event.data.actionDesc);
        } else if (event.data && (event.data.type === 'COACH_CLASS_STATUS_EVENT' || event.data.type === 'COACH_CHECKIN_EVENT' || event.data.type === 'PARENT_ATTENDANCE_EVENT')) {
          handleIncomingMqttMessage(REALTIME_SYNC_TOPIC, JSON.stringify(event.data));
        }
      };
    }
  } catch (e) {
    console.log('BroadcastChannel init error:', e);
  }

  // Storage event listener fallback
  window.addEventListener('storage', (e) => {
    if (e.key === 'dbo_students_v14' || e.key === 'dbo_daily_attendance_v14' || e.key === 'dbo_parent_registrations_v14') {
      reloadStateFromStorage();
    }
  });

  // 2. Pull from Vercel Cloud API
  pullStateFromCloudApi();
  setInterval(pullStateFromCloudApi, 8000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      pullStateFromCloudApi();
    }
  });

  // 3. Multi-device Cloud WebSocket Realtime via Dual Redundant MQTT Brokers
  try {
    if (typeof mqtt !== 'undefined') {
      const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
      window.realtimeMqttClient = mqtt.connect(brokerUrl, {
        clientId: window.dboClientId + '_emqx',
        keepalive: 45,
        clean: true,
        reconnectPeriod: 3000
      });

      window.realtimeMqttClient.on('connect', () => {
        console.log('⚡ DBO Real-Time Cloud Engine Connected:', window.dboClientId);
        updateRealtimeIndicator(true);
        window.realtimeMqttClient.subscribe([CLOUD_STATE_TOPIC, REALTIME_SYNC_TOPIC, CLOUD_EVENT_TOPIC], { qos: 1 });

        setTimeout(() => {
          if (window.realtimeMqttClient && window.realtimeMqttClient.connected) {
            window.realtimeMqttClient.publish(REALTIME_SYNC_TOPIC, JSON.stringify({
              senderId: window.dboClientId,
              type: 'REQUEST_SYNC'
            }), { qos: 1 });
          }
        }, 600);
      });

      window.realtimeMqttClient.on('message', handleIncomingMqttMessage);
      window.realtimeMqttClient.on('error', () => {
        if (!window.backupMqttClient || !window.backupMqttClient.connected) {
          updateRealtimeIndicator(false);
        }
      });
      window.realtimeMqttClient.on('offline', () => {
        if (!window.backupMqttClient || !window.backupMqttClient.connected) {
          updateRealtimeIndicator(false);
        }
      });
      window.realtimeMqttClient.on('reconnect', () => {
        updateRealtimeIndicator(true);
      });

      // Secondary Redundant Broker: HiveMQ WSS
      const backupUrl = 'wss://broker.hivemq.com:8884/mqtt';
      window.backupMqttClient = mqtt.connect(backupUrl, {
        clientId: window.dboClientId + '_hive',
        keepalive: 45,
        clean: true,
        reconnectPeriod: 4000
      });

      window.backupMqttClient.on('connect', () => {
        updateRealtimeIndicator(true);
        window.backupMqttClient.subscribe([CLOUD_STATE_TOPIC, REALTIME_SYNC_TOPIC, CLOUD_EVENT_TOPIC], { qos: 1 });
      });
      window.backupMqttClient.on('message', handleIncomingMqttMessage);
      window.backupMqttClient.on('error', () => {});
    }
  } catch (err) {
    console.log('MQTT Engine init error:', err);
  }
}

function updateRealtimeIndicator(isOnline) {
  const ind = document.getElementById('realtimeLiveIndicator');
  if (!ind) return;
  if (isOnline) {
    ind.className = 'inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200';
    ind.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> <span>ออนไลน์ เรียลไทม์</span>';
  } else {
    ind.className = 'inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200';
    ind.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> <span>ออฟไลน์ (ในเครื่อง)</span>';
  }
}
