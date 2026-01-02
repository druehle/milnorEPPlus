const displayLines = document.querySelectorAll('.display-primary .display-line');
const definitionTextEl = document.querySelector('.definition-text');

const buttons = {
  up: document.querySelector('.arrow.up'),
  down: document.querySelector('.arrow.down'),
  program: document.querySelector('.program'),
  stop: document.querySelector('.stop'),
  confirm: document.querySelector('.confirm'),
};

document.querySelectorAll('.control-btn').forEach((button) => {
  button.addEventListener('focus', () => button.classList.add('focused'));
  button.addEventListener('blur', () => button.classList.remove('focused'));
});

const CONFIG = {
  hasTemperatureControl: true,
  hasSteam: true,
  hasThirdWater: false,
  hasCooldownValve: true,
  hasReuseDrain: false,
};

const PROGRAM_MENU = [
  { id: 'run', label: '0 OK TURN KEY' },
  { id: 'addChange', label: '1 ADD/CHANGE' },
  { id: 'configure', label: '2 CONFIGURE' },
  { id: 'standard', label: '3 STANDARD' },
  { id: 'transfer', label: '4 DATA XFER' },
];

const STEP_TYPES = [
  {
    code: '0',
    label: '0',
    description:
      'End formula: The last step of each formula must be of type 0. This step is automatically added as a last step if the previous step is type 6 (final extract).',
  },
  {
    code: '1',
    label: '1',
    description:
      'One-way wash: Basket rotates clockwise for the full step. Use for small loads needing extra mechanical action.',
  },
  {
    code: '2',
    label: '2',
    description:
      'Two-way wash: Basket alternates direction with pauses to prevent roping. Most common selection.',
  },
  {
    code: '3',
    label: '3',
    description:
      'Soak wash: Cylinder remains stationary; use only when no mechanical action is required.',
  },
  {
    code: '4',
    label: '4',
    description:
      'Low extract speed (E1) used between baths or for low-speed final extract on two-speed machines.',
  },
  {
    code: '5',
    label: '5',
    description:
      'Model-dependent extract (E2 or final E3 sequence depending on configuration).',
  },
  {
    code: '6',
    label: '6',
    description:
      'Final extract (E3): Highest extract speed for applicable models.',
  },
];
STEP_TYPES.forEach((type) => {
  if (type.value == null) type.value = type.code;
});

const BATH_TYPE_CODES = new Set(['1', '2', '3']);

const HOT_VALVE_OPTIONS = [
  { value: 0, label: 'OFF', description: 'Hot water valve closed.' },
  { value: 1, label: 'ON', description: 'Hot water valve opens during fill.' },
  { value: 2, label: 'MOD RAISE', description: 'Modulate hot valve to raise temperature. (very uncommon)' },
];

const COLD_VALVE_OPTIONS = [
  { value: 0, label: 'OFF', description: 'Cold water valve closed.' },
  { value: 1, label: 'ON', description: 'Cold water valve opens during fill.' },
  { value: 3, label: 'MOD LOWER', description: 'Modulate cold valve to lower temperature. (very uncommon)' },
];

const THIRD_VALVE_OPTIONS = [
  { value: 0, label: 'OFF', description: 'Third water valve closed.' },
  { value: 1, label: 'ON', description: 'Third water valve opens during fill.' },
  { value: 2, label: 'MOD HOT', description: 'Third valve modulates from hot supply.' },
  { value: 3, label: 'MOD COLD', description: 'Third valve modulates from cold supply.' },
];

const BATH_LEVEL_OPTIONS = [
  { value: 1, label: 'LEVEL 1', description: 'Lowest configured bath level. (usually used when injecting chemicals)' },
  { value: 2, label: 'LEVEL 2', description: 'Low-medium bath level.' },
  { value: 3, label: 'LEVEL 3', description: 'Medium bath level.' },
  { value: 4, label: 'LEVEL 4', description: 'Medium-high bath level.' },
  { value: 5, label: 'LEVEL 5', description: 'High bath level.' },
  { value: 6, label: 'LEVEL 6', description: 'Highest bath level (flush/rinses/cooldown).' },
];

const STEAM_CODE_OPTIONS = [{ value: 0, label: 'NO STEAM', description: 'Steam control not available.' }];

const CHEM_START_OPTIONS = [
  { value: 0, label: 'FILL', description: 'Inject while filling.' },
  { value: 1, label: 'LEVEL', description: 'Inject once bath level is satisfied.' },
  { value: 2, label: 'TEMP', description: 'Inject after level and temperature are satisfied.' },
];

const WASH_SPEED_OPTIONS = [
  { value: 0, label: 'WASH 2', description: 'High wash speed for use with goods requiring less mechanical action.' },
  { value: 1, label: 'WASH 1', description: 'Normal wash speed.' },
  { value: 2, label: 'ALT W2', description: 'High wash speed with the motor on and off (dwell) times as set in the alternate on time and alternate off time configure decisions.' },
  { value: 3, label: 'ALT W1', description: 'Normal wash speed with the motor on and off times as set in the alternate on time and alternate off time configure decisions.' },
];

