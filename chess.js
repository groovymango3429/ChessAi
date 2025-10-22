// Chess Game Implementation with Improved AI

// Piece values for evaluation
const PIECE_VALUES = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
    'P': -100, 'N': -320, 'B': -330, 'R': -500, 'Q': -900, 'K': -20000
};

// Piece-Square Tables for positional evaluation (from black's perspective)
const PST = {
    'p': [
        0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
        5,  5, 10, 25, 25, 10,  5,  5,
        0,  0,  0, 20, 20,  0,  0,  0,
        5, -5,-10,  0,  0,-10, -5,  5,
        5, 10, 10,-20,-20, 10, 10,  5,
        0,  0,  0,  0,  0,  0,  0,  0
    ],
    'n': [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
    ],
    'b': [
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -20,-10,-10,-10,-10,-10,-10,-20
    ],
    'r': [
        0,  0,  0,  0,  0,  0,  0,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        0,  0,  0,  5,  5,  0,  0,  0
    ],
    'q': [
        -20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5,  5,  5,  5,  0,-10,
         -5,  0,  5,  5,  5,  5,  0, -5,
          0,  0,  5,  5,  5,  5,  0, -5,
        -10,  5,  5,  5,  5,  5,  0,-10,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20
    ],
    'k': [
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20,
        -10,-20,-20,-20,-20,-20,-20,-10,
         20, 20,  0,  0,  0,  0, 20, 20,
         20, 30, 10,  0,  0, 10, 30, 20
    ]
};

// Game state
let board = [];
let currentPlayer = 'white';
let selectedSquare = null;
let validMoves = [];
let moveHistory = [];
let lastMove = null;
let aiDepth = 3;
let gameOver = false;

// Unicode chess pieces
const PIECES = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// Initialize the board
function initBoard() {
    board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    currentPlayer = 'white';
    selectedSquare = null;
    validMoves = [];
    moveHistory = [];
    lastMove = null;
    gameOver = false;
}

// Draw the board
function drawBoard() {
    const boardElement = document.getElementById('chessboard');
    boardElement.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];
            if (piece !== '.') {
                square.innerHTML = `<span class="piece">${PIECES[piece]}</span>`;
            }

            // Highlight selected square
            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
                square.classList.add('selected');
            }

            // Highlight valid moves
            if (validMoves.some(move => move.toRow === row && move.toCol === col)) {
                square.classList.add('valid-move');
            }

            // Highlight last move
            if (lastMove && 
                ((lastMove.fromRow === row && lastMove.fromCol === col) ||
                 (lastMove.toRow === row && lastMove.toCol === col))) {
                square.classList.add('last-move');
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }

    updateStatus();
}

// Handle square click
function handleSquareClick(row, col) {
    if (gameOver || currentPlayer !== 'white') return;

    const piece = board[row][col];

    // If a square is already selected
    if (selectedSquare) {
        const move = validMoves.find(m => m.toRow === row && m.toCol === col);
        if (move) {
            makeMove(move);
            selectedSquare = null;
            validMoves = [];
            
            // AI's turn
            if (!gameOver && currentPlayer === 'black') {
                setTimeout(makeAIMove, 100);
            }
        } else if (piece !== '.' && isWhitePiece(piece)) {
            // Select different piece
            selectedSquare = { row, col };
            validMoves = getValidMoves(row, col);
        } else {
            selectedSquare = null;
            validMoves = [];
        }
    } else {
        // Select a piece
        if (piece !== '.' && isWhitePiece(piece)) {
            selectedSquare = { row, col };
            validMoves = getValidMoves(row, col);
        }
    }

    drawBoard();
}

// Make a move
function makeMove(move) {
    const piece = board[move.fromRow][move.fromCol];
    
    // Store move in history
    moveHistory.push({
        from: { row: move.fromRow, col: move.fromCol },
        to: { row: move.toRow, col: move.toCol },
        piece: piece,
        captured: board[move.toRow][move.toCol],
        promotion: move.promotion
    });

    // Handle pawn promotion
    if (move.promotion) {
        board[move.toRow][move.toCol] = move.promotion;
    } else {
        board[move.toRow][move.toCol] = piece;
    }
    board[move.fromRow][move.fromCol] = '.';

    lastMove = move;
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';

    // Check for game over
    if (isCheckmate(currentPlayer)) {
        gameOver = true;
        updateStatus();
    }
}

// Undo the last move
function undoMove() {
    if (moveHistory.length === 0) return;

    // Undo AI move
    if (moveHistory.length > 0) {
        const aiMove = moveHistory.pop();
        board[aiMove.from.row][aiMove.from.col] = aiMove.piece;
        board[aiMove.to.row][aiMove.to.col] = aiMove.captured;
    }

    // Undo player move
    if (moveHistory.length > 0) {
        const playerMove = moveHistory.pop();
        board[playerMove.from.row][playerMove.from.col] = playerMove.piece;
        board[playerMove.to.row][playerMove.to.col] = playerMove.captured;
        lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;
    }

    currentPlayer = 'white';
    selectedSquare = null;
    validMoves = [];
    gameOver = false;
    drawBoard();
}

