$(document).ready(function() {
    let game;
    let gameType = "ai";
    let gameStarter = 1;
    $(".tile").prop("disabled", true);

    $("#startButton").click(function() {
        game = new Game(gameType, gameStarter);
        game.start();
    });

    $(".tile").click(function() {
        game.playerMove(parseInt($(this).val()), $(this));
    });

    $(".gameType").click(function() {
        gameType = $(this).val();
        $(this).addClass("selected");
        $(this).siblings().removeClass("selected");
        if (gameType === "human") {
            $(".gameStarter").hide();
            $("#default").click()
        } else {
            $(".gameStarter").show();
        }
    });

    $(".gameStarter").click(function() {
        gameStarter = parseInt($(this).val());
        $(this).addClass("selected");
        $(this).siblings().removeClass("selected");
    });
});



class Game {
    constructor(oppType, startPlayer) {
        this.curPlayer = startPlayer;
        this.playerTwo = oppType;

        this.gameState = new GameState();
        this.AI = new TicTacToeAI();

        this.playerSymbols = (this.curPlayer === 1) ? ["X","O"] : ["O","X"];
        this.gameOver = false;
    }
    start() {
        $("h1").html("Tic-Tac-Toe");
        $(".tile").prop("disabled", false);
        this.updateBoard();
        if (this.curPlayer === 2) this.aiGo();
    }

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

    aiGo() {
        let aiMove = this.AI.aiMove(this.gameState);
        this.gameState.makeMove(aiMove, this.curPlayer);
        this.updateBoard();
        this.curPlayer = 1;
    }

    updateBoard() {
        for (let tile in this.gameState.state) {
            if (this.gameState.state[tile] !== 0) {
                $("#"+tile).html((this.gameState.state[tile] === 1) ? this.playerSymbols[0] : this.playerSymbols[1]);
            } else {
                $("#"+tile).html("");
            }
        }
        if (this.gameState.checkWin()) {
            this.winner();
        }
    }

    winner(player) {
        $("h1").html("Player " +this.curPlayer +" wins");
        $(".tile").prop("disabled", true);
        this.gameOver = true; //Stops AI going if player won
    }

}

class TicTacToeAI {
    miniMax(newState, player) {
        if (newState.checkWin() && player === 1) return {score: -10};
        if (newState.checkWin() && player === 2) return {score: 10};
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

        if (player === 2) {
            return moves.reduce(function(minObj, nextObj) {
                return (nextObj.score < minObj.score) ? nextObj : minObj;
            });
        } else {
            return moves.reduce(function(maxObj, nextObj) {
                return (nextObj.score > maxObj.score) ? nextObj : maxObj;
            });
        }

    }

    aiMove(state) {
        return this.miniMax(state, 2).space;
    }

}

class GameState {
    constructor(startState = [0,0,0,0,0,0,0,0,0]) {
        this.state = startState;
    }
    makeMove(move, player) {
        if (this.validSpace(move)) {
            this.state[move] = player;   
        }
    }
    checkWin() {
        for (let i = 0; i <= 2; i++) {
            //accross
            if (this.state[0+i*3] === this.state[1+i*3] && this.state[1+i*3] === this.state[2+i*3] && this.state[0+i*3] !== 0) return true;    
            //down
            if (this.state[0+i] === this.state[3+i] && this.state[3+i] === this.state[6+i] && this.state[0+i] !== 0) return true;
        }
        //diagonal
        if (this.state[0] === this.state[4] && this.state[4] === this.state[8] && this.state[0] !== 0) return true;
        if (this.state[2] === this.state[4] && this.state[4] === this.state[6] && this.state[2] !== 0) return true;
        return false;
    }
    freeSpaces() {
        let spaces = [];
        for (let i in this.state) {
            if (this.state[i] === 0) spaces.push(parseInt(i));
        }
        return spaces;
    }
    validSpace(move) {
        return (this.freeSpaces(this.state).indexOf(move) === -1) ? false : true;
    }
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
    const testGame = new Game("ai", 1);
    let testState = new GameState([1,1,1,2,2,0,0,0,0])
    console.log(testState);
    let testAI = new TicTacToeAI();
    console.log(testAI.aiMove(testState));
})();

