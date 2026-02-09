const boardElement = document.getElementById('board');
const turnDisplay = document.getElementById('turn-display');
let selectedCell = null;
let currentTurn = 'white';
let isGameOver = false;

let boardState = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    Array(8).fill(''), Array(8).fill(''), Array(8).fill(''), Array(8).fill(''),
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

function handleSelect(cell) {
    if (isGameOver) return;

    // Если кликнули по уже выбранной — снимаем выделение
    if (selectedCell === cell) {
        clearHighlights();
        selectedCell.classList.remove('selected');
        selectedCell = null;
        return;
    }

    if (selectedCell) {
        if (canMove(selectedCell, cell, boardState)) {
            executeMove(selectedCell, cell);
            clearHighlights();
        } else {
            // Если кликнули на другую свою фигуру — переключаем выбор
            if (cell.dataset.color === currentTurn) {
                selectedCell.classList.remove('selected');
                clearHighlights();
                selectedCell = cell;
                cell.classList.add('selected');
                showPossibleMoves(cell);
            } else {
                selectedCell.classList.remove('selected');
                clearHighlights();
                selectedCell = null;
            }
        }
    } else if (cell.dataset.color === currentTurn) {
        selectedCell = cell;
        cell.classList.add('selected');
        showPossibleMoves(cell); // ПОКАЗЫВАЕМ ХОДЫ
    }
}

// Функция поиска всех возможных ходов
function showPossibleMoves(fromCell) {
    const allCells = document.querySelectorAll('.cell');
    const fR = parseInt(fromCell.dataset.row);
    const fC = parseInt(fromCell.dataset.col);
    const movingPiece = boardState[fR][fC];
    const isWhite = movingPiece === movingPiece.toUpperCase();

    allCells.forEach(toCell => {
        const tR = parseInt(toCell.dataset.row);
        const tC = parseInt(toCell.dataset.col);

        if (canMove(fromCell, toCell, boardState)) {
            const target = boardState[tR][tC];

            if (target === "") {
                toCell.classList.add('possible-move');
            } else {
                // Проверяем, что в клетке именно ВРАГ
                const isTargetWhite = target === target.toUpperCase();
                if (isWhite !== isTargetWhite) {
                    toCell.classList.add('possible-attack');
                }
            }
        }
    });
}

// Очистка подсказок
function clearHighlights() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('possible-move');
        cell.classList.remove('possible-attack');
    });
}

// =====================================================================

function makeBotMove() {
    if (isGameOver || currentTurn === 'white') return;

    const allMoves = [];
    const cells = Array.from(document.querySelectorAll('.cell'));

    cells.forEach(fromCell => {
        // Проверяем, что фигура черная
        if (fromCell.dataset.color === 'black') {
            const fR = parseInt(fromCell.dataset.row);
            const fC = parseInt(fromCell.dataset.col);

            cells.forEach(toCell => {
                const tR = parseInt(toCell.dataset.row);
                const tC = parseInt(toCell.dataset.col);

                // Важнейшая проверка: бот может ходить только по правилам canMove
                if (canMove(fromCell, toCell, boardState)) {
                    const targetPiece = boardState[tR][tC];

                    // Бот НЕ должен есть свои фигуры
                    const isTargetBlack = targetPiece !== "" && targetPiece === targetPiece.toLowerCase();

                    if (!isTargetBlack) {
                        // Вес хода: 20 за короля, 10 за фигуру, 1 за пустую клетку
                        let weight = 1;
                        if (targetPiece !== "") {
                            weight = (targetPiece.toLowerCase() === 'k') ? 20 : 10;
                        }
                        allMoves.push({ from: fromCell, to: toCell, weight: weight });
                    }
                }
            });
        }
    });

    if (allMoves.length > 0) {
        // Сортируем ходы по весу (самые выгодные в начало)
        allMoves.sort((a, b) => b.weight - a.weight);

        // Берем лучшие ходы
        const bestWeight = allMoves[0].weight;
        const bestMoves = allMoves.filter(m => m.weight === bestWeight);
        const move = bestMoves[Math.floor(Math.random() * bestMoves.length)];

        // Выполняем ход только после небольшой паузы для плавности
        setTimeout(() => {
            // Перед ходом бота убедимся, что выделение снято
            if (selectedCell) {
                selectedCell.classList.remove('selected');
                selectedCell = null;
            }
            executeMove(move.from, move.to);
        }, 600);
    }
}

// =====================================================================