// Get valid moves for a piece
function getValidMoves(row, col) {
    const piece = board[row][col];
    const moves = [];

    if (piece === '.') return moves;

    const isWhite = isWhitePiece(piece);
    const pieceLower = piece.toLowerCase();

    switch (pieceLower) {
        case 'p':
            moves.push(...getPawnMoves(row, col, isWhite));
            break;
        case 'n':
            moves.push(...getKnightMoves(row, col, isWhite));
            break;
        case 'b':
            moves.push(...getBishopMoves(row, col, isWhite));
            break;
        case 'r':
            moves.push(...getRookMoves(row, col, isWhite));
            break;
        case 'q':
            moves.push(...getQueenMoves(row, col, isWhite));
            break;
        case 'k':
            moves.push(...getKingMoves(row, col, isWhite));
            break;
    }

    return moves;
}

// Pawn moves
function getPawnMoves(row, col, isWhite) {
    const moves = [];
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    const promotionRow = isWhite ? 0 : 7;

    // Move forward one square
    if (board[row + direction] && board[row + direction][col] === '.') {
        if (row + direction === promotionRow) {
            moves.push({ fromRow: row, fromCol: col, toRow: row + direction, toCol: col, promotion: isWhite ? 'Q' : 'q' });
        } else {
            moves.push({ fromRow: row, fromCol: col, toRow: row + direction, toCol: col });
        }

        // Move forward two squares from starting position
        if (row === startRow && board[row + 2 * direction][col] === '.') {
            moves.push({ fromRow: row, fromCol: col, toRow: row + 2 * direction, toCol: col });
        }
    }

    // Capture diagonally
    for (const dcol of [-1, 1]) {
        const newRow = row + direction;
        const newCol = col + dcol;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = board[newRow][newCol];
            if (target !== '.' && isWhitePiece(target) !== isWhite) {
                if (newRow === promotionRow) {
                    moves.push({ fromRow: row, fromCol: col, toRow: newRow, toCol: newCol, promotion: isWhite ? 'Q' : 'q' });
                } else {
                    moves.push({ fromRow: row, fromCol: col, toRow: newRow, toCol: newCol });
                }
            }
        }
    }

    return moves;
}

// Knight moves
function getKnightMoves(row, col, isWhite) {
    const moves = [];
    const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const [drow, dcol] of offsets) {
        const newRow = row + drow;
        const newCol = col + dcol;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = board[newRow][newCol];
            if (target === '.' || isWhitePiece(target) !== isWhite) {
                moves.push({ fromRow: row, fromCol: col, toRow: newRow, toCol: newCol });
            }
        }
    }

    return moves;
}

// Bishop moves
function getBishopMoves(row, col, isWhite) {
    return getSlidingMoves(row, col, isWhite, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
}

// Rook moves
function getRookMoves(row, col, isWhite) {
    return getSlidingMoves(row, col, isWhite, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
}

// Queen moves
function getQueenMoves(row, col, isWhite) {
    return getSlidingMoves(row, col, isWhite, [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ]);
}

// Sliding moves (for bishop, rook, queen)
function getSlidingMoves(row, col, isWhite, directions) {
    const moves = [];

    for (const [drow, dcol] of directions) {
        let newRow = row + drow;
        let newCol = col + dcol;

        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = board[newRow][newCol];
            if (target === '.') {
                moves.push({ fromRow: row, fromCol: col, toRow: newRow, toCol: newCol });
            } else {
                if (isWhitePiece(target) !== isWhite) {
                    moves.push({ fromRow: row, fromCol: col, toRow: newRow, toCol: newCol });
                }
                break;
            }
            newRow += drow;
            newCol += dcol;
        }
    }

    return moves;
}

// King moves
function getKingMoves(row, col, isWhite) {
    const moves = [];
    const offsets = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];

    for (const [drow, dcol] of offsets) {
        const newRow = row + drow;
        const newCol = col + dcol;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = board[newRow][newCol];
            if (target === '.' || isWhitePiece(target) !== isWhite) {
                moves.push({ fromRow: row, fromCol: col, toRow: newRow, toCol: newCol });
            }
        }
    }

    return moves;
}

// Check if piece is white
function isWhitePiece(piece) {
    return piece === piece.toUpperCase();
}

// Evaluate board position
function evaluateBoard() {
    let score = 0;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece === '.') continue;

            const isWhite = isWhitePiece(piece);
            const pieceLower = piece.toLowerCase();
            
            // Material value
            let value = PIECE_VALUES[piece];
            
            // Positional value
            const pstIndex = isWhite ? (7 - row) * 8 + col : row * 8 + col;
            const posValue = PST[pieceLower][pstIndex];
            
            score += value + (isWhite ? -posValue : posValue);
        }
    }

    return score;
}

