const piecesUnicode = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

function isPathClear(fR, fC, tR, tC, boardState) {
    const dR = Math.sign(tR - fR);
    const dC = Math.sign(tC - fC);

    let currR = parseInt(fR) + dR;
    let currC = parseInt(fC) + dC;

    while (currR !== parseInt(tR) || currC !== parseInt(tC)) {
        if (currR < 0 || currR > 7 || currC < 0 || currC > 7) return false;

        if (boardState[currR][currC] !== '') {
            return false; 
        }
        currR += dR;
        currC += dC;
    }
    return true;

}