function executeMove(from, to) {
    const fR = from.dataset.row, fC = from.dataset.col;
    const tR = to.dataset.row, tC = to.dataset.col;
    const pieceChar = boardState[fR][fC];

    // 1. Сначала меняем данные
    boardState[tR][tC] = pieceChar;
    boardState[fR][fC] = '';

    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();

    // 2. Создаем анимацию (ghost)
    const ghost = document.createElement('div');
    ghost.className = 'dragging-piece';
    ghost.dataset.color = currentTurn;
    ghost.style.width = fromRect.width + 'px';
    ghost.style.height = fromRect.height + 'px';
    ghost.style.left = fromRect.left + 'px';
    ghost.style.top = fromRect.top + 'px';
    ghost.textContent = piecesUnicode[pieceChar];
    document.body.appendChild(ghost);

    // Скрываем фигуру в исходной клетке
    Array.from(from.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = '';
    });

    setTimeout(() => {
        ghost.style.left = toRect.left + 'px';
        ghost.style.top = toRect.top + 'px';
    }, 10);

    // 3. ЗАВЕРШЕНИЕ ХОДА (через 310мс)
    setTimeout(() => {
        if (document.body.contains(ghost)) {
            document.body.removeChild(ghost);
        }

        // ПЕРВАЯ ВАЖНАЯ ПРАВКА: Сначала перерисовываем доску, 
        // чтобы визуальное состояние совпало с boardState
        createBoard(boardElement, boardState, handleSelect);

        // Логика игры
        if (to.dataset.type === 'k') endGame(currentTurn);
        if (pieceChar.toLowerCase() === 'p' && (tR == 0 || tR == 7)) {
            handlePromotion(tR, tC, currentTurn);
        }

        // Лог хода
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const moveText = `${currentTurn === 'white' ? '⚪' : '⚫'} ${letters[fC]}${8 - fR} → ${letters[tC]}${8 - tR}`;
        const logEntry = document.createElement('div');
        logEntry.textContent = moveText;
        document.getElementById('move-history').prepend(logEntry);

        // Смена хода
        currentTurn = (currentTurn === 'white') ? 'black' : 'white';
        updateTurnUI();

        // Очистка выделения
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            selectedCell = null;
        }
        clearHighlights();

        // ВТОРАЯ ВАЖНАЯ ПРАВКА: Вызываем бота только в самом конце,
        // когда всё остальное уже отрисовано и переключено
        const gameMode = document.getElementById('game-mode').value;
        if (gameMode === 'pve' && currentTurn === 'black' && !isGameOver) {
            makeBotMove();
        }
    }, 310);
}

function updateTurnUI() {
    turnDisplay.textContent = (currentTurn === 'white') ? 'Белые' : 'Черные';
    turnDisplay.style.background = (currentTurn === 'white') ? '#f1c40f' : '#333';
    turnDisplay.style.color = (currentTurn === 'white') ? '#000' : '#fff';
}

function endGame(winner) {
    isGameOver = true;
    boardElement.classList.add('king-down');
    const winnerText = winner === 'white' ? 'БЕЛЫЕ ПОБЕДИЛИ!' : 'ЧЕРНЫЕ ПОБЕДИЛИ!';
    document.getElementById('status').innerHTML = `<span style="color:#e74c3c">${winnerText}</span>`;
    setTimeout(() => alert("Шах и мат! " + winnerText), 100);
}

let pendingPromotion = null; // Храним данные о превращении

function handlePromotion(row, col, color) {
    const overlay = document.getElementById('promotion-overlay');
    const options = document.querySelectorAll('.promo-choice');
    const promoPieces = color === 'white' ?
        { q: '♕', r: '♖', b: '♗', n: '♘' } :
        { q: '♛', r: '♜', b: '♝', n: '♞' };

    overlay.classList.remove('hidden');
    pendingPromotion = { row, col, color };

    options.forEach(opt => {
        const type = opt.dataset.type;
        opt.textContent = promoPieces[type];
        opt.onclick = () => finalizePromotion(type);
    });
}

function finalizePromotion(type) {
    const { row, col, color } = pendingPromotion;
    // Обновляем состояние доски (с учетом регистра для черных/белых)
    boardState[row][col] = (color === 'white') ? type.toUpperCase() : type.toLowerCase();

    document.getElementById('promotion-overlay').classList.add('hidden');
    pendingPromotion = null;

    // Перерисовываем доску, чтобы увидеть новую фигуру
    createBoard(boardElement, boardState, handleSelect);
}

// Запуск игры
createBoard(boardElement, boardState, handleSelect);