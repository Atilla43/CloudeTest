// Game Engine - Snake Game with Advanced Features

class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Game settings
        this.gridSize = 20;
        this.tileCount = 30;
        this.canvasSize = this.gridSize * this.tileCount;

        // Set canvas size
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;

        // Game state
        this.snake = [];
        this.food = { x: 0, y: 0 };
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 100;
        this.level = 1;
        this.lastUpdateTime = 0;

        // Visual effects
        this.particles = [];
        this.foodGlow = 0;
        this.glowDirection = 1;

        // Initialize
        this.initSnake();
        this.spawnFood();
        this.setupEventListeners();
        this.updateUI();
    }

    initSnake() {
        this.snake = [
            { x: 15, y: 15 },
            { x: 14, y: 15 },
            { x: 13, y: 15 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && !this.gameRunning) {
                this.startGame();
                return;
            }

            if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                this.togglePause();
                return;
            }

            if (!this.gameRunning || this.gamePaused) return;

            const keyMap = {
                'ArrowUp': { x: 0, y: -1 },
                'ArrowDown': { x: 0, y: 1 },
                'ArrowLeft': { x: -1, y: 0 },
                'ArrowRight': { x: 1, y: 0 },
                'w': { x: 0, y: -1 },
                'W': { x: 0, y: -1 },
                's': { x: 0, y: 1 },
                'S': { x: 0, y: 1 },
                'a': { x: -1, y: 0 },
                'A': { x: -1, y: 0 },
                'd': { x: 1, y: 0 },
                'D': { x: 1, y: 0 }
            };

            if (keyMap[e.key]) {
                e.preventDefault();
                this.changeDirection(keyMap[e.key]);
            }
        });

        // Touch/Swipe controls
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchend', (e) => {
            if (!this.gameRunning || this.gamePaused) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                this.changeDirection(deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
            } else {
                // Vertical swipe
                this.changeDirection(deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
            }
        });

        // Mobile button controls
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.gameRunning || this.gamePaused) return;

                const directions = {
                    'up': { x: 0, y: -1 },
                    'down': { x: 0, y: 1 },
                    'left': { x: -1, y: 0 },
                    'right': { x: 1, y: 0 }
                };

                const direction = btn.dataset.direction;
                if (directions[direction]) {
                    this.changeDirection(directions[direction]);
                }
            });
        });

        // Start button
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
    }

    changeDirection(newDirection) {
        // Prevent moving in opposite direction
        if (newDirection.x === -this.direction.x && newDirection.y === -this.direction.y) {
            return;
        }
        this.nextDirection = newDirection;
    }

    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.gameSpeed = 100;
        this.initSnake();
        this.spawnFood();
        this.hideOverlay();
        this.updateUI();
        this.gameLoop();
    }

    togglePause() {
        if (!this.gameRunning) return;

        this.gamePaused = !this.gamePaused;

        if (this.gamePaused) {
            this.showOverlay('⏸️ Game Paused', 'Press P or ESC to resume');
        } else {
            this.hideOverlay();
            this.gameLoop();
        }
    }

    gameLoop(currentTime = 0) {
        if (!this.gameRunning || this.gamePaused) return;

        const deltaTime = currentTime - this.lastUpdateTime;

        if (deltaTime >= this.gameSpeed) {
            this.update();
            this.lastUpdateTime = currentTime;
        }

        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update() {
        // Update direction
        this.direction = { ...this.nextDirection };

        // Move snake
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount ||
            head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }

        // Add new head
        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        } else {
            // Remove tail
            this.snake.pop();
        }
    }

    eatFood() {
        // Increase score
        const basePoints = 10;
        const levelBonus = (this.level - 1) * 5;
        const lengthBonus = Math.floor(this.snake.length / 5) * 2;
        const points = basePoints + levelBonus + lengthBonus;

        this.score += points;

        // Create particles
        this.createParticles(this.food.x, this.food.y);

        // Play sound
        this.playSound('eat');

        // Level up every 100 points
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.gameSpeed = Math.max(50, this.gameSpeed - 5);
            this.playSound('levelup');
        }

        // Spawn new food
        this.spawnFood();

        // Update UI
        this.updateUI();

        // Animate score
        this.animateScore();
    }

    spawnFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment =>
            segment.x === this.food.x && segment.y === this.food.y
        ));
    }

    createParticles(x, y) {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            this.particles.push({
                x: x * this.gridSize + this.gridSize / 2,
                y: y * this.gridSize + this.gridSize / 2,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                life: 30,
                maxLife: 30
            });
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

        // Draw grid
        this.drawGrid();

        // Draw food with glow effect
        this.drawFood();

        // Draw snake
        this.drawSnake();

        // Draw particles
        this.drawParticles();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvasSize);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvasSize, i * this.gridSize);
            this.ctx.stroke();
        }
    }

    drawFood() {
        // Animated glow
        this.foodGlow += this.glowDirection * 0.05;
        if (this.foodGlow >= 1 || this.foodGlow <= 0) {
            this.glowDirection *= -1;
        }

        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;

        // Outer glow
        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize / 2,
            y + this.gridSize / 2,
            0,
            x + this.gridSize / 2,
            y + this.gridSize / 2,
            this.gridSize
        );
        gradient.addColorStop(0, `rgba(255, 100, 100, ${0.3 + this.foodGlow * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 100, 100, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - this.gridSize / 2, y - this.gridSize / 2,
                         this.gridSize * 2, this.gridSize * 2);

        // Food circle
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize / 2,
            y + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;

            // Gradient from head to tail
            const opacity = 1 - (index / this.snake.length) * 0.5;

            if (index === 0) {
                // Head - special styling
                const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
                gradient.addColorStop(0, '#4facfe');
                gradient.addColorStop(1, '#00f2fe');

                this.ctx.fillStyle = gradient;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#00f2fe';
            } else {
                // Body
                const hue = 200 - (index / this.snake.length) * 50;
                this.ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${opacity})`;
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.5)`;
            }

            this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            this.ctx.shadowBlur = 0;

            // Add shine effect
            if (index === 0) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.fillRect(x + 2, y + 2, this.gridSize / 2, this.gridSize / 3);
            }
        });
    }

    drawParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;

            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);

            return particle.life > 0;
        });
    }

    gameOver() {
        this.gameRunning = false;
        this.playSound('gameover');

        // Save high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        // Save game record
        this.saveGameRecord();

        // Show game over screen
        this.showOverlay(
            '💀 Game Over!',
            `Final Score: ${this.score}<br>High Score: ${this.highScore}<br><br>Press SPACE or tap to restart`
        );
    }

    showOverlay(title, message) {
        const overlay = document.getElementById('gameOverlay');
        const overlayTitle = document.getElementById('overlayTitle');
        const overlayMessage = document.getElementById('overlayMessage');

        overlayTitle.textContent = title;
        overlayMessage.innerHTML = message;
        overlay.classList.remove('hidden');
    }

    hideOverlay() {
        const overlay = document.getElementById('gameOverlay');
        overlay.classList.add('hidden');
    }

    updateUI() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('snakeLength').textContent = this.snake.length;
        document.getElementById('gameLevel').textContent = this.level;
    }

    animateScore() {
        const scoreElement = document.getElementById('currentScore');
        scoreElement.classList.remove('animate');
        void scoreElement.offsetWidth; // Trigger reflow
        scoreElement.classList.add('animate');
    }

    playSound(type) {
        const soundElement = document.getElementById(`${type}Sound`);
        if (soundElement && soundElement.src) {
            soundElement.currentTime = 0;
            soundElement.play().catch(() => {});
        }
    }

    loadHighScore() {
        return parseInt(localStorage.getItem('snakeHighScore')) || 0;
    }

    saveHighScore() {
        localStorage.setItem('snakeHighScore', this.highScore.toString());
    }

    saveGameRecord() {
        const records = JSON.parse(localStorage.getItem('snakeRecords') || '[]');

        records.push({
            score: this.score,
            length: this.snake.length,
            level: this.level,
            date: new Date().toISOString(),
            wallet: window.walletAddress || 'Not connected'
        });

        // Keep only top 10 records
        records.sort((a, b) => b.score - a.score);
        const topRecords = records.slice(0, 10);

        localStorage.setItem('snakeRecords', JSON.stringify(topRecords));

        // Update leaderboard display
        window.updateLeaderboard();
    }
}

// Initialize game when DOM is ready
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new SnakeGame();
});
