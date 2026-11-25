const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadAttendance(overrides = {}) {
  const context = vm.createContext(overrides);
  for (const name of ['attendance', 'parent']) {
    const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'modules', name + '.js'), 'utf8');
    vm.runInContext(source, context, { filename: name + '.js' });
  }
  return context;
}

test('Attendance dates change at midnight in Bangkok', () => {
  const app = loadAttendance();
  assert.equal(app.getTodayDateKey(new Date('2026-11-24T16:59:59Z')), '2026-11-24');
  assert.equal(app.getTodayDateKey(new Date('2026-11-24T17:00:00Z')), '2026-11-25');
  assert.equal(app.isAttendanceDateKey('2026-02-30'), false);
});

test('RSVP and leave persist the selected date without deducting quota', () => {
  const broadcasts = [];
  const student = { id: 17, name: 'Demo', remaining: 5 };
  const app = loadAttendance({
    loggedInStudent: student,
    dailyAttendance: {},
    window: { dboRealtimeBC: { postMessage: payload => broadcasts.push(payload) } },
    saveState() {},
    playNotificationChime() {},
    showToast() {},
    triggerTelegramPush() {}
  });
  app.renderParentView = () => {};
  app.renderDailyAttendanceBoard = () => {};
  assert.equal(app.setTodayAttendanceFromParent('attending', '', '2026-11-26', 'คลาสปกติ'), true);
  assert.equal(app.dailyAttendance['2026-11-26'][17].slot, 'คลาสปกติ');
  assert.equal(app.setTodayAttendanceFromParent('leave', 'ทดสอบ', '2026-11-27'), true);
  assert.equal(app.dailyAttendance['2026-11-27'][17].status, 'leave');
  assert.equal(app.setTodayAttendanceFromParent('leave', '', '2026-11-31'), false);
  assert.deepEqual(broadcasts.map(event => event.dateKey), ['2026-11-26', '2026-11-27']);
  assert.equal(student.remaining, 5);
});

test('Editing or repeating a training record applies only the quota difference', () => {
  const app = loadAttendance();
  const original = { slot: 'คลาสปกติ', attendingStudents: [{ id: 17 }, { id: 17 }] };
  assert.equal(app.getRecordQuotaChanges(original, original).length, 0);
  const changed = app.getRecordQuotaChanges(original, { slot: 'คลาสวันเสาร์', attendingStudents: [{ id: 17 }] });
  assert.deepEqual(JSON.parse(JSON.stringify(changed)), [
    { studentId: '17', course: 'regular', delta: 1 },
    { studentId: '17', course: 'saturday', delta: -1 }
  ]);
});

test('Moving a record preserves unrelated attendance on the original day', () => {
  const original = { id: 'round-a', date: '2026-11-25', coach: 'Coach', attendingStudents: [{ id: 17 }] };
  const otherAttendance = { 17: { recordId: original.id, status: 'attending' }, 23: { status: 'leave', updatedBy: 'parent' } };
  const app = loadAttendance({ dailyAttendance: { [original.date]: otherAttendance }, teachingRecords: [] });
  const next = { ...original, date: '2026-11-26', leaveStudents: [], updatedAt: 1000 };
  app.updateRecordedAttendance(original, next, '17:30 น.');
  assert.equal(app.dailyAttendance[original.date][17], undefined);
  assert.equal(app.dailyAttendance[original.date][23].status, 'leave');
  assert.equal(app.dailyAttendance[next.date][17].recordId, original.id);
});
test('Parent responses match the coach slot with either label', () => {
  const regular = 'คลาสปกติ 17:30 - 19:30 น.';
  const saturday = 'คลาสวันเสาร์ Team DBO 16:00 - 17:30 น.';
  const control = { value: regular };
  const app = loadAttendance({
    document: { getElementById: () => control },
    dailyAttendance: { '2026-11-28': {
      1: { status: 'attending', updatedBy: 'parent', slot: '17:30 - 19:30 น. (คลาสปกติ)' },
      2: { status: 'attending', updatedBy: 'parent', slot: '16:00 - 17:30 น. (คลาสวันเสาร์ Coach Oat)' }
    } }
  });
  assert.deepEqual(Object.keys(app.getPendingAttendanceForSlot('2026-11-28')), ['1']);
  control.value = saturday;
  assert.deepEqual(Object.keys(app.getPendingAttendanceForSlot('2026-11-28')), ['2']);
  control.value = 'คลาสวันเสาร์ Basic Coach Oat 09:00 - 10:30 น.';
  assert.deepEqual(Object.keys(app.getPendingAttendanceForSlot('2026-11-28')), []);
});

