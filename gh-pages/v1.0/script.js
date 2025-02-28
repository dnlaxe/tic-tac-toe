class Board {  
    constructor (computerOpponent, humanSymbol = 'O', totalGames) {
        this.board = this.createBoard();
        this.currentPlayer = 'X';
        this.computerOpponent = computerOpponent;
        this.humanSymbol = humanSymbol;
        this.computerSymbol = humanSymbol === 'X' ? 'O' : 'X';
        this.totalGames = totalGames;
        this.wins = {
            'X' : 0,
            'O' : 0
        }
    }

    createBoard() {
        return [['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9']
            ];
    }

    displayBoard() {
        for (let row of this.board) {
        console.log(row.join(' | '));
        }
        console.log('\n')
    }

    makeMove(position, symbol) {
        for (let i = 0; i< this.board.length; i++) {
            for (let j = 0; j < this.board.length; j++) {
                if (this.board[i][j] === position.toString()) {
                    this.board[i][j] = symbol;
                    return true;
                }
            }
        }
        return false;
    }

    checkWinner() {
        const winningLines = [
            //rows
            [this.board[0][0], this.board[0][1], this.board[0][2]],
            [this.board[1][0], this.board[1][1], this.board[1][2]],
            [this.board[2][0], this.board[2][1], this.board[2][2]],
            //columns
            [this.board[0][0], this.board[1][0], this.board[2][0]],
            [this.board[0][1], this.board[1][1], this.board[2][1]],
            [this.board[0][2], this.board[1][2], this.board[2][2]],
            //diagonals
            [this.board[0][0], this.board[1][1], this.board[2][2]],
            [this.board[0][2], this.board[1][1], this.board[2][0]]
        ];

    for (const line of winningLines) {
        if (line.every((square) => square === "O")) return "O";
        if (line.every((square) => square === "X")) return "X";
    }

    return this.board.flat().every((square) => square === 'X' || square === 'O') ? 'draw' : null;
    }

    computerMove(game) {
        const attemptedComputerMove = game.makeMove((Math.floor(Math.random() * 9) + 1), game.currentPlayer);
        if (!attemptedComputerMove) this.computerMove(game);      
    }

    changePlayer () {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    updateScore(winner) {
        if(winner === 'X' || winner === 'O') this.wins[winner]++;
    }

    checkSeriesWinner() {
        const winsNeeded = Math.ceil(this.totalGames / 2);
        if (this.wins.X >= winsNeeded) return 'X';
        if (this.wins.O >= winsNeeded) return 'O';
        return null;
    }

    resetBoard() {
        this.board = this.createBoard();
    }
}

//GAME ENGINE
// Function to handle human player's turn

function humanTurn(game) {
    game.displayBoard(game);
    
    rl.question(`Player ${game.currentPlayer}, choose a number...\n> `, (pos) => {    
        if (game.makeMove(pos, game.currentPlayer)) {  
            console.log('\n')
            game.displayBoard(game);
            game.changePlayer(game);
            handleTurn(game);
        } else {
            console.log('\nSpace already taken. Please try again!\n')
            humanTurn(game);
            }
    })
}

// Function to handle computer's turn

function computerTurn(game) {
    console.log("Computer's turn...\n");
    game.computerMove(game);
    game.changePlayer(game);
    handleTurn(game);
}

// Function to handle turns and check for winners

function handleTurn(game) {
    const winner = game.checkWinner()
        if(winner) {
            console.log(winner === "draw" ? "\nIt's a draw!\n" : `${winner} wins!\n`);
            game.updateScore(winner);
            game.displayBoard();
            
            const seriesWinner = game.checkSeriesWinner();
            if(seriesWinner) {
                console.log(`\n********************************************\n********************************************`);
                console.log(`\n${seriesWinner} wins the series! Final score: X : ${game.wins.X}, O : ${game.wins.O}\n`);
                console.log(`********************************************\n********************************************\n\n\n`);
                rl.close();
                return;
            } else {
                
                if (winner != "draw") {
                    game.currentPlayer = winner === "X" ? "O" : "X";
                    console.log(`\n======================================`);
                    console.log(`Current Score: X : ${game.wins.X}, O : ${game.wins.O}`);
                    console.log('\nNext round begins...Loser to begin...');
                    console.log(`======================================\n`);
                } else {
                    game.changePlayer();
                    console.log(`\n======================================`);
                    console.log(`Current Score: X : ${game.wins.X}, O : ${game.wins.O}`);
                    console.log('\nNo winner...Next round begins...');
                    console.log(`======================================\n`);
                }
                game.resetBoard();
                handleTurn(game);
            }
        } else {
            
            if (game.computerOpponent) {
                game.currentPlayer === game.humanSymbol ? humanTurn(game) : computerTurn(game);
            } else {
                humanTurn(game);
            }
            
        }
}

//GAME INITIALISATION
// To get user input

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
    });

// Function to initialise game

function startGame() {
    rl.question(`Do you want to play against the computer? y/n\n> `, (opponentChoice) => {
        const opponent = opponentChoice === "y";
        
        rl.question(`\nDo you want to be X or O?\n> `, (symbolChoice) => {
            const symbol = symbolChoice;
            
            rl.question(`\nBest of how many games?\n> `, (numGames) => {
            const bestOf = numGames;

            const game = new Board(opponent, symbol, bestOf);
            const randomTurn = coinFlip();

            console.log(`\n======================================`);
            console.log(`Beginning game, best of ${game.totalGames} games.`);
            console.log(`\nFlipping coin to see who goes first...`);
            console.log(`\nPlayer ${game.currentPlayer} to begin!`);
            console.log(`======================================\n`);
            game.currentPlayer = randomTurn;

            if (opponent) {
                if (game.currentPlayer === game.humanSymbol) {
                    humanTurn(game);
                } else {
                    computerTurn(game);
                }
            } else {
                humanTurn(game);
            };
        }) 
}) })
}

function coinFlip() {
    return Math.random() < 0.5 ? 'X' : 'O';
}

startGame();