const DRAIN_TYPE_OPTIONS = [
  { value: 0, label: 'STANDARD', description: 'Basket turns clockwise at drain (distribution) speed while draining. Standard drain speed varies by machine model, but is designed to impart about one G of acceleration to the goods.' },
  { value: 1, label: '2-WAY WASH', description: 'While draining, the basket reverses at wash speed to provide more mechanical action among the goods. Do not use this selection if the next step will be an extract.' },
  { value: 2, label: 'NO DRAIN', description: 'Bath water is retained for later operations in this same bath. Chemicals may be added, and temperature or level may be raised without draining. (Does not drain washer)' },
  { value: 3, label: 'STOP AT FILL', description: 'The basket is kept stationary during the fill phase of this step, but rotates at drain speed while draining. This selection minimizes friction among the goods before they are thoroughly wetted.' },
  { value: 4, label: 'STOP AT DRAIN', description: 'The basket is kept stationary while draining to prevent abrasion from mechanical action. During the fill phase of this step, basket motion is controlled by the Type of step decision. This selection is not valid if the next step is an extract. If a bath is programmed with this option, then an extract is programmed immediately following the bath step, the controller will change the drain code from 4=Stop with drain to 0=Standard drain speed.' },
  { value: 5, label: 'STOP F&D', description: '—The basket is held stationary during both the fill and drain phases of this step. Basket rotation, as determined by the Type of step decision, begins only after the desired level is achieved. This selection is not valid if the next step is an extract. If a bath is programmed with this option, then an extract is programmed immediately following the bath step, the controller will change the drain code from 5=Stop with fill and drain to 3=Stop with fill.' },
];

const DRAIN_DEST_OPTIONS = [
  { value: 0, label: 'SEWER', description: 'Drain to sewer.' },
  { value: 1, label: 'REUSE', description: 'Drain to reuse tank.' },
];

const END_ACTIONS = [
  { value: 0, label: 'STOP BUZZ', description: 'Stop and sound signal until cancelled.' },
  { value: 1, label: 'REV BUZZ', description: 'Reverse at wash speed while signal sounds.' },
  { value: 2, label: 'DRAIN BUZZ', description: 'Run at drain speed while signal sounds.' },
  { value: 3, label: 'TUMBLE', description: 'Tumble for two minutes then signal.' },
  { value: 4, label: 'STOP W/O B', description: 'Stop with signal that auto-cancels after two minutes.' },
  { value: 5, label: 'REV W/O B', description: 'Reverse with signal that auto-cancels after two minutes.' },
  { value: 6, label: 'DRAIN W/O B', description: 'Drain speed with auto-cancelled signal.' },
];

const DECISION_FLOW = [
  'type',
  'duration',
  'hotValve',
  'coldValve',
  'thirdValve',
  'bathLevel',
  'steamCode',
  'chemicals',
  'washSpeed',
  'drainType',
  'drainDestination',
  'endAction',
];

const SPD_START_INDEX = DECISION_FLOW.indexOf('washSpeed');

const DECISION_CURSOR_COLUMNS = {
  type: 3,
  duration: 4,
  hotValve: 10,
  coldValve: 11,
  thirdValve: 12,
  bathLevel: 13,
  steamCode: 14,
  chemicals: 15,
  washSpeed: 3,
  drainType: 7,
  drainDestination: 9,
  endAction: -1,
};

const MAX_STEPS = 30;
const MAX_CHEMICALS = 5;

const formulas = Array.from({ length: 30 }, (_, index) => {
  if (index === 0) return createWhiteTowelsFormula();
  return { steps: [createEndStep()] };
});

const state = {
  mode: 'programMenu',
  menuIndex: 0,
  formulaIndex: 0,
  stepPhase: 'select',
  selectedStepIndex: 0,
  activeStepIndex: null,
  decisionIndex: 0,
  chemicalStage: null,
  chemicalIndex: 0,
  workingChemical: null,
  durationStage: 0,
  message: null,
};

let messageTimer = null;
let modeBeforeMessage = null;

buttons.up?.addEventListener('click', () => handleDirection(1));
buttons.down?.addEventListener('click', () => handleDirection(-1));
buttons.confirm?.addEventListener('click', handleConfirm);
buttons.stop?.addEventListener('click', handleStop);
buttons.program?.addEventListener('click', handleDeleteStep);
function handleDirection(delta) {

  if (state.mode === 'message') return;

  switch (state.mode) {
    case 'programMenu':
      state.menuIndex = clamp(state.menuIndex + delta, 0, PROGRAM_MENU.length - 1);
      break;
    case 'formulaSelect':
      state.formulaIndex = clamp(state.formulaIndex + delta, 0, 29);
      break;
    case 'stepEdit':
      if (state.stepPhase === 'select') {
        adjustStepSelection(delta);
      } else {
        adjustDecision(delta);
      }
      break;
    default:
      break;
  }

  render();
}

