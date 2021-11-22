// Constants
const COLORS = ['blue', 'green', 'yellow', 'orange', 'red'];
const COMBINATION_LENGTH = 4;
const ROW_NUMBER = 10;
const MODES = {
  DEMO: 'DEMO',
  REGULAR: 'REGULAR',
  RESTARTED: 'RESTARTED',
};

const DEMO_TIME_BETWEEN_GUESSES = 5000;
const DEMO_TIME_TO_PLACE_CHIP = 1000;

// Math helpers
const getValueWithinBounds = (value, min, max) => {
  let valueToSet = value;
  const rangeSize = max - min + 1;

  while (valueToSet > max) {
    valueToSet -= rangeSize;
  }

  while (valueToSet < min) {
    valueToSet += rangeSize;
  }

  return valueToSet;
};

const getMatch = (suggestion, combination) => {
  const suggestionLeftover = [...suggestion];
  const combinationLeftover = [...combination];
  let blacks = 0;
  let whites = 0;

  // Go through combination and suggestion and cross out exact matches
  for (let i = 0; i < suggestionLeftover.length; i++) {
    if (suggestionLeftover[i] === combinationLeftover[i]) {
      suggestionLeftover[i] = -1;
      combinationLeftover[i] = -1;
      blacks += 1;
    }
  }

  // Go through combination and suggestion again and cross out unexact matches
  for (let i = 0; i < suggestionLeftover.length; i++) {
    if (suggestionLeftover[i] >= 0) {
      const index = combinationLeftover.indexOf(suggestionLeftover[i]);
      if (index >= 0) {
        combinationLeftover[index] = -1;
        suggestionLeftover[i] = -1;
        whites += 1;
      }
    }
  }


  return {
    blacks,
    whites
  };
};

const getRandomColor = () => Math.floor(Math.random() * 5);

const getRandomCombination = () => {
  const combination = [];
  for (let i = 0; i < COMBINATION_LENGTH; i++) {
    combination.push(getRandomColor());
  }

  return combination;
};

const areCombinationsMatching = (a, b) => a.every((el, index) => el === b[index]);

// DOM elements
const rulesElement = document.querySelector('#rules');
const statusElement = document.querySelector('#status');
const boardElement = document.querySelector('board');
const respondButtonElement = document.querySelector('#respond');
const newGameButtonElement = document.querySelector('#new');
const restartGameButtonElement = document.querySelector('#restart');
const showDemoButtonElement = document.querySelector('#demo');
const combinationElement = document.querySelector('#combination');
const helpElement = document.querySelector('help');

// Templates
const template = document.querySelector('#row').innerText;
const translationWon = document.querySelector('#translation-won').innerText;
const translationLost = document.querySelector('#translation-lost').innerText;
const translationLetsPlay = document.querySelector('#translation-lets-play').innerText;
const translationLetsPlayAgain = document.querySelector('#translation-lets-play-again').innerText;
const translationDemo = document.querySelector('#translation-demo').innerText;

// DOM-level helpers
const enableButton = (buttonElement) => {
  buttonElement.removeAttribute('disabled');
};

const disableButton = (buttonElement) => {
  buttonElement.setAttribute('disabled', 'disabled');
};

const showElement = (element) => {
  element.removeAttribute('hidden');
};

const hideElement = (element) => {
  element.setAttribute('hidden', 'hidden');
};

const setStatus = (message) => statusElement.innerText = message;

const renderLargeSet = (setElement, row) => {
  setElement.querySelectorAll('hole').forEach((holeEl, holeIndex) => {
    holeEl.classList.remove(...COLORS);
    if (row && row[holeIndex] >= 0) {
      holeEl.classList.add(COLORS[row[holeIndex]]);
    }
  });
};

const appendRowFromTemplate = () => {
  const rowElement = document.createElement('row');
  rowElement.innerHTML = template;
  boardElement.appendChild(rowElement);
  return rowElement;
};

const getHintAtIndex = (index) => helpElement.querySelector(`p:nth-of-type(${+index + 1})`);

