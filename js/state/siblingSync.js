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

      // NOTE: Contact information is linked for parent login, but remaining quotas are strictly independent!
      // NEVER overwrite or mirror remaining or saturdayRemaining across siblings.
      // Every student's quota is strictly maintained exactly as set by the coach directly.
    }
  });
}

function syncSharedSiblingQuota(sourceStudent, target = 'regular') {
  // Disabled as per coach instruction: Each student quota is strictly independent and controlled by coach directly.
  // Never automatically increase or decrease or mirror quota onto siblings.
  return;
}

function getLinkedStudents(student) {
  if (!student) return [];
  const phone = (student.phone || '').replace(/[^\d]/g, '');
  return students.filter(candidate => {
    if (candidate.id === student.id) return true;
    if (student.siblingGroupId && student.siblingGroupId === candidate.siblingGroupId) return true;
    return Boolean(phone && phone === (candidate.phone || '').replace(/[^\d]/g, ''));
  });
}

function switchSibling(studentId) {
  const target = getLinkedStudents(loggedInStudent).find(student => String(student.id) === String(studentId));
  if (!target) return;
  if (typeof loginAsStudent === 'function') {
    loginAsStudent(target);
  } else {
    loggedInStudent = target;
    localStorage.setItem('dbo_parent_logged_v14', JSON.stringify(loggedInStudent));
    renderParentView();
    showToast(`สลับดูข้อมูลน้อง ${target.name} แล้ว`);
  }
}