function handleConfirm() {
  if (state.mode === 'message') return;

  if (state.mode === 'programMenu') {
    handleProgramMenuConfirm();
    return;
  }

  if (state.mode === 'formulaSelect') {
    enterStepEditor();
    return;
  }

  if (state.mode === 'stepEdit') {
    if (state.stepPhase === 'select') {
      beginEditingStep();
    } else {
      advanceDecision();
    }
  }
}

function handleStop() {
  if (state.mode === 'message') return;
  if (state.mode === 'stepEdit') {
    if (state.stepPhase === 'decision') {
      exitStepDecisionMode();
    } else {
      goToFormulaSelect();
    }
    return;
  }
  if (state.mode === 'formulaSelect') {
    goToProgramMenu();
  }
}

function handleDeleteStep() {
  if (
    state.mode !== 'stepEdit' ||
    state.mode === 'message' ||
    state.stepPhase !== 'select'
  ) {
    return;
  }

  const formula = getCurrentFormula();
  if (!formula.steps.length) return;
  if (formula.steps.length === 1) {
    showMessage('CANNOT DELETE', 'ONLY STEP', { nextMode: 'stepEdit' });
    return;
  }

  if (state.selectedStepIndex >= formula.steps.length - 1) {
    showMessage('CANNOT DELETE', 'END STEP', { nextMode: 'stepEdit' });
    return;
  }

  formula.steps.splice(state.selectedStepIndex, 1);
  ensureTerminalEnd(formula);

  const slots = getSelectableSlotCount(formula);
  state.selectedStepIndex = clamp(state.selectedStepIndex, 0, Math.max(slots - 1, 0));
  showMessage('STEP DELETED', 'SELECT NEXT', { nextMode: 'stepEdit' });
}

function handleProgramMenuConfirm() {
  const choice = PROGRAM_MENU[state.menuIndex];
  switch (choice.id) {
    case 'run':
      showMessage('TURN KEY TO RUN', 'RETURN TO FORM', { nextMode: 'programMenu' });
      break;
    case 'addChange':
      state.mode = 'formulaSelect';
      state.stepPhase = 'select';
      state.selectedStepIndex = 0;
      state.activeStepIndex = null;
      resetDurationStage();
      render();
      break;
    default:
      showMessage('NOT AVAILABLE', 'USE 1 ADD/CHANGE', { nextMode: 'programMenu' });
      break;
  }
}

function enterStepEditor() {
  state.mode = 'stepEdit';
  state.stepPhase = 'select';
  state.selectedStepIndex = 0;
  state.activeStepIndex = null;
  state.decisionIndex = 0;
  state.chemicalStage = null;
  resetDurationStage();
  render();
}

function beginEditingStep() {
  const formula = getCurrentFormula();
  if (state.selectedStepIndex === formula.steps.length) {
    if (formula.steps.length >= MAX_STEPS) {
      showMessage('MAX 30 STEPS', 'DELETE TO ADD', { nextMode: 'stepEdit' });
      return;
    }
    const insertAt = Math.max(formula.steps.length - 1, 0);
    formula.steps.splice(insertAt, 0, createDefaultStep());
    state.activeStepIndex = insertAt;
    state.selectedStepIndex = insertAt;
  } else {
    state.activeStepIndex = state.selectedStepIndex;
  }

  state.stepPhase = 'decision';
  const step = ensureStep(state.activeStepIndex);
  state.decisionIndex = findNextDecisionIndex(-1, step);
  resetChemicalState();
  resetDurationStage();
  render();
}

function adjustStepSelection(delta) {
  const formula = getCurrentFormula();
  const slots = getSelectableSlotCount(formula);
  state.selectedStepIndex = clamp(
    state.selectedStepIndex + delta,
    0,
    Math.max(slots - 1, 0),
  );
}

function adjustDecision(delta) {
  const step = getActiveStep();
  if (!step) return;

  const decisionId = DECISION_FLOW[state.decisionIndex];
  switch (decisionId) {
    case 'type':
      step.typeCode = cycleCollection(STEP_TYPES, step.typeCode, delta);
      break;
    case 'duration':
      adjustDuration(delta);
      break;
    case 'hotValve':
      step.hotValve = cycleCollection(HOT_VALVE_OPTIONS, step.hotValve, delta);
      break;
    case 'coldValve':
      step.coldValve = cycleCollection(COLD_VALVE_OPTIONS, step.coldValve, delta);
      break;
    case 'thirdValve':
      step.thirdValve = cycleCollection(THIRD_VALVE_OPTIONS, step.thirdValve, delta);
      break;
    case 'bathLevel':
      step.bathLevel = cycleCollection(BATH_LEVEL_OPTIONS, step.bathLevel, delta);
      break;
    case 'steamCode':
      step.steamCode = cycleCollection(STEAM_CODE_OPTIONS, step.steamCode, delta);
      break;
    case 'chemicals':
      adjustChemicalDecision(delta, step);
      break;
    case 'washSpeed':
      step.washSpeed = cycleCollection(WASH_SPEED_OPTIONS, step.washSpeed, delta);
      break;
    case 'drainType':
      step.drainType = cycleCollection(DRAIN_TYPE_OPTIONS, step.drainType, delta);
      break;
    case 'drainDestination':
      step.drainDestination = cycleCollection(
        DRAIN_DEST_OPTIONS,
        step.drainDestination,
        delta,
      );
      break;
    case 'endAction':
      step.endAction = cycleCollection(END_ACTIONS, step.endAction, delta);
      break;
    default:
      break;
  }
}

