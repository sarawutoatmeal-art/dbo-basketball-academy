// ========================================================
// DBO Basketball Academy - Sibling State & Linked Quotas
// ========================================================

function syncSiblingState(stList) {
  if (!stList || !Array.isArray(stList)) return;
  SIBLING_DEFINITIONS.forEach(def => {
    const members = stList.filter(s => def.names.includes(s.name));
    if (members.length >= 2) {
      // If any member has phone, copy to all siblings
      const linkedPhone = members.map(m => m.phone).find(p => p && p.trim() !== '') || '';
      const parentName = members.map(m => m.parentName).find(p => p && p.trim() !== '') || '';
      const parentRelation = members.map(m => m.parentRelation).find(p => p && p.trim() !== '') || '';

      members.forEach(m => {
        m.siblingGroupId = def.id;
        m.siblingMode = def.mode;
        if (linkedPhone && (!m.phone || m.phone.trim() === '')) {
          m.phone = linkedPhone;
        }
        if (parentName && (!m.parentName || m.parentName.trim() === '')) {
          m.parentName = parentName;
        }
        if (parentRelation && (!m.parentRelation || m.parentRelation.trim() === '')) {
          m.parentRelation = parentRelation;
        }
      });

      // If mode is shared, mirror the quota & history across shared siblings
      if (def.mode === 'shared') {
        let latestTs = 0;
        let sourceMember = members[0];
        members.forEach(m => {
          const ts = m._updatedAt || 0;
          if (ts >= latestTs) {
            latestTs = ts;
            sourceMember = m;
          }
        });

        members.forEach(m => {
          m.remaining = sourceMember.remaining;
          m.saturdayRemaining = sourceMember.saturdayRemaining;
          if (sourceMember.checkInHistory) {
            m.checkInHistory = sourceMember.checkInHistory;
          }
        });
      }
    }
  });
}

function syncSharedSiblingQuota(sourceStudent, target = 'regular') {
  if (!sourceStudent || !sourceStudent.siblingGroupId) return;
  const def = SIBLING_DEFINITIONS.find(d => d.id === sourceStudent.siblingGroupId);
  if (!def || def.mode !== 'shared') return;

  const siblings = students.filter(s => s.siblingGroupId === sourceStudent.siblingGroupId && s.id !== sourceStudent.id);
  siblings.forEach(sib => {
    if (target === 'saturday') {
      sib.saturdayRemaining = sourceStudent.saturdayRemaining;
    } else {
      sib.remaining = sourceStudent.remaining;
    }
    sib._updatedAt = Date.now();
    if (sourceStudent.checkInHistory) {
      sib.checkInHistory = JSON.parse(JSON.stringify(sourceStudent.checkInHistory));
    }
  });
}

function switchSibling(studentIdStr) {
  const sid = parseInt(studentIdStr, 10);
  const target = students.find(s => s.id === sid);
  if (!target) return;

  loggedInStudent = target;
  localStorage.setItem('dbo_parent_logged_v14', JSON.stringify(loggedInStudent));
  
  const cleanPhone = (loggedInStudent.phone || '').replace(/[^\d]/g, '');
  const matched = students.filter(s => (s.phone || '').replace(/[^\d]/g, '') === cleanPhone || (s.siblingGroupId && s.siblingGroupId === target.siblingGroupId));
  if (typeof renderParentView === 'function') {
    renderParentView(matched);
  }
  showToast(`สลับดูข้อมูลน้อง ${target.name} เรียบร้อยแล้ว`);
}
