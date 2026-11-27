// ========================================================
// DBO Basketball Academy - Interactive Coach Tactic Board
// (Full/Half DBO Court with Center Logo, Draggable Players/Ball/Cones,
//  Tactical Arrows/Dribble/Screen/Freehand Drawing, Presets & Real Student Lineup)
// ========================================================

const DBO_COACH_BOARD_SAVED_KEY = 'dbo_coach_board_saved_plays_v1';

const coachBoardState = {
  initialized: false,
  courtMode: 'full', // 'full' | 'half'
  tool: 'move',      // 'move' | 'arrow' | 'dribble' | 'screen' | 'pen'
  strokeColor: '#DEB95B',
  showDefense: true,
  isFullscreen: false,
  activeTokenId: null,
  isDrawing: false,
  currentDrawing: null,
  drawings: [],      // Array of { type, color, points: [{x, y}] } in normalized 0..1000x0..1500 coords
  tokens: [],        // Normalized coordinates: x in [0..100], y in [0..100]
  lineupNames: {
    O1: 'PG (1)',
    O2: 'SG (2)',
    O3: 'SF (3)',
    O4: 'PF (4)',
    O5: 'C (5)'
  }
};

function getDefaultCoachBoardTokens(mode = 'full', preset = '5out') {
  // Normalized coordinates: x (0=left, 100=right), y (0=top hoop, 100=bottom hoop/midcourt)
  if (preset === 'pick_roll') {
    return [
      { id: 'O1', kind: 'offense', num: '1', label: coachBoardState.lineupNames.O1, x: 50, y: 38 },
      { id: 'O2', kind: 'offense', num: '2', label: coachBoardState.lineupNames.O2, x: 86, y: 26 },
      { id: 'O3', kind: 'offense', num: '3', label: coachBoardState.lineupNames.O3, x: 14, y: 26 },
      { id: 'O4', kind: 'offense', num: '4', label: coachBoardState.lineupNames.O4, x: 18, y: 12 },
      { id: 'O5', kind: 'offense', num: '5', label: coachBoardState.lineupNames.O5, x: 42, y: 33 },
      { id: 'D1', kind: 'defense', num: 'X1', label: 'X1', x: 50, y: 31 },
      { id: 'D2', kind: 'defense', num: 'X2', label: 'X2', x: 78, y: 22 },
      { id: 'D3', kind: 'defense', num: 'X3', label: 'X3', x: 22, y: 22 },
      { id: 'D4', kind: 'defense', num: 'X4', label: 'X4', x: 26, y: 13 },
      { id: 'D5', kind: 'defense', num: 'X5', label: 'X5', x: 44, y: 26 },
      { id: 'BALL', kind: 'ball', num: '🏀', label: 'บอล', x: 55, y: 37 }
    ];
  }

  if (preset === 'zone_23') {
    return [
      { id: 'O1', kind: 'offense', num: '1', label: coachBoardState.lineupNames.O1, x: 50, y: 40 },
      { id: 'O2', kind: 'offense', num: '2', label: coachBoardState.lineupNames.O2, x: 82, y: 30 },
      { id: 'O3', kind: 'offense', num: '3', label: coachBoardState.lineupNames.O3, x: 18, y: 30 },
      { id: 'O4', kind: 'offense', num: '4', label: coachBoardState.lineupNames.O4, x: 50, y: 23 },
      { id: 'O5', kind: 'offense', num: '5', label: coachBoardState.lineupNames.O5, x: 64, y: 13 },
      { id: 'D1', kind: 'defense', num: 'X1', label: 'X1', x: 38, y: 26 },
      { id: 'D2', kind: 'defense', num: 'X2', label: 'X2', x: 62, y: 26 },
      { id: 'D3', kind: 'defense', num: 'X3', label: 'X3', x: 26, y: 14 },
      { id: 'D4', kind: 'defense', num: 'X4', label: 'X4', x: 50, y: 13 },
      { id: 'D5', kind: 'defense', num: 'X5', label: 'X5', x: 74, y: 14 },
      { id: 'BALL', kind: 'ball', num: '🏀', label: 'บอล', x: 54, y: 39 }
    ];
  }

  if (preset === 'zone_131') {
    return [
      { id: 'O1', kind: 'offense', num: '1', label: coachBoardState.lineupNames.O1, x: 50, y: 42 },
      { id: 'O2', kind: 'offense', num: '2', label: coachBoardState.lineupNames.O2, x: 84, y: 32 },
      { id: 'O3', kind: 'offense', num: '3', label: coachBoardState.lineupNames.O3, x: 16, y: 32 },
      { id: 'O4', kind: 'offense', num: '4', label: coachBoardState.lineupNames.O4, x: 84, y: 13 },
      { id: 'O5', kind: 'offense', num: '5', label: coachBoardState.lineupNames.O5, x: 36, y: 18 },
      { id: 'D1', kind: 'defense', num: 'X1', label: 'X1', x: 50, y: 31 },
      { id: 'D2', kind: 'defense', num: 'X2', label: 'X2', x: 26, y: 23 },
      { id: 'D3', kind: 'defense', num: 'X3', label: 'X3', x: 50, y: 22 },
      { id: 'D4', kind: 'defense', num: 'X4', label: 'X4', x: 74, y: 23 },
      { id: 'D5', kind: 'defense', num: 'X5', label: 'X5', x: 50, y: 12 },
      { id: 'BALL', kind: 'ball', num: '🏀', label: 'บอล', x: 54, y: 41 }
    ];
  }

  if (preset === 'box_out') {
    return [
      { id: 'O1', kind: 'offense', num: '1', label: coachBoardState.lineupNames.O1, x: 50, y: 37 },
      { id: 'O2', kind: 'offense', num: '2', label: coachBoardState.lineupNames.O2, x: 78, y: 27 },
      { id: 'O3', kind: 'offense', num: '3', label: coachBoardState.lineupNames.O3, x: 22, y: 27 },
      { id: 'O4', kind: 'offense', num: '4', label: coachBoardState.lineupNames.O4, x: 30, y: 16 },
      { id: 'O5', kind: 'offense', num: '5', label: coachBoardState.lineupNames.O5, x: 70, y: 16 },
      { id: 'D1', kind: 'defense', num: 'X1', label: 'X1', x: 50, y: 27 },
      { id: 'D2', kind: 'defense', num: 'X2', label: 'X2', x: 64, y: 21 },
      { id: 'D3', kind: 'defense', num: 'X3', label: 'X3', x: 36, y: 21 },
      { id: 'D4', kind: 'defense', num: 'X4', label: 'X4', x: 38, y: 14 },
      { id: 'D5', kind: 'defense', num: 'X5', label: 'X5', x: 62, y: 14 },
      { id: 'BALL', kind: 'ball', num: '🏀', label: 'บอล', x: 50, y: 10 }
    ];
  }

  if (preset === 'cone_drill') {
    return [
      { id: 'O1', kind: 'offense', num: '1', label: coachBoardState.lineupNames.O1, x: 50, y: 46 },
      { id: 'O2', kind: 'offense', num: '2', label: coachBoardState.lineupNames.O2, x: 50, y: 54 },
      { id: 'O3', kind: 'offense', num: '3', label: coachBoardState.lineupNames.O3, x: 50, y: 62 },
      { id: 'O4', kind: 'offense', num: '4', label: coachBoardState.lineupNames.O4, x: 82, y: 28 },
      { id: 'O5', kind: 'offense', num: '5', label: coachBoardState.lineupNames.O5, x: 18, y: 28 },
      { id: 'C1', kind: 'cone', num: '🔺', label: 'กรวย 1', x: 50, y: 36 },
      { id: 'C2', kind: 'cone', num: '🔺', label: 'กรวย 2', x: 36, y: 28 },
      { id: 'C3', kind: 'cone', num: '🔺', label: 'กรวย 3', x: 64, y: 22 },
      { id: 'C4', kind: 'cone', num: '🔺', label: 'กรวย 4', x: 38, y: 16 },
      { id: 'BALL', kind: 'ball', num: '🏀', label: 'บอล', x: 55, y: 45 }
    ];
  }

  // Default: 5-Out Motion
  return [
    { id: 'O1', kind: 'offense', num: '1', label: coachBoardState.lineupNames.O1, x: 50, y: 40 },
    { id: 'O2', kind: 'offense', num: '2', label: coachBoardState.lineupNames.O2, x: 82, y: 31 },
    { id: 'O3', kind: 'offense', num: '3', label: coachBoardState.lineupNames.O3, x: 18, y: 31 },
    { id: 'O4', kind: 'offense', num: '4', label: coachBoardState.lineupNames.O4, x: 86, y: 14 },
    { id: 'O5', kind: 'offense', num: '5', label: coachBoardState.lineupNames.O5, x: 14, y: 14 },
    { id: 'D1', kind: 'defense', num: 'X1', label: 'X1', x: 50, y: 32 },
    { id: 'D2', kind: 'defense', num: 'X2', label: 'X2', x: 72, y: 26 },
    { id: 'D3', kind: 'defense', num: 'X3', label: 'X3', x: 28, y: 26 },
    { id: 'D4', kind: 'defense', num: 'X4', label: 'X4', x: 74, y: 14 },
    { id: 'D5', kind: 'defense', num: 'X5', label: 'X5', x: 26, y: 14 },
    { id: 'BALL', kind: 'ball', num: '🏀', label: 'บอล', x: 55, y: 39 }
  ];
}