function adjustDuration(delta) {
  const step = getActiveStep();
  if (!step) return;
  const digits = getDurationDigits(step.duration);
  switch (state.durationStage) {
    case 0:
      digits.tens = clamp(digits.tens + delta, 0, 6);
      break;
    case 1:
      digits.ones = clamp(digits.ones + delta, 0, 9);
      break;
    default:
      digits.quarter = clamp(digits.quarter + delta, 0, 3);
      break;
  }
  step.duration = durationFromDigits(digits);
}

function advanceDecision() {
  const step = getActiveStep();
  if (!step) return;

  const decisionId = DECISION_FLOW[state.decisionIndex];
  if (decisionId === 'chemicals') {
    const remain = advanceChemicalDecision(step);
    if (remain) {
      render();
      return;
    }
  } else if (decisionId === 'duration') {
    if (state.durationStage < 2) {
      state.durationStage += 1;
      render();
      return;
    }
    resetDurationStage();
  }

  const nextIndex = findNextDecisionIndex(state.decisionIndex, step);
  if (nextIndex === -1) {
    finalizeStepEdit(step);
    return;
  }

  state.decisionIndex = nextIndex;
  resetDurationStage();
  if (DECISION_FLOW[state.decisionIndex] !== 'chemicals') {
    resetChemicalState();
  }
  render();
}

function finalizeStepEdit(step) {
  normalizeStep(step);
  const formula = getCurrentFormula();
  if (step.typeCode === '0') {
    const keepIndex = state.activeStepIndex ?? 0;
    formula.steps.splice(keepIndex + 1);
  }
  ensureTerminalEnd(formula);

  const slots = getSelectableSlotCount(formula);
  state.selectedStepIndex = clamp(
    state.activeStepIndex ?? state.selectedStepIndex,
    0,
    Math.max(slots - 1, 0),
  );

  state.stepPhase = 'select';
  state.activeStepIndex = null;
  state.decisionIndex = 0;
  resetChemicalState();
  resetDurationStage();

  showMessage('STEP SAVED', 'SELECT NEXT', { duration: 900, nextMode: 'stepEdit' });
}
function adjustChemicalDecision(delta, step) {
  ensureChemicalStage(step);
  if (!state.workingChemical) return;

  switch (state.chemicalStage) {
    case 'number': {
      const current = state.workingChemical.number ?? 0;
      state.workingChemical.number = clamp(current + delta, 0, MAX_CHEMICALS);
      break;
    }
    case 'start': {
      const options = getChemicalStartOptions();
      state.workingChemical.startMode = cycleCollection(
        options,
        state.workingChemical.startMode,
        delta,
      );
      break;
    }
    case 'duration': {
      const current = state.workingChemical.duration ?? 40;
      state.workingChemical.duration = clamp(current + delta, 0, 255);
      break;
    }
    case 'signal': {
      const current = state.workingChemical.requiresSignal ? 1 : 0;
      const next = clamp(current + delta, 0, 1);
      state.workingChemical.requiresSignal = Boolean(next);
      break;
    }
    default:
      break;
  }
}

function advanceChemicalDecision(step) {
  ensureChemicalStage(step);
  if (!state.workingChemical) return false;

  switch (state.chemicalStage) {
    case 'number':
      if (!state.workingChemical.number) {
        step.chemicals.splice(state.chemicalIndex);
        resetChemicalState();
        return false;
      }
      state.chemicalStage = 'start';
      if (state.workingChemical.startMode == null) state.workingChemical.startMode = 0;
      return true;
    case 'start':
      state.chemicalStage = 'duration';
      if (state.workingChemical.duration == null) state.workingChemical.duration = 40;
      return true;
    case 'duration':
      state.chemicalStage = 'signal';
      return true;
    case 'signal':
      commitChemical(step);
      if (state.chemicalIndex >= MAX_CHEMICALS - 1) {
        resetChemicalState();
        return false;
      }
      state.chemicalIndex += 1;
      state.workingChemical =
        cloneChemical(step.chemicals[state.chemicalIndex]) || createChemical();
      state.chemicalStage = 'number';
      return true;
    default:
      return false;
  }
}

function commitChemical(step) {
  const record = {
    number: state.workingChemical.number,
    startMode: state.workingChemical.startMode ?? 0,
    duration: state.workingChemical.duration ?? 40,
    requiresSignal: Boolean(state.workingChemical.requiresSignal),
  };

  if (state.chemicalIndex < step.chemicals.length) {
    step.chemicals[state.chemicalIndex] = record;
  } else {
    step.chemicals.push(record);
  }
}

function ensureChemicalStage(step) {
  if (state.chemicalStage) return;
  state.chemicalStage = 'number';
  state.chemicalIndex = 0;
  state.workingChemical =
    cloneChemical(step.chemicals[0]) || createChemical();
}

