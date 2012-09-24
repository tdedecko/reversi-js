var XSIZE = 8;
var YSIZE = 8;
var EMPTY = 0;
var DARK = 1;
var LIGHT = 2;
var GRAY = 3;

var turnColor;
var otherColor;
var skipLastTurn;
var Board;

function drawBoard() {
	var Text = "";
	for (var y = 0; y < YSIZE; y++) {
		for (var x = 0; x < XSIZE; x++) {
			Text += "<div id='box-" + x + "-" + y + "' class='box'><div id='node-" + x + "-" + y + "'>&nbsp;</div></div>";
		}
		Text += "<br/>";
	}
	document.getElementById("board").innerHTML = Text;

	// Create board
	Board = new Array(XSIZE);
	for(var x = 0; x < XSIZE; x++) {
		Board[x] = new Array(YSIZE);
	}
}

function updateBoard(x, y, mark) {
	Board[x][y] = mark;
	var element = document.getElementById("node-" + x + "-" + y);

	// Remove any old actions
	element.onmouseover = function() {};
	element.onmouseout = function() {};
	element.onclick = function() {};

	if (mark == EMPTY) {
		element.setAttribute("class", "marker empty");
	} else if (mark == DARK) {
		element.setAttribute("class", "marker dark");
	} else if (mark == LIGHT) {
		element.setAttribute("class", "marker light");
	} else if (mark == GRAY) {
		element.setAttribute("class", "marker grayoff");
		element.onmouseover = function() {
			if (turnColor == LIGHT) {
				element.setAttribute("class", "marker grayonlight");
			} else {
				element.setAttribute("class", "marker grayondark");
			}
		};
		element.onmouseout = function() {
			element.setAttribute("class", "marker grayoff");
		};
		element.onclick = function() {
			element.onmouseover = function() {};
			element.onmouseout = function() {};
			element.onclick = function() {};
			makeMove(x, y);
		};
	}
}

function displayPlayAgain() {
	var againElement = document.getElementById("again");
	againElement.innerHTML = "Play Again";
	
	againElement.onclick = function() {
		againElement.onclick = function() {};
		againElement.innerHTML = "";
		startGame();	
	};
}

function getPlayerText(player) {
	if (player == DARK) {
		return "Dark";
	} else if (player == LIGHT) {
		return "Light";
	} else {
		return "Empty";
	}
}

function updateTurn(player) {
	turnColor = player;
	if (player == DARK) {
		otherColor = LIGHT;
	} else if (player == LIGHT) {
		otherColor = DARK;
		
	} else {
		turnColor = EMPTY;
		otherColor = EMPTY;
	}
	
	var turnElement = document.getElementById("turn");
	turnElement.innerHTML = getPlayerText(player) + "'s turn";
}

function updateMessage(text) {
	var messageElement = document.getElementById("message");
	messageElement.innerHTML = text;
}

function clearMessage() {
	var messageElement = document.getElementById("message");
	messageElement.innerHTML = "";
}

function clearBoard() {
	for (var y = 0; y < YSIZE; y++) {
		for (var x = 0; x < XSIZE; x++) {
			updateBoard(x, y, EMPTY);
		}
	}
}

function findNeighbors(x, y) {
	var neighbors = [];

	for(var dx = -1; dx <= 1; dx++) {
		for(var dy = -1; dy <= 1; dy++) {
			var ax = x + dx;
			var ay = y + dy;

			if ( !isOutsideBounds(ax, ay) ) {
				neighbors = neighbors.concat({x : ax, y : ay, dx : dx, dy : dy});
			}
		}
	}
	return neighbors;
}

function isOutsideBounds(x, y) {
	if (y == YSIZE || y == -1 || x == XSIZE || x == -1) {
		return true;
	}
	return false;
}

function capture(x, y) {
	neighbor = findNeighbors(x, y);
	for (var i = 0; i < neighbor.length; i++) {
		var path = findPath(neighbor[i].x, neighbor[i].y, neighbor[i].dx, neighbor[i].dy);
		for (var j = 0; j < path.length; j++) {
			updateBoard(path[j].x, path[j].y, turnColor);
		}
	}
}

function isValidMove(x, y) {
	if (Board[x][y] != EMPTY) {
		return false;
	}

	neighbor = findNeighbors(x, y);
	for (var i = 0; i < neighbor.length; i++) {
		var path = findPath(neighbor[i].x, neighbor[i].y, neighbor[i].dx, neighbor[i].dy);
		if (path.length != 0) {
			return true;
		}
	}
	return false;
}

// Returns coordinates of a valid path or [] if path is invalid
function findPath(x, y, dx, dy) {
	if (Board[x][y] != otherColor) {
		return [];
	}

	var path = [{x : x, y : y}];

	var ax = x + dx;
	var ay = y + dy;

	while ( !isOutsideBounds(ax, ay) && Board[ax][ay] != EMPTY && Board[ax][ay] != GRAY) {
		if (Board[ax][ay] == turnColor) {
			return path;
		}

		path = path.concat({x : ax, y : ay});

		ax = ax + dx;
		ay = ay + dy;
	}

	return [];
}

function findValidMoves() {
	var moveCount = 0;
	for (var y = 0; y < YSIZE; y++) {
		for (var x = 0; x < XSIZE; x++) {
			if (isValidMove(x, y)) {
				moveCount++;
				updateBoard(x, y, GRAY);
			}
		}
	}
	return moveCount;
}

function clearOldMoves() {
	for (var y = 0; y < YSIZE; y++) {
		for (var x = 0; x < XSIZE; x++) {
			if (Board[x][y] == GRAY) {
				updateBoard(x, y, EMPTY);
			}
		}
	}
}

function gameover() {
	var turnElement = document.getElementById("turn");
	turnElement.innerHTML = "Game Over!";
	
	var winner = findWinner();
	if (winner == EMPTY) {
		updateMessage("it's a tie!");
	} else {
		updateMessage(getPlayerText(winner) + " wins!");
	}
	
	displayPlayAgain();
}

function findWinner() {
	var countDark = 0;
	var countLight = 0;
	for (var y = 0; y < YSIZE; y++) {
		for (var x = 0; x <XSIZE; x++) {
			if (Board[x][y] == DARK) {
				countDark++;
			} else if (Board[x][y] == LIGHT) {
				countLight++;
			}
		}
	}
	
	if (countDark > countLight) {
		return DARK;
	} else if (countLight > countDark) {
		return LIGHT;
	} else {
		return EMPTY;
	}
}

function nextTurn() {
	clearMessage();

	updateTurn(otherColor);
	clearOldMoves();
	
	var moveCount = findValidMoves();
	if (moveCount == 0) {
		if (skipLastTurn) {
			gameover();
		} else {
			skipLastTurn = true;
			nextTurn();
		}
	} else {
		if (skipLastTurn) {
			updateMessage(getPlayerText(otherColor) + " was unable to move.");	
		}
		skipLastTurn = false;
	}
}

function makeMove(x, y) {
	updateBoard(x, y, turnColor);
	capture(x, y);
	nextTurn();
}

function startGame() {
	skipLastTurn = false;
	clearBoard();
	clearMessage();

	// Set initial starting locations
	updateBoard(3, 3, LIGHT);
	updateBoard(3, 4, DARK);
	updateBoard(4, 3, DARK);
	updateBoard(4, 4, LIGHT);

	updateTurn(DARK);
	findValidMoves();
}

function init() {
	drawBoard();
	startGame();
}