function initCoachBoard() {
  const stage = document.getElementById('dboCoachBoardStage');
  if (!stage) return;

  if (!coachBoardState.initialized) {
    coachBoardState.tokens = getDefaultCoachBoardTokens(coachBoardState.courtMode, '5out');
    bindCoachBoardEvents();
    coachBoardState.initialized = true;
  }

  populateCoachBoardStudentAssigners();
  renderCoachBoardSavedPlaysList();
  renderCoachBoardTokens();
  resizeAndRenderCoachBoardCanvas();
  updateCoachBoardToolbarUI();
}

function setCoachBoardCourtMode(mode) {
  coachBoardState.courtMode = mode === 'half' ? 'half' : 'full';
  const stage = document.getElementById('dboCoachBoardStage');
  const fullSvg = document.getElementById('dboFullCourtSvg');
  const halfSvg = document.getElementById('dboHalfCourtSvg');

  if (stage) {
    stage.dataset.courtMode = coachBoardState.courtMode;
  }
  if (fullSvg && halfSvg) {
    if (coachBoardState.courtMode === 'half') {
      fullSvg.classList.add('hidden');
      halfSvg.classList.remove('hidden');
    } else {
      halfSvg.classList.add('hidden');
      fullSvg.classList.remove('hidden');
    }
  }

  updateCoachBoardToolbarUI();
  setTimeout(() => {
    renderCoachBoardTokens();
    resizeAndRenderCoachBoardCanvas();
  }, 30);
}

