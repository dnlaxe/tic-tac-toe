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

                if (score[player1] > bestOf / 2 || score[player2] > bestOf / 2) {
                    const winner = score[player1] > score[player2] ? player1 : player2;
                    const winnerScore = Math.max(score[player1], score[player2]);
                    const loserScore = Math.min(score[player1], score[player2]);
                    ui.log(`${winner} wins the series ${winnerScore} to ${loserScore}`);
                
                    // Ask if the player wants to play again
                    ui.promptInput("Do you want to play again?", ["y", "n"], (playAgain) => {
                        if (playAgain === "y") {
                            TicTacToe.startGame(); // Restart game
                        } else {
                            ui.clear();
                            ui.log("Thank you for playing"); // Show only if 'n' is selected
                        }
                    });
                
                    return;
                }
                

                round++;
                game.reset();
                ui.delayAction(() => playGame(), 2000);
            };

            const updateUI = () => {
                ui.scoreboard(player1, player2, score[player1], score[player2], bestOf);
                ui.displayboard(game.getBoard());
            };
            
            return { playGame };
    };

    // UI
    const createUI = () => {

        const main = document.getElementById('main');

        const log = (message) => {
            const messageDiv = document.createElement("div");
            messageDiv.id = "message";
            messageDiv.innerHTML = message;
            main.appendChild(messageDiv);
        }

        const promptInput = (message, options, callback) => {
            document.getElementById("input-container")?.remove();
        
            const inputContainer = document.createElement("div");
            inputContainer.id = "input-container";
        
            const question = document.createElement("p");
            question.innerHTML = `${message} (${options.join(" / ")})`;
        
            const inputField = document.createElement("input");
        
            // Error message element
            const errorMessage = document.createElement("p");
            errorMessage.id = "error-message";
            errorMessage.style.display = "none"; // Initially hidden
        
            inputContainer.appendChild(question);
            inputContainer.appendChild(inputField);
            inputContainer.appendChild(errorMessage);
        
            document.getElementById("main").appendChild(inputContainer);
        
            inputField.focus();
        
            inputField.addEventListener("keypress", (event) => {
                if (event.key === "Enter") {
                    let input = inputField.value.trim().toLowerCase();
        
                    if (options.length === 0 || options.includes(input)) {
                        inputContainer.remove();
                        callback(input);
                    } else {
                        inputField.value = "";
        
                        // Show only one error message
                        errorMessage.textContent = "Invalid input. Try again.";
                        errorMessage.style.display = "block";
                    }
                }
            });
        };
        
        
        const getPlayerMove = (player, callback) => {

            document.getElementById("input-container")?.remove();

            const inputContainer = document.createElement("div");
            inputContainer.id = "input-container";
        
            const question = document.createElement("p");
            question.innerHTML = `Player ${player}, choose a number:`;
        
            const inputField = document.createElement("input");

            inputContainer.appendChild(question);
            inputContainer.appendChild(inputField);

            document.getElementById("main").appendChild(inputContainer);

            inputField.focus();

            inputField.addEventListener("keypress", (event) => {
                if (event.key === "Enter") {
                    const move = parseInt(inputField.value, 10);
                    inputContainer.remove();
                    callback(move);
                }
            });
        };
        
        const displayboard = (board) => {
            log(`${addSpace(8)}${board[0] || 1} | ${board[1] || 2} | ${board[2] || 3}<br>${addSpace(7)}---•---•---<br>${addSpace(8)}${board[3] || 4} | ${board[4] || 5} | ${board[5] || 6}<br>${addSpace(7)}---•---•---<br>${addSpace(8)}${board[6] || 7} | ${board[7] || 8} | ${board[8] || 9}<br>`
            );
        }

        const scoreboard = (player1, player2, player1score, player2score, bestOf) => {
            log(`${player1}:${player1score}<span></span>BEST OF ${bestOf}<span></span>${player2}:${player2score}`)
        }

        const delayAction = (callback, delay = 1000) => {
            setTimeout(callback, delay);
        };
        
        const addSpace = (number) => {
            return " ".repeat(number)
        }

        const clear = () => {
            main.innerHTML = '';
        }

        return { log, promptInput, displayboard, clear, scoreboard, getPlayerMove, delayAction };

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

        ui.promptInput("Do you want to play with the computer?<br>", ["y", "n"], (playWithComputer) => {
            const isComputer = playWithComputer === "y";
    
            ui.promptInput("Best of how many games?<br>", ["1", "3", "5", "7", "9"], (bestOf) => {
    
                ui.promptInput("Do you want to be X or O?<br>", ["x", "o"], (player1) => {
                    player1 = player1.toUpperCase();
                    const player2 = player1 === "X" ? "O" : "X";
                    const ai = isComputer ? createAI() : null;
                    const startingPlayer = Math.random() < 0.5 ? player1 : player2;
                    const game = createGame(player1, player2, startingPlayer);
                    const flow = createGameFlow(game, ui, ai, isComputer, bestOf, player1, player2);
    
                    flow.playGame();
                });
            });
        });
    };
    

    return { startGame };

})();

TicTacToe.startGame();