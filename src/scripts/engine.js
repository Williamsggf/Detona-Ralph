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
};

// Função para tocar som
function playSound(audioName) {
    let audio = new Audio(`./src/audios/${audioName}`);
    audio.volume = 0.1;
    audio.play();
}

// Contador de tempo
function countDown() {
    if (state.values.curretTime > 0) {
        state.values.curretTime--;
        state.view.timeLeft.textContent = state.values.curretTime;
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

// Função para mover o inimigo em intervalos definidos
function moveEnemy() {
    clearInterval(state.values.timeid);
    state.values.timeid = setInterval(randomSquare, state.values.gameVelocity);
}

// Adiciona escutadores de eventos para detectar acertos
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
        });
    });
}

// Aumenta a dificuldade a cada novo nível
function newLevel() {
    if (state.values.lives >= 0) {
        state.values.gameVelocity = Math.max(500, state.values.gameVelocity - 300);
        state.values.level += 1;
        state.view.level.textContent = state.values.level;
        state.values.pontAcert = 1 + state.values.level;
        state.values.curretTime = 30;
        moveEnemy();
    }
}

// Função para salvar a pontuação do jogador
function saveScore(nome, level, score) {
    const scoreData = { nome, level, score };

    fetch('https://app-gestao-backend.vercel.app/auth/RscoresDR', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro ao salvar a pontuação');
        return response.json();
    })
    .then(data => {
        alert("Pontuação salva com sucesso!");
        displayScores(); // Atualiza a lista de pontuações
    })
    .catch(error => console.error('Erro ao salvar a pontuação:', error));
}

// Exibe a lista de pontuações
function displayScores() {
    fetch('https://app-gestao-backend.vercel.app/auth/CscoresDR')
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro na resposta da rede.");
            }
            return response.json();
        })
        .then(data => {
            const scoresTableBody = document.getElementById("scores-table").querySelector("tbody");
            scoresTableBody.innerHTML = ""; // Limpa o conteúdo atual do tbody

            // Verifica se a resposta contém uma lista de pontuações
            if (Array.isArray(data.scores) && data.scores.length > 0) {
                data.scores.forEach(score => {
                    // Cria uma nova linha de tabela
                    const row = document.createElement("tr");

                    // Cria e insere as células de nome, nível e pontuação
                    const nameCell = document.createElement("td");
                    nameCell.textContent = score.nome;

                    const levelCell = document.createElement("td");
                    levelCell.textContent = score.level;

                    const scoreCell = document.createElement("td");
                    scoreCell.textContent = score.score;

                    // Adiciona as células à linha
                    row.appendChild(nameCell);
                    row.appendChild(levelCell);
                    row.appendChild(scoreCell);

                    // Adiciona a linha ao corpo da tabela
                    scoresTableBody.appendChild(row);
                });
            } else {
                console.error("Nenhuma pontuação disponível:", data);
                scoresTableBody.innerHTML = "<tr><td colspan='3'>Nenhuma pontuação encontrada.</td></tr>";
            }
        })
        .catch(error => console.error('Erro ao carregar as pontuações:', error));
}

// Chama a função para carregar as pontuações quando a página carregar
window.addEventListener('load', displayScores);


// Função de término de jogo
function gameOver() {
    clearInterval(state.values.timeid);
    alert(`Game Over! Você chegou no level: ${state.values.level} com pontuação de ${state.values.result} pontos`);

    // Solicita o nome do jogador
    const playerName = prompt("Digite seu nome para salvar sua pontuação:");
    if (playerName) {
        saveScore(playerName, state.values.level, state.values.result);
    }

    // Reseta o estado do jogo
    state.values.lives = 3;
    state.values.curretTime = 30;
    state.values.level = 1;
    state.values.result = 0;
    state.values.contErros = 0;

    state.view.lives.textContent = state.values.lives;
    state.view.timeLeft.textContent = state.values.curretTime;
    state.view.score.textContent = state.values.result;
    state.view.level.textContent = state.values.level;

    moveEnemy(); // Reinicia o movimento do inimigo
}

// Inicialização do jogo
function init() {
    state.view.timeLeft.textContent = state.values.curretTime;
    state.view.lives.textContent = state.values.lives;
    state.view.score.textContent = state.values.result;
    state.view.level.textContent = state.values.level;
    displayScores();
    moveEnemy();
    addListenerHitBox();
    setInterval(countDown, 1000);
}

document.addEventListener("DOMContentLoaded", init);
