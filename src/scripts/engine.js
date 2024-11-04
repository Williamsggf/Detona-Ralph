const state = {
    view: {
        squares: document.querySelectorAll('.square'),
        enemy: document.querySelector('.enemy'),
        timeLeft: document.querySelector("#time-left"),
        score: document.querySelector('#score'),
        level: document.querySelector('#level'),
        lives: document.querySelector('#lives'),
        startButton: document.getElementById('start-button') // Referência ao botão Start
    },
    values: {
        timeid: null,
        gameVelocity: 3000,
        hitPosition: 0,
        result: 0,
        pontAcert: 1,
        currentTime: 30, 
        lives: 3,
        level: 1,
        contErros: 0,
        authToken: null // Armazenará o token JWT
    },
};

// Função para realizar o login e obter o token JWT
async function login(username) {
    try {
        const response = await fetch('https://app-gestao-backend.vercel.app/auth/loginDR', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        if (!response.ok) {
            throw new Error('Erro ao realizar login');
        }

        const data = await response.json();
        state.values.authToken = data.token;
        alert('Login realizado com sucesso!');
    } catch (error) {
        console.error('Erro ao realizar login:', error);
    }
}

// Função para tocar som
function playSound(audioName) {
    let audio = new Audio(`./src/audios/${audioName}`);
    audio.volume = 0.1;
    audio.play();
}

// Contador de tempo
function countDown() {
    if (state.values.currentTime > 0) {
        state.values.currentTime--;
        state.view.timeLeft.textContent = state.values.currentTime;
    } else {
        newLevel();
    }
}

// Função para remover inimigo
function removeEnemy() {
    state.view.squares.forEach((square) => {
        square.classList.remove("enemy");
    });
}

// Função para gerar posição aleatória do inimigo
function randomSquare() {
    removeEnemy();
    let randomNumber = Math.floor(Math.random() * state.view.squares.length);
    let randomSquare = state.view.squares[randomNumber];
    randomSquare.classList.add("enemy");
    state.values.hitPosition = randomSquare.id;
    state.values.contErros++;
    if (state.values.contErros > 3) {
        playSound('buzzer.mp3');
        state.values.lives--;
        state.view.lives.textContent = state.values.lives;
        state.values.contErros = 0;
        if (state.values.lives <= 0) gameOver();
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
                if (state.values.lives <= 0) gameOver();
                playSound("buzzer.mp3");
            }
        });
    });
}

// Função para salvar a pontuação do jogador
function saveScore(nome, level, score) {
    const scoreData = { nome, level, score };

    fetch('https://app-gestao-backend.vercel.app/auth/RscoresDR', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.values.authToken}` // Adiciona o token JWT
        },
        body: JSON.stringify(scoreData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro ao salvar a pontuação');
        return response.json();
    })
    .then(data => {
        alert("Pontuação salva com sucesso!");
        displayScores();
        reloadPage();
    })
    .catch(error => console.error('Erro ao salvar a pontuação:', error));
}

// Função para exibir as pontuações
function displayScores() {
    fetch('https://app-gestao-backend.vercel.app/auth/CscoresDR', {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${state.values.authToken}` // Adiciona o token JWT
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro na resposta da rede.");
        }
        return response.json();
    })
    .then(data => {
        const scoresTableBody = document.getElementById("scores-table").querySelector("tbody");
        scoresTableBody.innerHTML = ""; 

        if (Array.isArray(data.scores) && data.scores.length > 0) {
            data.scores.forEach(score => {
                const row = document.createElement("tr");

                const nameCell = document.createElement("td");
                nameCell.textContent = score.nome;

                const levelCell = document.createElement("td");
                levelCell.textContent = score.level;

                const scoreCell = document.createElement("td");
                scoreCell.textContent = score.score;

                row.appendChild(nameCell);
                row.appendChild(levelCell);
                row.appendChild(scoreCell);

                scoresTableBody.appendChild(row);
            });
        } else {
            console.error("Nenhuma pontuação disponível:", data);
            scoresTableBody.innerHTML = "<tr><td colspan='3'>Nenhuma pontuação encontrada.</td></tr>";
        }
    })
    .catch(error => console.error('Erro ao carregar as pontuações:', error));
}

window.addEventListener('load', () => {

    const username = 'Detona';
    if (username) {
        login(username).then(displayScores);
    }
});

// Função para iniciar o jogo
function startGame() {
    state.view.timeLeft.textContent = state.values.currentTime;
    state.view.lives.textContent = state.values.lives;
    state.view.score.textContent = state.values.result;
    state.view.level.textContent = state.values.level;
    
    displayScores();
    moveEnemy();
    addListenerHitBox();
    addKeyboardListenerHitBox();
    
    // Inicia o contador de tempo uma única vez
    if (!state.values.timerId) {
        state.values.timerId = setInterval(countDown, 1000);
    }

    state.view.startButton.disabled = true;
    document.getElementById("Modal").style.display = "none";
}

state.view.startButton.addEventListener("click", startGame);
