// Constants
const colors = ['blue', 'green', 'yellow', 'orange', 'red'];
const combinationLength = 4;
const modes = {
  DEMO: 'DEMO',
  REGULAR: 'REGULAR',
  RESTARTED: 'RESTARTED',
};

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
  for (let i = 0; i < combinationLength; i++) {
    combination.push(getRandomColor());
  }

  return combination;
};

// State
const state = {
  combination: [],
  rows: [],
  rowElements: [],
  mode: null,

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
  return rows[rows.length - 1];
};

const rowElementsSelector = () => state.rowElements;
const combinationSelector = () => state.combination;
const modeSelector = () => state.mode;

const demoCombinationSelector = () => state.demoCombination;
const demoRowsSelector = () => state.demoRows;
const demoAnimationTimeoutSelector = () => state.demoAnimationTimeout;

const easterClicksSelector = () => state.easterClicks;

const hasWonSelector = () => {
  const rows = rowsSelector();
  const combination = combinationSelector();

  return rows[rows.length - 2] && rows[rows.length - 2].every((item, index) => item === combination[index]);
};

const hasLostSelector = () => {
  const rows = rowsSelector();
  const rowElements = rowElementsSelector();

  return rows.length > rowElements.length;
};

const hasStartedGame = () => {
  const rows = rowsSelector();

  return rows[0] && rows[0].some((value) => value !== -1);
};

const isGameActiveSelector = () => !hasWonSelector() && !hasLostSelector();

const shouldEnableNewGameButton = () => modeSelector() !== modes.REGULAR || hasStartedGame();

const shouldEnableRespondButtonSelector = () => {
  const rows = rowsSelector();
  const isGameActive = isGameActiveSelector();

  return isGameActive && rows[rows.length - 1].every((holeValue) => holeValue >= 0);
};

const shouldEnableRestartGameButton = () => modeSelector() !== modes.DEMO && hasStartedGame();

// Actions modifying state
const setCombination = (combination) => {
  state.combination = combination;
};

const setRows = (rows) => {
  state.rows = rows;
};

const addRow = (row) => {
  const rows = rowsSelector();
  setRows([
    ...rows,
    row
  ]);
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

  let valueToSet = getValueWithinBounds(valueAtIndex + direction, -1, colors.length - 1);

  setCurrentRowHoleValue(index, valueToSet);
};

const setRowElements = (rowElements) => {
  state.rowElements = rowElements;
};

const renderBoard = () => {
  const elements = [];

  for (let i = 0; i < 10; i++) {
    const rowElement = document.createElement('row');
    rowElement.innerHTML = template;
    elements.unshift(rowElement);
    boardElement.appendChild(rowElement);
  }

  setRowElements(elements);
};

const setDemoAnimationTimeout = (demoAnimationTimeout) => {
  state.demoAnimationTimeout = demoAnimationTimeout;
};

const resetDemoAnimationTimeout = () => {
  state.demoAnimationTimeout = null;
};

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
    holeEl.classList.remove(...colors);
    if (row && row[holeIndex] >= 0) {
      holeEl.classList.add(colors[row[holeIndex]]);
    }
  });
};

const getHintAtIndex = (index) => helpElement.querySelector(`p:nth-of-type(${+index + 1})`);

// Game logic
const applyButtonsState = () => {
  if (shouldEnableNewGameButton()) {
    enableButton(newGameButtonElement);
  } else {
    disableButton(newGameButtonElement);
  }

  if (shouldEnableRestartGameButton()) {
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

const win = () => {
  const combination = combinationSelector();

  setStatus(translationWon);
  showElement(combinationElement);
  renderLargeSet(combinationElement.querySelector('set'), combination);
  applyButtonsState();
};

const lose = () => {
  setStatus(translationLost);
  applyButtonsState();
};

const renderRows = () => {
  const rowElements = rowElementsSelector();
  const rows = rowsSelector();
  const combination = combinationSelector();
  const hasWon = hasWonSelector();
  const isGameActive = isGameActiveSelector();

  rowElements.forEach((rowEl, rowIndex) => {
    const row = rows[rowIndex];
    if (rowIndex === rows.length - 1 && !hasWon) {
      rowEl.classList.add('active');
    } else {
      rowEl.classList.remove('active');
    }
    renderLargeSet(rowEl.querySelector('set.large'), row);

    rowEl.querySelectorAll('set.small hole').forEach((holeEl) => holeEl.classList.remove('black', 'white'));

    if (rowIndex < rows.length - 1 || (rowIndex === rows.length - 1 && !isGameActive)) {
      const {
        blacks,
        whites
      } = getMatch(rows[rowIndex], combination);
      const match = new Array(blacks).fill('black').concat(new Array(whites).fill('white'));

      rowEl.classList.add('response');

      rowEl.querySelectorAll('set.small hole').forEach((holeEl, holeIndex) => {
        holeEl.classList.add(match[holeIndex]);
      });

      if (hasWon) {
        win();
      }
    }
  });

  applyButtonsState();
};

const respond = () => {
  const rows = rowsSelector();
  const rowElements = rowElementsSelector();

  if (!shouldEnableRespondButtonSelector()) {
    return;
  }

  if (rows.length === rowElements.length) {
    lose();
    return;
  }

  rows.push([-1, -1, -1, -1]);
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
    state.mode = modes.RESTARTED;
    setStatus(translationLetsPlayAgain)
  } else {
    state.mode = modes.REGULAR;
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
      setDemoAnimationTimeout(setTimeout(showNextDemoAnimationFrame, 5000));
    }
  } else {
    const valueToSet = demoRows[rows.length - 1][index];
    setCurrentRowHoleValue(index, valueToSet);

    setDemoAnimationTimeout(setTimeout(showNextDemoAnimationFrame, 1000));
  }
  renderRows();
};

const showDemo = () => {
  const demoCombination = demoCombinationSelector();
  const demoAnimationTimeout = demoAnimationTimeoutSelector();

  // Initialize animated board
  state.combination = demoCombination;
  setRows([[-1, -1, -1, -1]]);
  state.mode = modes.DEMO;
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
    applyButtonsState();
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
  let easterClicks = easterClicksSelector();
  state.easterClicks = easterClicks + 1;

  easterClicks = easterClicksSelector();
  if (easterClicks === 6) {
    document.body.classList.add('threed');
  }
});

// Initialize
renderBoard();
startGame();

window.selectors = {
  rowsSelector,
  rowElementsSelector,
  combinationSelector,
  modeSelector,

  demoRowsSelector,
  demoCombinationSelector,
  demoAnimationTimeoutSelector,

  easterClicksSelector,
};

window.actions = {
  setCombination,
};

window.helpers = {
  getRandomCombination,
  getValueWithinBounds,
};
