'use strict'
var gBoard = []
var gLevel = {
    size: 4,
    mines: 3
}

const BOMB = '💣'
const FLAG = '🚩'

var gTimerInterval
var gStartTime

const gGame = {
    inOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
    hints: 3,
    isFirstClick: true,
}
function init() {
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)
    gGame.lives = 3
    gGame.hints = 3
    gGame.isFirstClick = true
    updateLivesDisplay()
    console.log();
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
    var strHTML = '<table><tbody>'
    for (var i = 0; i < gLevel.size; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var tdClass = `cell cell-${i}-${j}`
            var tdCall = ''
            var tdClass = (gBoard[i][j].isShown) ? 'shown' : 'close'
            if (currCell.isShown) {
                if (currCell.isMine) {
                    tdCall = BOMB
                } else {
                    if (currCell.minesAroundCount === 0) {
                        tdClass += ' cell-no-mines'
                    }
                    tdCall = currCell.minesAroundCount || ''
                }
            } else if (currCell.isMarked) {
                tdCall = FLAG
            }

            strHTML += `<td class="cell ${tdClass}" oncontextmenu="onCellMarked(this, ${i}, ${j})" onclick="onCellClicked(this, ${i}, ${j}, event)">${tdCall}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
    checkGameOver()
    checkGameWon()
    renderHits()
}
function renderHits() {
    var elHint = document.querySelector('.hintsDiv')
    var strHTML = ''
    for (var i = 0; i < gGame.hints; i++) {
        strHTML += `<span onclick="hintClicked()">💡</span>`
    }
    elHint.innerHTML = strHTML
}
function hintClicked() {
    if (gGame.hints > 0) {
        gGame.hints--
        
        gGame.isHint = false

        
        var cellsToReveal = document.querySelectorAll('.cell')
        cellsToReveal.forEach(cell => {
            cell.classList.add('shown')
            cell.classList.remove('close')
        })
        
        setTimeout(() => {
            cellsToReveal.forEach(cell => {
                cell.classList.remove('shown')
                cell.classList.add('close')
            })
            renderBoard(gBoard)
        }, 1000)
    }
    gGame.isHint = false
}
function placeMines(board, mines, excludeI, excludeJ) {
    var emptyCells = getEmptyCells(board, excludeI, excludeJ)
    for (var i = 0; i < mines; i++) {
        var randomCellIdx = getRandomInt(0, emptyCells.length)
        const { i: cellI, j: cellJ } = emptyCells.splice(randomCellIdx, 1)[0]
        board[cellI][cellJ].isMine = true
    }
}
function getEmptyCells(board, excludeI, excludeJ) {
    var emptyCells = []
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (!board[i][j].isMine && (i !== excludeI || j !== excludeJ)) {
                emptyCells.push({ i: i, j: j })
            }
        }
    }
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
function btnClick(elBtn) {
    var size = +elBtn.dataset.size
    var mines = +elBtn.dataset.mines
    gLevel.size = size
    gLevel.mines = mines
    init()
}
function onCellClicked(elCell, i, j, event) {
    document.addEventListener('contextmenu', event => event.preventDefault());
    if (event && event.button === 0) {
        if (gGame.isFirstClick) {
            startTimer()
            placeMines(gBoard, gLevel.mines, i, j)
            setMinesAroundCounts(gBoard)
            gGame.isFirstClick = false
            gGame.isOn = true
        }

        if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
            gBoard[i][j].isShown = true
            if (gBoard[i][j].isMine) {
                lives(true)
                renderBoard(gBoard)
            } else {
                lives(false)
                gGame.shownCount++
                if (gBoard[i][j].minesAroundCount === 0) {
                    expandShown(gBoard, i, j)
                }
                renderBoard(gBoard)
            }
        }
    }
}
function onCellMarked(elCell, i, j,) {
    if (!gBoard[i][j].isShown) {
        gBoard[i][j].isMarked = !gBoard[i][j].isMarked
        if (gBoard[i][j].isMarked) {
            gGame.markedCount++
        } else {
            gGame.markedCount--
        }
        renderBoard(gBoard)
    }
}
function restart(icon) {
    init()
    document.querySelector('.icon').innerText = '😀'
    resetTimer()
    renderHits()
}
function lives(isMine) {
    if (isMine) {
        gGame.lives--
        updateLivesDisplay()
        if (gGame.lives === 0) {
            gameOver()
        }
        return gGame.lives
    }
    updateLivesDisplay()
    return gGame.lives
}
function updateLivesDisplay() {
    var elLivesText = document.querySelector('.livesText')
    elLivesText.innerHTML = `Lives: ${gGame.lives}`
    console.log('Lives remaining:', gGame.lives)
    document.querySelector('.lives').innerText = '💓'.repeat(gGame.lives)

}
function checkGameOver() {
    var revealedMines = 0
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isMine && gBoard[i][j].isShown) {
                revealedMines++
            }
        }
    }
    if (revealedMines > 0) {
        gameOver()
    }

}
function gameOver() {
    gGame.isOn = false
    if (gGame.lives === 0) {
        document.querySelector('.icon').innerHTML = '🤬'
        alert('loss!')
        resetTimer()
        const cells = document.querySelectorAll('.cell')
        cells.forEach(cell => {
            cell.onclick = null
        })
    } else if (gGame.lives === 3) {
        document.querySelector('.icon').innerHTML = '😀'
    } else {
        document.querySelector('.icon').innerHTML = '😟'
    }
}
function gameWon() {
    gGame.isOn = false
    document.querySelector('.icon').innerText = '😎'
    alert('victory!!!')
    resetTimer()
}
function checkGameWon() {
    var totalCells = gLevel.size * gLevel.size;
    var revealedNonMines = 0
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (!gBoard[i][j].isMine && gBoard[i][j].isShown) {
                revealedNonMines++
            }
        }
    }
    if (revealedNonMines === totalCells - gLevel.mines) {
        gameWon()
    }
}
function expandShown(board, i, j) {
    for (var row = i - 1; row <= i + 1; row++) {
        for (var col = j - 1; col <= j + 1; col++) {
            if (row >= 0 && row < board.length && col >= 0 && col < board[0].length) {
                if (!board[row][col].isMine && !board[row][col].isShown) {
                    board[row][col].isShown = true
                    gGame.shownCount++
                    if (board[row][col].minesAroundCount === 0) {
                        expandShown(board, row, col)
                    }
                }
            }
        }
    }
    renderBoard(board)
}
function tdClicked(thisTd, currI, currJ) {
    if (gBoard[currI][currJ].isMine) {
        var thisTd = document.querySelector('.board')
        thisTd.classList.remove('close')
        thisTd.classList.add('shown')
        gBoard[currI][currJ].isShown = true
        gGame.shownCount++
        renderBoard()

    }
}
function startTimer() {
    gStartTime = Date.now()

    gTimerInterval = setInterval(() => {
        var secsPassed = ((Date.now() - gStartTime) / 1000).toFixed(1)
        var elSpan = document.querySelector('.timer')
        elSpan.innerText = secsPassed
    }, 10)
}
function resetTimer() {
    clearInterval(gTimerInterval)
    var elSpan = document.querySelector('.timer')
    elSpan.innerText = '0.0'
}