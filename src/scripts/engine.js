const state = {
    view: {
        squares: document.querySelectorAll('.square'),
        enemy: document.querySelector('.enemy'),
        timeLeft: document.querySelector("#time-left"),
        score: document.querySelector('#score'),
        level: document.querySelector('#level'),
        lives: document.querySelector('#lives'),
    },
    values: {
        timeid: null,
        gameVelocity: 3000,
        hitPosition: 0,
        result: 0,
        pontAcert: 1,
        curretTime: 30,
        lives: 3,
        level: 1,
        contErros: 0,
    },
}

function playSound(audioName) {
    let audio = new Audio(`./src/audios/${audioName}`);
    audio.volume = 0.1;
    audio.play();
  }

function countDown() {
    if (state.values.curretTime > 0) {
        state.values.curretTime--;
        state.view.timeLeft.textContent = state.values.curretTime;
    } else {
        newLevel();
    }
}

function removeEnemy() {
    state.view.squares.forEach((square) => {
        square.classList.remove("enemy");
    })
}

function randomSquare() {
    removeEnemy();
    let randomNumber = Math.floor(Math.random() * 9);
    let randomSquare = state.view.squares[randomNumber];
    randomSquare.classList.add("enemy");
    state.values.hitPosition = randomSquare.id;
    state.values.contErros++;
    if (state.values.contErros > 3) {
        playSound('buzzer.mp3');
        state.values.lives--;
        state.view.lives.textContent = state.values.lives;
        state.values.contErros = 0;
        if (state.values.lives < 0) gameOver();
    }
}

function moveEnemy() {
    clearInterval(state.values.timeid);
    state.values.timeid = setInterval(randomSquare, state.values.gameVelocity);
}

function addListenerHitBox() {
    state.view.squares.forEach((square) => {
        square.addEventListener("mousedown", () => {
            if (square.id === state.values.hitPosition) {
                state.values.result += state.values.pontAcert;
                state.view.score.textContent = state.values.result;
                state.values.hitPosition = null;
                state.values.contErros = 0;
                playSound('hit.m4a');
                removeEnemy();
            } else {
                state.values.lives--;
                state.view.lives.textContent = state.values.lives;
                if (state.values.lives < 0) gameOver();
                playSound("buzzer.mp3");
            }
        })
    })
}

function newLevel() {
    if (state.values.lives >= 0) {
        state.values.gameVelocity = Math.max(300, state.values.gameVelocity - 300);
        state.values.level += 1;
        state.view.level.textContent = state.values.level;
        state.values.pontAcert = 1 + state.values.level;
        state.values.curretTime = 30;
        moveEnemy();
    }
}

function gameOver() {
    clearInterval(state.values.timeid);
    alert("Game Over! Você chegou no level: " + state.values.level + " com pontuação de " + state.values.result + " pontos");

    state.values.lives = 3;
    state.values.curretTime = 30;
    state.values.level = 0;
    state.values.result = 0;
    state.values.contErros = 0;

    state.view.lives.textContent = state.values.lives;
    state.view.timeLeft.textContent = state.values.curretTime;
    state.view.score.textContent = state.values.result;
    state.view.level.textContent = state.values.level;
}

function init() {
    state.view.timeLeft.textContent = state.values.curretTime;
    state.view.lives.textContent = state.values.lives;
    state.view.score.textContent = state.values.result;
    state.view.level.textContent = state.values.level;
    moveEnemy();
    addListenerHitBox();
    setInterval(countDown, 1000);

}


init();
