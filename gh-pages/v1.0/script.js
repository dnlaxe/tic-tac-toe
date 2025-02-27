const readline = require('readline');

class Board {
    
    constructor () {
        this.board = this.createBoard();
        this.currentPlayer = 'X';
        this.rl = readline.createInterface({
                  input: process.stdin,
                  output: process.stdout
                  });
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

    return this.board.flat().every((square) => square === 'X' || square === 'O') ? 'Draw' : null;
    }

    play() {

        this.displayBoard();
    
        this.rl.question(`Player ${this.currentPlayer}, choose a number...\n`, (pos) => {    
            if (this.makeMove(pos, this.currentPlayer)) {
                this.displayBoard();
                    const winner = this.checkWinner()
                    if(winner){
                        console.log(`Player ${winner} wins!`);
                        this.rl.close();
                        return;
                    }
                this.changePlayer();
                this.play();
            } else {
                console.log('\n')
                console.log('Space already taken. Please try again!')
                console.log('\n')
                this.play();
            }
        })
        }
    
        changePlayer () {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
}

const game = new Board();
game.play();