$(document).ready(function() {
    let game;
    //Default Options
    let gameType = "ai";
    let gameStarter = 1;
    $(".tile").prop("disabled", true);
    $("#resultBox").hide();

    //Start creates a new Game object and starts the game
    $("#startButton").click(function() {
        game = new Game(gameType, gameStarter);
        game.start();
    });

    //Tiles always send their move to Game, Game decides if valid
    //A move is a 0 to 8 integer
    $(".tile").click(function() {
        game.playerMove(parseInt($(this).val()), $(this));
    });

    //Select human or ai opponent
    $(".gameType").click(function() {
        gameType = $(this).val();
        $(this).addClass("selected");
        $(this).siblings().removeClass("selected");
        if (gameType === "human") {
            $(".gameStarter").css('visibility', 'hidden');
            $("#default").click()
        } else {
            $(".gameStarter").css('visibility', 'visible');
        }
    });

    //If AI opponent, chose first player
    $(".gameStarter").click(function() {
        gameStarter = parseInt($(this).val());
        $(this).addClass("selected");
        $(this).siblings().removeClass("selected");
    });
});

/*  Game handles game flow and governs all interations with Document
    Has subordinate AI and GameState objects that do not direectly interact
*/  
class Game {
    constructor(oppType, startPlayer) {
        this.curPlayer = startPlayer;
        this.playerTwo = oppType;

        //Game stores the state and ai
        this.gameState = new GameState();
        this.AI = new TicTacToeAI();

        //Human player 1 is always curPlayer 1, its the symbols that change 
        this.playerSymbols = (this.curPlayer === 1) ? ["X","O"] : ["O","X"];
        this.gameOver = false;
    }
    start() {
        //Enable board, update clear board in case of reset, if ai going first, tell it to.
        $(".tile").prop("disabled", false);
        $(".tile").removeClass("winTile");
        $("#resultBox").hide();
        this.updateBoard();
        if (this.curPlayer === 2) this.aiGo();
    }

    //If a tile has sent its value to the game, and it is a valid move on the correct turn,
    // make the move. If game against AI, tell it to take its turn (if game not over)
    playerMove(move) {
        if (this.curPlayer === 1 || (this.curPlayer === 2 && this.playerTwo === "human")) {
            if (this.gameState.validSpace(move)) {         
                this.gameState.makeMove(move, this.curPlayer);
                this.updateBoard();
                this.curPlayer = (this.curPlayer === 1) ? 2 : 1;
                if (this.curPlayer === 2 && this.playerTwo === "ai" && !this.gameOver){
                    this.aiGo();
                } 
            }
        }
    }

    //AI object determines a move, Game acts on it
    aiGo() {
        let cloneState = new GameState(this.gameState.state);
        let aiMove = this.AI.aiMove(cloneState);
        this.gameState.makeMove(aiMove, this.curPlayer);
        this.updateBoard();
        this.curPlayer = 1;
    }

    //Updates the board and checks end result
    updateBoard() {
        for (let tile in this.gameState.state) {
            if (this.gameState.state[tile] !== 0) {
                $("#"+tile).html((this.gameState.state[tile] === 1) ? this.playerSymbols[0] : this.playerSymbols[1]);
            } else {
                $("#"+tile).html("");
            }
        }
        //Check for winner, otherwise check for no free spaces (tie)
        let winState = this.gameState.checkWin();
        if (winState.win) {
            this.winner(winState);
        } else if(this.gameState.freeSpaces().length === 0) {
            this.tie();
        }
    }

    //Board update if tie
    tie() {
        $("#resultBox").show()
        $("#resultBox").html("It's a Tie!");
        $(".tile").prop("disabled", true);
        this.gameOver = true;
    }

