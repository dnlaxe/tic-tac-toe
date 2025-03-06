
// MODEL
class TicTacToe {
    constructor(symbol, withComputer, bestOf) {
        this.board = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.playerOneSymbol = symbol; 
        this.playerTwoSymbol = this.playerOneSymbol === 'X' ? 'O' : 'X';
        this.currentPlayer = this.flipCoin();
        this.score = { 
            X: 0, O: 0 
            };
        this.totalGames = bestOf;
        this.round = 0;
        this.emptySpaces = 9;
        this.playWithComputer = withComputer;
    }

    changePlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    makeMove(position) {
        if (this.board[position - 1] === position) {
            this.board[position - 1] = this.currentPlayer;
            this.emptySpaces--;
            return true;
        }
        return false;
    }

    checkGameWinner() {
        const winningLines = [
            // Rows
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            // Columns 
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            // Diagonals 
            [0, 4, 8], [6, 4, 2]             
        ];

        for (const line of winningLines) {
            if (line.every((i) => this.board[i] === 'O')) return 'O';
            if (line.every((i) => this.board[i] === 'X')) return 'X';
        }

        return this.emptySpaces === 0 ? 'DRAW' : null;
    }

    checkSeriesWinner() {
        const winsNeeded = Math.ceil(this.totalGames / 2);
        if (this.score.X >= winsNeeded) return 'X';
        if (this.score.O >= winsNeeded) return 'O';
        return null;
    }

    updateScore(winner) {
        if (winner !== 'DRAW') this.score[winner]++;
        this.round++;
    }

    flipCoin() {
        return Math.random() < 0.5 ? 'X' : 'O';
    }

    resetBoard() {
        this.board = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.emptySpaces = 9;
    }
}



// FLOW

function startGame() {
    document.addEventListener("DOMContentLoaded", function () {
    removeAllDivs();
    headerStart();
    askQuestion("Do you want to play with the computer? (y/n)", function askWithComputer(withComputer) {
        withComputer = withComputer.trim().toLowerCase();
        
        if (withComputer !== 'y' && withComputer !== 'n') {
            invalidInput("Invalid input!");
            return askQuestion("Do you want to play with the computer? (y/n)", askWithComputer);
        }
    
        const playWithComputer = withComputer === 'y';
    
        askQuestion("Do you want to be X or O?", function askSymbol(symbol) {
            symbol = symbol.trim().toUpperCase();
            
            if (symbol !== 'X' && symbol !== 'O') {
                invalidInput("Invalid symbol!");
                return askQuestion("Do you want to be X or O?", askSymbol);
            }
    
            const playerOneSymbol = symbol;
    
            askQuestion("Best of how many games? Enter odd number", function askNumGames(numGames) {
                numGames = numGames.trim();
                const bestOf = parseInt(numGames);
    
                if (isNaN(bestOf) || bestOf <= 0 || bestOf % 2 === 0) {
                    invalidInput("Invalid number!");
                    return askQuestion("Best of how many games? Enter odd number", askNumGames);
                }
            
                const game = new TicTacToe(playerOneSymbol, playWithComputer, bestOf);
                showMessage(`Flipping coin..`);

                setTimeout(() => {
                
                showMessage(`${game.currentPlayer} starts first!`);
                
                setTimeout(() => {
                    removeAllDivs();
                    header(game);
                    displayBoard(game.board);
                    game.changePlayer();
                    handleTurn(game);
                }, 800);
            }, 800);
            });
        });
    });
})
}

