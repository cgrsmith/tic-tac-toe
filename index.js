



class Game {
    constructor(oppType) {
        this.gameState = [0,0,0,0,0,0,0,0,0];
        this.curPlayer = 1;
        this.playerTwo = oppType;
    }

    changeState(state, move, player) {
        let newState = state;
        if (this.validSpace(state, move)) {
            newState[move] = player;
        }
        return newState;
    }

    checkWin(state) {
        for (let i = 0; i <= 2; i++) {
            if ((state[0+i*3] === state[1+i*3]) && (state[1+i*3] === state[2+i*3]) && state[0+i*3] !== 0) return true;    
            if ((state[0+i] === state[3+i]) && (state[3+i] === state[6+i]) && state[0+i] !== 0) return true;
        }
        if ((state[0] === state[4]) && (state[4] === state[8]) && state[0] !== 0) return true;
        if ((state[2] === state[4]) && (state[4] === state[6]) && state[2] !== 0) return true;
        return false;
    }
    freeSpaces(state) {
        let spaces = [];
        for (let i in state) {
            if (state[i] === 0) spaces.push(parseInt(i));
        }
        return spaces;
    }
    validSpace(state, move) {
        return (this.freeSpaces(state).indexOf(move) === -1) ? false : true;
    }
}

function test() {
    const testGame = new Game("Player");
    console.log("Testing");
    console.log(testGame.validSpace([0,0,0,0,0], 2) === true);
    console.log(testGame.validSpace([0,0,0,0,1], 4) === false);
    console.log(testGame.changeState([0,0,0,0,1], 2, 1));
}
test();
