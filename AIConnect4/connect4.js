const COLUMNS = 7,       // constant variable declarations
    ROWS = 6,
    EMPTY_SPACE = " ",
    Player_AI = "o",       // Human Player or AI depending on mode
    Player_CPU = "x",       // Opponent (CPU or AI)
    PLAYER_CPU = Player_CPU, // CPU as player 2 by default
    PLAYER_AI = Player_AI,  // // AI as player 1 when AI vs CPU mode is selected
    CONNECT = 4;  // <-- Change this and you can play connect 5, connect 3, connect 100 and so on!
new Vue({         // Vue is a JavaScript framework for building interactive user interfaces
    el: "#app",   // specifies the HTML element where the Vue instance will be mounted
    data: () => ({ // defines the data model for the Vue instance
        board: [], // holds the current state of the Connect 4 game board
        COLUMNS,
        ROWS,
        Player_AI,
        Player_CPU,
        PLAYER_CPU,
        PLAYER_AI,
        EMPTY_SPACE,
        currentPlayer: null, // Keeps track of whose turn it is in the game, starts as null but will switch
        isCpuPlaying: true,
        isAIplaying: true, 
        canPlay: false,
    }),
    async mounted() {  // mounted() is a lifecycle hook in Vue that runs after the Vue instance is fully created and inserted into the DOM
        await Swal.fire(  // shows a popup dialog to the user. It's an asynchronous action
            'Connect 4 game', //hello
            'CSC-416-102', //hello
            'info'
        );
        this.resetGame(); // resets the game state, clearing the board
        this.selectPlayer();
/*
        while(!checkGameStatus()){    // while gamew isn't over
            if(currentPlayer = PLAYER_CPU){
                makeCPUmove();
            }
            else if(currentPlayer = PLAYER_AI){
              makeAIMove(); 
            }
            this.togglePlayer();      // switch player
        }
*/            
    },
    methods: {           // defines functions (methods) that will handle events or perform actions within the app
        async resetGame() {
            await this.askUserGameMode();
            this.fillBoard();     // is called to initialize or reset the game board
            this.selectPlayer();  // determining which player will start the game
                                  // Automatically start the AI vs CPU match if it's that mode
            if (!this.canPlay) {  // Ensure the game mode is AI vs CPU
                this.makeMove();  // Trigger the first move
            }
        },
        async askUserGameMode() { //an asynchronous method, allows the program to wait for user input before continuing to the next step
            this.canPlay = false; // Before the user selects the game mode, the game is temporarily set to a state where no one can make a move
            const result = await Swal.fire({  // uses the SweetAlert2 library (Swal.fire) to show a popup dialog
                title: 'Choose game mode',  // title of the dialog box
                text: "Do you want to play against CPU, or see AI vs CPU?",
                icon: 'question',  // Displays a question mark icon
                showCancelButton: true,
                confirmButtonColor: '#fdbf9c', // Sets the color of the "confirm" button 
                cancelButtonColor: '#4A42F3',  // likewise
                //  cancelButtonText: 'Me Vs another player',
                cancelButtonText: 'AI Vs CPU',
                confirmButtonText: 'Me Vs CPU'
            });
            this.canPlay = true;  // After the user makes a choice, the game is allowed to resume

            if (result.isConfirmed) {   // If the user clicked "Me Vs CPU"
                this.isCpuPlaying = true;  // Sets the game to human vs CPU mode
                this.isAIPlaying = false;  // Ensures AI vs CPU mode is off
            } else if (result.isDismissed) { // If the user clicked "AI Vs CPU"
                this.isCpuPlaying = true;  // CPU is playing
                this.isAIPlaying = true;   // AI is also playing
                this.currentPlayer = PLAYER_AI;
                this.makeAIMove();
            }
            // this.isCpuPlaying = !!result.value; // determines if the user chose to play against the CPU
           
        },
        countUp(x, y, player, board) {  // checks for consecutive pieces belonging to a player upward from the current position
                                        // x: The column index of the starting position
                                        // y: The row index of the starting position
            let startY = (y - CONNECT >= 0) ? y - CONNECT + 1 : 0; // calculates how far upwards we need to check. 
            let counter = 0;
            for (; startY <= y; startY++) {  // Starts at startY and iterates upwards until it reaches the current row y
                if (board[startY][x] === player) { // If the piece at this position belongs to the player, increment counter
                    counter++;
                } else {
                    counter = 0;  // If the piece doesn't belong to the player, reset the counter
                }
            }
            return counter;    // Returns the count of consecutive pieces found upwards
        },
        countRight(x, y, player, board) {  // checks for consecutive pieces belonging to a player to the right from the current position 
            let endX = (x + CONNECT < COLUMNS) ? x + CONNECT - 1 : COLUMNS - 1;  //Determines how far to the right we need to check
            let counter = 0;
            for (; x <= endX; x++) {   // Starts at the current column x and moves right until it reaches endX
                if (board[y][x] === player) {  // If the piece belongs to the player, increment counter
                    counter++;
                } else {
                    counter = 0;   // Reset the counter if a different piece or an empty space is encountered.
                }
            }
            return counter;     // Returns the count of consecutive pieces found to the right
        },
        countUpRight(x, y, player, board) {    // checks for consecutive pieces diagonally up-right from the current position
            let endX = (x + CONNECT < COLUMNS) ? x + CONNECT - 1 : COLUMNS - 1; // Determines how far right we can go before going out of bounds
            let startY = (y - CONNECT >= 0) ? y - CONNECT + 1 : 0;  // Determines how far up we can go before hitting the top row
            let counter = 0;
            while (x <= endX && startY <= y) {  // Moves diagonally up-right by incrementing x and decrementing y (moving right while going up)
                if (board[y][x] === player) {
                    counter++;
                } else {
                    counter = 0;
                }
                x++;       // Move diagonally up-right by incrementing the column (x) and decrementing the row (y)
                y--;
            }
            return counter;  // Returns the count of consecutive pieces found diagonally up-right
        },
        countDownRight(x, y, player, board) {   // hecks for consecutive pieces diagonally down-right from the current position 
            let endX = (x + CONNECT < COLUMNS) ? x + CONNECT - 1 : COLUMNS - 1; // Determines how far right we can go before going out of bounds
            let endY = (y + CONNECT < ROWS) ? y + CONNECT - 1 : ROWS - 1; // Determines how far down we can go before going out of bounds
            let counter = 0;
            while (x <= endX && y <= endY) { // Moves diagonally down-right by incrementing both x and y
                if (board[y][x] === player) {
                    counter++;
                } else {
                    counter = 0;
                }
                x++;          // Move diagonally down-right by incrementing both x and y
                y++;
            }
            return counter;
        },
        isWinner(player, board) {  // checks if the current player has won by forming a sequence of CONNECT consecutive pieces in any direction
            for (let y = 0; y < ROWS; y++) {    // terates over every position x and y on the board using two nested for loops
                for (let x = 0; x < COLUMNS; x++) {
                    let count = 0;
                    count = this.countUp(x, y, player, board); //checks upward
                    if (count >= CONNECT) return true; //If count is greater than or equal to CONNECT, the player wins, and returns true
                    count = this.countRight(x, y, player, board); // checks horizontally to the right
                    if (count >= CONNECT) return true;
                    count = this.countUpRight(x, y, player, board);  // checks a diagonal going up-right
                    if (count >= CONNECT) return true; 
                    count = this.countDownRight(x, y, player, board);  // checks a diagonal going down-right
                    if (count >= CONNECT) return true;
                }
            }
            return false;  // If no win is found after checking all positions, the method returns false
        },
        isTie(board) {      // checks if the game is a tie 
            for (let y = 0; y < ROWS; y++) {  // loops over every position (x, y) on the board using two nested loops for rows and columns
                for (let x = 0; x < COLUMNS; x++) {
                    const currentCell = board[y][x];    // For each position (x, y)
                    if (currentCell === EMPTY_SPACE) {  // checks if the current cell (board[y][x]) is an empty space
                        return false; // If an empty space is found, the method immediately returns false, there is still room to make moves
                    }
                }
            }
            return true; // no empty space, returns true, indicating the game is a tie
        },
        getRandomNumberBetween(min, max) {   // generates a random integer between min and max (inclusive)
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        selectPlayer() {     // randomly selects which player will start the game, either Player_AI or Player_CPU
            if (this.isCpuPlaying) {   // If CPU is playing, we're in either Human vs CPU or AI vs CPU mode
                if (this.getRandomNumberBetween(0, 1) === 0) {
                    this.currentPlayer = Player_AI;   // This could be AI or Human depending on the game mode
                } else {
                    this.currentPlayer = Player_CPU;  // CPU always starts as Player_CPU
                }
            }
        },
        togglePlayer() {
            if (this.currentPlayer === PLAYER_CPU) {
                this.currentPlayer = PLAYER_AI;      // Switch to AI's turn if CPU just played
            } else if (this.currentPlayer === PLAYER_AI) {
                this.currentPlayer = PLAYER_CPU;     // Switch to CPU's turn if AI just played
            }
        },
        getAdversary(player) {  // determines the adversary (opponent) of the given player
            if (player === Player_AI) {
                return Player_CPU;
            } else {
                return Player_AI;
            }
        },
        fillBoard() {    // initializes the game board as a 2D array, filling it with empty spaces
            this.board = [];   // sets this.board to an empty array.
            for (let i = 0; i < ROWS; i++) {
                this.board.push([]);   // Pushes an empty array representing a new row.
                for (let j = 0; j < COLUMNS; j++) {
                    this.board[i].push(EMPTY_SPACE);  // Fills each cell in the row with EMPTY_SPACE
                }
            }
        },
        cellImage(cell) {      // returns the correct image URL based on the value of the cell
            if (cell === this.Player_AI) {
                return "img/player1.png";     // return "img/player1.png" (the image for Player 1's piece).
            } else if (cell === this.Player_CPU) {
                return "img/player2.png";     // vice versa
            } else {
                return "img/empty.png"      // the image for an empty cell
            }
        },
        async makeMove(columnNumber) {         
            const columnIndex = columnNumber - 1;  // gets the column index
            const firstEmptyRow = this.getFirstEmptyRow(columnIndex, this.board); // finds the first empty row in the column
        
            if (firstEmptyRow === -1) {
                Swal.fire('Cannot put here, it is full'); // prevent move if column is full
                return;
            }
            Vue.set(this.board[firstEmptyRow], columnIndex, this.currentPlayer);  // Places current player's piece in the board
            const status = await this.checkGameStatus();   // Check if the game has ended (win or tie)   
            if (!status) {
                this.togglePlayer();  // Toggle to the next player (CPU or AI)
                if (this.currentPlayer === PLAYER_CPU) {  // Depending on the new current player, make the next move
                    this.makeCpuMove();  // CPU makes a move if it's CPU's turn
                } else if (this.currentPlayer === PLAYER_AI) {
                    this.makeAIMove();   // AI makes a move if it's AI's turn
                }
            } else {
                this.askUserForAnotherMatch();     // If game has ended (status is true), ask for another match
            }
        },

        async checkGameStatus() {   // Returns true if there's a winner or a tie. False otherwise
            if (this.isWinner(this.currentPlayer, this.board)) {
                await this.showWinner();
                return true;
            } else if (this.isTie(this.board)) {
                await this.showTie();
                return true;
            }
            return false;
        },
        async askUserForAnotherMatch() {   // self explanatory
            this.canPlay = false;
            const result = await Swal.fire({
                title: 'Play again?',
                text: "Do you want to play again?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#fdbf9c',
                cancelButtonColor: '#4A42F3',
                cancelButtonText: 'No',
                confirmButtonText: 'Yes'
            });
            if (result.value) {
                this.resetGame();
            }
        },

        async makeAIMove() {    
            if (!this.currentPlayer == PLAYER_AI) {
                return;  // Exit if it's not AI's turn
            }
        
            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await delay(1000); // Pause for 1 second (adjust as needed)
        
            console.log("AI's turn, analyzing the board.");
        
            // AI logic to evaluate the best move
            function uniformCostSearch(board, player) {
                const validMoves = getValidMoves(board);
                if (validMoves.length === 0) {
                    return -1;  // No valid moves, board is full
                }
        
                let bestMove = null;
                let lowestCost = Infinity;
        
                validMoves.forEach(col => {
                    const row = getFirstEmptyRow(col, board);
                    const boardCopy = board.map(row => row.slice());  // Copy the board efficiently
                    dropPiece(boardCopy, row, col, player);
        
                    // Check if this move allows CPU to win next turn
                    if (!leavesOpponentWinningMove(boardCopy, col, player)) {
                        const cost = calculateCost(boardCopy, player);
                        
                        if (cost < lowestCost) {
                            lowestCost = cost;
                            bestMove = col;
                        }
                    }
                });
        
                // If all moves are dangerous, pick any random valid move (fallback)
                if (bestMove === null) {
                    console.log("AI found no safe moves, picking a random one.");
                    bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                }
        
                return bestMove;
            }
        
            // Function to simulate opponent's winning move after the AI's move
            function leavesOpponentWinningMove(board, col, player) {
                const opponent = player === PLAYER_AI ? PLAYER_CPU : PLAYER_AI;
                const validMoves = getValidMoves(board);
        
                // Simulate each of the opponent's possible moves
                for (let oppCol of validMoves) {
                    const oppRow = getFirstEmptyRow(oppCol, board);
                    const boardCopy = board.map(row => row.slice());  // Copy the board efficiently
                    dropPiece(boardCopy, oppRow, oppCol, opponent);
        
                    if (isWinningMove(opponent, boardCopy)) {
                        console.log(`AI avoiding move in column ${col} because it allows CPU to win.`);
                        return true;  // This move allows the opponent to win
                    }
                }
        
                return false;
            }
        
            // Get a list of all valid columns
            function getValidMoves(board) {
                const validMoves = [];
                for (let col = 0; col < COLUMNS; col++) {
                    if (getFirstEmptyRow(col, board) !== -1) {
                        validMoves.push(col);
                    }
                }
                return validMoves;
            }
        
            // Simulate dropping a piece on the board
            function dropPiece(board, row, col, player) {
                board[row][col] = player;
            }
        
            // Get the first empty row in a column
            function getFirstEmptyRow(col, board) {
                for (let row = ROWS - 1; row >= 0; row--) {
                    if (board[row][col] === EMPTY_SPACE) {
                        return row;
                    }
                }
                return -1;  // Column is full
            }
        
            // Cost function based on board state
            function calculateCost(board, player) {
                let cost = 0;
                const opponent = player === PLAYER_AI ? PLAYER_CPU : PLAYER_AI;
        
                // High penalty if opponent is about to win
                if (isWinningMove(opponent, board)) {
                    cost += 1000;
                }
        
                // Low cost (reward) if AI is about to win
                if (isWinningMove(player, board)) {
                    cost -= 1000;
                }
        
                return cost;
            }
        
            // Check if the player has a winning move
            function isWinningMove(player, board) {
                for (let y = 0; y < ROWS; y++) {
                    for (let x = 0; x < COLUMNS; x++) {
                        if (countUp(x, y, player, board) >= CONNECT ||
                            countRight(x, y, player, board) >= CONNECT ||
                            countUpRight(x, y, player, board) >= CONNECT ||
                            countDownRight(x, y, player, board) >= CONNECT) {
                            return true;
                        }
                    }
                }
                return false;
            }
        
            // Helper functions to count connected pieces in various directions
            function countUp(x, y, player, board) {
                let count = 0;
                for (let i = 0; i < CONNECT; i++) {
                    if (y - i >= 0 && board[y - i][x] === player) {
                        count++;
                    } else {
                        break;
                    }
                }
                return count;
            }
        
            function countRight(x, y, player, board) {
                let count = 0;
                for (let i = 0; i < CONNECT; i++) {
                    if (x + i < COLUMNS && board[y][x + i] === player) {
                        count++;
                    } else {
                        break;
                    }
                }
                return count;
            }
        
            function countUpRight(x, y, player, board) {
                let count = 0;
                for (let i = 0; i < CONNECT; i++) {
                    if (x + i < COLUMNS && y - i >= 0 && board[y - i][x + i] === player) {
                        count++;
                    } else {
                        break;
                    }
                }
                return count;
            }
        
            function countDownRight(x, y, player, board) {
                let count = 0;
                for (let i = 0; i < CONNECT; i++) {
                    if (x + i < COLUMNS && y + i < ROWS && board[y + i][x + i] === player) {
                        count++;
                    } else {
                        break;
                    }
                }
                return count;
            }
        
            // Get the best column for the AI and make the move
            const bestColumn = uniformCostSearch(this.board, this.currentPlayer);
            if (bestColumn !== -1) {
                const firstEmptyRow = this.getFirstEmptyRow(bestColumn, this.board);
                Vue.set(this.board[firstEmptyRow], bestColumn, this.currentPlayer);
        
                const status = await this.checkGameStatus();  // Check if AI wins or game is tied
                if (!status) {
                    this.togglePlayer();  // Move to the next player's turn
                    if (this.currentPlayer === PLAYER_CPU) {
                        this.makeCpuMove();  // Trigger CPU move if needed
                    }
                } else {
                    this.askUserForAnotherMatch();  // End game
                }
            } else {
                console.error("No valid moves found for AI");
            }
        },

        async makeCpuMove() {  // responsible for the CPU making a move when it's the CPU’s turn
            if (!this.isCpuPlaying || (this.currentPlayer !== PLAYER_CPU && this.currentPlayer !== PLAYER_AI)) {  // if not CPU's turn, exit
                return;
            }
            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await delay(1000); // Pause for 3 seconds
                // Continue with the rest of the CPU move logic
            
            
            const bestColumn = this.currentPlayer === PLAYER_CPU  // gets the best column to play piece for cpu 
                        ? this.getBestColumnForCpu()
                        : this.getBestColumnForAi();
            const firstEmptyRow = this.getFirstEmptyRow(bestColumn, this.board); // finds the first available row in the chosen column
            console.log({ firstEmptyRow });
            Vue.set(this.board[firstEmptyRow], bestColumn, this.currentPlayer); // places CPU's piece in the selected column at the first empty row
            const status = await this.checkGameStatus(); // see if the CPU has won or if the game is tied.
            if (!status) {
                this.togglePlayer(); // switch turns to the player.
                if (this.currentPlayer === PLAYER_AI) {     // Trigger the AI's turn after CPU
                    this.makeAIMove();
                }
            } else {
                this.askUserForAnotherMatch();
            }
        },
        
        getBestColumnForAi() {
            const winnerColumn = this.getWinnerColumn(this.board, this.currentPlayer); // checks if the AI can win in any column
            if (winnerColumn !== -1) {  // AI has a winning move available
                console.log("AI chooses winner column");
                return winnerColumn;
            }
            const adversary = this.getAdversary(this.currentPlayer);  // Check if adversary wins in the next move, if so, we take it
            const winnerColumnForAdversary = this.getWinnerColumn(this.board, adversary); // evaluate potential columns based on how many consecutive pieces the CPU can form in each column.
            if (winnerColumnForAdversary !== -1) {                   // CPU prioritizes blocking the opponent’s high-score move
                console.log("AI chooses take adversary's victory");
                return winnerColumnForAdversary;
            }
            const AIStats = this.getColumnWithHighestScore(this.currentPlayer, this.board); // Also evaluates the adversary's best columns
            const adversaryStats = this.getColumnWithHighestScore(adversary, this.board);    // Also evaluates the adversary's best columns
            console.log("AI chooses take adversary's victory");
            console.log({ adversaryStats });
            console.log({ AIStats });
            if (adversaryStats.highestCount > AIStats.highestCount) {    // We take the adversary's best move if it is higher than AI's
                console.log("AI chooses take adversary highest score");
                
                return adversaryStats.columnIndex;
            } else if (AIStats.highestCount > 1) {          // If no immediate win or block is needed, the CPU checks which column gives the highest score
                console.log("AI chooses highest count");
                return AIStats.columnIndex;
            }
            const centralColumn = this.getCentralColumn(this.board); // CPU tries to occupy the central column, which is often advantageous because it maximizes future connection possibilities
            if (centralColumn !== -1) {
                console.log("AI Chooses central column"); 
                return centralColumn;
            }
            
            console.log("AI chooses random column");     // Finally we return a random column
            return this.getRandomColumn(this.board);

        },
        getBestColumnForCpu() {   // implements the strategy for the CPU to select the best column to drop its piece
            const winnerColumn = this.getWinnerColumn(this.board, this.currentPlayer); // checks if the CPU can win in any column
            if (winnerColumn !== -1) {  // CPU has a winning move available
                console.log("Cpu chooses winner column");
                return winnerColumn;
            }
            const adversary = this.getAdversary(this.currentPlayer);  // Check if adversary wins in the next move, if so, we take it
            const winnerColumnForAdversary = this.getWinnerColumn(this.board, adversary); // evaluate potential columns based on how many consecutive pieces the CPU can form in each column.
            if (winnerColumnForAdversary !== -1) {                   // CPU prioritizes blocking the opponent’s high-score move
                console.log("Cpu chooses take adversary's victory");
                return winnerColumnForAdversary;
            }
            const cpuStats = this.getColumnWithHighestScore(this.currentPlayer, this.board); // Also evaluates the adversary's best columns
            const adversaryStats = this.getColumnWithHighestScore(adversary, this.board);    // Also evaluates the adversary's best columns
            console.log("Cpu chooses take adversary's victory");
            console.log({ adversaryStats });
            console.log({ cpuStats });
            if (adversaryStats.highestCount > cpuStats.highestCount) {    // We take the adversary's best move if it is higher than CPU's
                console.log("CPU chooses take adversary highest score");
                
                return adversaryStats.columnIndex;
            } else if (cpuStats.highestCount > 1) {          // If no immediate win or block is needed, the CPU checks which column gives the highest score
                console.log("CPU chooses highest count");
                return cpuStats.columnIndex;
            }
            const centralColumn = this.getCentralColumn(this.board); // CPU tries to occupy the central column, which is often advantageous because it maximizes future connection possibilities
            if (centralColumn !== -1) {
                console.log("CPU Chooses central column"); 
                return centralColumn;
            }
            
            console.log("CPU chooses random column");     // Finally we return a random column
            return this.getRandomColumn(this.board);

        },
        getWinnerColumn(board, player) {
            for (let i = 0; i < COLUMNS; i++) {
                const boardClone = JSON.parse(JSON.stringify(board));  // A deep copy of the board is created
                const firstEmptyRow = this.getFirstEmptyRow(i, boardClone);
                
                if (firstEmptyRow !== -1) {       // //Proceed only if row is ok
                    boardClone[firstEmptyRow][i] = player;

                    if (this.isWinner(player, boardClone)) {     // If this is winner, return the column
                        return i;
                    }
                }
            }
            return -1;
        },
        getColumnWithHighestScore(player, board) {   // determine which column on the board would give the highest score
            const returnObject = {   // keeps track of the column with the highest score
                highestCount: -1,
                columnIndex: -1,
            };
            for (let i = 0; i < COLUMNS; i++) {   // iterates over every column (i is the column index) to check the potential score
                const boardClone = JSON.parse(JSON.stringify(board)); // creates copy, ensures the original board remains unmodified during this analysis
                const firstEmptyRow = this.getFirstEmptyRow(i, boardClone); // Finds the first available (empty) row in column 
                if (firstEmptyRow !== -1) {     // If the column has an empty row, proceed
                    boardClone[firstEmptyRow][i] = player;  // Simulates placing the player's piece in the first available row of column
                    const firstFilledRow = this.getFirstFilledRow(i, boardClone); // After placing piece, this finds the first row in the column that contains the new piece.
                    if (firstFilledRow !== -1) { // f a valid row is found where piece was placed, proceeds to count how many pieces are connected in different directions
                        let count = 0;
                        count = this.countUp(i, firstFilledRow, player, boardClone);   // Calls the countUp method to count how many consecutive pieces the player has vertically upwards
                        if (count > returnObject.highestCount) {   // If this count is greater than the current highestCount, update
                            returnObject.highestCount = count; 
                            returnObject.columnIndex = i;
                        }
                        count = this.countRight(i, firstFilledRow, player, boardClone);   // Calls countRight to count the player's consecutive pieces horizontally to the right.
                        if (count > returnObject.highestCount) {
                            returnObject.highestCount = count;
                            returnObject.columnIndex = i;
                        }
                        count = this.countUpRight(i, firstFilledRow, player, boardClone);    // Calls countUpRight to count how many pieces the player has diagonally upwards to the right
                        if (count > returnObject.highestCount) {
                            returnObject.highestCount = count;
                            returnObject.columnIndex = i;
                        }
                        count = this.countDownRight(i, firstFilledRow, player, boardClone);   // count the player's pieces diagonally downwards and to the right
                        if (count > returnObject.highestCount) {
                            returnObject.highestCount = count;
                            returnObject.columnIndex = i;
                        }
                    }
                }                      // After checking all columns, the method returns the returnObject, which contains:
            }                          // highestCount: largest number of consecutive pieces the player can get by placing piece in any column
            return returnObject;       // columnIndex: The column where this highest score is achieved
        },
        getRandomColumn(board) {    // selects a random column for the CPU to make a move when no strategic move is found.
            while (true) {
                const boardClone = JSON.parse(JSON.stringify(board)); // deep copy of the board is created to avoid modifying the actual game board while testing moves
                const randomColumnIndex = this.getRandomNumberBetween(0, COLUMNS - 1);
                const firstEmptyRow = this.getFirstEmptyRow(randomColumnIndex, boardClone);
                if (firstEmptyRow !== -1) {
                    return randomColumnIndex;
                }
            }
        },
        getCentralColumn(board) {  // returns the index of the central column of the board, a useful strategy in Connect 4
            const boardClone = JSON.parse(JSON.stringify(board));
            const centralColumn = parseInt((COLUMNS - 1) / 2);
            if (this.getFirstEmptyRow(centralColumn, boardClone) !== -1) {

                return centralColumn;
            }
            return -1;
        },
        async showWinner() {
            if (this.currentPlayer === PLAYER_AI) {
                await Swal.fire('Winner is AI!');  // using SweetAlert (Swal), If AI is the current player when game ends
            } else if (this.currentPlayer === PLAYER_CPU) {
                await Swal.fire('Winner is CPU!'); // If CPU is the current player when game ends
            } else {
                await Swal.fire('Winner is player 1'); // Fallback, if Player_AI was playing
            }
        },
        async showTie() {  // displays a message indicating that the game ended in a tie
            await Swal.fire('Tie');
        },
        getFirstFilledRow(columnIndex, board) {  // finds the first filled row (non-empty space) in a specific column of the board
            for (let i = ROWS - 1; i >= 0; i--) {  // loop starts from the bottom row (ROWS - 1) and moves upwards (i--), iterating through each row in columnIndex
                if (board[i][columnIndex] !== EMPTY_SPACE) {  // Checks if the cell at the current row and column is not empty
                    return i;
                }
            }
            return -1;    // if no filled row is found, the function returns -1 to indicate this
        },                // function helps identify the highest row in the column that contains a piece

        getFirstEmptyRow(columnIndex, board) {     // finds the first empty row in a specific column, allowing a move to be made
            for (let i = ROWS - 1; i >= 0; i--) {  // this loop starts at the bottom (ROWS - 1) and works its way up, searching for first empty space.
                if (board[i][columnIndex] === EMPTY_SPACE) {   // Checks if the current cell is an empty space
                    return i;     // If an empty space is found, the function returns the index of that row
                }
            }
            return -1;   // If no empty space is found, the function returns -1
        }
    }
});