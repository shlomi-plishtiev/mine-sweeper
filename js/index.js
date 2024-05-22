'use strict'
var gBoard = []
var gLevel = {
    size: 4,
    mines: 2
}
const BOMB = '💣'
const FLAG = '🚩'

const gGame = {
    inOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function init() {
    gBoard = buildBoard(gLevel.size)
    placeMines(gBoard, gLevel.mines)
    setMinesAroundCounts(gBoard)
    renderBoard(gBoard)


}

function createMat(ROWS, COLS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}
function buildBoard(size) {
    const board = createMat(size, size)
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    // console.log(board)
    return board
}
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < gLevel.size; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var tdCall = ''

            if (currCell.isShown) {
                tdCall = currCell.isMine ? BOMB : currCell.minesAroundCount
            }
        

            strHTML += `<td class="cell" onclick="onCellClicked(this, ${i}, ${j})">${tdCall}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}
function placeMines(board, gLevel) {
    var emptyCells = getEmptyCell(board)
    for (var i = 0; i < gLevel; i++) {
        var randomCell = getRandomInt(0, emptyCells.length)
        const { i, j } = emptyCells.splice(randomCell, 1)[0]
        board[i][j].isMine = true
    }
}
function getEmptyCell() {
    var emptyCells = []
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (!gBoard[i][j].isMine) {
                emptyCells.push({ i: i, j: j })
            }
        }
    }
    // console.log(emptyCells)
    return emptyCells
}
function setMinesAroundCounts(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(i, j)
        }
    }
}
function setMinesNegsCount(cellI, cellJ) {
    var negMinesCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue
            if (gBoard[i][j].isMine) negMinesCount++
        }
    }
    // console.log('negMinesCount',negMinesCount)
    return negMinesCount
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function onCellClicked(elCell, i, j) {
    // console.log('onCellClicked called with:', elCell, i, j)
    if (gBoard[i]) {
        var currThisNum = gBoard[i][j].minesAroundCount
        console.log('minesAroundCount:', currThisNum)
        gBoard[i][j].isShown = true
        renderBoard(gBoard)
    }
}