function resetChemicalState() {
  state.chemicalStage = null;
  state.chemicalIndex = 0;
  state.workingChemical = null;
}

function resetDurationStage() {
  state.durationStage = 0;
}

function goToProgramMenu() {
  state.mode = 'programMenu';
  state.menuIndex = 0;
  state.stepPhase = 'select';
  state.selectedStepIndex = 0;
  state.activeStepIndex = null;
  state.decisionIndex = 0;
  resetChemicalState();
  resetDurationStage();
  render();
}

function goToFormulaSelect() {
  state.mode = 'formulaSelect';
  state.stepPhase = 'select';
  state.activeStepIndex = null;
  state.decisionIndex = 0;
  resetChemicalState();
  resetDurationStage();
  render();
}

function exitStepDecisionMode() {
  state.stepPhase = 'select';
  state.activeStepIndex = null;
  state.decisionIndex = 0;
  resetChemicalState();
  resetDurationStage();
  render();
}

function updateDisplayLine(line, text) {
  const target = displayLines[line - 1];
  if (!target) return;
  const processed = (text ?? '')
    .toString()
    .toUpperCase()
    .padEnd(20, ' ')
    .slice(0, 20);

  const cursorRegion = getCursorRegion();
  const highlightSet =
    cursorRegion && cursorRegion.line === line
      ? new Set(cursorRegion.columns)
      : null;

  target.innerHTML = '';
  for (let i = 0; i < processed.length; i += 1) {
    const span = document.createElement('span');
    span.className = 'cell';
    span.textContent = processed[i];
    if (highlightSet?.has(i)) {
      span.classList.add('cursor-cell');
    }
    target.appendChild(span);
  }
}

function render() {
  const cursorRegion = getCursorRegion();
  if (!cursorRegion) {
    clearCursor();
  } else {
    setCursorRegion(cursorRegion.line, cursorRegion.columns);
  }

  if (state.mode === 'message') {
    updateDisplayLine(1, state.message?.line1 ?? '');
    updateDisplayLine(2, state.message?.line2 ?? '');
    setDefinition('');
    return;
  }

  setDefinition('');

  switch (state.mode) {
    case 'programMenu':
      updateDisplayLine(1, 'PROGRAM MENU');
      updateDisplayLine(
        2,
        `> ${PROGRAM_MENU[state.menuIndex].label}`.padEnd(20, ' '),
      );
      setDefinition('Select a programming option, then press Cycle Start.');
      break;
    case 'formulaSelect':
      updateDisplayLine(1, 'SELECT FORMULA');
      updateDisplayLine(
        2,
        `FORMULA ${String(state.formulaIndex + 1).padStart(2, '0')}`,
      );
      setDefinition('Choose a formula number (01-30) to add or edit.');
      break;
    case 'stepEdit':
      renderStepEditor();
      break;
    default:
      updateDisplayLine(1, ''.padEnd(20, ' '));
      updateDisplayLine(2, ''.padEnd(20, ' '));
      break;
  }
}

function renderStepEditor() {
  updateDisplayLine(1, getStepHeaderText());
  const formula = getCurrentFormula();

  if (state.stepPhase === 'select' || state.activeStepIndex == null) {
    resetDurationStage();
    const stepNumber = state.selectedStepIndex + 1;
    if (state.selectedStepIndex >= formula.steps.length) {
      updateDisplayLine(2, `${pad2(stepNumber)} NEW SLOT`.padEnd(20, ' '));
      setDefinition('Insert a new step here.');
    } else {
      const step = formula.steps[state.selectedStepIndex];
      updateDisplayLine(
        2,
        getStepDataLine(state.selectedStepIndex, step, { page: 'A' }),
      );
      setDefinition('Select a programmed step to edit.');
    }
    return;
  }

  const step = getActiveStep();
  if (!step) {
    state.stepPhase = 'select';
    renderStepEditor();
    return;
  }

  const decisionId = DECISION_FLOW[state.decisionIndex];
  if (decisionId === 'chemicals') {
    ensureChemicalStage(step);
  }

  updateDisplayLine(2, getStepDataLine(state.activeStepIndex, step));
  setDefinition(getDecisionDefinition(decisionId, step));
}

function getStepHeaderText() {
  const formulaNumber = state.formulaIndex + 1;
  return isOnSpdPage()
    ? formatSpdHeader(formulaNumber)
    : formatStepHeader(formulaNumber);
}

function isOnSpdPage() {
  return (
    state.mode === 'stepEdit' &&
    state.stepPhase === 'decision' &&
    state.activeStepIndex != null &&
    state.decisionIndex >= SPD_START_INDEX
  );
}
function getStepDataLine(stepIndex, step, { page } = {}) {
  const pageMode = page ?? (isOnSpdPage() ? 'SPD' : 'A');
  return pageMode === 'SPD'
    ? buildSpdLine(stepIndex, step)
    : buildPageALine(stepIndex, step);
}

