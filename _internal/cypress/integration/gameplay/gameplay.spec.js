/// <reference types="cypress" />

const colors = ['blue', 'green', 'yellow', 'orange', 'red'];
const rowNumber = 10;
const combinationLength = 4;


const visitPage = () => {
  cy.visit('https://besuhoff.github.io/goki/');
  // cy.visit('http://localhost:63342/goki/');
};

const getActiveHoleAtIndex = (index) => cy.get(`board row.active set.large hole:nth-of-type(${index + 1})`);
const getColorsFromCombination = (combination) => combination.map((index) => colors[index]);
const inputCombination = (combination) => {
  combination.forEach((holeValue, index) => {
    for (let i = 0; i <= holeValue; i++) {
      getActiveHoleAtIndex(index).click();
    }
  });
};
const respond = () => cy.get('#respond').click();

describe('example to-do app', () => {
  before(() => {
    visitPage();
  });

  it('disables New game button by default', () => {
    cy.get('#new').should('be.disabled');
  });

  it('disables Restart game button by default', () => {
    cy.get('#restart').should('be.disabled');
  });

  it('disables Respond button by default', () => {
    cy.get('#respond').should('be.disabled');
  });

  it('sets bottom-most row as active', () => {
    cy.get('board row:last-of-type').should('have.class', 'active');
    cy.get('board row.active').should('have.length', 1);
  });

  describe('when the first move is made', () => {
    before(() => {
      visitPage();
      getActiveHoleAtIndex(0).click();
    });

    it('sets hole to blue', () => {
      getActiveHoleAtIndex(0).should('have.class', 'blue');
    });

    it('keeps Respond button disabled', () => {
      cy.get('#respond').should('be.disabled');
    });

    it('enables New game button', () => {
      cy.get('#new').should('not.be.disabled');
    });

    it('enables Restart game button', () => {
      cy.get('#restart').should('not.be.disabled');
    });
  });

  describe('available colors', () => {
    beforeEach(() => {
      visitPage();
    });

    colors.forEach((color, index) => {
      describe(`when left mouse button is clicked ${index + 1} time${index > 0 ? 's' : ''}`, () => {
        it(`sets ${color} color of the chip`, () => {
          for (let i = 0; i < index + 1; i++) {
            getActiveHoleAtIndex(0).click();
          }

          getActiveHoleAtIndex(0).should('have.class', color);
        });
      });

      describe(`when right mouse button is clicked ${colors.length - index} time${colors.length - index > 1 ? 's' : ''}`, () => {
        it(`sets ${color} color of the chip`, () => {
          for (let i = 0; i < index + 1; i++) {
            getActiveHoleAtIndex(0).click({ button: 2 });
          }

          getActiveHoleAtIndex(0).should('have.class', color);
        });
      });

    });

    [
      ['left', {}],
      ['right', { button: 2 }],
    ].forEach(([button, event]) => {
      describe(`when ${button} mouse button is clicked ${colors.length + 1} times`, () => {
        it('unsets color of the chip', () => {
          for (let i = 0; i < colors.length + 1; i++) {
            getActiveHoleAtIndex(0).click(event);
          }

          getActiveHoleAtIndex(0).invoke('attr', 'class').should('be.empty');
        });
      });
    });
  });

  describe('responding', () => {
    let combinationSelector = null;
    let setCombination = null;

    [
      [[0, 0, 0, 0], [0, 0, 0, 1], 3, 0],
      [[0, 0, 0, 0], [0, 0, 1, 1], 2, 0],
      [[0, 0, 0, 1], [0, 0, 1, 1], 3, 0],
      [[1, 0, 0, 0], [0, 0, 1, 1], 1, 2],

      [[0, 0, 0, 0], [1, 1, 1, 1], 0, 0],
      [[1, 1, 1, 1], [2, 2, 2, 2], 0, 0],
      [[2, 2, 2, 2], [3, 3, 3, 3], 0, 0],
      [[3, 3, 3, 3], [4, 4, 4, 4], 0, 0],

      [[2, 2, 2, 2], [1, 1, 1, 1], 0, 0],
      [[3, 3, 3, 3], [2, 2, 2, 2], 0, 0],
      [[4, 4, 4, 4], [3, 3, 3, 3], 0, 0],
      [[0, 0, 0, 0], [4, 4, 4, 4], 0, 0],

      [[2, 2, 4, 4], [1, 1, 3, 3], 0, 0],
      [[2, 2, 4, 4], [2, 3, 2, 3], 1, 1],
      [[1, 2, 4, 4], [4, 3, 4, 2], 1, 2],
      [[1, 2, 4, 4], [0, 2, 0, 3], 1, 0],
      [[3, 4, 4, 3], [3, 4, 4, 4], 3, 0],
      [[3, 4, 2, 3], [3, 4, 3, 2], 2, 2],
      [[0, 4, 0, 1], [2, 4, 2, 1], 2, 0],

      [[1, 2, 3, 4], [4, 3, 2, 1], 0, 4],
      [[1, 2, 3, 4], [4, 3, 2, 0], 0, 3],
      [[0, 2, 3, 4], [3, 2, 0, 4], 2, 2],
      [[1, 2, 3, 4], [1, 2, 1, 4], 3, 0],
      [[1, 2, 3, 4], [1, 2, 1, 4], 3, 0],
      [[0, 2, 3, 4], [2, 0, 4, 3], 0, 4],
    ].forEach(([suggestion, puzzle, blacks, whites]) => {
      describe(`when input is ${getColorsFromCombination(suggestion)} and the puzzle is ${getColorsFromCombination(puzzle)}`, () => {
        before(() => {
          visitPage();
          cy.window().then((win) => {
            combinationSelector = win.selectors.combinationSelector;
            setCombination = win.actions.setCombination;

            setCombination(puzzle);
            inputCombination(suggestion);
          });
        });

        it('enables Respond button', () => {
          cy.get('#respond').should('not.be.disabled');
        });

        describe('and Respond is clicked', () => {
          before(() => {
            respond();
          });

          it('removes active class from bottom-most row', () => {
            cy.get('board row:last-of-type').should('not.have.class', 'active');
          });

          it('sets response class on a bottom-most row', () => {
            cy.get('board row:last-of-type').should('have.class', 'response');
          });

          it('activates the second bottom-most row', () => {
            cy.get('board row:nth-last-of-type(2)').should('have.class', 'active');
          });

          it(`responds with ${blacks} blacks and ${whites} whites`, () => {
            cy.get('board row.response set.small').within(() => {
              cy.get('hole.black').should('have.length', blacks);
              cy.get('hole.white').should('have.length', whites);
            });
          });
        });
      });

      describe('when user puts in puzzle combination and clicks Respond', () => {
        before(() => {
          visitPage();
          cy.window().then((win) => {
            combinationSelector = win.selectors.combinationSelector;
            setCombination = win.actions.setCombination;

            setCombination(puzzle);
            inputCombination(puzzle);
            respond();
          });
        });

        it('removes active class from bottom-most row', () => {
          cy.get('board row:last-of-type').should('not.have.class', 'active');
        });

        it('sets response class on a bottom-most row', () => {
          cy.get('board row:last-of-type').should('have.class', 'response');
        });

        it('does not activate the second bottom-most row', () => {
          cy.get('board row:nth-last-of-type(2)').should('not.have.class', 'active');
        });

        it(`responds with ${combinationLength} black chips`, () => {
          cy.get('board row.response set.small hole.black').should('have.length', combinationLength);
        });

        it('shows up winning message', () => {
          cy.get('#status').should('have.text', 'You won!');
        });

        it('reveals the winning combination', () => {
          cy.get('#combination').should('be.visible');
          cy.get('#combination set.large hole').should($holes => {
            for (let i = 0; i < combinationLength; i++) {
              expect($holes.eq(i)).to.have.class(colors[puzzle[i]]);
            }
          });
        });
      });
    });

    describe('when you are out of rows', () => {
      const puzzle = [1, 0, 0, 0];

      before(() => {
        visitPage();
        cy.window().then((win) => {
          combinationSelector = win.selectors.combinationSelector;
          setCombination = win.actions.setCombination;

          setCombination(puzzle);
          for (let i = 0; i < rowNumber; i++) {
            inputCombination([0, 0, 0, 0]);
            respond();
          }
        });
      });

      it('shows up losing message', () => {
        cy.get('#status').should('have.text', 'You lost!');
      });

      it('disables Respond button', () => {
        cy.get('#respond').should('be.disabled');
      });

      describe('and Restart game button is clicked', () => {
        before(() => {
          cy.get('#restart').click();
        });

        it('preserves puzzle combination', () => {
          const newCombination = combinationSelector();
          expect(newCombination).to.equal(puzzle);
        });

        describe('and the combination is put in', () => {
          before(() => {
            inputCombination(puzzle);
          });

          it('does not show the response', () => {
            cy.get('row.active set.small hole.black').should('have.length', 0);
            cy.get('row.active set.small hole.white').should('have.length', 0);
          });
        });
      })
    });

    describe('when the last row is winning', () => {
      const puzzle = [1, 0, 0, 0];
      before(() => {
        visitPage();
        cy.window().then((win) => {
          combinationSelector = win.selectors.combinationSelector;
          setCombination = win.actions.setCombination;
          setCombination(puzzle);
          for (let i = 0; i < rowNumber - 1; i++) {
            inputCombination([0, 0, 0, 0]);
            respond();
          }

          inputCombination(puzzle);
          respond();
        });
      });

      it('shows up winning message', () => {
        cy.get('#status').should('have.text', 'You won!');
      });

      it(`responds with ${combinationLength} black chips`, () => {
        cy.get('board row.response:first-of-type set.small hole.black').should('have.length', combinationLength);
      });

      it('disables Respond button', () => {
        cy.get('#respond').should('be.disabled');
      });
    });
  });
});