function setCoachBoardTool(toolName) {
  coachBoardState.tool = toolName;
  updateCoachBoardToolbarUI();
}

function setCoachBoardColor(colorHex) {
  coachBoardState.strokeColor = colorHex;
  updateCoachBoardToolbarUI();
}

function toggleCoachBoardDefense() {
  coachBoardState.showDefense = !coachBoardState.showDefense;
  renderCoachBoardTokens();
  updateCoachBoardToolbarUI();
}

function addCoachBoardCone() {
  const existingCones = coachBoardState.tokens.filter(t => t.kind === 'cone').length;
  const num = existingCones + 1;
  const offset = (existingCones % 5) * 8;
  coachBoardState.tokens.push({
    id: 'CONE_' + Date.now() + '_' + num,
    kind: 'cone',
    num: '🔺',
    label: `กรวย ${num}`,
    x: Math.min(85, 34 + offset),
    y: 48
  });
  coachBoardState.tool = 'move';
  renderCoachBoardTokens();
  updateCoachBoardToolbarUI();
  if (typeof showToast === 'function') showToast(`เพิ่มกรวยฝึกซ้อม #${num} บนสนามแล้ว (ลากวางได้เลย)`);
}

function clearCoachBoardCones() {
  coachBoardState.tokens = coachBoardState.tokens.filter(t => t.kind !== 'cone');
  renderCoachBoardTokens();
}