function buildPageALine(stepIndex, step) {
  const stepNumber = pad2(stepIndex + 1);
  const rawType = (step?.typeCode ?? '0').toString();
  const typeCode = rawType.length > 2 ? rawType.slice(-2) : rawType;
  const durationDigits = formatDurationDigits(step.duration);
  const temperatureValue = formatTemperatureValue(step.temperature);
  const hot = formatSingleDigit(step.hotValve);
  const cold = formatSingleDigit(step.coldValve);
  const level = formatSingleDigit(step.bathLevel);
  const steam = formatSingleDigit(step.steamCode);
  const chemicalBlock = buildChemicalBlock(step);
  const line = `${stepNumber} ${typeCode}${durationDigits}${temperatureValue}${hot}${cold} ${level}${steam}${chemicalBlock}`;
  return line.padEnd(20, ' ').slice(0, 20);
}

function buildSpdLine(stepIndex, step) {
  const stepNumber = pad2(stepIndex + 1);
  const wash = formatSingleDigit(step.washSpeed);
  const drain = formatSingleDigit(step.drainType);
  const end = formatSingleDigit(step.endAction);
  return `${stepNumber} ${wash}   ${drain} ${end}`.padEnd(20, ' ').slice(0, 20);
}

function formatDurationDigits(totalQuarters) {
  const digits = getDurationDigits(totalQuarters);
  return `${digits.tens}${digits.ones}${digits.quarter}`;
}

function getDurationDigits(totalQuarters = 1) {
  const clamped = clamp(Math.round(totalQuarters ?? 1), 1, 255);
  const minutes = Math.floor(clamped / 4);
  const quarter = clamped - minutes * 4;
  return {
    tens: Math.floor(minutes / 10),
    ones: minutes % 10,
    quarter,
  };
}

function durationFromDigits(digits) {
  let tens = clamp(digits.tens ?? 0, 0, 6);
  let ones = clamp(digits.ones ?? 0, 0, 9);
  let minutes = tens * 10 + ones;
  if (minutes > 63) {
    minutes = 63;
    tens = 6;
    ones = 3;
  }
  const quarter = clamp(digits.quarter ?? 0, 0, 3);
  let total = minutes * 4 + quarter;
  total = clamp(total, 1, 255);
  return total;
}

function buildChemicalBlock(step) {
  const chemical = getChemicalDisplayState(step);
  const number = formatSingleDigit(chemical.number);
  const when = formatSingleDigit(chemical.startMode);
  const durationCode = formatChemicalDurationCode(chemical.duration ?? 0);
  const signalChar = chemical.requiresSignal ? '1' : '0';
  return `${number}${when}${durationCode}${signalChar}`;
}

function getChemicalDisplayState(step) {
  if (
    state.stepPhase === 'decision' &&
    DECISION_FLOW[state.decisionIndex] === 'chemicals' &&
    state.workingChemical
  ) {
    return state.workingChemical;
  }
  return (
    step.chemicals[state.chemicalIndex ?? 0] ||
    step.chemicals[0] ||
    createChemical()
  );
}

function formatTemperatureValue(value) {
  if (value == null) return '---';
  const clamped = clamp(Math.round(value), 0, 999);
  return String(clamped).padStart(3, '0').slice(-3);
}

function formatSingleDigit(value, fallback = 0) {
  const normalized = Number.isFinite(Number(value))
    ? Number(value)
    : fallback;
  const clamped = clamp(Math.trunc(normalized), 0, 9);
  return String(clamped);
}

const INJECT_DURATION_CODES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q'];

function formatChemicalDurationCode(durationSeconds) {
  const clamped = clamp(Math.round(durationSeconds), 0, 255);
  if (clamped <= 99) return pad2(clamped);
  const base = clamp(Math.floor(clamped / 10) * 10, 100, 250);
  const index = Math.floor((base - 100) / 10);
  const letter = INJECT_DURATION_CODES[index] ?? INJECT_DURATION_CODES[INJECT_DURATION_CODES.length - 1];
  const remainder = clamp(clamped - base, 0, 9);
  return `${letter}${remainder}`;
}

function createWhiteTowelsFormula() {
  const steps = [
    createStepFromTemplate({
      typeCode: '2',
      duration: durationFromMMQ('020'),
      hotValve: 0,
      coldValve: 1,
      bathLevel: 6,
    }),
    createStepFromTemplate({
      typeCode: '2',
      duration: durationFromMMQ('080'),
      hotValve: 1,
      coldValve: 0,
      bathLevel: 3,
      chemicals: [createChemicalRecord(1, 40, 0, false)],
    }),
    createStepFromTemplate({
      typeCode: '2',
      duration: durationFromMMQ('080'),
      hotValve: 1,
      coldValve: 0,
      bathLevel: 3,
      chemicals: [createChemicalRecord(2, 40, 0, false)],
    }),
    createStepFromTemplate({
      typeCode: '2',
      duration: durationFromMMQ('080'),
      hotValve: 1,
      coldValve: 0,
      bathLevel: 3,
      chemicals: [createChemicalRecord(3, 40, 0, false)],
    }),
    createStepFromTemplate({
      typeCode: '2',
      duration: durationFromMMQ('020'),
      hotValve: 1,
      coldValve: 1,
      bathLevel: 6,
    }),
    createStepFromTemplate({
      typeCode: '2',
      duration: durationFromMMQ('020'),
      hotValve: 0,
      coldValve: 1,
      bathLevel: 6,
    }),
    createStepFromTemplate({
      typeCode: '1',
      duration: durationFromMMQ('030'),
      hotValve: 0,
      coldValve: 1,
      bathLevel: 4,
      chemicals: [createChemicalRecord(4, 30, 0, false)],
    }),
    createStepFromTemplate({
      typeCode: '1',
      duration: durationFromMMQ('030'),
      hotValve: 0,
      coldValve: 1,
      bathLevel: 4,
      chemicals: [createChemicalRecord(5, 30, 0, false)],
    }),
    createStepFromTemplate({
      typeCode: '6',
      duration: durationFromMMQ('050'),
      hotValve: 0,
      coldValve: 0,
      bathLevel: 1,
    }),
    createEndStep(),
  ];

  return { steps };
}

