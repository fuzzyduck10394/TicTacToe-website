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

var whoStarts = false; // false = x  || true = o

var numXwins = 0;
var numOwins = 0;

var nextMove;

var squareArray = [];

const choosing = new Audio("../.sounds/choosing.wav");
const winning = new Audio("../.sounds/winner.wav");
const draw = new Audio("../.sounds/draw.wav");


function resetGame() {
    board.innerHTML = "";
    again.style.display = "none";


    if (whoStarts) nextMove = 'O';
    else nextMove = 'X';

    update();

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

    if (nextMove === 'X') msg.innerHTML = "It is player's&nbsp<span class='cross'>X</span>&nbspturn.";
    else msg.innerHTML = "It is player's&nbsp<span class='circle'>O</span>&nbspturn.";
}


function wonGame() {
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

        if (squareArray[a].state != "" && squareArray[a].state == squareArray[b].state && squareArray[a].state == squareArray[c].state) {
            if (i <= 2) //horizontal
                squareArray[b].element.innerHTML += "<div class='line'></div>";
            else if (i <= 5 && i > 2) //vartical
                squareArray[b].element.innerHTML += "<div class='line vertical'></div>";
            else if (i == 6) //diagonal
                squareArray[b].element.innerHTML += "<div class='line diagonal1'></div>";
            else if (i == 7)
                squareArray[b].element.innerHTML += "<div class='line diagonal2'></div>";

            winning.play();
            return true;
        }
    }
    return false;
}

function isDraw() {
    var result = true;

    squareArray.forEach(({ state }) => { if (state == '') result = false });

    if (result == true) draw.play();
    return result;
}

function gameOver(result) {
    update();

    again.style.display = "flex";

    msg.innerHTML = result;

    const collection = document.getElementsByClassName('square');

    for (let i = 0; i < 9; i++) {
        collection[i].classList.remove("notClicked");
        collection[i].onclick = function () { return false; };
    }
}

class ClassSquare {
    constructor(element, index) {
        this.element = element;
        this.index = index;
        this.state = "";
    }

    clicked() {
        this.state = nextMove;

        this.element.classList.remove("notClicked");
        this.element.onclick = function () {
            return false;
        };

        this.element.querySelector("p").innerHTML = this.state;

        if (nextMove == 'X') {
            nextMove = 'O';
            this.element.querySelector("p").style.color = xcolor;
        }

        else {
            nextMove = 'X';
            this.element.querySelector("p").style.color = ocolor;
        }
        update();
        choosing.play();

        if (wonGame()) {
            if (this.state === 'X') {
                numXwins++;
                return gameOver("The winner is player&nbsp<span class ='cross'>X</span>&nbsp!");
            }

            if (this.state === 'O') {
                numOwins++;
                return gameOver("The winner is player&nbsp<span class='circle'>O</span>&nbsp!");
            }
        }
        if (isDraw()) {
            return gameOver("It is a draw.");
        }
    }
}



