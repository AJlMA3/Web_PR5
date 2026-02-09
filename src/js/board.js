function createBoard(boardElement, boardState, handleSelect) {
    boardElement.innerHTML = '';
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement('div');
            cell.className = `cell ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Координаты
            if (c === 0) {
                const label = document.createElement('span');
                label.className = 'label-row';
                label.textContent = 8 - r;
                cell.appendChild(label);
            }
            if (r === 7) {
                const label = document.createElement('span');
                label.className = 'label-col';
                label.textContent = letters[c];
                cell.appendChild(label);
            }

            const char = boardState[r][c];
            if (char) {
                const pieceSpan = document.createElement('span');
                pieceSpan.textContent = piecesUnicode[char];
                cell.appendChild(pieceSpan);
                cell.dataset.color = char === char.toLowerCase() ? 'black' : 'white';
                cell.dataset.type = char.toLowerCase();
            }

            cell.onclick = () => handleSelect(cell);
            boardElement.appendChild(cell);
        }
    }
}