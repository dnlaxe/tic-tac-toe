const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
    UI.clear();
    UI.headerStart();
    UI.askQuestion(" Do you want to play with the computer? (y/n)", function askWithComputer(withComputer) {
        withComputer = withComputer.trim().toLowerCase();
        
        if (withComputer !== 'y' && withComputer !== 'n') {
            UI.invalidInput("\n               Invalid input!");
            return UI.askQuestion("\n Do you want to play with the computer? (y/n)", askWithComputer);
        }
    
        const playWithComputer = withComputer === 'y';
    
        UI.askQuestion("\n          Do you want to be X or O?", function askSymbol(symbol) {
            symbol = symbol.trim().toUpperCase();
            
            if (symbol !== 'X' && symbol !== 'O') {
                UI.invalidInput("\n               Invalid symbol!");
                return UI.askQuestion("\n          Do you want to be X or O?", askSymbol);
            }
    
            const playerOneSymbol = symbol;
    
            UI.askQuestion("\n   Best of how many games? Enter odd number", function askNumGames(numGames) {
                numGames = numGames.trim();
                const bestOf = parseInt(numGames);
    
                if (isNaN(bestOf) || bestOf <= 0 || bestOf % 2 === 0) {
                    UI.invalidInput("\n              Invalid number!");
                    return UI.askQuestion("\n    Best of how many games? Enter odd number", askNumGames);
                }
            
                const game = new TicTacToe(playerOneSymbol, playWithComputer, bestOf);
                
                setTimeout(() => {
                UI.showMessage(`\n              Flipping coin...`);
                UI.showMessage(`\n              ${game.currentPlayer} starts first!`);
                
                setTimeout(() => {
                    UI.clear();
                    UI.header(game);
                    UI.displayBoard(game.board);
                    game.changePlayer();
                    handleTurn(game);
                }, 500);
            }, 500);
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
                UI.clear();
                UI.header(game);
                UI.displayBoard(game.board);
                UI.announceSeriesWinner(seriesWinner, game);

                UI.askQuestion("       Do you want to play again? y/n", (oneMoreTime) => {
                const onceMore  = oneMoreTime.toLowerCase() === 'y';
                if(onceMore) {
                    startGame();
                } else {
                    rl.close();
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
            UI.showMessage(`            Next round to begin...\n`);
            UI.showMessage(`        Flipping coin... ${game.currentPlayer} goes first.\n`);
            handleTurn(game)}, 2000);
        return;
    }

    game.changePlayer();
    setTimeout(() => {
        game.currentPlayer === game.playerOneSymbol ? playerOne(game) : playerTwo(game);
    }, 500);
}

function playerOne(game) {
    UI.askQuestion(`         Player ${game.currentPlayer}, choose a number...\n`, (pos) => {
        const position = parseInt(pos);
        if (isNaN(position) || position < 1 || position > 9) {
            UI.invalidInput("Invalid input! Choose a number between 1 and 9.");
            return playerOne(game);
        }
        if (!game.makeMove(position)) {
            UI.invalidInput("\n       Spot already taken! Try again.");
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
        UI.showMessage("              Computer's turn...");
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

// UI
const UI = {
    showMessage(message) {
        console.log(message);
    },

    displayBoard(board) {
        console.log(`                  ${board[0]} | ${board[1]} | ${board[2]}
                 ---•---•---
                  ${board[3]} | ${board[4]} | ${board[5]}
                 ---•---•---
                  ${board[6]} | ${board[7]} | ${board[8]}
        `);
    },

    askQuestion(question, callback) {
        rl.question(question + "\n                      ", callback);
    },

    announceWinner(winner, game) {
        if (winner === "DRAW") {
            this.showMessage(`---------------------------------------------\n             Round ${game.round}: It's a tie!\n---------------------------------------------`);
        } else {
            this.showMessage(`---------------------------------------------\n             Round ${game.round}: Winner: ${winner}\n---------------------------------------------`);
        }
    },

    announceSeriesWinner(seriesWinner, game) {
        this.showMessage('*********************************************\n\n'
            +`          ${seriesWinner} wins the series ${game.score.X > game.score.O ? game.score.X : game.score.O} to ${game.score.X > game.score.O ? game.score.O : game.score.X}\n\n`
            +'*********************************************\n');
    },

    invalidInput(message) {
        this.showMessage(`${message}`);
    },

    header(game) {
        console.log('\n*********************************************\n\n'
                 +'       T  I  C  -  T  A  C  -  T  O  E\n\n'
                 +'*********************************************\n\n'
                +` X PTS : ${game.score.X}        BEST OF ${game.totalGames}        O PTS : ${game.score.O}\n`);
    },

    headerStart() {
        console.log('\n*********************************************\n\n'
                 +'       T  I  C  -  T  A  C  -  T  O  E\n\n'
                 +'*********************************************\n');
    },

    clear() {
        console.clear();
    }
};

startGame();