// State
const state = {
  combination: [],
  rows: [],
  rowElements: [],
  mode: null,
  isCurrentRowChecked: false,

// Demo purposes
  demoCombination: [2, 3, 3, 4],
  demoRows: [
    [0, 1, 2, 4],
    [0, 1, 3, 3],
    [4, 2, 3, 3],
    [4, 3, 2, 3],
    [3, 4, 2, 3],
    [2, 3, 3, 4],
    [-1, -1, -1, -1],
  ],
  demoAnimationTimeout: null,

  // Easter :)
  easterClicks: 0,
};

// Selectors
const rowsSelector = () => state.rows;
const currentRowSelector = () => {
  const rows = rowsSelector();
  return rows.length > 0 ? rows[rows.length - 1] : null;
};

const rowElementsSelector = () => state.rowElements;
const combinationSelector = () => state.combination;
const modeSelector = () => state.mode;
const isCurrentRowCheckedSelector = () => state.isCurrentRowChecked;

const demoCombinationSelector = () => state.demoCombination;
const demoRowsSelector = () => state.demoRows;
const demoAnimationTimeoutSelector = () => state.demoAnimationTimeout;

const easterClicksSelector = () => state.easterClicks;

const hasWinningCombinationSelector = () => {
  const currentRow = currentRowSelector();
  const combination = combinationSelector();

  return currentRow ? areCombinationsMatching(currentRow, combination) : false;
};

const hasWonSelector = () => {
  const hasWinningCombination = hasWinningCombinationSelector();
  const isCurrentRowChecked = isCurrentRowCheckedSelector();
  return isCurrentRowChecked && hasWinningCombination;
};

const hasLostSelector = () => {
  const rows = rowsSelector();
  const hasWinningCombination = hasWinningCombinationSelector();
  const isCurrentRowChecked = isCurrentRowCheckedSelector();
  return rows.length === ROW_NUMBER && isCurrentRowChecked && !hasWinningCombination;
};

const hasStartedGameSelector = () => {
  const rows = rowsSelector();

  return rows[0] && rows[0].some((value) => value !== -1);
};

const isGameActiveSelector = () => !hasWonSelector() && !hasLostSelector();

const shouldEnableNewGameButtonSelector = () => modeSelector() !== MODES.REGULAR || hasStartedGameSelector();

const shouldEnableRespondButtonSelector = () => {
  const currentRow = currentRowSelector();
  const isGameActive = isGameActiveSelector();

  return isGameActive && currentRow.every((holeValue) => holeValue >= 0);
};

const shouldEnableRestartGameButtonSelector = () => modeSelector() !== MODES.DEMO && hasStartedGameSelector();

// Actions modifying state
const setCombination = (combination) => {
  state.combination = combination;
};

const setRows = (rows) => {
  state.rows = rows;
};

const setMode = (mode) => {
  state.mode = mode;
};

const setIsCurrentRowChecked = () => {
  state.isCurrentRowChecked = true;
};

const resetIsCurrentRowChecked = () => {
  state.isCurrentRowChecked = false;
};

const addRow = (row) => {
  const rows = rowsSelector();
  setRows([
    ...rows,
    row
  ]);
  resetIsCurrentRowChecked();
};

const setRowAtIndex = (rowIndex, row) => {
  const rows = rowsSelector();
  setRows([
    ...rows.slice(0, rowIndex),
    row,
    ...rows.slice(rowIndex + 1)
  ]);
};

const setCurrentRow = (row) => {
  const rows = rowsSelector();
  setRowAtIndex(rows.length - 1, row);
};

const setCurrentRowHoleValue = (holeIndex, value) => {
  const currentRow = currentRowSelector();
  setCurrentRow(
    [
      ...currentRow.slice(0, holeIndex),
      value,
      ...currentRow.slice(holeIndex + 1),
    ]
  );
};

const toggleItem = (index, direction) => {
  const currentRow = currentRowSelector();
  const valueAtIndex = currentRow[index];

  let valueToSet = getValueWithinBounds(valueAtIndex + direction, -1, COLORS.length - 1);

  setCurrentRowHoleValue(index, valueToSet);
};