function applyCoachBoardPreset(presetKey) {
  coachBoardState.tokens = getDefaultCoachBoardTokens(coachBoardState.courtMode, presetKey);
  coachBoardState.drawings = [];

  // Add sample tactical diagram arrows for each preset so coaches see an instant visual play!
  if (presetKey === 'pick_roll') {
    coachBoardState.drawings.push(
      { type: 'screen', color: '#DEB95B', points: [{ x: 420, y: 330 }, { x: 465, y: 370 }] },
      { type: 'dribble', color: '#DEB95B', points: [{ x: 500, y: 380 }, { x: 370, y: 310 }, { x: 380, y: 180 }] },
      { type: 'arrow', color: '#FFFFFF', points: [{ x: 420, y: 330 }, { x: 495, y: 165 }] }
    );
  } else if (presetKey === '5out') {
    coachBoardState.drawings.push(
      { type: 'arrow', color: '#DEB95B', points: [{ x: 500, y: 400 }, { x: 785, y: 315 }] },
      { type: 'arrow', color: '#FFFFFF', points: [{ x: 500, y: 400 }, { x: 500, y: 150 }] }
    );
  } else if (presetKey === 'cone_drill') {
    coachBoardState.showDefense = false;
    coachBoardState.drawings.push(
      { type: 'dribble', color: '#DEB95B', points: [{ x: 500, y: 440 }, { x: 500, y: 365 }, { x: 370, y: 280 }, { x: 630, y: 220 }, { x: 390, y: 160 }, { x: 485, y: 115 }] }
    );
  } else {
    coachBoardState.showDefense = true;
  }

  renderCoachBoardTokens();
  renderCoachBoardCanvas();
  updateCoachBoardToolbarUI();
  if (typeof showToast === 'function') {
    const names = {
      '5out': 'แผนบุก 5-Out Motion',
      'pick_roll': 'แผน Pick & Roll (คู่ 1-5)',
      'zone_23': 'เกมรับ 2-3 Zone Defense',
      'zone_131': 'เกมรับ 1-3-1 Zone Trap',
      'box_out': 'การจัดตำแหน่ง Box Out & Rebound',
      'cone_drill': 'แบบฝึกซ้อมเลี้ยงบอลอ้อมกรวย (Cone Drill)'
    };
    showToast(`โหลดรูปแบบ "${names[presetKey] || presetKey}" เรียบร้อย`);
  }
}

function undoCoachBoardDrawing() {
  if (coachBoardState.drawings.length > 0) {
    coachBoardState.drawings.pop();
    renderCoachBoardCanvas();
  }
}

function clearCoachBoardDrawings() {
  coachBoardState.drawings = [];
  renderCoachBoardCanvas();
  if (typeof showToast === 'function') showToast('ล้างเส้นวาดบนสนามเรียบร้อย');
}

function resetCoachBoardAll() {
  coachBoardState.drawings = [];
  coachBoardState.showDefense = true;
  coachBoardState.tokens = getDefaultCoachBoardTokens(coachBoardState.courtMode, '5out');
  renderCoachBoardTokens();
  renderCoachBoardCanvas();
  updateCoachBoardToolbarUI();
  if (typeof showToast === 'function') showToast('รีเซ็ตกระดานโค้ชกลับสู่ตำแหน่งเริ่มต้นแล้ว');
}

function assignStudentToBoardPosition(posKey, studentName) {
  const posNum = posKey.replace('O', '');
  const posTitles = { '1': 'PG', '2': 'SG', '3': 'SF', '4': 'PF', '5': 'C' };
  const cleanLabel = studentName ? studentName : `${posTitles[posNum] || 'P'} (${posNum})`;
  coachBoardState.lineupNames[posKey] = cleanLabel;

  const tok = coachBoardState.tokens.find(t => t.id === posKey);
  if (tok) {
    tok.label = cleanLabel;
    renderCoachBoardTokens();
  }
}

