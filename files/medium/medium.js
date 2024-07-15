const xcolor = "#17bebb";
const ocolor = "#E4572E";

const board = document.getElementById("board");
const msg = document.getElementById("message");
const again = document.getElementById("again");
again.addEventListener("click", function () { resetGame() });

const xwins = document.getElementById("xwins");
const owins = document.getElementById("owins");

const playerLogoX = document.getElementById("playerLogoX");
const playerLogoO = document.getElementById("playerLogoO");

const announcement = document.getElementById("announcement");

const huPlayer = 'X';
const aiPlayer = 'O';

var whoStarts = true;  // false == o || true == x

var numXwins = 0;
var numOwins = 0;

var squareArray = [];

const choosing = new Audio("../.sounds/choosing.wav");
const winning = new Audio("../.sounds/winner.wav");
const draw = new Audio("../.sounds/draw.wav");


function resetGame() {
    update();

    msg.style.display = "flex";
    board.innerHTML = "";
    again.style.display = "none";

    squareArray = [];

    for (let i = 0; i < 9; i++) {
        const div = document.createElement("div");
        div.classList.add("square", "notClicked");

        const square = new ClassSquare(div, i);

        div.onclick = function () {
            square.clicked();
        };

        div.appendChild(document.createElement("p"))
        board.appendChild(div);
        squareArray.push(square);
    }

    if (!whoStarts) {
        if (aiPlayer === 'X')
            msg.innerHTML = "Player&nbsp<span class='cross'>X</span>&nbspstarts the game";
        else
            msg.innerHTML = "Player&nbsp<span class='circle'>O</span>&nbspstarts the game";

        compMove();
        whoStarts = true;
    }
    else {
        msg.innerHTML = "Player ";

        if (huPlayer === 'X')
            msg.innerHTML = "Player&nbsp<span class='cross'>X</span>&nbspstarts the game";
        else
            msg.innerHTML = "Plyaer&nbsp<span class='circle'>O</span>&nbspstarts the game";

        whoStarts = false;
    }
}

function update() {
    playerLogoX.style.border = "#4f494a solid 5px";
    playerLogoO.style.border = "#4f494a solid 5px";

    if (numXwins > numOwins) {
        announcement.innerHTML = "Player&nbsp<span class='cross'>X</span>&nbspis in the lead";
        playerLogoX.style.border = "#0c6b6a solid 5px";

    }
    else if (numOwins > numXwins) {
        announcement.innerHTML = "Player&nbsp<span class='circle'>O</span>&nbspis in the lead";
        playerLogoO.style.border = "#a42701 solid 5px";
    }
    if (numXwins === numOwins) {
        if (numXwins + numOwins === 0) announcement.innerHTML = "There is no leader yet";
        else announcement.innerHTML = "It is a draw";
    }

    xwins.innerHTML = numXwins;
    owins.innerHTML = numOwins;
}


function wonGame(board, player, noUI = false) {

    var lines = [
        [0, 1, 2], // horizontal
        [3, 4, 5],
        [6, 7, 8],

        [0, 3, 6], // vertical
        [1, 4, 7],
        [2, 5, 8],

        [0, 4, 8], // diagonal
        [2, 4, 6]
    ];

    for (let i = 0; i < 2 * 3 + 2; i++) {
        const [a, b, c] = lines[i];

        if (board[a].state === player && board[b].state === player && board[c].state === player) {
            if (noUI) {
                if (i <= 2) //horizontal
                    board[b].element.innerHTML += "<div class='line'></div>";
                if (i <= 5 && i > 2) //vertical
                    board[b].element.innerHTML += "<div class='line vertical'></div>";
                if (i == 6) //diagonal1
                    board[b].element.innerHTML += "<div class='line diagonal1'></div>";
                if (i == 7) //diagonal2
                    board[b].element.innerHTML += "<div class='line diagonal2'></div>";
            }
            return true;
        }
    }
    return false;
}

function isDraw(board) {
    var result = true;
    board.forEach(({ state }) => { if (state == '') result = false });
    return result;
}

function gameOver() {

    if (wonGame(squareArray, 'X', true)) {
        numXwins++;
        winning.play();
    }

    else if (wonGame(squareArray, 'O', true)) {
        numOwins++;
        winning.play();
    }

    else {
        draw.play();
    }


    again.style.display = "flex";

    update();

    const collection = document.getElementsByClassName('square');

    // remove hover
    for (let i = 0; i < 9; i++) {
        collection[i].classList.remove("notClicked");
        collection[i].onclick = function () { return false; };
    }

}

class ClassSquare {
    constructor(element, index) {
        this.element = element;
        this.index = index;
        this.state = '';
    }

    clicked() {
        turn(this.index, huPlayer);
        if (wonGame(squareArray, huPlayer) || isDraw(squareArray)) return gameOver();
        msg.style.display = 'none';
        compMove();
    }
}

function turn(squareId, player) {
    var square = squareArray[squareId];

    square.state = player;
    square.element.classList.remove("notClicked");
    square.element.onclick = function () { return false; };
    square.element.querySelector("p").innerHTML = player;

    if (player === 'X') square.element.querySelector("p").style.color = xcolor;
    else if (player === 'O') square.element.querySelector("p").style.color = ocolor;

    if (player === huPlayer) choosing.play();
}


function compMove() {
    var move;

    if (emptySquares(squareArray).length == 9) move = Math.floor(Math.random() * 9); // first random move

    else {
        var minimaxOrRandom = Math.floor(Math.random() * 2); // 50% chances on minimax algorithm

        if (minimaxOrRandom === 0) {
            console.log("minimax");
            move = minimax(squareArray, true).index.index;
        }
        else {
            console.log("random");
            do {
                move = Math.floor(Math.random() * 9);
            } while (squareArray[move].state != '');
        }
    }

    turn(move, aiPlayer);

    if (wonGame(squareArray, aiPlayer, true) || isDraw(squareArray)) return gameOver();
}


function isNumber(value) {
    return (value.state === '') ? true : false;
}

function emptySquares(nb) {
    return nb.filter(isNumber);
}


function minimax(nb, isMaximazing) {
    let aspots = emptySquares(nb);

    let player = isMaximazing ? 'O' : 'X';

    if (wonGame(nb, huPlayer, false)) return { score: -10 };
    else if (wonGame(nb, aiPlayer, false)) return { score: 10 };
    else if (aspots.length === 0) return { score: 0 };

    let mvs = [];

    for (let i = 0; i < aspots.length; i++) {
        let mv = {};

        mv.index = nb[aspots[i].index];
        mv.state = nb[aspots[i].index].state;

        nb[aspots[i].index].state = player;

        if (isMaximazing) {
            let result = minimax(nb, false);
            mv.score = result.score;
        }
        else {
            let result = minimax(nb, true);
            mv.score = result.score;
        }

        nb[aspots[i].index].state = mv.state;

        mvs.push(mv);
    }

    let best;
    if (isMaximazing) {
        var bs = -10000;
        for (let i = 0; i < mvs.length; i++) {
            if (mvs[i].score > bs) {
                bs = mvs[i].score;
                best = i;
            }
        }
    }

    else {
        var bs = 10000;
        for (let i = 0; i < mvs.length; i++) {
            if (mvs[i].score < bs) {
                bs = mvs[i].score;
                best = i;
            }
        }
    }
    return mvs[best];
}