function createDefaultStep(typeCode = '2') {
  return {
    typeCode,
    duration: durationFromMMQ('040'),
    temperature: null,
    hotValve: 0,
    coldValve: 0,
    thirdValve: 0,
    bathLevel: 1,
    steamCode: 0,
    chemicals: [],
    washSpeed: 1,
    drainType: 0,
    drainDestination: 0,
    endAction: 0,
  };
}

function durationFromMMQ(value) {
  const normalized = value.toString().padStart(3, '0');
  const minutes = parseInt(normalized.slice(0, 2), 10) || 0;
  const quarters = parseInt(normalized.slice(2), 10) || 0;
  return clamp(minutes * 4 + quarters, 1, 255);
}

function createEndStep() {
  const step = createDefaultStep('0');
  step.duration = 1;
  step.endAction = 0;
  return step;
}

function createChemical() {
  return {
    number: 0,
    startMode: 0,
    duration: 40,
    requiresSignal: false,
  };
}

function createChemicalRecord(number, duration = 40, startMode = 0, requiresSignal = false) {
  return { number, duration, startMode, requiresSignal };
}

function cloneChemical(record) {
  if (!record) return null;
  return {
    number: record.number,
    startMode: record.startMode,
    duration: record.duration,
    requiresSignal: record.requiresSignal,
  };
}

function normalizeStep(step) {
  if (!isBathStep(step)) {
    step.hotValve = 0;
    step.coldValve = 0;
    step.thirdValve = 0;
    step.bathLevel = 1;
    step.steamCode = 0;
    step.chemicals = [];
  }
  if (step.typeCode === '0') {
    step.chemicals = [];
    step.washSpeed = 0;
    step.drainType = 0;
    step.drainDestination = 0;
  }
}

function ensureTerminalEnd(formula) {
  if (!formula.steps.length) {
    formula.steps.push(createEndStep());
    return;
  }
  const last = formula.steps[formula.steps.length - 1];
  if (last.typeCode !== '0') {
    formula.steps.push(createEndStep());
  }
}

function getSelectableSlotCount(formula) {
  const base = formula.steps.length;
  if (base >= MAX_STEPS) return base;
  return base + 1;
}
function getCurrentFormula() {
  return formulas[state.formulaIndex];
}

function getActiveStep() {
  const formula = getCurrentFormula();
  if (state.activeStepIndex == null) return null;
  return formula.steps[state.activeStepIndex];
}

function ensureStep(index) {
  const formula = getCurrentFormula();
  while (formula.steps.length <= index && formula.steps.length < MAX_STEPS) {
    formula.steps.splice(formula.steps.length - 1, 0, createDefaultStep());
  }
  return formula.steps[index];
}

function findNextDecisionIndex(currentIndex, step) {
  for (let i = currentIndex + 1; i < DECISION_FLOW.length; i += 1) {
    if (isDecisionActive(DECISION_FLOW[i], step)) {
      return i;
    }
  }
  return -1;
}

function isDecisionActive(decisionId, step) {
  if (!step) return false;
  switch (decisionId) {
    case 'hotValve':
    case 'coldValve':
      return isBathStep(step);
    case 'thirdValve':
      return isBathStep(step) && CONFIG.hasThirdWater;
    case 'bathLevel':
      return isBathStep(step);
    case 'steamCode':
      return isBathStep(step) && CONFIG.hasSteam;
    case 'chemicals':
      return isBathStep(step);
    case 'washSpeed':
    case 'drainType':
    case 'drainDestination':
      return isBathStep(step);
    case 'endAction':
      return step.typeCode === '0';
    default:
      return true;
  }
}

function isBathStep(step) {
  if (!step) return false;
  return BATH_TYPE_CODES.has(step.typeCode);
}

function formatStepHeader(formulaNumber) {
  const prefix = formulaNumber < 10 ? `0${formulaNumber}` : String(formulaNumber);
  return `${prefix} TMMQFFFHC LSCWSS*`.padEnd(20, ' ');
}

function formatSpdHeader(formulaNumber) {
  const prefix = formulaNumber < 10 ? `0${formulaNumber}` : String(formulaNumber);
  return `${prefix} SPD D E`.padEnd(20, ' ');
}