test('Save, duplicate, edit and delete a round without changing a sibling balance', async () => {
  const attendance = { dataset: { studentId: '17', status: 'attending' } };
  const student = { id: 17, name: 'Demo', remaining: 5, saturdayRemaining: 4, siblingGroupId: 'demo-family' };
  const sibling = { id: 18, name: 'Demo sibling', remaining: 7, saturdayRemaining: 3, siblingGroupId: 'demo-family' };
  const fields = {
    editingRecordId: { value: '' },
    recordDateInput: { value: '2026-11-26' },
    recordSlotSelect: { value: 'คลาสปกติ 17:30 - 19:30 น.' },
    recordCoachSelect: { value: 'ผู้ช่วยโค้ช (Assistant)' },
    recordTopicInput: { value: 'Passing' },
    recordSendPushCheckbox: { checked: false }
  };
  let closed = false;
  let copied = '';
  fields.teachingRecordModal = { classList: { contains: () => closed, add: () => { closed = true; } } };
  const app = loadAttendance({
    isCoachAuth: true,
    loggedInStudent: null,
    students: [student, sibling],
    dailyAttendance: {},
    teachingRecords: [],
    document: { getElementById: id => fields[id], querySelectorAll: () => [attendance] },
    navigator: { clipboard: { writeText: async text => { copied = text; } } },
    showToast() {},
    saveState() {},
    confirm: () => true
  });
  const siblingSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'state', 'siblingSync.js'), 'utf8');
  vm.runInContext(siblingSource, app);
  app.renderTeachingRecordsList = app.updateSessionDateDisplay = app.renderDailyAttendanceBoard = () => {};
  await app.saveTeachingRecordFromModal();
  await app.saveTeachingRecordFromModal();
  closed = false;
  await app.saveTeachingRecordFromModal();
  const record = app.teachingRecords[0];
  assert.equal(app.teachingRecords.length, 1);
  assert.equal(student.remaining, 4);
  await app.copyTeachingRecordSummary(record.id);
  assert.match(copied, /26 พฤศจิกายน 2569/);
  assert.match(copied, /มาเรียน 1 คน · ลา 0 คน/);
  assert.match(copied, /Passing/);

  fields.editingRecordId.value = record.id;
  fields.recordDateInput.value = '2026-11-28';
  fields.recordSlotSelect.value = 'คลาสวันเสาร์ Team DBO 16:00 - 17:30 น.';
  await app.saveTeachingRecordFromModal();
  assert.equal(student.remaining, 5);
  assert.equal(student.saturdayRemaining, 3);
  assert.equal(app.dailyAttendance['2026-11-28'][17].recordId, record.id);
  app.isCoachAuth = false;
  app.deleteTeachingRecord(record.id);
  assert.equal(app.teachingRecords.length, 1);
  app.isCoachAuth = true;
  app.deleteTeachingRecord(record.id);
  assert.equal(student.saturdayRemaining, 4);
  assert.equal(sibling.saturdayRemaining, 3);
  assert.equal(sibling.remaining, 7);
});

test('Show dated assessment trends only with two comparable results', () => {
  const app = loadAttendance();
  const element = {};
  app.renderMeasurementHistory([{ val: 27 }, { val: 31, dateKey: '2026-11-25' }], 31, element);
  assert.equal(element.textContent, 'ล่าสุด 31 ซม.');
  app.renderMeasurementHistory([{ val: 27, dateKey: '2026-11-20' }, { val: 31, dateKey: '2026-11-25' }], 31, element);
  assert.match(element.textContent, /27 ซม\. → .*31 ซม\./);
});
test('A parent can switch to a linked sibling and keeps that sibling’s own balance', () => {
  const child = { id: 17, name: 'Demo one', phone: '000-000-1212', remaining: 5 };
  const sibling = { id: 18, name: 'Demo two', phone: '0000001212', remaining: 2 };
  const unrelated = { id: 19, name: 'Demo other', remaining: 3 };
  let viewed;
  const app = vm.createContext({
    students: [child, sibling, unrelated],
    loggedInStudent: child,
    localStorage: { setItem() {} },
    renderParentView() { viewed = app.loggedInStudent; },
    showToast() {}
  });
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'state', 'siblingSync.js'), 'utf8');
  vm.runInContext(source, app);
  app.switchSibling('19');
  assert.equal(app.loggedInStudent.id, 17);
  app.switchSibling('18');
  assert.equal(viewed.id, 18);
  assert.equal(viewed.remaining, 2);
});

test('Demo never opens an MQTT connection or calls the production sync API', async () => {
  const listeners = [];
  const window = { addEventListener: event => listeners.push(event) };
  const app = vm.createContext({
    window, IS_TEST_DEMO_ENV: true,
    fetch() { assert.fail('Demo should never fetch cloud state'); },
    mqtt: { connect() { assert.fail('Demo should never open MQTT'); } }
  });
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'state', 'cloudSync.js'), 'utf8');
  vm.runInContext(source, app);
  app.initRealtimeEngine();
  await app.pushStateToCloudApi({});
  app.publishToMqttBrokers('test', {});
  assert.ok(listeners.includes('storage'));
});
test('Calendar displays complete weeks for four-, five- and six-row months', () => {
  function createElement(tag) {
    return {
      tag, children: [], dataset: {}, attributes: {},
      appendChild(child) { this.children.push(child); },
      setAttribute(name, value) { this.attributes[name] = value; },
      set innerHTML(value) { this.children = []; }
    };
  }
  const grid = createElement('div');
  const app = loadAttendance({
    calendarDayOverrides: {},
    document: { createElement, getElementById: id => id === 'masterCalendarGrid' ? grid : null }
  });
  app.getTodayDateKey = () => '2026-02-01';
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'modules', 'schedule.js'), 'utf8');
  vm.runInContext(source, app);
  app.renderMasterCalendarGrid();
  assert.equal(grid.children.length, 28);
  assert.equal(grid.children[0].attributes['aria-current'], 'date');
  app.stepMasterCalendarMonth(1);
  assert.equal(grid.children.length, 35);
  app.stepMasterCalendarMonth(2);
  assert.equal(grid.children.length, 42);
  assert.equal(grid.children.filter(day => day.tag === 'button').length, 31);
});
