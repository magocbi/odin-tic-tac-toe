function Player(name, symbol) {
  function getName() {
    return name;
  }

  function getSymbol() {
    return symbol;
  }

  return { getName, getSymbol };
}

const GameBoard = (function gameBoard() {
  let board = new Array(9).fill(null);
  function getBoardState() {
    return board.slice();
  }

  function resetBoard() {
    board = new Array(9).fill(null);
  }

  function playMove(index, symbol) {
    board[index] = symbol;
  }

  function gameTie() {
    return board.every((symbol) => symbol !== null);
  }

  function getWinIndex(winConditions, symbol) {
    return winConditions.filter((combination) =>
      combination.every((index) => board[index] === symbol)
    );
  }

  function positionOccupied(index) {
    return board[index];
  }

  return {
    getBoardState,
    resetBoard,
    playMove,
    getWinIndex,
    gameTie,
    positionOccupied,
  };
})();

const displayController = (function displayController() {
  const canvas = document.getElementById('gameboard');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  const ctx = canvas.getContext('2d');

  const BOARD_COLOR = '#d1c05e';
  const BOARD_LINES_COLOR = '#000000';

  function drawX(startPosition, distance, size) {
    console.log(startPosition);
    const offset = size * distance;
    ctx.beginPath();
    ctx.moveTo(startPosition.x + offset, startPosition.y + offset);
    ctx.lineTo(
      startPosition.x + distance - offset,
      startPosition.y + distance - offset
    );
    ctx.moveTo(startPosition.x + distance - offset, startPosition.y + offset);
    ctx.lineTo(startPosition.x + offset, startPosition.y + distance - offset);
    ctx.stroke();
  }

  function drawO(centerPosition, distance, size) {
    ctx.beginPath();
    ctx.arc(
      centerPosition.x,
      centerPosition.y,
      (distance / 2) * size,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  function drawLine(startPosition, endPosition, lineWidth) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = BOARD_LINES_COLOR;
    ctx.beginPath();
    ctx.moveTo(startPosition.x, startPosition.y);
    ctx.lineTo(endPosition.x, endPosition.y);
  }

  function drawBoardLines() {
    const size = canvas.width;
    const lineWidth = size * 0.03;
    const cellSize = size / 3;
    const offset = size * 0.05;
    // vertical lines
    for (let i = 1; i <= 2; i++) {
      drawLine(
        { x: cellSize * i, y: 0 + offset },
        { x: cellSize * i, y: size - offset },
        lineWidth
      );
      ctx.stroke();
    }
    // horizontal lines
    for (let i = 1; i <= 2; i++) {
      drawLine(
        { x: 0 + offset, y: cellSize * i },
        { x: size - offset, y: cellSize * i }
      );
      ctx.stroke();
    }
  }

  function resetCanvas() {
    ctx.fillStyle = BOARD_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBoardLines();
  }

  function drawBoard(gameBoard) {
    const size = canvas.width;
    const lineWidth = size * 0.03;
    const cellSize = size / 3;
    const offset = size * 0.05;
    for (let i = 0; i < 3; i += 1) {
      //row

      for (let j = 0; j < 3; j++) {
        //column
        const cell = gameBoard[i * 3 + j];
        if (cell === 'x') {
          drawX(
            { x: cellSize * j + offset, y: cellSize * i + offset },
            cellSize - offset * 2,
            0.8
          );
        }
        if (cell === 'o') {
          drawO(
            {
              x: cellSize * j + cellSize / 2,
              y: cellSize * i + cellSize / 2,
            },
            cellSize - offset * 2,
            0.8
          );
        }
      }
    }
  }

  function getCanvas() {
    return canvas;
  }

  return { resetCanvas, drawBoard, getCanvas };
})(document);

const gameController = (function gameController(gameBoard, display, Player) {
  let playerOne;
  let playerTwo;
  let playerOneTurn = true;
  let gameOver = false;
  const playerOneInput = document.getElementById('player-one');
  const playerTwoInput = document.getElementById('player-two');
  const winConditions = [
    [0, 1, 2],
    [4, 5, 6],
    [7, 8, 9],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6],
  ];

  function getBoardCellIndex(clickPosition) {
    const { x: clickX, y: clickY } = clickPosition;
    const cellSize = display.getCanvas().width / 3;
    let index = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const startX = j * cellSize;
        const startY = i * cellSize;
        const endX = j * cellSize + cellSize;
        const endY = i * cellSize + cellSize;

        if (
          clickX >= startX &&
          clickY >= startY &&
          clickX <= endX &&
          clickY <= endY
        ) {
          index = i * 3 + j;
          break;
        }
      }
    }
    return index;
  }

  function handleBoardClick(e) {
    if (gameOver) return;
    const clickPosition = {
      x: e.offsetX,
      y: e.offsetY,
    };
    const cellIndex = getBoardCellIndex(clickPosition);
    if (gameBoard.positionOccupied(cellIndex)) return;
    let winCombinations = [];
    if (playerOneTurn) {
      gameBoard.playMove(cellIndex, playerOne.getSymbol());
      playerOneTurn = false;
      winCombinations = gameBoard.getWinIndex(
        winConditions,
        playerOne.getSymbol()
      );
    } else {
      gameBoard.playMove(cellIndex, playerTwo.getSymbol());
      playerOneTurn = true;
      winCombinations = gameBoard.getWinIndex(
        winConditions,
        playerTwo.getSymbol()
      );
    }
    if (winCombinations.length || gameBoard.gameTie()) {
      gameOver = true;
    }
    console.log(winCombinations);
    display.drawBoard(gameBoard.getBoardState());
  }

  function setUpNewGame() {
    display.resetCanvas();
    display.drawBoard(gameBoard.getBoardState());

    const playerOneName = playerOneInput.value || 'Player 1';
    const playerTwoName = playerTwoInput.value || 'Player 2';
    playerOne = Player(playerOneName, 'x');
    playerTwo = Player(playerTwoName, 'o');
  }

  function setUpListeners() {
    display.getCanvas().removeEventListener('click', handleBoardClick);
    display.getCanvas().addEventListener('click', handleBoardClick);
  }

  return { setUpNewGame, setUpListeners };
})(GameBoard, displayController, Player);

gameController.setUpListeners();
gameController.setUpNewGame();
