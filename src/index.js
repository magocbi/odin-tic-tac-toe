function Player(name, symbol) {
  function getName() {
    return name;
  }

  function getSymbol() {
    return symbol;
  }

  function setName(newName) {
    name = newName;
  }

  return { getName, getSymbol, setName };
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

const boardDisplay = (function boardDisplay() {
  const canvas = document.getElementById('gameboard');
  const ctx = canvas.getContext('2d');

  const BOARD_COLOR = '#d1c05e';
  const BOARD_LINES_COLOR = '#000000';
  const X_COLOR = '#a36e05';
  const O_COLOR = '#7a3f00';
  const WINNING_LINE_COLOR = '#001724';

  let winningLineDrawn = false;

  function drawX(startPosition, distance, size) {
    const offset = size * distance;
    ctx.lineCap = 'round';
    ctx.lineWidth = canvas.width * 0.03;
    ctx.strokeStyle = X_COLOR;
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
    ctx.lineWidth = canvas.width * 0.03;
    ctx.strokeStyle = O_COLOR;
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
    setUpCanvas();
    winningLineDrawn = false;
  }

  function drawBoard(gameBoard) {
    const size = canvas.width;
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

  function getPositionByIndex(index, offsetX = 0, offsetY = 0) {
    const size = canvas.width;
    const cellSize = size / 3;
    // get correct row by flooring
    const y = Math.floor(index / 3) * cellSize + offsetY;
    // get correct column by module
    const x = (index % 3) * cellSize + offsetX;

    return { x, y };
  }

  function getDistanceBetweenPoints(
    { x: startX, y: startY },
    { x: endX, y: endY }
  ) {
    const distance = {
      x: Math.abs(endX - startX),
      y: Math.abs(endY - startY),
    };
    return distance;
  }

  function drawWinningLine(winningCombinations) {
    const size = canvas.width;
    const cellSize = size / 3;
    const winning = winningCombinations[0].map((index) => {
      const centeredPosition = getPositionByIndex(
        index,
        cellSize / 2,
        cellSize / 2
      );
      return centeredPosition;
    });
    const startPosition = winning[0];
    const endPosition = winning[2];
    const distance = getDistanceBetweenPoints(startPosition, endPosition);
    const delta = {
      x: endPosition.x - startPosition.x,
      y: endPosition.y - startPosition.y,
    };
    let animationEnd = false;
    let animateId;
    let currentPosition = startPosition;
    function animate() {
      let nextPosition = {
        x: currentPosition.x + delta.x / 20,
        y: currentPosition.y + delta.y / 20,
      };
      const currentDistance = getDistanceBetweenPoints(
        startPosition,
        nextPosition
      );
      if (currentDistance.x >= distance.x && currentDistance.y >= distance.y) {
        winningLineDrawn = true;
        animationEnd = true;
        nextPosition = endPosition;
      }
      ctx.lineCap = 'round';
      ctx.lineWidth = size * 0.05;
      ctx.strokeStyle = WINNING_LINE_COLOR;
      ctx.beginPath();
      ctx.moveTo(currentPosition.x, currentPosition.y);
      ctx.lineTo(nextPosition.x, nextPosition.y);
      ctx.stroke();

      if (animationEnd) {
        cancelAnimationFrame(animateId);
        return;
      }
      currentPosition = nextPosition;
      animateId = requestAnimationFrame(animate);
    }
    if (winningLineDrawn) {
      ctx.lineWidth = size * 0.05;
      ctx.lineCap = 'round';
      ctx.strokeStyle = WINNING_LINE_COLOR;
      ctx.beginPath();
      ctx.moveTo(startPosition.x, startPosition.y);
      ctx.lineTo(endPosition.x, endPosition.y);
      ctx.stroke();
    } else {
      animate();
    }
  }

  function setUpCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BOARD_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBoardLines();
  }

  return { resetCanvas, drawBoard, getCanvas, setUpCanvas, drawWinningLine };
})(document);

const displayController = (function displayController(document, window) {
  const playerOneInput = document.getElementById('player-one');
  const playerTwoInput = document.getElementById('player-two');
  const restartBtn = document.getElementById('restart-btn');
  const gameInfo = document.querySelector('.info-display h2');

  function updatePlayerInputs(playerOneName, playerTwoName) {
    playerOneInput.value = playerOneName;
    playerTwoInput.value = playerTwoName;
  }

  function updateGameInfo(action, playerName) {
    switch (action) {
      case 'turn':
        gameInfo.textContent = `${playerName} turn to play!`;
        break;
      case 'tie':
        gameInfo.textContent = 'Game is tied!';
        break;
      case 'won':
        gameInfo.textContent = `${playerName} has won the game`;
    }
  }

  function onRestart(callback) {
    restartBtn.addEventListener('click', callback);
  }

  function onNameChange(callback) {
    playerOneInput.addEventListener('input', callback);
    playerTwoInput.addEventListener('input', callback);
  }

  function onWindowResize(callback) {
    window.addEventListener('resize', callback);
  }

  return {
    onRestart,
    onNameChange,
    onWindowResize,
    updateGameInfo,
    updatePlayerInputs,
  };
})(document, window);

const gameController = (function gameController(
  gameBoard,
  boardDisplay,
  displayController,
  Player
) {
  let playerOne;
  let playerTwo;
  let playerOneTurn = true;
  let gameOver = false;
  let winCombinations = [];
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6],
  ];

  function getBoardCellIndex({ x: clickX, y: clickY }) {
    const cellSize = boardDisplay.getCanvas().width / 3;
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
    if (playerOneTurn) {
      gameBoard.playMove(cellIndex, playerOne.getSymbol());
      winCombinations = gameBoard.getWinIndex(
        winConditions,
        playerOne.getSymbol()
      );
      displayController.updateGameInfo('turn', playerTwo.getName());
    } else {
      gameBoard.playMove(cellIndex, playerTwo.getSymbol());
      winCombinations = gameBoard.getWinIndex(
        winConditions,
        playerTwo.getSymbol()
      );
      displayController.updateGameInfo('turn', playerOne.getName());
    }
    displayController.updatePlayerInputs(
      playerOne.getName(),
      playerTwo.getName()
    );
    boardDisplay.drawBoard(gameBoard.getBoardState());

    if (winCombinations.length || gameBoard.gameTie()) {
      gameOver = true;
      if (winCombinations.length) {
        let winningPlayer = playerOneTurn
          ? playerOne.getName()
          : playerTwo.getName();
        displayController.updateGameInfo('won', winningPlayer);
        boardDisplay.drawWinningLine(winCombinations);
      } else {
        displayController.updateGameInfo('tie', null);
      }
    }

    playerOneTurn = !playerOneTurn;
  }

  function setUpNewGame() {
    gameBoard.resetBoard();
    boardDisplay.resetCanvas();
    boardDisplay.drawBoard(gameBoard.getBoardState());

    const playerOneName = playerOne?.getName() || 'Player 1';
    const playerTwoName = playerTwo?.getName() || 'Player 2';
    playerOne = Player(playerOneName, 'x');
    playerTwo = Player(playerTwoName, 'o');
    playerOneTurn = true;
    gameOver = false;
    displayController.updateGameInfo('turn', playerOneName);
    displayController.updateGameInfo(playerOneName, playerTwoName);
  }

  function resizeCanvas() {
    boardDisplay.setUpCanvas();
    boardDisplay.drawBoard(gameBoard.getBoardState());
    if (gameOver) {
      boardDisplay.drawWinningLine(winCombinations);
    }
  }

  function onNameInputHandler(e) {
    const input = e.target;
    if (!input) return;
    let name = input.value;
    if (input.id === 'player-one') {
      name = name || 'Player 1';
      playerOne.setName(name);
    } else {
      name = name || 'Player 2';
      playerTwo.setName(name);
    }
  }

  function setUpListeners() {
    boardDisplay.getCanvas().addEventListener('click', handleBoardClick);
    displayController.onRestart(setUpNewGame);
    displayController.onNameChange(onNameInputHandler);
    displayController.onWindowResize(resizeCanvas);
  }

  return { setUpNewGame, setUpListeners };
})(GameBoard, boardDisplay, displayController, Player);

gameController.setUpListeners();
gameController.setUpNewGame();