const setRowElements = (rowElements) => {
  state.rowElements = rowElements;
};

const renderBoard = () => {
  const elements = [];

  for (let i = 0; i < ROW_NUMBER; i++) {
    const rowElement = appendRowFromTemplate();
    elements.unshift(rowElement);
  }

  setRowElements(elements);
};

const setDemoAnimationTimeout = (demoAnimationTimeout) => {
  state.demoAnimationTimeout = demoAnimationTimeout;
};

const resetDemoAnimationTimeout = () => {
  state.demoAnimationTimeout = null;
};

const addEasterClicks = () => state.easterClicks += 1;

// Game logic
const applyButtonsState = () => {
  if (shouldEnableNewGameButtonSelector()) {
    enableButton(newGameButtonElement);
  } else {
    disableButton(newGameButtonElement);
  }

  if (shouldEnableRestartGameButtonSelector()) {
    enableButton(restartGameButtonElement);
  } else {
    disableButton(restartGameButtonElement);
  }

  if (shouldEnableRespondButtonSelector()) {
    enableButton(respondButtonElement);
  } else {
    disableButton(respondButtonElement);
  }
};

const displayWinningStatus = () => {
  const combination = combinationSelector();

  setStatus(translationWon);
  showElement(combinationElement);
  renderLargeSet(combinationElement.querySelector('set'), combination);
};

const displayLostStatus = () => {
  setStatus(translationLost);
};

const renderRows = () => {
  const rowElements = rowElementsSelector();
  const rows = rowsSelector();
  const combination = combinationSelector();
  const isGameActive = isGameActiveSelector();
  const isCurrentRowChecked = isCurrentRowCheckedSelector();

  rowElements.forEach((rowEl, rowIndex) => {
    const row = rows[rowIndex];
    if (rowIndex === rows.length - 1 && isGameActive) {
      rowEl.classList.add('active');
    } else {
      rowEl.classList.remove('active');
    }
    renderLargeSet(rowEl.querySelector('set.large'), row);

    rowEl.querySelectorAll('set.small hole').forEach((holeEl) => holeEl.classList.remove('black', 'white'));
    rowEl.classList.add('response');

    if (rowIndex < rows.length - 1 || (rowIndex === rows.length - 1 && isCurrentRowChecked)) {
      const {
        blacks,
        whites
      } = getMatch(rows[rowIndex], combination);
      const match = new Array(blacks).fill('black').concat(new Array(whites).fill('white'));

      rowEl.classList.add('response');

      rowEl.querySelectorAll('set.small hole').forEach((holeEl, holeIndex) => {
        holeEl.classList.add(match[holeIndex]);
      });
    }
  });

  applyButtonsState();
};

const respond = () => {
  const rows = rowsSelector();
  const rowElements = rowElementsSelector();
  const hasWinningCombination = hasWinningCombinationSelector();

  if (!shouldEnableRespondButtonSelector()) {
    return;
  }

  setIsCurrentRowChecked();

  if (hasWinningCombination) {
    displayWinningStatus();
  } else if (rows.length === rowElements.length) {
    displayLostStatus();
  } else {
    addRow([-1, -1, -1, -1]);
  }

  renderRows();
};

const startGame = (restart) => {
  const demoAnimationTimeout = demoAnimationTimeoutSelector();

  hideElement(helpElement);
  hideElement(combinationElement);
  // Show live hints
  showElement(combinationElement.querySelector('.live'));
  // Hide demo hints
  hideElement(combinationElement.querySelector('.demo'));

  // Clear currently running demo animation if any
  if (demoAnimationTimeout) {
    clearTimeout(demoAnimationTimeout);
    resetDemoAnimationTimeout()
  }

  // Set appropriate mode and status
  if (restart) {
    setMode(MODES.RESTARTED);
    setStatus(translationLetsPlayAgain)
  } else {
    setMode(MODES.REGULAR);
    setStatus(translationLetsPlay);
    setCombination(getRandomCombination());
  }
  setRows([[-1, -1, -1, -1]]);
  renderRows();
};

