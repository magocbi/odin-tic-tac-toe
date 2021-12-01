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
    const newBoard = board.slice();
    newBoard[index] = symbol;
    board = newBoard;
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

  function getAvailableMoves() {
    const availableMoves = board
      .slice()
      .map((cell, index) => ({ index, symbol: cell }))
      .filter((cell) => cell.symbol === null);
    return availableMoves;
  }

  return {
    getBoardState,
    resetBoard,
    playMove,
    getWinIndex,
    gameTie,
    positionOccupied,
    getAvailableMoves,
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

  function getBoardCellIndex({ x: clickX, y: clickY }) {
    const cellSize = canvas.width / 3;
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

  return {
    resetCanvas,
    drawBoard,
    getCanvas,
    setUpCanvas,
    drawWinningLine,
    getBoardCellIndex,
  };
})(document);

const displayController = (function displayController(document, window) {
  const playerOneInput = document.getElementById('player-one');
  const playerTwoInput = document.getElementById('player-two');
  const restartBtn = document.getElementById('restart-btn');
  const gameInfo = document.querySelector('.info-display h2');
  const playerBtn = document.getElementById('player-btn');
  const computerBtn = document.getElementById('computer-btn');

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

  function onPlayerToggle(callback) {
    computerBtn.addEventListener('click', callback);
    playerBtn.addEventListener('click', callback);
  }

  function updatePlayerToggle(computerPlay) {
    computerBtn.classList.toggle('selected');
    playerBtn.classList.toggle('selected');
  }

  return {
    onRestart,
    onNameChange,
    onWindowResize,
    onPlayerToggle,
    updateGameInfo,
    updatePlayerInputs,
    updatePlayerToggle,
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
  let computerPlay = false;
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

  function displayGameResults() {
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

  function checkGameOver() {
    if (winCombinations.length || gameBoard.gameTie()) {
      gameOver = true;
    }
  }

  function getWinIndex(winConditions, symbol,board) {
    return winConditions.filter((combination) =>
      combination.every((index) => board[index] === symbol)
    );
  }

  function getAvailableMoves(board) {
    const availableMoves = board
      .slice()
      .map((cell, index) => ({ index, symbol: cell }))
      .filter((cell) => cell.symbol === null);
    return availableMoves;
  }

  function playMove(index, symbol) {
    gameBoard.playMove(index, symbol);
    winCombinations = gameBoard.getWinIndex(winConditions, symbol);
    boardDisplay.drawBoard(gameBoard.getBoardState());
  }
  
  function getMiniMaxComputerIndex(currentBoard, depth, computer) {
    const playerOneSymbol = playerOne.getSymbol();
    const playerTwoSymbol = playerTwo.getSymbol();

    if (getWinIndex(winConditions,playerTwoSymbol,currentBoard).length) return 1;
    if (getWinIndex(winConditions,playerOneSymbol,currentBoard).length) return -1;    
    if (depth === 0 || currentBoard.every(cell => cell!==null)) return 0;
    
    if (computer) {
      let maxEval = -Infinity;
      const availableMoves = getAvailableMoves(currentBoard);
      availableMoves.forEach(({index}) => {
        const newBoard = currentBoard.slice();
        newBoard[index]= playerTwoSymbol;
        let eval = getMiniMaxComputerIndex(newBoard,depth-1,false);
        maxEval = Math.max(maxEval,eval);
      });
      return maxEval;
    }else{
      let minEval  = Infinity;
      const availableMoves = getAvailableMoves(currentBoard);
      availableMoves.forEach(({index}) => {
        const newBoard = currentBoard.slice();
        newBoard[index]= playerOneSymbol;
        let eval = getMiniMaxComputerIndex(newBoard,depth-1,true);
        minEval = Math.min(minEval,eval);
      });
      return minEval;
    }
  }

  function getComputerMoveIndex(depth) {
    const availableMoves = gameBoard.getAvailableMoves();
    if(depth  ===0){
      const randomChoice = Math.floor(Math.random() * availableMoves.length);
      return availableMoves[randomChoice].index;
    }
    let bestMove;
    let eval = -Infinity;
    availableMoves.forEach(({index}) =>{
      const newBoard = gameBoard.getBoardState();
      newBoard[index] = playerTwo.getSymbol();
      let currentEval = getMiniMaxComputerIndex(newBoard,depth,false);
      if(eval<currentEval) {
        bestMove = index;
        eval = currentEval;
      }
    })
    console.log(eval);
    return bestMove;
    
  }


  function passTurn() {
    if (computerPlay && !gameOver) {
      playerOneTurn = !playerOneTurn;
      const moveIndex = getComputerMoveIndex(2);
      playMove(moveIndex, playerTwo.getSymbol());
      displayController.updateGameInfo('turn', playerOne.getName());
      checkGameOver();
    }
    
    
    
    if (gameOver) {
      displayGameResults();
    } 
    playerOneTurn = !playerOneTurn;
      
    
  }

  function handleBoardClick(e) {
    if (gameOver) return;
    const clickPosition = {
      x: e.offsetX,
      y: e.offsetY,
    };
    const cellIndex = boardDisplay.getBoardCellIndex(clickPosition);
    if (gameBoard.positionOccupied(cellIndex)) return;
    if (playerOneTurn) {
      playMove(cellIndex, playerOne.getSymbol());
      displayController.updateGameInfo('turn', playerTwo.getName());
    } else {
      playMove(cellIndex, playerTwo.getSymbol());
      displayController.updateGameInfo('turn', playerOne.getName());
    }
    // in case input field was left empty
    displayController.updatePlayerInputs(
      playerOne.getName(),
      playerTwo.getName()
    );

    checkGameOver();

    passTurn();
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

  function toggleComputer() {
    computerPlay = !computerPlay;
    displayController.updatePlayerToggle(computerPlay);
  }

  function setUpListeners() {
    boardDisplay.getCanvas().addEventListener('click', handleBoardClick);
    displayController.onRestart(setUpNewGame);
    displayController.onNameChange(onNameInputHandler);
    displayController.onWindowResize(resizeCanvas);
    displayController.onPlayerToggle(toggleComputer);
  }

  return { setUpNewGame, setUpListeners };
})(GameBoard, boardDisplay, displayController, Player);

gameController.setUpListeners();
gameController.setUpNewGame();
