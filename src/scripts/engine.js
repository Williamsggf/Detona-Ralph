// Estado e Inicialização do Jogo
const state = {
    view: {
        squares: [],
        timeLeft: null,
        score: null,
        level: null,
        lives: null,
        startButton: null
    },
    values: {
        timeId: null,
        gameVelocity: 3000,
        hitPosition: null,
        score: 0,
        pointsPerHit: 1,
        remainingTime: 30,
        lives: 3,
        level: 1,
        errorCount: 0,
        timerId: null
    },
};

let authToken = null; // Token JWT será inicializado depois do DOM carregar

// Inicialização do Jogo e Elementos do DOM
function initializeGame() {
    state.view.squares = document.querySelectorAll('.square');
    state.view.timeLeft = document.querySelector("#time-left");
    state.view.score = document.querySelector('#score');
    state.view.level = document.querySelector('#level');
    state.view.lives = document.querySelector('#lives');
    state.view.startButton = document.getElementById('start-button');
    
    // Inicializa token JWT (substitua pela sua forma de obtenção real)
    authToken = 'eLM4iaa2h|SM9Zp';

    // Definir listeners e exibir pontuações
    state.view.startButton.addEventListener("click", startGame);
    displayScores();
}

// Funções de Utilidade
function playSound(audioName) {
    const audio = new Audio(`./src/audios/${audioName}`);
    audio.volume = 0.1;
    audio.play();
}

// Lógica de Tempo
function countDown() {
    if (state.values.remainingTime > 0) {
        state.values.remainingTime--;
        state.view.timeLeft.textContent = state.values.remainingTime;
    } else {
        advanceLevel();
    }
}

// Controle do Inimigo
function removeEnemy() {
    state.view.squares.forEach(square => square.classList.remove("enemy"));
}

function randomSquare() {
    removeEnemy();
    const randomIndex = Math.floor(Math.random() * state.view.squares.length);
    const selectedSquare = state.view.squares[randomIndex];
    selectedSquare.classList.add("enemy");
    state.values.hitPosition = selectedSquare.id;
    state.values.errorCount++;
    checkErrors();
}

function checkErrors() {
    if (state.values.errorCount > 3) {
        playSound('buzzer.mp3');
        state.values.lives--;
        state.view.lives.textContent = state.values.lives;
        state.values.errorCount = 0;
        if (state.values.lives <= 0) gameOver();
    }
}

function moveEnemy() {
    clearInterval(state.values.timeId);
    state.values.timeId = setInterval(randomSquare, state.values.gameVelocity);
}

// Manipulação de Eventos
function addMouseHitListener() {
    state.view.squares.forEach(square => {
        square.addEventListener("mousedown", () => {
            if (square.id === state.values.hitPosition) {
                processHit();
            } else {
                processMiss();
            }
        });
    });
}

function addKeyboardHitListener() {
    document.addEventListener("keydown", event => {
        if (/^[1-9]$/.test(event.key) && event.key === state.values.hitPosition) {
            processHit();
        } else {
            processMiss();
        }
    });
}

function processHit() {
    state.values.score += state.values.pointsPerHit;
    state.view.score.textContent = state.values.score;
    state.values.hitPosition = null;
    state.values.errorCount = 0;
    playSound('hit.m4a');
    removeEnemy();
}

function processMiss() {
    state.values.lives--;
    state.view.lives.textContent = state.values.lives;
    playSound("buzzer.mp3");
    if (state.values.lives <= 0) gameOver();
}

// Avanço de Nível
function advanceLevel() {
    if (state.values.lives > 0) {
        state.values.gameVelocity = Math.max(500, state.values.gameVelocity - 250);
        state.values.level++;
        state.view.level.textContent = state.values.level;
        state.values.pointsPerHit = 1 + state.values.level;
        state.values.remainingTime = 30;
        moveEnemy();
    }
}

// Final do Jogo
function gameOver() {
    clearInterval(state.values.timeId);
    clearInterval(state.values.timerId);
    alert(`Game Over! Nível alcançado: ${state.values.level}, Pontuação: ${state.values.score}`);
    const playerName = prompt("Digite seu nome para salvar a pontuação:");
    if (playerName) saveScore(playerName, state.values.level, state.values.score);
    resetGame();
}

// Reset do Estado do Jogo
function resetGame() {
    state.values.lives = 3;
    state.values.level = 1;
    state.values.score = 0;
    state.values.errorCount = 0;
    state.values.remainingTime = 30;
    state.view.lives.textContent = state.values.lives;
    state.view.timeLeft.textContent = state.values.remainingTime;
    state.view.score.textContent = state.values.score;
    state.view.level.textContent = state.values.level;
    state.view.startButton.disabled = false;
    document.getElementById("Modal").style.display = "flex";
}

// Início do Jogo
function startGame() {
    state.view.timeLeft.textContent = state.values.remainingTime;
    state.view.lives.textContent = state.values.lives;
    state.view.score.textContent = state.values.score;
    state.view.level.textContent = state.values.level;
    displayScores();
    moveEnemy();
    addMouseHitListener();
    addKeyboardHitListener();
    state.values.timerId = setInterval(countDown, 1000);
    state.view.startButton.disabled = true;
    document.getElementById("Modal").style.display = "none";
}

// Salvando e Exibindo Pontuações
function saveScore(name, level, score) {
    const scoreData = { name, level, score };
    fetch('https://app-gestao-backend.vercel.app/auth/RscoresDR', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(scoreData)
    })
    .then(response => response.json())
    .then(() => {
        alert("Pontuação salva com sucesso!");
        displayScores();
        resetGame();
    })
    .catch(error => console.error('Erro ao salvar pontuação:', error));
}

function displayScores() {
     if (!authToken || !isValidJWT(authToken)) {
    console.error("Missing or invalid JWT token");
    return;
  }

  fetch('https://app-gestao-backend.vercel.app/auth/CscoresDR', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json' // Might be required by your backend
    }
  })
  .then(response => response.json())
  .then(data => {
    const scoresTableBody = document.getElementById("scores-table").querySelector("tbody");
    scoresTableBody.innerHTML = "";
    if (Array.isArray(data.scores) && data.scores.length > 0) {
      data.scores.forEach(score => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${score.name}</td><td>${score.level}</td><td>${score.score}</td>`;
        scoresTableBody.appendChild(row);
      });
    } else {
      scoresTableBody.innerHTML = "<tr><td colspan='3'>Nenhuma pontuação encontrada.</td></tr>";
    }
  })
  .catch(error => console.error('Erro ao carregar pontuações:', error));
}

// Inicia o Jogo ao Carregar a Página
window.addEventListener('DOMContentLoaded', initializeGame);