function handleTurn(game) {
    const winner = game.checkGameWinner();

    if (winner) {
        game.updateScore(winner);
        announceWinner(winner, game);
        
        const seriesWinner = game.checkSeriesWinner();
        if (seriesWinner) {
                announceSeriesWinner(seriesWinner, game);

                askQuestion("Do you want to play again? y/n", (oneMoreTime) => {
                const onceMore  = oneMoreTime.toLowerCase() === 'y';
                if(onceMore) {
                    startGame();
                } else {
                    removeAllDivs();
                    headerStart(game);
                    showMessage('Thank you for playing.')
                }
            });
            return;
        }

        game.resetBoard();
        game.currentPlayer = game.flipCoin();
        

        setTimeout(() => {
            removeAllDivs();
            header(game);
            displayBoard(game.board);
            showMessage(`Next round to begin..\n`);
            showMessage(`Flipping coin.. ${game.currentPlayer} goes first.\n`);
            handleTurn(game)}, 2000);
        return;
    }

    game.changePlayer();
    setTimeout(() => {
        game.currentPlayer === game.playerOneSymbol ? playerOne(game) : playerTwo(game);
    }, 500);
}

function playerOne(game) {
    askQuestion(`Player ${game.currentPlayer}, choose a number..\n`, (pos) => {
        const position = parseInt(pos);
        if (isNaN(position) || position < 1 || position > 9) {
            invalidInput("Invalid input! Choose a number between 1 and 9.");
            return playerOne(game);
        }
        if (!game.makeMove(position)) {
            invalidInput("Spot already taken! Try again.");
            return playerOne(game);
        }
        removeAllDivs();
        header(game);
        displayBoard(game.board);
        handleTurn(game);
    });
}

function playerTwo(game) {
    if (game.playWithComputer) {
        showMessage("Computer's turn..");
        setTimeout(() => {
            computerMove(game);
            removeAllDivs();
            header(game);
            displayBoard(game.board);
            handleTurn(game)
        }, 1000); 
    } else {
        playerOne(game);
    }
}

// COMPUTER LOGIC
function computerMove(game) {
    let move;
    do {
        move = Math.floor(Math.random() * 9) + 1;
    } while (!game.makeMove(move));
}

//NEW UI

const consoleDiv = document.getElementById('console');

function askQuestion(questionText, callback) {

    
    if (!consoleDiv) {
        console.error("Element with id 'console' not found.");
        return;
    }


    const questionDiv = document.createElement("div");
    questionDiv.innerHTML = questionText;
    consoleDiv.appendChild(questionDiv);

    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.id = "user-input";
    consoleDiv.appendChild(inputField);

    inputField.focus();

    inputField.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            callback(inputField.value.trim());
        }
    });
}

function showMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.innerHTML = message;
    consoleDiv.appendChild(messageDiv);
}


function removeDiv(element) {
    if (consoleDiv.contains(element)) {
        consoleDiv.removeChild(element);
    }
}

function removeAllDivs() {
    consoleDiv.innerHTML = "";
}

function announceWinner(winner, game) {
    if (winner === "DRAW") {
        showMessage(`---------------------------------------------------<br>Round ${game.round}: It's a tie!<br>---------------------------------------------------`);
    } else {
        showMessage(`---------------------------------------------------<br>Round ${game.round}: Winner: ${winner}<br>---------------------------------------------------`);
    }
}

function announceSeriesWinner(seriesWinner, game) {
    showMessage('***************************************************<br>'
        +`          ${seriesWinner} WINS THE SERIES ${game.score.X > game.score.O ? game.score.X : game.score.O} TO ${game.score.X > game.score.O ? game.score.O : game.score.X}<br>`
        +'***************************************************');
}

function invalidInput(message) {
    this.showMessage(`${message}`);
}
    
function displayBoard(board) {
        showMessage(`${board[0]} | ${board[1]} | ${board[2]}<br>---•---•---<br>${board[3]} | ${board[4]} | ${board[5]}<br>---•---•---<br>${board[6]} | ${board[7]} | ${board[8]}`);
    }


function header(game) {
        showMessage('***************************************************<br>'
            +'T  I  C  -  T  A  C  -  T  O  E\n\n'
            +'***************************************************<br>'
            +`X PTS : ${game.score.X}` + "<span>..........</span>" + `BEST OF ${game.totalGames}` + "<span>..........</span>" + `O PTS : ${game.score.O}<br> `);
}

function headerStart() {
        showMessage('***************************************************<br>'
                 +'T  I  C  -  T  A  C  -  T  O  E\n\n'
                 +'***************************************************\n');
}


startGame();
