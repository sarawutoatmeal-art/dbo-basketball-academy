// ========================================================
// DBO Basketball Academy - Interactive Coach Tactic Board v2
// (Die-Cut DBO Gold Center Crest, Full-Screen iPad & Phone Auto-Fit
//  Portrait & Landscape Courts, Customizable Token Colors, Arrows/Drills)
// ========================================================

const DBO_COACH_BOARD_SAVED_KEY = 'dbo_coach_board_saved_plays_v1';
const DBO_COACH_BOARD_PREFS_KEY = 'dbo_coach_board_prefs_v2';

const DBO_TOKEN_THEMES = {
  purple: {
    id: 'purple',
    name: 'ม่วง-ทอง DBO',
    bg: 'linear-gradient(135deg, #241044 0%, #38196B 100%)',
    text: '#DEB95B',
    border: '#DEB95B',
    plateBg: 'rgba(36, 16, 68, 0.94)',
    plateBorder: '#DEB95B',
    swatch: '#241044'
  },
  gold: {
    id: 'gold',
    name: 'ทองแชมเปี้ยน DBO',
    bg: 'linear-gradient(135deg, #F3D27A 0%, #CAA044 100%)',
    text: '#241044',
    border: '#241044',
    plateBg: 'rgba(36, 16, 68, 0.94)',
    plateBorder: '#DEB95B',
    swatch: '#DEB95B'
  },
  white: {
    id: 'white',
    name: 'ขาวบริสุทธิ์ DBO',
    bg: 'linear-gradient(135deg, #FFFFFF 0%, #F3EEF8 100%)',
    text: '#241044',
    border: '#241044',
    plateBg: 'rgba(36, 16, 68, 0.92)',
    plateBorder: '#FFFFFF',
    swatch: '#FFFFFF'
  },
  blue: {
    id: 'blue',
    name: 'น้ำเงินรอยัล',
    bg: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
    text: '#FFFFFF',
    border: '#93C5FD',
    plateBg: 'rgba(30, 58, 138, 0.94)',
    plateBorder: '#93C5FD',
    swatch: '#2563EB'
  },
  emerald: {
    id: 'emerald',
    name: 'เขียวมรกต',
    bg: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
    text: '#FFFFFF',
    border: '#A7F3D0',
    plateBg: 'rgba(6, 95, 70, 0.94)',
    plateBorder: '#6EE7B7',
    swatch: '#10B981'
  },
  orange: {
    id: 'orange',
    name: 'ส้มบาสเกตบอล',
    bg: 'linear-gradient(135deg, #9A3412 0%, #EA580C 100%)',
    text: '#FFFFFF',
    border: '#FDBA74',
    plateBg: 'rgba(124, 45, 18, 0.94)',
    plateBorder: '#FDBA74',
    swatch: '#EA580C'
  },
  black: {
    id: 'black',
    name: 'ดำคาร์บอน-ทอง',
    bg: 'linear-gradient(135deg, #111111 0%, #27272A 100%)',
    text: '#DEB95B',
    border: '#DEB95B',
    plateBg: 'rgba(17, 17, 17, 0.94)',
    plateBorder: '#DEB95B',
    swatch: '#18181B'
  },
  red: {
    id: 'red',
    name: 'แดงแทคติก',
    bg: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)',
    text: '#FFFFFF',
    border: '#FCA5A5',
    plateBg: 'rgba(127, 29, 29, 0.94)',
    plateBorder: '#FCA5A5',
    swatch: '#DC2626'
  }
};