    //Board update if winner
    winner(winState) {      
        for (let i in winState.spaces) {
            $("#"+ winState.spaces[i]).addClass("winTile");
        }
        $("#resultBox").show()
        $("#resultBox").html("Player " +this.curPlayer +" wins");
        $(".tile").prop("disabled", true);
        this.gameOver = true; //Stops AI going if player won
    }

}
/*  TicTacToeAI is uses the minimax algorithm to determine a move to send to the Game
*/
class TicTacToeAI {
    //Typical minimax
    miniMax(newState, player) {
        //If player = 1, then player = 2 won last round
        if (newState.checkWin().win && player === 1) return {score: 20};
        if (newState.checkWin().win && player === 2) return {score: -10};
        if (newState.freeSpaces().length === 0) return {score: 0};

        let nextPlayer = (player === 1) ? 2 : 1;
        let availSpaces = newState.freeSpaces();
        let moves = [];
        
        for (let space in availSpaces) {
            let move = {};
            move.space = availSpaces[space];
            newState.makeMove(move.space, player);
            let result = this.miniMax(newState, nextPlayer);
            move.score = result.score;
            moves.push(move);
            newState.clearSpace(move.space);
        }
        
        if (player === 1) {
            return moves.reduce(function(minObj, nextObj) {
                return (nextObj.score < minObj.score) ? nextObj : minObj;
            });
        } else {
            return moves.reduce(function(maxObj, nextObj) {
                return (nextObj.score > maxObj.score) ? nextObj : maxObj;
            });
        }

    }

    //start minimax, get move to return to Game
    aiMove(state) {
        return this.miniMax(state, 2).space;
    }

}
/*  GameState handles storing the state and any modifications to it. 
    Also determines valid moves and checks win conditions.
    Board State is represented by array of 0 to 8, as in:
    0 1 2
    3 4 5
    6 7 8
*/
class GameState {
    constructor(startState = [0,0,0,0,0,0,0,0,0]) {
        this.state = startState;
    }
    makeMove(move, player) {
        if (this.validSpace(move)) {
            this.state[move] = player;   
        }
    }

    //If a win, return object with winning spaces and boolean
    checkWin() {
        for (let i = 0; i <= 2; i++) {
            //accross
            if (this.state[0+i*3] === this.state[1+i*3] && this.state[1+i*3] === this.state[2+i*3] && 
                this.state[0+i*3] !== 0) return {spaces:[0+i*3,1+i*3,2+i*3], win: true};    
            //down
            if (this.state[0+i] === this.state[3+i] && this.state[3+i] === this.state[6+i] && 
                this.state[0+i] !== 0) return {spaces:[0+i,3+i,6+i], win: true};
        }
        //diagonal
        if (this.state[0] === this.state[4] && this.state[4] === this.state[8] && 
            this.state[0] !== 0) return {spaces:[0,4,8], win: true};
        if (this.state[2] === this.state[4] && this.state[4] === this.state[6] && 
            this.state[2] !== 0) return {spaces:[2,4,6], win: true};
        //No winner, return boolean
        return {win: false};
    }

    //Return an array of the free remaining spaces
    freeSpaces() {
        let spaces = [];
        for (let i in this.state) {
            if (this.state[i] === 0) spaces.push(parseInt(i));
        }
        return spaces;
    }

    //Check if a move is
    validSpace(move) {
        return (this.freeSpaces(this.state).indexOf(move) === -1) ? false : true;
    }
    //Clear a move (used in minimax backtracking)
    clearSpace(move) {
        this.state[move] = 0;   
    }
    reset() {
        this.state = [0,0,0,0,0,0,0,0,0];
    }
}

(function test() {
//     const testGame = new Game("ai", 1);
//     console.log("Testing");
//     //GameState test
//     console.log("---GameState");
//     console.log(testGame.gameState.validSpace(2) === true);
//     testGame.gameState.makeMove(2, 1);
//     console.log(testGame.gameState.validSpace(2) === false);
//     testGame.gameState.makeMove(2, 2);
//     console.log(testGame.gameState.state[2] !== 2);
//     testGame.gameState.reset();
//     //Game test
//     console.log("---Game");
//     console.log(testGame.curPlayer === 1);
//     testGame.playerMove(0); //test a human can move
//     console.log(testGame.curPlayer === 1);
//     testGame.playerMove(1); //AI has moved
//     console.log(testGame.curPlayer === 1);
//     testGame.playerTwo = "human"; //Switch to human
//     testGame.playerMove(3); //check player 2 can move manually if a human
//     console.log(testGame.curPlayer === 2);
//     testGame.playerMove(3); //test cant move to occupied space
//     console.log(testGame.curPlayer === 2);
//     //AI test
})();

