function canMove(from, to, boardState) {
    const fR = parseInt(from.dataset.row);
    const fC = parseInt(from.dataset.col);
    const tR = parseInt(to.dataset.row);
    const tC = parseInt(to.dataset.col);
    const type = from.dataset.type;
    const color = from.dataset.color;

    if (to.dataset.color === color) return false;

    const dr = tR - fR;
    const dc = tC - fC;

    // проверка препятствий (функция isPathClear модуля utils)
    if (type !== 'n' && type !== 'k') {
        if (!isPathClear(fR, fC, tR, tC, boardState)) return false;
    }

    switch (type) {
        case 'p':
            const dir = color === 'white' ? -1 : 1;
            const startRow = color === 'white' ? 6 : 1;

            // ход вперед
            if (fC === tC && dr === dir) {
                return boardState[tR][tC] === '';
            }

            // первый ход пешки на 2 клетки
            if (fC === tC && fR === startRow && dr === 2 * dir) {
                return boardState[fR + dir][fC] === '' && boardState[tR][tC] === '';
            }

            if (Math.abs(dc) === 1 && dr === dir) {
                const targetPiece = boardState[tR][tC];
                if (targetPiece !== '') {
                    const isTargetWhite = targetPiece === targetPiece.toUpperCase();
                    return isTargetWhite !== (color === 'white');
                }
            }
            return false;
        case 'r': return (dr === 0 || dc === 0);
        case 'n': return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
        case 'b': return Math.abs(dr) === Math.abs(dc);
        case 'q': return Math.abs(dr) === Math.abs(dc) || dr === 0 || dc === 0;
        case 'k': return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
    }
    return false;

}