const coachBoardState = {
  initialized: false,
  courtMode: 'full',       // 'full' | 'half' | 'landscape'
  tool: 'move',            // 'move' | 'arrow' | 'dribble' | 'screen' | 'pen'
  strokeColor: '#FFFFFF',  // Crisp white tactical lines matching screenshot
  offenseTheme: 'blue',    // Team A: Royal Blue (Photo 1 & 2)
  defenseTheme: 'red',     // Team B: Tactical Red (Photo 1 & 2)
  showDefense: true,
  isFullscreen: false,
  openDrawer: null,        // null | 'colors' | 'presets' | 'lineup' | 'saves'
  activeTokenId: null,
  isDrawing: false,
  currentDrawing: null,
  drawings: [],            // Normalized 0..1000 coords
  redoStack: [],           // Stack for Redo
  tokens: [],              // Normalized 0..100 coords (stored in vertical portrait reference frame)
  lineupNames: {
    O1: 'PG (1)',
    O2: 'SG (2)',
    O3: 'SF (3)',
    O4: 'PF (4)',
    O5: 'C (5)'
  }
};

function loadCoachBoardPrefs() {
  try {
    const raw = localStorage.getItem(DBO_COACH_BOARD_PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p.offenseTheme && DBO_TOKEN_THEMES[p.offenseTheme]) coachBoardState.offenseTheme = p.offenseTheme;
      if (p.defenseTheme && DBO_TOKEN_THEMES[p.defenseTheme]) coachBoardState.defenseTheme = p.defenseTheme;
      if (p.courtMode) coachBoardState.courtMode = p.courtMode;
    }
  } catch (e) {}
}

function saveCoachBoardPrefs() {
  try {
    localStorage.setItem(DBO_COACH_BOARD_PREFS_KEY, JSON.stringify({
      offenseTheme: coachBoardState.offenseTheme,
      defenseTheme: coachBoardState.defenseTheme,
      courtMode: coachBoardState.courtMode
    }));
  } catch (e) {}
}

function getDefaultCoachBoardTokens(mode = 'full', preset = '5out') {
  if (preset === 'cone_drill') {
    return [
      { id: 'O1', kind: 'offense', num: '57', label: 'Matthew', x: 50, y: 46 },
      { id: 'O2', kind: 'offense', num: '89', label: 'John', x: 50, y: 54 },
      { id: 'O3', kind: 'offense', num: '58', label: 'Greg', x: 50, y: 62 },
      { id: 'O4', kind: 'offense', num: '99', label: 'Peter', x: 82, y: 28 },
      { id: 'O5', kind: 'offense', num: '74', label: 'Josh', x: 18, y: 28 },
      { id: 'C1', kind: 'cone', num: '🔺', label: 'กรวย 1', x: 50, y: 36 },
      { id: 'C2', kind: 'cone', num: '🔺', label: 'กรวย 2', x: 36, y: 28 },
      { id: 'C3', kind: 'cone', num: '🔺', label: 'กรวย 3', x: 64, y: 22 },
      { id: 'C4', kind: 'cone', num: '🔺', label: 'กรวย 4', x: 38, y: 16 },
      { id: 'BALL', kind: 'ball', num: '🏀', label: 'บอล', x: 55, y: 45 }
    ];
  }

  if (mode === 'full') {
    // Exact Lineup & Sideline Bench from BLUELINDEN Full Court Screenshot (Photo 2)
    const tokens = [
      { id: 'O1', kind: 'offense', num: '57', label: 'Matthew', x: 30, y: 77 },
      { id: 'O2', kind: 'offense', num: '89', label: 'John', x: 74, y: 77 },
      { id: 'D1', kind: 'defense', num: '47', label: 'Kevin', x: 30, y: 69 },
      { id: 'D2', kind: 'defense', num: '97', label: 'Steven', x: 70, y: 67 },
      { id: 'D3', kind: 'defense', num: '77', label: 'David', x: 71, y: 37 },
      { id: 'BALL', kind: 'ball', num: '🏀', label: 'บอล', x: 67, y: 44 },
      // Bottom bench reserve tokens
      { id: 'OB0', kind: 'offense', isBench: true, num: '99', label: 'Peter', x: 20, y: 93 },
      { id: 'DB0', kind: 'defense', isBench: true, num: '68', label: 'Ryan', x: 32, y: 93 }
    ];

    // Left Sideline Bench Reserves (Team A Blue 12..20)
    for (let i = 12; i <= 20; i++) {
      const idx = i - 12;
      tokens.push({
        id: `OB_${i}`,
        kind: 'offense',
        isBench: true,
        num: String(i),
        label: `Player ${i}`,
        x: 6,
        y: Math.round(23 + idx * 7)
      });
    }

    // Right Sideline Bench Reserves (Team B Red 12..20)
    for (let i = 12; i <= 20; i++) {
      const idx = i - 12;
      tokens.push({
        id: `DB_${i}`,
        kind: 'defense',
        isBench: true,
        num: String(i),
        label: `Player ${i}`,
        x: 94,
        y: Math.round(23 + idx * 7)
      });
    }

    return tokens;
  }

  // Default Wide 3x3 Half Court Lineup
  return [
    { id: 'O1', kind: 'offense', num: '57', label: 'Matthew', x: 50, y: 55 },
    { id: 'O2', kind: 'offense', num: '89', label: 'John', x: 26, y: 48 },
    { id: 'O3', kind: 'offense', num: '58', label: 'Greg', x: 18, y: 78 },
    { id: 'O4', kind: 'offense', num: '99', label: 'Peter', x: 82, y: 78 },
    { id: 'O5', kind: 'offense', num: '74', label: 'Josh', x: 74, y: 48 },
    { id: 'D1', kind: 'defense', num: '47', label: 'Kevin', x: 50, y: 44 },
    { id: 'D2', kind: 'defense', num: '68', label: 'Ryan', x: 38, y: 40 },
    { id: 'D3', kind: 'defense', num: '97', label: 'Steven', x: 62, y: 40 },
    { id: 'D4', kind: 'defense', num: '77', label: 'Justin', x: 42, y: 22 },
    { id: 'D5', kind: 'defense', num: '77', label: 'David', x: 58, y: 22 },
    { id: 'BALL', kind: 'ball', num: '🏀', label: 'บอล', x: 50, y: 63 }
  ];
}