function populateCoachBoardStudentAssigners() {
  const container = document.getElementById('coachBoardLineupSelectors');
  if (!container) return;

  const sortedStudents = (typeof students !== 'undefined' && Array.isArray(students))
    ? [...students].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'th'))
    : [];

  const positions = [
    { key: 'O1', num: '1', role: 'PG (การ์ดจ่าย)' },
    { key: 'O2', num: '2', role: 'SG (ชูตติ้งการ์ด)' },
    { key: 'O3', num: '3', role: 'SF (สมอลฟอร์เวิร์ด)' },
    { key: 'O4', num: '4', role: 'PF (เพาเวอร์ฟอร์เวิร์ด)' },
    { key: 'O5', num: '5', role: 'C (เซ็นเตอร์)' }
  ];

  container.innerHTML = positions.map(p => {
    const currentLabel = coachBoardState.lineupNames[p.key] || '';
    const optionsHtml = sortedStudents.map(st => {
      const selected = currentLabel === st.name ? 'selected' : '';
      return `<option value="${escapeHtml(st.name)}" ${selected}>น้อง ${escapeHtml(st.name)}</option>`;
    }).join('');

    return `
      <div class="flex items-center gap-1.5 bg-nike-cloud border border-nike-hairlineSoft rounded-xl px-2.5 py-1.5">
        <span class="w-6 h-6 rounded-full bg-[#241044] text-[#DEB95B] border border-[#DEB95B] flex items-center justify-center text-xs font-extrabold font-mono flex-shrink-0">${p.num}</span>
        <div class="min-w-0 flex-1">
          <div class="text-[10px] font-bold text-nike-mute leading-none">${p.role}</div>
          <select onchange="assignStudentToBoardPosition('${p.key}', this.value)" aria-label="เลือกนักเรียนตำแหน่ง ${p.role}" class="w-full bg-transparent text-xs font-bold text-nike-ink focus:outline-hidden cursor-pointer truncate mt-0.5">
            <option value="">-- ${p.role.split(' ')[0]} (${p.num}) --</option>
            ${optionsHtml}
          </select>
        </div>
      </div>
    `;
  }).join('');
}

function renderCoachBoardTokens() {
  const layer = document.getElementById('dboCoachBoardTokensLayer');
  if (!layer) return;

  layer.innerHTML = '';
  const isHalf = coachBoardState.courtMode === 'half';

  coachBoardState.tokens.forEach(tok => {
    if (tok.kind === 'defense' && !coachBoardState.showDefense) return;

    // In half-court mode, scale top-half y [0..55] into [0..92] so tokens fill the spacious half-court
    const displayY = isHalf ? Math.min(94, Math.max(6, tok.y * 1.68)) : Math.min(96, Math.max(4, tok.y));
    const displayX = Math.min(95, Math.max(5, tok.x));

    const el = document.createElement('div');
    el.className = `dbo-board-token dbo-token-${tok.kind}`;
    el.dataset.tokenId = tok.id;
    el.style.left = `${displayX}%`;
    el.style.top = `${displayY}%`;

    if (tok.kind === 'ball') {
      el.innerHTML = `
        <div class="dbo-token-ball-circle" title="ลูกบาสเกตบอล (ลากเพื่อย้ายตำแหน่ง)">🏀</div>
      `;
    } else if (tok.kind === 'cone') {
      el.innerHTML = `
        <div class="dbo-token-cone-circle" title="${escapeHtml(tok.label)}">🔺</div>
        <span class="dbo-token-nameplate">${escapeHtml(tok.label)}</span>
      `;
    } else {
      el.innerHTML = `
        <div class="dbo-token-disc">${escapeHtml(tok.num)}</div>
        <span class="dbo-token-nameplate">${escapeHtml(tok.label)}</span>
      `;
    }

    layer.appendChild(el);
  });
}