const showNextDemoAnimationFrame = () => {
  let rows = rowsSelector();
  const demoRows = demoRowsSelector();
  const currentAnimatedRow = rows[rows.length - 1];

  const index = currentAnimatedRow.indexOf(-1);

  if (index === -1) {
    switch (rows.length) {
      case 1:
        showElement(getHintAtIndex(0));
        break;
      case 2:
        showElement(getHintAtIndex(1));
        break;
      case 5:
        showElement(getHintAtIndex(2));
        break;
    }

    // Append new row to an animated set
    addRow([-1, -1, -1, -1]);
    rows = rowsSelector();

    // If we didn't reach the end yet, apply longer pause and proceed
    if (demoRows[rows.length - 1].some((value) => value !== -1)) {
      setDemoAnimationTimeout(setTimeout(showNextDemoAnimationFrame, DEMO_TIME_BETWEEN_GUESSES));
    }
  } else {
    const valueToSet = demoRows[rows.length - 1][index];
    setCurrentRowHoleValue(index, valueToSet);

    setDemoAnimationTimeout(setTimeout(showNextDemoAnimationFrame, DEMO_TIME_TO_PLACE_CHIP));
  }
  renderRows();
};

const showDemo = () => {
  const demoCombination = demoCombinationSelector();
  const demoAnimationTimeout = demoAnimationTimeoutSelector();

  // Initialize animated board
  setCombination(demoCombination);
  setRows([[-1, -1, -1, -1]]);
  setMode(MODES.DEMO);
  // Render sample combination onto demo box
  renderLargeSet(combinationElement.querySelector('set'), demoCombination);
  // Hide all help hints at first
  helpElement.querySelectorAll('p').forEach(p => hideElement(p));
  // Hide live hints
  hideElement(combinationElement.querySelector('.live'));
  // Show demo hints
  showElement(combinationElement.querySelector('.demo'));
  // Display demo combination
  showElement(combinationElement);
  // Display help container
  showElement(helpElement);
  setStatus(translationDemo);
  // Clear currently running demo animation if any
  if (demoAnimationTimeout) {
    clearTimeout(demoAnimationTimeout);
    resetDemoAnimationTimeout();
  }
  // Clear the board
  renderRows();

  // Place first chip in 2 seconds
  setDemoAnimationTimeout(setTimeout(showNextDemoAnimationFrame, 2000));
};

// Event listeners
respondButtonElement.addEventListener('click', respond);
restartGameButtonElement.addEventListener('click', () => startGame(true));
newGameButtonElement.addEventListener('click', () => startGame());
showDemoButtonElement.addEventListener('click', () => showDemo());
document.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    respond();
  }
});

boardElement.addEventListener('mouseup', (event) => {
  const el = event.target;
  const rows = rowsSelector();
  const rowElements = rowElementsSelector();

  if (!hasWonSelector() && el.tagName.toLowerCase() === 'hole' && el.parentElement.classList.contains('large') && el.parentElement.parentElement === rowElements[rows.length - 1]) {
    const index = [...el.parentElement.children].indexOf(el);
    toggleItem(index, event.button === 2 ? -1 : 1);
    renderRows();
  }
});

boardElement.addEventListener('contextmenu', (event) => {
  const el = event.target;

  const rows = rowsSelector();
  const rowElements = rowElementsSelector();

  if (!hasWonSelector() && el.tagName.toLowerCase() === 'hole' && el.parentElement.classList.contains('large') && el.parentElement.parentElement === rowElements[rows.length - 1]) {
    event.preventDefault();
  }
});

rulesElement.addEventListener('click', () => {
  addEasterClicks();
  let easterClicks = easterClicksSelector();

  if (easterClicks === 6) {
    document.body.classList.add('threed');
  }
});

// Initialize
renderBoard();
startGame();

window.selectors = {
  combinationSelector,
};

window.actions = {
  setCombination,
};

window.helpers = {
  getValueWithinBounds,
};