function createStepFromTemplate(overrides) {
  const base = createDefaultStep(overrides.typeCode ?? '2');
  return {
    ...base,
    ...overrides,
    chemicals: overrides.chemicals
      ? overrides.chemicals.map(cloneChemical)
      : overrides.chemicals ?? [],
  };
}

function getCursorRegion() {
  if (state.mode !== 'stepEdit') return null;

  if (state.stepPhase === 'select' || state.activeStepIndex == null) {
    return { line: 2, columns: [0, 1] };
  }

  const decisionId = DECISION_FLOW[state.decisionIndex];
  if (decisionId === 'duration') {
    return { line: 2, columns: getDurationCursorColumns() };
  }
  if (decisionId === 'chemicals') {
    return { line: 2, columns: getChemicalCursorColumns() };
  }

  const column = DECISION_CURSOR_COLUMNS[decisionId];
  if (column == null) return null;
  return { line: 2, columns: [clamp(Math.round(column), 0, 19)] };
}

function getDurationCursorColumns() {
  const base = 4;
  const offset = clamp(state.durationStage ?? 0, 0, 2);
  return [clamp(base + offset, 0, 19)];
}

function getChemicalCursorColumns() {
  switch (state.chemicalStage) {
    case 'start':
      return [16];
    case 'duration':
      return [17, 18];
    case 'signal':
      return [19];
    case 'number':
    default:
      return [15];
  }
}

function setCursorRegion(line, columns) {
  state.cursorRegion = { line, columns: [...columns] };
}

function clearCursor() {
  state.cursorRegion = null;
}

function setDefinition(text) {
  if (!definitionTextEl) return;
  definitionTextEl.textContent = text || '';
}

function getDecisionDefinition(decisionId, step) {
  switch (decisionId) {
    case 'type':
      return getStepType(step)?.description ?? 'Select the bath or extract type.';
    case 'duration':
      if (state.durationStage === 0) return 'Adjust tens of minutes (first M).';
      if (state.durationStage === 1) return 'Adjust ones of minutes (second M).';
      return 'Adjust quarter-minutes (Q = 15 seconds).';
    case 'hotValve':
      return describeOption(HOT_VALVE_OPTIONS, step.hotValve, 'Hot water valve control.');
    case 'coldValve':
      return describeOption(COLD_VALVE_OPTIONS, step.coldValve, 'Cold water valve control.');
    case 'thirdValve':
      return describeOption(THIRD_VALVE_OPTIONS, step.thirdValve, 'Third water valve control.');
    case 'bathLevel':
      return describeOption(BATH_LEVEL_OPTIONS, step.bathLevel, 'Select bath level.');
    case 'steamCode':
      return 'Steam code fixed at 0 (steam not configurable).';
    case 'chemicals':
      return getChemicalStageDefinition(step);
    case 'washSpeed':
      return describeOption(WASH_SPEED_OPTIONS, step.washSpeed, 'Select wash speed profile.');
    case 'drainType':
      return describeOption(DRAIN_TYPE_OPTIONS, step.drainType, 'Choose drain motion.');
    case 'drainDestination':
      return describeOption(DRAIN_DEST_OPTIONS, step.drainDestination, 'Select drain destination.');
    case 'endAction':
      return describeOption(END_ACTIONS, step.endAction, 'Choose how the formula ends.');
    default:
      return '';
  }
}

function getChemicalStageDefinition(step) {
  const chem = state.workingChemical ?? createChemical();
  switch (state.chemicalStage) {
    case 'number':
      return 'Choose chemical pump number (0 skips this slot).';
    case 'start': {
      const options = getChemicalStartOptions();
      return describeOption(options, chem.startMode ?? 0, 'W=0 fill, 1 level satisfied, 2 level & temperature satisfied.');
    }
    case 'duration':
      return 'Set the injection duration in seconds (00-255).';
    case 'signal':
      return '1 requires operator acknowledgement before chemical injects.';
    default:
      return 'Configure up to five chemical injections for this bath.';
  }
}

function describeOption(options, value, fallback = '') {
  const option = options.find((opt) => opt.value === value);
  return option?.description ?? fallback;
}

function getChemicalStartOptions() {
  return CHEM_START_OPTIONS;
}

function getStepType(step) {
  return STEP_TYPES.find((type) => type.code === step.typeCode);
}

function cycleCollection(collection, currentValue, delta) {
  if (!collection.length) return currentValue;
  const values = collection.map((item) => item.value);
  let index = values.indexOf(currentValue);
  if (index === -1) index = 0;
  index = clamp(index + delta, 0, collection.length - 1);
  return collection[index].value;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function showMessage(line1, line2, { duration = 1200, nextMode } = {}) {
  if (messageTimer) clearTimeout(messageTimer);
  if (state.mode !== 'message') {
    modeBeforeMessage = state.mode;
  }
  state.mode = 'message';
  state.message = { line1, line2 };
  render();
  messageTimer = setTimeout(() => {
    state.mode = nextMode ?? modeBeforeMessage ?? 'programMenu';
    state.message = null;
    render();
  }, duration);
}

render();