function updateCoachBoardToolbarUI() {
  // Court Mode buttons
  ['full', 'half'].forEach(m => {
    const btn = document.getElementById(`btnCourtMode-${m}`);
    if (btn) {
      const active = coachBoardState.courtMode === m;
      btn.className = active
        ? 'px-3 py-1.5 rounded-full text-xs font-bold bg-[#241044] text-[#DEB95B] border border-[#DEB95B] shadow-2xs cursor-pointer transition-all'
        : 'px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-nike-ink border border-nike-hairlineSoft hover:bg-nike-cloud cursor-pointer transition-all';
    }
  });

  // Tool Mode buttons
  ['move', 'arrow', 'dribble', 'screen', 'pen'].forEach(t => {
    const btn = document.getElementById(`btnBoardTool-${t}`);
    if (btn) {
      const active = coachBoardState.tool === t;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.className = active
        ? 'dbo-tool-btn active flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#241044] text-[#DEB95B] ring-2 ring-[#DEB95B] cursor-pointer transition-all'
        : 'dbo-tool-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-nike-cloud text-nike-ink border border-nike-hairlineSoft hover:bg-purple-100/60 cursor-pointer transition-all';
    }
  });

  // Color swatches
  document.querySelectorAll('[data-board-color]').forEach(sw => {
    const c = sw.getAttribute('data-board-color');
    const active = c.toLowerCase() === coachBoardState.strokeColor.toLowerCase();
    sw.style.transform = active ? 'scale(1.18)' : 'scale(1)';
    sw.style.boxShadow = active ? '0 0 0 2px #241044, 0 0 0 4px #DEB95B' : 'none';
  });

  // Defense toggle button
  const defBtn = document.getElementById('btnToggleBoardDefense');
  if (defBtn) {
    defBtn.className = coachBoardState.showDefense
      ? 'px-3 py-1.5 rounded-full text-xs font-bold bg-rose-700 text-white border border-rose-800 flex items-center gap-1.5 cursor-pointer transition-all'
      : 'px-3 py-1.5 rounded-full text-xs font-semibold bg-nike-cloud text-nike-mute border border-nike-hairlineSoft flex items-center gap-1.5 cursor-pointer transition-all';
    const span = defBtn.querySelector('span');
    if (span) span.textContent = coachBoardState.showDefense ? 'ทีมรับ X1-X5: เปิด' : 'ทีมรับ X1-X5: ปิด';
  }

  // Stage cursor class
  const stage = document.getElementById('dboCoachBoardStage');
  if (stage) {
    stage.style.cursor = coachBoardState.tool === 'move' ? 'grab' : 'crosshair';
  }
}

function resizeAndRenderCoachBoardCanvas() {
  const stage = document.getElementById('dboCoachBoardStage');
  const canvas = document.getElementById('dboCoachBoardCanvas');
  if (!stage || !canvas) return;

  const rect = stage.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  renderCoachBoardCanvas();
}

