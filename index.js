



class Game {
    constructor(oppType, startPlayer) {
        this.gameState = new GameState();
        this.curPlayer = startPlayer;
        this.playerTwo = oppType;
        this.AI = new TicTacToeAI();

    }
    playerMove(move) {
        if (this.curPlayer === 1 || (this.curPlayer === 2 && this.playerTwo === "human")) {
            if (this.gameState.validSpace(move)) {
                this.gameState.makeMove(move, this.curPlayer);
                this.curPlayer = (this.curPlayer === 1) ? 2 : 1;
                if (this.curPlayer === 2 && this.playerTwo === "AI"){
                    let aiMove = this.AI.aiMove(this.gameState);
                    this.gameState.makeMove(aiMove, this.curPlayer);
                } 
            }
        }
    }
}

class TicTacToeAI {

    aiMove(state) {
        return state.freeSpaces()[0];
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
            if ((this.state[0+i*3] === this.state[1+i*3]) && (this.state[1+i*3] === this.state[2+i*3]) && 
                this.state[0+i*3] !== 0) return true;    
            if ((this.state[0+i] === this.state[3+i]) && (this.state[3+i] === this.state[6+i]) && 
                this.state[0+i] !== 0) return true;
        }
        if ((this.state[0] === this.state[4]) && (this.state[4] === this.state[8]) && this.state[0] !== 0) return true;
        if ((this.state[2] === this.state[4]) && (this.state[4] === this.state[6]) && this.state[2] !== 0) return true;
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
    reset() {
        this.state = [0,0,0,0,0,0,0,0,0];
    }
}

(function test() {
    const testGame = new Game("AI", 1);
    console.log("Testing");
    //GameState test
    console.log("---GameState");
    console.log(testGame.gameState.validSpace(2) === true);
    testGame.gameState.makeMove(2, 1);
    console.log(testGame.gameState.validSpace(2) === false);
    testGame.gameState.makeMove(2, 2);
    console.log(testGame.gameState.state[2] !== 2);
    testGame.gameState.reset();
    //Game test
    console.log("---Game");
    console.log(testGame.curPlayer === 1);
    testGame.playerMove(0); //test a human can move
    console.log(testGame.curPlayer === 2);
    testGame.playerMove(1); //Cant, still AI
    console.log(testGame.curPlayer !== 1);
    testGame.playerTwo = "human"; //Switch to human
    testGame.playerMove(2); //check player 2 can move manually if a human
    console.log(testGame.curPlayer === 1);
    testGame.playerMove(2); //test cant move to occupied space
    console.log(testGame.curPlayer === 1);
    //AI test

})();