// Minimax with alpha-beta pruning
function minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
        return evaluateBoard();
    }

    const player = isMaximizing ? 'black' : 'white';
    const allMoves = getAllMovesForPlayer(player);

    if (allMoves.length === 0) {
        if (isInCheck(player)) {
            return isMaximizing ? -100000 : 100000;
        }
        return 0; // Stalemate
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of allMoves) {
            // Make move
            const backup = makeTemporaryMove(move);
            const evaluation = minimax(depth - 1, alpha, beta, false);
            // Undo move
            undoTemporaryMove(move, backup);

            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of allMoves) {
            // Make move
            const backup = makeTemporaryMove(move);
            const evaluation = minimax(depth - 1, alpha, beta, true);
            // Undo move
            undoTemporaryMove(move, backup);

            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

// Get all moves for a player
function getAllMovesForPlayer(player) {
    const moves = [];
    const isWhite = player === 'white';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece !== '.' && isWhitePiece(piece) === isWhite) {
                moves.push(...getValidMoves(row, col));
            }
        }
    }

    // Move ordering: prioritize captures
    moves.sort((a, b) => {
        const captureA = board[a.toRow][a.toCol] !== '.' ? 1 : 0;
        const captureB = board[b.toRow][b.toCol] !== '.' ? 1 : 0;
        return captureB - captureA;
    });

    return moves;
}

// Make temporary move for evaluation
function makeTemporaryMove(move) {
    const captured = board[move.toRow][move.toCol];
    const piece = board[move.fromRow][move.fromCol];
    
    if (move.promotion) {
        board[move.toRow][move.toCol] = move.promotion;
    } else {
        board[move.toRow][move.toCol] = piece;
    }
    board[move.fromRow][move.fromCol] = '.';

    return { piece, captured };
}

// Undo temporary move
function undoTemporaryMove(move, backup) {
    board[move.fromRow][move.fromCol] = backup.piece;
    board[move.toRow][move.toCol] = backup.captured;
}

// Check if king is in check
function isInCheck(player) {
    const isWhite = player === 'white';
    const kingChar = isWhite ? 'K' : 'k';
    
    // Find king position
    let kingRow = -1, kingCol = -1;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === kingChar) {
                kingRow = row;
                kingCol = col;
                break;
            }
        }
        if (kingRow !== -1) break;
    }

    // Check if any opponent piece can attack the king
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece !== '.' && isWhitePiece(piece) !== isWhite) {
                const moves = getValidMoves(row, col);
                if (moves.some(m => m.toRow === kingRow && m.toCol === kingCol)) {
                    return true;
                }
            }
        }
    }

    return false;
}

// Check for checkmate
function isCheckmate(player) {
    if (!isInCheck(player)) return false;

    const moves = getAllMovesForPlayer(player);
    for (const move of moves) {
        const backup = makeTemporaryMove(move);
        const inCheck = isInCheck(player);
        undoTemporaryMove(move, backup);
        
        if (!inCheck) return false;
    }

    return true;
}

// Make AI move
function makeAIMove() {
    document.getElementById('thinking').textContent = 'AI is thinking...';
    
    setTimeout(() => {
        const moves = getAllMovesForPlayer('black');
        if (moves.length === 0) {
            gameOver = true;
            updateStatus();
            return;
        }

        let bestMove = null;
        let bestValue = -Infinity;

        for (const move of moves) {
            const backup = makeTemporaryMove(move);
            const value = minimax(aiDepth - 1, -Infinity, Infinity, false);
            undoTemporaryMove(move, backup);

            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }

        if (bestMove) {
            makeMove(bestMove);
            drawBoard();
        }

        document.getElementById('thinking').textContent = '';
    }, 10);
}

// Update status
function updateStatus() {
    const statusElement = document.getElementById('status');
    const evalElement = document.getElementById('evaluation');

    if (gameOver) {
        if (isCheckmate(currentPlayer)) {
            statusElement.textContent = currentPlayer === 'white' ? 'Black Wins - Checkmate!' : 'White Wins - Checkmate!';
        } else {
            statusElement.textContent = 'Stalemate!';
        }
    } else {
        statusElement.textContent = currentPlayer === 'white' ? "White's Turn" : "Black's Turn (AI)";
    }

    const evaluation = evaluateBoard() / 100;
    evalElement.textContent = `Eval: ${evaluation.toFixed(2)}`;
}

// New game
function newGame() {
    initBoard();
    drawBoard();
}

// Change difficulty
function changeDifficulty() {
    aiDepth = parseInt(document.getElementById('difficulty').value);
}

// Initialize game on load
window.addEventListener('DOMContentLoaded', () => {
    initBoard();
    drawBoard();
});