function renderCoachBoardCanvas() {
  const stage = document.getElementById('dboCoachBoardStage');
  const canvas = document.getElementById('dboCoachBoardCanvas');
  if (!stage || !canvas) return;

  const rect = stage.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  if (w === 0 || h === 0) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  const allStrokes = [...coachBoardState.drawings];
  if (coachBoardState.currentDrawing) {
    allStrokes.push(coachBoardState.currentDrawing);
  }

  const isHalf = coachBoardState.courtMode === 'half';

  allStrokes.forEach(stroke => {
    if (!stroke || !Array.isArray(stroke.points) || stroke.points.length < 2) return;

    const pts = stroke.points.map(p => ({
      x: (p.x / 1000) * w,
      y: ((isHalf ? Math.min(1000, p.y * 1.68) : p.y) / 1000) * h
    }));

    ctx.save();
    ctx.strokeStyle = stroke.color || '#DEB95B';
    ctx.fillStyle = stroke.color || '#DEB95B';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 4;

    if (stroke.type === 'dribble') {
      ctx.setLineDash([10, 8]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    const last = pts[pts.length - 1];
    const prev = pts[Math.max(0, pts.length - 4)] || pts[0];
    const angle = Math.atan2(last.y - prev.y, last.x - prev.x);

    if (stroke.type === 'arrow' || stroke.type === 'dribble') {
      // Draw tactical arrowhead
      const headLen = 15;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(
        last.x - headLen * Math.cos(angle - Math.PI / 6),
        last.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        last.x - headLen * Math.cos(angle + Math.PI / 6),
        last.y - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    } else if (stroke.type === 'screen') {
      // Draw perpendicular Screen / Pick T-bar
      const barHalf = 13;
      const perp = angle + Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(last.x - barHalf * Math.cos(perp), last.y - barHalf * Math.sin(perp));
      ctx.lineTo(last.x + barHalf * Math.cos(perp), last.y + barHalf * Math.sin(perp));
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    ctx.restore();
  });
}

function bindCoachBoardEvents() {
  const stage = document.getElementById('dboCoachBoardStage');
  if (!stage) return;

  window.addEventListener('resize', () => {
    resizeAndRenderCoachBoardCanvas();
  });

  stage.addEventListener('pointerdown', (e) => {
    const rect = stage.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const tokenEl = e.target.closest('.dbo-board-token');
    const isHalf = coachBoardState.courtMode === 'half';

    // If user touches a player/ball/cone token, always allow dragging it smoothly
    if (tokenEl && (coachBoardState.tool === 'move' || e.pointerType === 'mouse')) {
      e.preventDefault();
      const tokenId = tokenEl.dataset.tokenId;
      coachBoardState.activeTokenId = tokenId;
      tokenEl.classList.add('dragging');
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      return;
    }

    if (coachBoardState.tool === 'move') return;

    // Drawing mode
    e.preventDefault();
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}

    const relX = ((e.clientX - rect.left) / rect.width) * 1000;
    const rawRelY = ((e.clientY - rect.top) / rect.height) * 1000;
    const relY = isHalf ? (rawRelY / 1.68) : rawRelY;

    coachBoardState.isDrawing = true;
    coachBoardState.currentDrawing = {
      type: coachBoardState.tool,
      color: coachBoardState.strokeColor,
      points: [{ x: relX, y: relY }]
    };
  });

  stage.addEventListener('pointermove', (e) => {
    const rect = stage.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const isHalf = coachBoardState.courtMode === 'half';

    // 1. Dragging a player/ball/cone token
    if (coachBoardState.activeTokenId) {
      e.preventDefault();
      const pctX = Math.min(95, Math.max(5, ((e.clientX - rect.left) / rect.width) * 100));
      const rawPctY = Math.min(96, Math.max(4, ((e.clientY - rect.top) / rect.height) * 100));

      const tok = coachBoardState.tokens.find(t => t.id === coachBoardState.activeTokenId);
      if (tok) {
        tok.x = Math.round(pctX * 10) / 10;
        tok.y = Math.round((isHalf ? (rawPctY / 1.68) : rawPctY) * 10) / 10;
      }

      const tokenEl = stage.querySelector(`.dbo-board-token[data-token-id="${coachBoardState.activeTokenId}"]`);
      if (tokenEl) {
        tokenEl.style.left = `${pctX}%`;
        tokenEl.style.top = `${rawPctY}%`;
      }
      return;
    }

    // 2. Drawing tactical line
    if (coachBoardState.isDrawing && coachBoardState.currentDrawing) {
      e.preventDefault();
      const relX = Math.min(1000, Math.max(0, ((e.clientX - rect.left) / rect.width) * 1000));
      const rawRelY = Math.min(1000, Math.max(0, ((e.clientY - rect.top) / rect.height) * 1000));
      const relY = isHalf ? (rawRelY / 1.68) : rawRelY;

      const pts = coachBoardState.currentDrawing.points;
      if (coachBoardState.currentDrawing.type === 'arrow' || coachBoardState.currentDrawing.type === 'screen') {
        // Straight tactical vector line from start to current cursor
        coachBoardState.currentDrawing.points = [pts[0], { x: relX, y: relY }];
      } else {
        // Smooth freehand / dribble path
        const last = pts[pts.length - 1];
        const dist = Math.hypot(relX - last.x, relY - last.y);
        if (dist > 8) {
          pts.push({ x: relX, y: relY });
        }
      }
      renderCoachBoardCanvas();
    }
  });

  const endPointer = (e) => {
    if (coachBoardState.activeTokenId) {
      const tokenEl = stage.querySelector(`.dbo-board-token[data-token-id="${coachBoardState.activeTokenId}"]`);
      if (tokenEl) tokenEl.classList.remove('dragging');
      coachBoardState.activeTokenId = null;
    }
    if (coachBoardState.isDrawing && coachBoardState.currentDrawing) {
      if (coachBoardState.currentDrawing.points.length >= 2) {
        coachBoardState.drawings.push(coachBoardState.currentDrawing);
      }
      coachBoardState.currentDrawing = null;
      coachBoardState.isDrawing = false;
      renderCoachBoardCanvas();
    }
  };

  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);
}

function saveCustomCoachBoardPlay() {
  const input = document.getElementById('coachBoardPlayNameInput');
  const title = (input && input.value.trim()) ? input.value.trim() : `แผนซ้อม DBO (${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })})`;

  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(DBO_COACH_BOARD_SAVED_KEY) || '[]');
  } catch (e) { saved = []; }

  const newPlay = {
    id: 'play_' + Date.now(),
    title,
    courtMode: coachBoardState.courtMode,
    showDefense: coachBoardState.showDefense,
    tokens: JSON.parse(JSON.stringify(coachBoardState.tokens)),
    drawings: JSON.parse(JSON.stringify(coachBoardState.drawings)),
    lineupNames: { ...coachBoardState.lineupNames },
    savedAt: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
  };

  saved.unshift(newPlay);
  localStorage.setItem(DBO_COACH_BOARD_SAVED_KEY, JSON.stringify(saved.slice(0, 12)));
  if (input) input.value = '';
  renderCoachBoardSavedPlaysList();
  if (typeof showToast === 'function') showToast(`บันทึกแผน "${title}" เรียบร้อยแล้ว`);
}

