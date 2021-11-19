const colors = ['blue', 'green', 'yellow', 'orange', 'red'];
let combination = [];
let rows = [];
const rowElements = [];

// Demo purposes
const sampleCombination = [2, 3, 3, 4];
const sampleRows = [
  [0, 1, 2, 4],
  [0, 1, 3, 3],
  [4, 2, 3, 3],
  [4, 3, 2, 3],
  [3, 4, 2, 3],
  [2, 3, 3, 4],
  [-1, -1, -1, -1],
];
let animationTimeout = null;

// DOM elements
const rulesElement = document.querySelector('#rules');
const statusElement = document.querySelector('#status');
const boardElement = document.querySelector('board');
const respondElement = document.querySelector('#respond');
const newElement = document.querySelector('#new');
const restartElement = document.querySelector('#restart');
const demoElement = document.querySelector('#demo');
const combinationElement = document.querySelector('#combination');
const helpElement = document.querySelector('help');

let easterClicks = 0;

rulesElement.addEventListener('click', () => {
  easterClicks += 1;
  if (easterClicks === 6) {
    document.body.classList.add('threed');
  }
});

const getHintAtIndex = (index) => helpElement.querySelector(`p:nth-of-type(${+index + 1})`);

// Render board from template
const template = document.querySelector('#row').innerText;
const translationWon = document.querySelector('#translation-won').innerText;
const translationLost = document.querySelector('#translation-lost').innerText;
const translationLetsPlay = document.querySelector('#translation-lets-play').innerText;
const translationLetsPlayAgain = document.querySelector('#translation-lets-play-again').innerText;
const translationDemo = document.querySelector('#translation-demo').innerText;

for (let i = 0; i < 10; i++) {
  const rowElement = document.createElement('row');
  rowElement.innerHTML = template;
  rowElements.unshift(rowElement);
  boardElement.appendChild(rowElement);
}

const getRandomColor = () => Math.floor(Math.random() * 5);

const generateCombination = () => {
  combination = [];
  for (let i = 0; i < 4; i++) {
    combination.push(getRandomColor());
  }
};

const toggleItem = (index, direction) => {
  const currentRow = rows[rows.length - 1];
  currentRow[index] += direction;
  if (currentRow[index] >= colors.length) {
    currentRow[index] = -1;
  }

  if (currentRow[index] < -1) {
    currentRow[index] = colors.length - 1;
  }
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

const win = () => {
  disableButton(respondElement);
  setStatus(translationWon);
  showElement(combinationElement);
  renderLargeSet(combinationElement.querySelector('set'), combination);
};

const lose = () => {
  disableButton(respondElement);
  setStatus(translationLost);
};

const renderLargeSet = (setElement, row) => {
  setElement.querySelectorAll('hole').forEach((holeEl, holeIndex) => {
    holeEl.classList.remove(...colors);
    if (row) {
      holeEl.classList.add(colors[row[holeIndex]]);
    }
  });
};

const renderRows = () => {
  rowElements.forEach((rowEl, rowIndex) => {
    const row = rows[rowIndex];
    if (rowIndex === rows.length - 1) {
      rowEl.classList.add('active');
    } else {
      rowEl.classList.remove('active');
    }
    renderLargeSet(rowEl.querySelector('set.large'), row);

    rowEl.querySelectorAll('set.small hole').forEach((holeEl) => holeEl.classList.remove('black', 'white'));

    if (rowIndex < rows.length - 1) {
      const {
        blacks,
        whites
      } = getMatch(rows[rowIndex], combination);
      const match = new Array(blacks).fill('black').concat(new Array(whites).fill('white'));

      rowEl.querySelectorAll('set.small hole').forEach((holeEl, holeIndex) => {
        holeEl.classList.add(match[holeIndex]);
      });

      if (blacks === combination.length) {
        win();
      }
    }
  });

  if (rows[rows.length - 1].every((holeValue) => holeValue >= 0)) {
    enableButton(respondElement);
  } else {
    disableButton(respondElement);
  }
};

const respond = () => {
  if (rows.length === rowElements.length) {
    lose();
    return;
  }

  rows.push([-1, -1, -1, -1]);
  renderRows();
};

const startGame = (restart) => {
  // Clear currently running demo animation if any
  if (animationTimeout) {
    clearTimeout(animationTimeout);
    animationTimeout = null;
  }
  hideElement(helpElement);
  hideElement(combinationElement);
  // Show live hints
  showElement(combinationElement.querySelector('.live'));
  // Hide demo hints
  hideElement(combinationElement.querySelector('.demo'));
  enableButton(restartElement);
  if (restart) {
    setStatus(translationLetsPlayAgain)
  } else {
    setStatus(translationLetsPlay);
    generateCombination();
  }
  rows = [[-1, -1, -1, -1]];
  renderRows();
};

const showNextDemoAnimationFrame = () => {
  const currentAnimatedRow = rows[rows.length - 1];

  const index = currentAnimatedRow.indexOf(-1);

  if (index === -1) {
    // Append new row to an animated set
    rows.push([-1, -1, -1, -1]);

    switch(rows.length) {
      case 2: showElement(getHintAtIndex(0)); break;
      case 3: showElement(getHintAtIndex(1)); break;
      case 6: showElement(getHintAtIndex(2)); break;
    }

    // If we didn't reach the end yet, apply longer pause and proceed
    if (sampleRows[rows.length - 1].some((value) => value !== -1)) {
      animationTimeout = setTimeout(showNextDemoAnimationFrame, 5000);
    }
  } else {
    currentAnimatedRow[index] = sampleRows[rows.length - 1][index];
    animationTimeout = setTimeout(showNextDemoAnimationFrame, 1000);
  }
  renderRows();
};

const showDemo = () => {
  // Initialize animated board
  combination = sampleCombination;
  rows = [[-1, -1, -1, -1]];
  // Render sample combination onto demo box
  renderLargeSet(combinationElement.querySelector('set'), combination);
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
  // Disable restart because demo can not be played
  disableButton(restartElement);
  setStatus(translationDemo);
  // Clear currently running demo animation if any
  if (animationTimeout) {
    clearTimeout(animationTimeout);
    animationTimeout = null;
  }
  // Clear the board
  renderRows();
  // Place first chip in 2 seconds
  animationTimeout = setTimeout(showNextDemoAnimationFrame, 2000);
};

respondElement.addEventListener('click', respond);
restartElement.addEventListener('click', () => startGame(true));
newElement.addEventListener('click', () => startGame());
demoElement.addEventListener('click', () => showDemo());

boardElement.addEventListener('mouseup', (event) => {
  const el = event.target;

  if (el.tagName.toLowerCase() === 'hole' && el.parentElement.classList.contains('large') && el.parentElement.parentElement === rowElements[rows.length - 1]) {
    const index = [...el.parentElement.children].indexOf(el);
    toggleItem(index, event.button === 2 ? -1 : 1);
    renderRows();
  }
});

boardElement.addEventListener('contextmenu', (event) => {
  const el = event.target;

  if (el.tagName.toLowerCase() === 'hole' && el.parentElement.classList.contains('large') && el.parentElement.parentElement === rowElements[rows.length - 1]) {
    event.preventDefault();
  }
});

startGame();