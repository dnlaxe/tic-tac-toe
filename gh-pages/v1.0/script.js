const TicTacToe = (() => {
    // LOGIC
    const createGame = (player1, player2, startingPlayer) => {

        let board = [null, null, null, null, null, null, null, null, null];
        let currentPlayer = startingPlayer;
        
        const makeMove = (index) => {
            if (board[index - 1] === null) {
                board[index - 1] = currentPlayer;
                currentPlayer = currentPlayer === player1 ? player2 : player1;
                return true
            }
            return false;
        };

        const checkWinner = () => {
            const winningLines = [
                [0,1,2], [3,4,5], [6,7,8],
                [0,3,6], [1,4,7], [2,5,8],
                [0,4,8], [2,4,6]
            ];

            for (line of winningLines) {
                const [a,b,c] = line;
                if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
            }

            return board.includes(null) ? null : 'DRAW';
        };

        const getBoard = () => {
            return board;
        };

        const getCurrentPlayer = () => {
            return currentPlayer;
        };

        const reset = () => {
            board = [null, null, null, null, null, null, null, null, null];
        };

        return { makeMove, checkWinner, getBoard, getCurrentPlayer, reset};
    };

    // GAME FLOW
    const createGameFlow = (game, ui, ai, playWithComputer, bestOf, player1, player2) => {
        let score = { [player1]: 0,
                      [player2]: 0
                    };
        let round = 1;

            const playGame = () => {
                ui.clear();
                updateUI();

                if (round === 1) {
                    ui.log(`Coin flip: ${game.getCurrentPlayer()} to begin`);
                } else {
                    ui.log(`${game.getCurrentPlayer()} to start next game`);
                }
                
                const handleMove = (index) => {

                    if (!game.makeMove(index)) return ui.log("Space already taken. Try again"), requestMove();
                    ui.clear();
                    updateUI();
                    const winner = game.checkWinner();
                    if (winner) return endGame(winner);
                    requestMove();
                }

                const requestMove = () => {
                    if (playWithComputer && game.getCurrentPlayer() === player2) {
                        ui.log("Computer is thinking..")
                        ui.delayAction(() => handleMove(ai.computerMove(game)), 2000);
                } else {
                    const atttemptedMove = ui.getPlayerMove(game.getCurrentPlayer(), handleMove);
                }
                };
                ui.delayAction(() => requestMove(), 1000);
            };

            const endGame = (winner) => {
                
                if (winner === "DRAW") {
                    ui.clear();
                    updateUI();
                    ui.log("It's a draw");
                    
                } else {
                    score[winner]++;
                    ui.clear();
                    updateUI();
                    ui.log(`${winner} wins round ${round}`);                
                }

                if (score[player1] > bestOf / 2 || score[player2] > bestOf / 2 ) {
                    const winner = score[player1] > score[player2] ? player1 : player2;
                    const winnerScore = Math.max(score[player1], score[player2]);
                    const loserScore = Math.min(score[player1], score[player2]);
                    ui.log(`${winner} wins the series ${winnerScore} to ${loserScore}`);
                    if (ui.promptInput("Do you want to play again?", ['y', 'n']) === 'y') {
                        TicTacToe.startGame();
                    } else {
                        ui.log("Thank you for playing");
                    }
                    return;
                }

                round++;
                game.reset();
                ui.delayAction(() => playGame(), 2000);
            };

            const updateUI = () => {
                ui.header();
                ui.scoreboard(player1, player2, score[player1], score[player2], bestOf);
                ui.displayboard(game.getBoard());
            };
            
            return { playGame };
    };

    // UI
    const createUI = () => {

        const log = (message) => {
            console.log(message);
        }

        const promptInput = (message, options) => {
            let input;
            do { 
                input = prompt(`${message} (${options.join(" / ")})`).toLowerCase();
                if (!options.includes(input)) {
                    console.log("Invalid input. Try again.");
                };
            } 
            while (!options.includes(input));
            return input;
        }

        const getPlayerMove = (player, callback) => {
            let move = parseInt(promptInput(`Player ${player}, choose a number`, ["1","2","3","4","5","6","7","8","9"]));
            callback(move);
        };
        
        const displayboard = (board) => {
            console.log(`${addSpace(8)}${board[0] || 1} | ${board[1] || 2} | ${board[2] || 3}\n${addSpace(7)}---•---•---\n${addSpace(8)}${board[3] || 4} | ${board[4] || 5} | ${board[5] || 6}\n${addSpace(7)}---•---•---\n${addSpace(8)}${board[6] || 7} | ${board[7] || 8} | ${board[8] || 9}\n`
            );
        }

        const header = () => {
            console.log(`*************************\n${addSpace(2)}T I C - T A C - T O E\n*************************`);
        }

        const scoreboard = (player1, player2, player1score, player2score, bestOf) => {
            console.log(` ${player1}:${player1score}    BEST OF ${bestOf}    ${player2}:${player2score}`)
        }

        const delayAction = (callback, delay = 1000) => {
            setTimeout(callback, delay);
        };
        
        const addSpace = (number) => {
            return " ".repeat(number)
        }

        const clear = () => {
            console.clear();
        }

        return { log, promptInput, displayboard, clear, header, scoreboard, getPlayerMove, delayAction };

        };

    // COMPUTER
    const createAI = () => {
        const computerMove = (game) => {
            return Math.floor(Math.random() * 9) + 1;
        }

        return { computerMove };
    };

    // SET-UP

    const startGame = () => {
        const ui = createUI();
        const playWithComputer = ui.promptInput(`Do you want to play with the computer?`, ['y', 'n']) === 'y';
        const bestOf = ui.promptInput('Best of how mang games?', ['1','3','5','7','9']);
        const player1 = ui.promptInput("Do you want to be X or O?", ['x', 'o']).toUpperCase();
        const player2 = player1 === 'X' ? 'O' : 'X';
        const ai = playWithComputer ? createAI() : null;
        const startingPlayer = Math.random() < 0.5 ? player1 : player2;
        const game = createGame(player1, player2, startingPlayer);
        const flow = createGameFlow(game, ui, ai, playWithComputer, bestOf, player1, player2);
        flow.playGame();
    };

    return { startGame };

})();

TicTacToe.startGame();