function loadSavedCoachBoardPlay(playId) {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(DBO_COACH_BOARD_SAVED_KEY) || '[]');
  } catch (e) { return; }

  const found = saved.find(p => p.id === playId);
  if (!found) return;

  coachBoardState.showDefense = found.showDefense !== false;
  coachBoardState.tokens = JSON.parse(JSON.stringify(found.tokens || []));
  coachBoardState.drawings = JSON.parse(JSON.stringify(found.drawings || []));
  if (found.lineupNames) {
    coachBoardState.lineupNames = { ...coachBoardState.lineupNames, ...found.lineupNames };
  }

  setCoachBoardCourtMode(found.courtMode || 'full');
  populateCoachBoardStudentAssigners();
  renderCoachBoardTokens();
  renderCoachBoardCanvas();
  if (typeof showToast === 'function') showToast(`โหลดแผน "${found.title}" แล้ว`);
}

function deleteSavedCoachBoardPlay(playId) {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(DBO_COACH_BOARD_SAVED_KEY) || '[]');
  } catch (e) { return; }

  saved = saved.filter(p => p.id !== playId);
  localStorage.setItem(DBO_COACH_BOARD_SAVED_KEY, JSON.stringify(saved));
  renderCoachBoardSavedPlaysList();
}

function renderCoachBoardSavedPlaysList() {
  const container = document.getElementById('coachBoardSavedPlaysList');
  if (!container) return;

  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(DBO_COACH_BOARD_SAVED_KEY) || '[]');
  } catch (e) { saved = []; }

  if (saved.length === 0) {
    container.innerHTML = `<span class="text-xs text-nike-mute">ยังไม่มีแผนที่บันทึกไว้ — จัดตำแหน่งผู้เล่นและวาดลูกศรแล้วกด "บันทึกแผน" ได้เลย</span>`;
    return;
  }

  container.innerHTML = saved.map(p => `
    <div class="inline-flex items-center gap-1.5 bg-nike-cloud border border-nike-hairlineSoft rounded-full pl-3 pr-1.5 py-1 text-xs">
      <button type="button" onclick="loadSavedCoachBoardPlay('${p.id}')" class="font-bold text-nike-ink hover:text-purple-800 cursor-pointer">
        📋 ${escapeHtml(p.title)} <span class="text-[10px] text-nike-mute font-normal">(${p.savedAt || ''})</span>
      </button>
      <button type="button" onclick="deleteSavedCoachBoardPlay('${p.id}')" aria-label="ลบแผน" class="w-5 h-5 rounded-full hover:bg-rose-100 text-nike-mute hover:text-rose-600 flex items-center justify-center cursor-pointer">✕</button>
    </div>
  `).join('');
}

function toggleCoachBoardFullscreen() {
  const wrapper = document.getElementById('dboCoachBoardCardWrapper');
  if (!wrapper) return;

  coachBoardState.isFullscreen = !coachBoardState.isFullscreen;
  if (coachBoardState.isFullscreen) {
    wrapper.classList.add('dbo-board-fullscreen');
  } else {
    wrapper.classList.remove('dbo-board-fullscreen');
  }

  const btn = document.getElementById('btnCoachBoardFullscreen');
  if (btn) {
    const span = btn.querySelector('span');
    if (span) span.textContent = coachBoardState.isFullscreen ? 'ย่อหน้าจอ' : 'เต็มจอ';
  }

  setTimeout(() => {
    renderCoachBoardTokens();
    resizeAndRenderCoachBoardCanvas();
  }, 50);
}
