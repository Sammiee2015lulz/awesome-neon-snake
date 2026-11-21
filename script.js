const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const gameOverDiv = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let gameRunning = false;

highScoreElement.textContent = highScore;

function initGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    generateFood();
    gameRunning = true;
    gameOverDiv.classList.add('hidden');
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 100);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // Avoid spawning on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

function update() {
    if (!gameRunning) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Self collision
    for (let segment of snake) {
        if (segment.x === head.x && segment.y === head.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        generateFood();
        // Speed up slightly
        clearInterval(gameLoop);
        const speed = Math.max(50, 100 - Math.floor(score / 50) * 5);
        gameLoop = setInterval(update, speed);
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    // Clear canvas with dark background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake with neon gradient
    snake.forEach((segment, index) => {
        const alpha = 1 - (index / snake.length) * 0.5;
        ctx.fillStyle = `rgba(0, 255, 159, ${alpha})`;
        ctx.shadowColor = '#00ff9f';
        ctx.shadowBlur = 10;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
    ctx.shadowBlur = 0;

    // Draw food (neon pink)
    ctx.fillStyle = '#ff0066';
    ctx.shadowColor = '#ff0066';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverDiv.classList.remove('hidden');
}

function restartGame() {
    initGame();
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

restartBtn.addEventListener('click', restartGame);

// Start game
initGame();