function initCoachBoard() {
  const stage = document.getElementById('dboCoachBoardStage');
  if (!stage) return;

  if (!coachBoardState.initialized) {
    loadCoachBoardPrefs();
    // Auto-select landscape court on wide iPad/tablet screens if user hasn't chosen yet
    if (!localStorage.getItem(DBO_COACH_BOARD_PREFS_KEY) && window.innerWidth >= 768 && window.innerWidth > window.innerHeight) {
      coachBoardState.courtMode = 'landscape';
    }
    coachBoardState.tokens = getDefaultCoachBoardTokens(coachBoardState.courtMode, '5out');
    bindCoachBoardEvents();
    coachBoardState.initialized = true;
  }

  renderTokenColorPickers();
  populateCoachBoardStudentAssigners();
  renderCoachBoardSavedPlaysList();
  setCoachBoardCourtMode(coachBoardState.courtMode, true);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Convert stored vertical-court coordinates (x:0..100, y:0..100) to current court view display %
function toDisplayCoords(xPct, yPct, mode) {
  if (mode === 'half') {
    return {
      x: Math.min(94, Math.max(6, xPct)),
      y: Math.min(92, Math.max(8, yPct))
    };
  }
  if (mode === 'landscape') {
    return {
      x: Math.min(96, Math.max(4, yPct)),
      y: Math.min(94, Math.max(6, 100 - xPct))
    };
  }
  return {
    x: Math.min(95, Math.max(5, xPct)),
    y: Math.min(96, Math.max(4, yPct))
  };
}

// Convert display % (0..100, 0..100) back to canonical coordinates
function fromDisplayCoords(dispXPct, dispYPct, mode) {
  if (mode === 'half') {
    return {
      x: dispXPct,
      y: dispYPct
    };
  }
  if (mode === 'landscape') {
    return {
      x: 100 - dispYPct,
      y: dispXPct
    };
  }
  return {
    x: dispXPct,
    y: dispYPct
  };
}

function setCoachBoardCourtMode(mode, skipSave = false) {
  const validModes = ['full', 'half', 'landscape'];
  const prevMode = coachBoardState.courtMode;
  coachBoardState.courtMode = validModes.includes(mode) ? mode : 'full';
  if (!skipSave) saveCoachBoardPrefs();

  // Refresh tokens to match mode layout if no active custom drawing
  if (prevMode !== coachBoardState.courtMode && (!coachBoardState.drawings || coachBoardState.drawings.length === 0)) {
    coachBoardState.tokens = getDefaultCoachBoardTokens(coachBoardState.courtMode);
  }

  const stage = document.getElementById('dboCoachBoardStage');
  const fullSvg = document.getElementById('dboFullCourtSvg');
  const halfSvg = document.getElementById('dboHalfCourtSvg');
  const landSvg = document.getElementById('dboLandscapeCourtSvg');

  if (stage) {
    stage.dataset.courtMode = coachBoardState.courtMode;
  }

  if (fullSvg) fullSvg.classList.toggle('hidden', coachBoardState.courtMode !== 'full');
  if (halfSvg) halfSvg.classList.toggle('hidden', coachBoardState.courtMode !== 'half');
  if (landSvg) landSvg.classList.toggle('hidden', coachBoardState.courtMode !== 'landscape');

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

function setCoachBoardTokenTheme(team, themeId) {
  if (!DBO_TOKEN_THEMES[themeId]) return;
  if (team === 'offense') {
    coachBoardState.offenseTheme = themeId;
  } else {
    coachBoardState.defenseTheme = themeId;
  }
  saveCoachBoardPrefs();
  renderTokenColorPickers();
  renderCoachBoardTokens();
  updateCoachBoardToolbarUI();
  if (typeof showToast === 'function') {
    const teamLabel = team === 'offense' ? 'หมากทีมบุก (1-5)' : 'หมากทีมรับ (X1-X5)';
    showToast(`เปลี่ยนสี${teamLabel} เป็น "${DBO_TOKEN_THEMES[themeId].name}" แล้ว`);
  }
}

function renderTokenColorPickers() {
  const offContainer = document.getElementById('offenseTokenColorSwatches');
  const defContainer = document.getElementById('defenseTokenColorSwatches');
  const defQuickContainer = document.getElementById('quickDefenseColorBar');

  const themes = Object.values(DBO_TOKEN_THEMES);

  if (offContainer) {
    offContainer.innerHTML = themes.map(t => {
      const active = coachBoardState.offenseTheme === t.id;
      return `
        <button type="button" onclick="setCoachBoardTokenTheme('offense', '${t.id}')" title="${t.name}" aria-label="สีทีมบุก ${t.name}" class="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${active ? 'bg-[#241044] text-[#DEB95B] border-[#DEB95B] ring-2 ring-[#DEB95B]' : 'bg-nike-cloud text-nike-ink border-nike-hairlineSoft hover:bg-purple-100/60'}">
          <span class="w-4 h-4 rounded-full flex-shrink-0 border border-black/30" style="background:${t.bg};"></span>
          <span>${t.name}</span>
        </button>
      `;
    }).join('');
  }

  if (defContainer) {
    defContainer.innerHTML = themes.map(t => {
      const active = coachBoardState.defenseTheme === t.id;
      return `
        <button type="button" onclick="setCoachBoardTokenTheme('defense', '${t.id}')" title="${t.name}" aria-label="สีทีมรับ ${t.name}" class="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${active ? 'bg-[#241044] text-[#DEB95B] border-[#DEB95B] ring-2 ring-[#DEB95B]' : 'bg-nike-cloud text-nike-ink border-nike-hairlineSoft hover:bg-purple-100/60'}">
          <span class="w-4 h-4 rounded-full flex-shrink-0 border border-black/30" style="background:${t.bg};"></span>
          <span>${t.name}</span>
        </button>
      `;
    }).join('');
  }

  if (defQuickContainer) {
    defQuickContainer.innerHTML = themes.map(t => {
      const active = coachBoardState.defenseTheme === t.id;
      return `
        <button type="button" onclick="setCoachBoardTokenTheme('defense', '${t.id}')" title="เปลี่ยนสีหมาก X1-X5: ${t.name}" aria-label="เปลี่ยนสีหมาก X1-X5 เป็น ${t.name}" class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-transform cursor-pointer" style="background:${t.bg}; color:${t.text}; border: 2px solid ${active ? '#DEB95B' : t.border}; transform: ${active ? 'scale(1.22)' : 'scale(1)'}; box-shadow: ${active ? '0 0 0 2px #241044, 0 0 0 4px #DEB95B' : 'none'};">
          X
        </button>
      `;
    }).join('');
  }
}

function toggleCoachBoardDrawer(drawerName) {
  if (coachBoardState.openDrawer === drawerName) {
    coachBoardState.openDrawer = null;
  } else {
    coachBoardState.openDrawer = drawerName;
  }

  ['colors', 'presets', 'lineup', 'saves'].forEach(d => {
    const panel = document.getElementById(`coachBoardDrawer-${d}`);
    const btn = document.getElementById(`btnBoardDrawer-${d}`);
    const isOpen = coachBoardState.openDrawer === d;
    if (panel) panel.classList.toggle('hidden', !isOpen);
    if (btn) {
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) {
        btn.classList.add('ring-2', 'ring-[#DEB95B]', 'bg-[#241044]', 'text-[#DEB95B]');
      } else {
        btn.classList.remove('ring-2', 'ring-[#DEB95B]', 'bg-[#241044]', 'text-[#DEB95B]');
      }
    }
  });
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
  if (typeof showToast === 'function') showToast(`เพิ่มกรวยฝึกซ้อม #${num} บนสนามแล้ว`);
}

function clearCoachBoardCones() {
  coachBoardState.tokens = coachBoardState.tokens.filter(t => t.kind !== 'cone');
  renderCoachBoardTokens();
}

function applyCoachBoardPreset(presetKey) {
  coachBoardState.tokens = getDefaultCoachBoardTokens(coachBoardState.courtMode, presetKey);
  coachBoardState.drawings = [];

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
    const popped = coachBoardState.drawings.pop();
    if (!coachBoardState.redoStack) coachBoardState.redoStack = [];
    coachBoardState.redoStack.push(popped);
    renderCoachBoardCanvas();
  }
}

