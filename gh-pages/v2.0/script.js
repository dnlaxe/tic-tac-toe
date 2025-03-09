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

document.addEventListener("DOMContentLoaded", function () {
    startGame();
})

function startGame() {
    UI.clear();
    UI.headerStart();
    UI.askQuestion("Do you want to play with the computer? (y/n)", function askWithComputer(withComputer) {
        withComputer = withComputer.trim().toLowerCase();
        
        if (withComputer !== 'y' && withComputer !== 'n') {
            UI.invalidInput("Invalid input!");
            return UI.askQuestion("Do you want to play with the computer? (y/n)", askWithComputer);
        }
    
        const playWithComputer = withComputer === 'y';
    
        UI.askQuestion("Do you want to be X or O?", function askSymbol(symbol) {
            symbol = symbol.trim().toUpperCase();
            
            if (symbol !== 'X' && symbol !== 'O') {
                UI.invalidInput("Invalid symbol!");
                return UI.askQuestion("Do you want to be X or O?", askSymbol);
            }
    
            const playerOneSymbol = symbol;
    
            UI.askQuestion("Best of how many games? Enter odd number", function askNumGames(numGames) {
                numGames = numGames.trim();
                const bestOf = parseInt(numGames);
    
                if (isNaN(bestOf) || bestOf <= 0 || bestOf % 2 === 0) {
                    UI.invalidInput("Invalid number!");
                    return UI.askQuestion("Best of how many games? Enter odd number", askNumGames);
                }
            
                const game = new TicTacToe(playerOneSymbol, playWithComputer, bestOf);

                UI.showMessage(`Flipping coin..`);

                setTimeout(() => {
                
                UI.showMessage(`${game.currentPlayer} starts first!`);
                
                setTimeout(() => {
                    UI.clear();
                    UI.header(game);
                    UI.displayBoard(game.board);
                    game.changePlayer();
                    handleTurn(game);
                }, 800);
            }, 800);
            });
        });
    });
}

function handleTurn(game) {
    const winner = game.checkGameWinner();

    if (winner) {
        game.updateScore(winner);
        UI.announceWinner(winner, game);
        
        const seriesWinner = game.checkSeriesWinner();
        if (seriesWinner) {
                UI.announceSeriesWinner(seriesWinner, game);

                UI.askQuestion("Do you want to play again? y/n", (oneMoreTime) => {
                const onceMore  = oneMoreTime.toLowerCase() === 'y';
                if(onceMore) {
                    startGame();
                } else {
                    UI.clear();
                    UI.headerStart(game);
                    UI.showMessage('Thank you for playing.')
                }
            });
            return;
        }

        game.resetBoard();
        game.currentPlayer = game.flipCoin();   

        setTimeout(() => {
            UI.clear();
            UI.header(game);
            UI.displayBoard(game.board);
            UI.showMessage(`Next round to begin..`);
            UI.showMessage(`Flipping coin.. ${game.currentPlayer} goes first.`);
            handleTurn(game)}, 2000);
        return;
    }

    game.changePlayer();
    setTimeout(() => {
        game.currentPlayer === game.playerOneSymbol ? playerOne(game) : playerTwo(game);
    }, 500);
}

function playerOne(game) {
    UI.askQuestion(`Player ${game.currentPlayer}, choose a number..`, (pos) => {
        const position = parseInt(pos);
        if (isNaN(position) || position < 1 || position > 9) {
            UI.invalidInput("Invalid input! Choose a number between 1 and 9.");
            return playerOne(game);
        }
        if (!game.makeMove(position)) {
            UI.invalidInput("Spot already taken! Try again.");
            return playerOne(game);
        }
        UI.clear();
        UI.header(game);
        UI.displayBoard(game.board);
        handleTurn(game);
    });
}

function playerTwo(game) {
    if (game.playWithComputer) {
        UI.showMessage("Computer's turn..");
        setTimeout(() => {
            computerMove(game);
            UI.clear();
            UI.header(game);
            UI.displayBoard(game.board);
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

// WEB UI

class WEB_UI {
    constructor(consoleElementId) {
        this.consoleDiv = document.getElementById(consoleElementId);
    }
    
    showMessage(message) {
            const messageDiv = document.createElement("div");
            messageDiv.innerHTML = message;
            this.consoleDiv.appendChild(messageDiv);
    }

    displayBoard(board) {
        this.showMessage(
            `${board[0]} | ${board[1]} | ${board[2]}<br>` +
            `---•---•---<br>` +
            `${board[3]} | ${board[4]} | ${board[5]}<br>` +
            `---•---•---<br>` +
            `${board[6]} | ${board[7]} | ${board[8]}`
        );
    }

    askQuestion(questionText, callback) {
        document.querySelectorAll("input[type='text']").forEach(input => input.disabled = true);
        
        const questionDiv = document.createElement("div");
        questionDiv.innerHTML = questionText;
        this.consoleDiv.appendChild(questionDiv);
        
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.id = "user-input";
        this.consoleDiv.appendChild(inputField);
        inputField.focus();

        inputField.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                callback(inputField.value.trim());
            }
        });
    }

    announceWinner(winner, game) {
        const message = winner === "DRAW" 
            ? `---------------------------------------------------<br>Round ${game.round}: It's a tie!<br>---------------------------------------------------`
            : `---------------------------------------------------<br>Round ${game.round}: Winner: ${winner}<br>---------------------------------------------------`;
        this.showMessage(message);
    }

    announceSeriesWinner(seriesWinner, game) {
        this.showMessage(
            '***************************************************<br>' +
            `          ${seriesWinner} WINS THE SERIES ${Math.max(game.score.X, game.score.O)} TO ${Math.min(game.score.X, game.score.O)}<br>` +
            '***************************************************'
        );
    }

    invalidInput(message) {
        this.showMessage(message);
    }    
    
    header(game) {
        this.showMessage(
            '***************************************************<br>' +
            'T  I  C  -  T  A  C  -  T  O  E<br>' +
            '***************************************************<br>' +
            `X PTS : ${game.score.X} <span></span> BEST OF ${game.totalGames} <span></span> O PTS : ${game.score.O}<br>`
        );
    }

    headerStart() {
        this.showMessage(
            '***************************************************<br>' +
            'T  I  C  -  T  A  C  -  T  O  E<br>' +
            '***************************************************'
        );

    }
    clear() {
        this.consoleDiv.innerHTML = "";
    }
}

// DARK LIGHT MODE TOGGLE
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');

    if (document.body.classList.contains('dark-theme')) {
        themeToggle.src = "icons/light.svg";
    } else {
        themeToggle.src = "icons/dark.svg";
    }
    
    const inputFields = document.querySelectorAll("input[type='text']");
    if (inputFields) {
        inputFields[inputFields.length - 1].focus();
    }
});

document.addEventListener("click", function (event) {
    const inputFields = document.querySelectorAll("input[type='text']");
    if (inputFields) {
        inputFields[inputFields.length - 1].focus();
    }
})

const UI = new WEB_UI('console');
startGame();
