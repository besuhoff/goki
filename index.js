const colors = ['blue', 'green', 'yellow', 'orange', 'red'];
let combination = [];
let rows = [];
const rowElements = [];

const statusElement = document.querySelector('#status');
const boardElement = document.querySelector('board');
const respondElement = document.querySelector('#respond');
const newElement = document.querySelector('#new');
const restartElement = document.querySelector('#restart');

for (let i = 0; i < 10; i++) {
  const rowElement = document.createElement('row');
  rowElement.innerHTML = document.querySelector('#row').innerText;
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

const enableRespondButton = () => {
  respondElement.removeAttribute('disabled');
};

const disableRespondButton = () => {
  respondElement.setAttribute('disabled', 'disabled');
};

const setStatus = (message) => statusElement.innerText = message;

const win = () => {
  disableRespondButton();
  setStatus('You won!');
};

const lose = () => {
  disableRespondButton();
  setStatus('You lost!');
};

const renderRows = () => {
  rowElements.forEach((rowEl, rowIndex) => {
    const row = rows[rowIndex];
    if (rowIndex === rows.length - 1) {
      rowEl.classList.add('active');
    } else {
      rowEl.classList.remove('active');
    }
    rowEl.querySelectorAll('set.large hole').forEach((holeEl, holeIndex) => {
      holeEl.classList.remove(...colors);
      if (row) {
        holeEl.classList.add(colors[row[holeIndex]]);
      }
    });

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

  if (rows[rows.length - 1].every(hole => hole >= 0)) {
    enableRespondButton();
  } else {
    disableRespondButton();
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
  if (restart) {
    setStatus('Let’s play it again...')
  } else {
    setStatus('Let’s play...');
    generateCombination();
  }
  rows = [
    [-1, -1, -1, -1]
  ];
  renderRows();
};

respondElement.addEventListener('click', respond);

restartElement.addEventListener('click', () => startGame(true));

newElement.addEventListener('click', () => startGame());

boardElement.addEventListener('mouseup', (event) => {
  const el = event.target;

  if (el.tagName.toLowerCase() === 'hole' && el.parentElement.classList.contains('large') && el.parentElement.parentElement === rowElements[rows.length - 1]) {
    const index = [...el.parentElement.children].indexOf(el);
    toggleItem(index, event.button === 2 ? -1 : 1);
    renderRows();
  }
});

boardElement.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

startGame();