function redoCoachBoardDrawing() {
  if (coachBoardState.redoStack && coachBoardState.redoStack.length > 0) {
    const item = coachBoardState.redoStack.pop();
    coachBoardState.drawings.push(item);
    renderCoachBoardCanvas();
  }
}

const COACH_BOARD_CYCLE_TOOLS = ['move', 'arrow', 'dribble', 'screen', 'pen'];
const COACH_BOARD_CYCLE_ICONS = {
  move: '🖐️',
  arrow: '↗️',
  dribble: '〰️',
  screen: '⊣',
  pen: '✏️'
};

function cycleCoachBoardDrawingTool() {
  const currentIdx = COACH_BOARD_CYCLE_TOOLS.indexOf(coachBoardState.tool);
  const nextIdx = (currentIdx + 1) % COACH_BOARD_CYCLE_TOOLS.length;
  setCoachBoardTool(COACH_BOARD_CYCLE_TOOLS[nextIdx]);
  const iconSpan = document.getElementById('floatingToolCycleIcon');
  if (iconSpan) iconSpan.innerText = COACH_BOARD_CYCLE_ICONS[coachBoardState.tool] || '✏️';
  if (typeof showToast === 'function') {
    const toolNames = {
      move: 'โหมด: ขยับหมาก 🖐️',
      arrow: 'โหมด: วาดลูกศร ↗️',
      dribble: 'โหมด: เส้นเลี้ยงบอล 〰️',
      screen: 'โหมด: สัญลักษณ์สกรีน ⊣',
      pen: 'โหมด: วาดอิสระ ✏️'
    };
    showToast(toolNames[coachBoardState.tool]);
  }
}

function clearCoachBoardDrawings() {
  if (coachBoardState.drawings.length > 0) {
    coachBoardState.redoStack = [...coachBoardState.drawings];
  }
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
  const mode = coachBoardState.courtMode;
  const offTheme = DBO_TOKEN_THEMES[coachBoardState.offenseTheme] || DBO_TOKEN_THEMES.blue;
  const defTheme = DBO_TOKEN_THEMES[coachBoardState.defenseTheme] || DBO_TOKEN_THEMES.red;

  coachBoardState.tokens.forEach(tok => {
    if (tok.kind === 'defense' && !coachBoardState.showDefense) return;

    const pos = toDisplayCoords(tok.x, tok.y, mode);

    const el = document.createElement('div');
    const benchClass = tok.isBench ? 'dbo-token-bench' : '';
    el.className = `dbo-board-token dbo-token-${tok.kind} ${benchClass}`.trim();
    el.dataset.tokenId = tok.id;
    el.style.left = `${pos.x}%`;
    el.style.top = `${pos.y}%`;

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
      const theme = tok.kind === 'offense' ? offTheme : defTheme;
      el.innerHTML = `
        <div class="dbo-token-disc" style="background:${theme.bg}; color:${theme.text};">${escapeHtml(tok.num)}</div>
        <span class="dbo-token-nameplate">${escapeHtml(tok.label)}</span>
      `;
    }

    layer.appendChild(el);
  });
}

function updateCoachBoardToolbarUI() {
  // Court Mode buttons
  ['full', 'landscape', 'half'].forEach(m => {
    const btn = document.getElementById(`btnCourtMode-${m}`);
    if (btn) {
      const active = coachBoardState.courtMode === m;
      btn.className = active
        ? 'px-3 py-1.5 rounded-full text-xs font-bold bg-[#DEB95B] text-[#241044] border border-[#DEB95B] shadow-2xs cursor-pointer transition-all'
        : 'px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 cursor-pointer transition-all';
    }
    const fsBtn = document.getElementById(`btnFsCourt-${m}`);
    if (fsBtn) {
      const active = coachBoardState.courtMode === m;
      fsBtn.className = active
        ? 'px-2.5 py-1 rounded-full text-[11px] font-black bg-[#DEB95B] text-[#241044] shadow-xs cursor-pointer transition-all'
        : 'px-2.5 py-1 rounded-full text-[11px] font-bold text-white hover:bg-white/20 cursor-pointer transition-all';
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

  // Line Color swatches
  document.querySelectorAll('[data-board-color]').forEach(sw => {
    const c = sw.getAttribute('data-board-color');
    const active = c.toLowerCase() === coachBoardState.strokeColor.toLowerCase();
    sw.style.transform = active ? 'scale(1.18)' : 'scale(1)';
    sw.style.boxShadow = active ? '0 0 0 2px #241044, 0 0 0 4px #DEB95B' : 'none';
  });

  // Defense toggle button
  const defBtn = document.getElementById('btnToggleBoardDefense');
  if (defBtn) {
    const defTheme = DBO_TOKEN_THEMES[coachBoardState.defenseTheme] || DBO_TOKEN_THEMES.gold;
    defBtn.className = coachBoardState.showDefense
      ? 'px-3 py-1.5 rounded-full text-xs font-bold bg-[#241044] text-[#DEB95B] border border-[#DEB95B] flex items-center gap-1.5 cursor-pointer transition-all'
      : 'px-3 py-1.5 rounded-full text-xs font-semibold bg-nike-cloud text-nike-mute border border-nike-hairlineSoft flex items-center gap-1.5 cursor-pointer transition-all';
    const span = defBtn.querySelector('span');
    if (span) span.textContent = coachBoardState.showDefense ? `X1-X5 (${defTheme.name})` : 'X1-X5: ปิด';
  }

  // Stage cursor
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

  const mode = coachBoardState.courtMode;

  allStrokes.forEach(stroke => {
    if (!stroke || !Array.isArray(stroke.points) || stroke.points.length < 2) return;

    const pts = stroke.points.map(p => {
      const disp = toDisplayCoords(p.x / 10, p.y / 10, mode);
      return {
        x: (disp.x / 100) * w,
        y: (disp.y / 100) * h
      };
    });

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
    const mode = coachBoardState.courtMode;

    // Tapping or dragging a token always moves the player/ball
    if (tokenEl) {
      e.preventDefault();
      const tokenId = tokenEl.dataset.tokenId;
      coachBoardState.activeTokenId = tokenId;
      tokenEl.classList.add('dragging');
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      return;
    }

    if (coachBoardState.tool === 'move') return;

    e.preventDefault();
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}

    const dispXPct = ((e.clientX - rect.left) / rect.width) * 100;
    const dispYPct = ((e.clientY - rect.top) / rect.height) * 100;
    const canon = fromDisplayCoords(dispXPct, dispYPct, mode);

    coachBoardState.isDrawing = true;
    coachBoardState.currentDrawing = {
      type: coachBoardState.tool,
      color: coachBoardState.strokeColor,
      points: [{ x: canon.x * 10, y: canon.y * 10 }]
    };
  });

  stage.addEventListener('pointermove', (e) => {
    const rect = stage.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const mode = coachBoardState.courtMode;

    if (coachBoardState.activeTokenId) {
      e.preventDefault();
      const dispXPct = Math.min(96, Math.max(4, ((e.clientX - rect.left) / rect.width) * 100));
      const dispYPct = Math.min(96, Math.max(4, ((e.clientY - rect.top) / rect.height) * 100));
      const canon = fromDisplayCoords(dispXPct, dispYPct, mode);

      const tok = coachBoardState.tokens.find(t => t.id === coachBoardState.activeTokenId);
      if (tok) {
        tok.x = Math.round(canon.x * 10) / 10;
        tok.y = Math.round(canon.y * 10) / 10;
      }

      const tokenEl = stage.querySelector(`.dbo-board-token[data-token-id="${coachBoardState.activeTokenId}"]`);
      if (tokenEl) {
        tokenEl.style.left = `${dispXPct}%`;
        tokenEl.style.top = `${dispYPct}%`;
      }
      return;
    }

    if (coachBoardState.isDrawing && coachBoardState.currentDrawing) {
      e.preventDefault();
      const dispXPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
      const dispYPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
      const canon = fromDisplayCoords(dispXPct, dispYPct, mode);
      const relX = canon.x * 10;
      const relY = canon.y * 10;

      const pts = coachBoardState.currentDrawing.points;
      if (coachBoardState.currentDrawing.type === 'arrow' || coachBoardState.currentDrawing.type === 'screen') {
        coachBoardState.currentDrawing.points = [pts[0], { x: relX, y: relY }];
      } else {
        const last = pts[pts.length - 1];
        const dist = Math.hypot(relX - last.x, relY - last.y);
        if (dist > 8) {
          pts.push({ x: relX, y: relY });
        }
      }
      renderCoachBoardCanvas();
    }
  });

  const endPointer = () => {
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
    offenseTheme: coachBoardState.offenseTheme,
    defenseTheme: coachBoardState.defenseTheme,
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
  if (found.offenseTheme && DBO_TOKEN_THEMES[found.offenseTheme]) coachBoardState.offenseTheme = found.offenseTheme;
  if (found.defenseTheme && DBO_TOKEN_THEMES[found.defenseTheme]) coachBoardState.defenseTheme = found.defenseTheme;
  coachBoardState.tokens = JSON.parse(JSON.stringify(found.tokens || []));
  coachBoardState.drawings = JSON.parse(JSON.stringify(found.drawings || []));
  if (found.lineupNames) {
    coachBoardState.lineupNames = { ...coachBoardState.lineupNames, ...found.lineupNames };
  }

  renderTokenColorPickers();
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
    container.innerHTML = `<span class="text-xs text-nike-mute">ยังไม่มีแผนที่บันทึกไว้ — จัดตำแหน่งผู้เล่นและวาดลูกศรแล้วกด "+ บันทึกแผน" ได้เลย</span>`;
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

function toggleCoachBoardDock(forceState) {
  const dock = document.getElementById('dboCoachBoardDockWrapper');
  const lbl = document.getElementById('lblToggleBoardDock');
  if (!dock) return;

  const shouldCollapse = typeof forceState === 'boolean'
    ? !forceState
    : !dock.classList.contains('dbo-dock-collapsed');

  if (shouldCollapse) {
    dock.classList.add('dbo-dock-collapsed');
    if (lbl) lbl.textContent = 'เครื่องมือ ▾';
  } else {
    dock.classList.remove('dbo-dock-collapsed');
    if (lbl) lbl.textContent = 'เครื่องมือ ▴ (ซ่อน)';
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function toggleCoachBoardFullscreen() {
  const wrapper = document.getElementById('dboCoachBoardCardWrapper');
  if (!wrapper) return;

  coachBoardState.isFullscreen = !coachBoardState.isFullscreen;
  if (coachBoardState.isFullscreen) {
    wrapper.classList.add('dbo-board-fullscreen');
    document.body.classList.add('dbo-board-fs-active');
    // Start with dock collapsed so coach has 100% full-screen unobstructed court
    toggleCoachBoardDock(false);
    try {
      if (wrapper.requestFullscreen) {
        await wrapper.requestFullscreen();
      } else if (wrapper.webkitRequestFullscreen) {
        wrapper.webkitRequestFullscreen();
      }
    } catch (e) {}
  } else {
    wrapper.classList.remove('dbo-board-fullscreen');
    document.body.classList.remove('dbo-board-fs-active');
    // Restore normal dock in regular view
    const dock = document.getElementById('dboCoachBoardDockWrapper');
    if (dock) dock.classList.remove('dbo-dock-collapsed');
    const lbl = document.getElementById('lblToggleBoardDock');
    if (lbl) lbl.textContent = 'เครื่องมือ ▾';
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } catch (e) {}
  }

  const btn = document.getElementById('btnCoachBoardFullscreen');
  if (btn) {
    const span = btn.querySelector('span');
    if (span) span.textContent = coachBoardState.isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ iPad / มือถือ';
  }

  updateCoachBoardToolbarUI();

  setTimeout(() => {
    renderCoachBoardTokens();
    resizeAndRenderCoachBoardCanvas();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }, 60);
}

document.addEventListener('fullscreenchange', () => {
  const wrapper = document.getElementById('dboCoachBoardCardWrapper');
  if (!document.fullscreenElement && coachBoardState.isFullscreen) {
    coachBoardState.isFullscreen = false;
    if (wrapper) wrapper.classList.remove('dbo-board-fullscreen');
    document.body.classList.remove('dbo-board-fs-active');
    const dock = document.getElementById('dboCoachBoardDockWrapper');
    if (dock) dock.classList.remove('dbo-dock-collapsed');
    const lbl = document.getElementById('lblToggleBoardDock');
    if (lbl) lbl.textContent = 'เครื่องมือ ▾';
    const btn = document.getElementById('btnCoachBoardFullscreen');
    if (btn) {
      const span = btn.querySelector('span');
      if (span) span.textContent = 'เต็มจอ iPad / มือถือ';
    }
    updateCoachBoardToolbarUI();
    setTimeout(() => {
      renderCoachBoardTokens();
      resizeAndRenderCoachBoardCanvas();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 60);
  }
});

window.toggleCoachBoardDock = toggleCoachBoardDock;
