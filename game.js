// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get audio elements
const sounds = {
    hop: document.getElementById('hopSound'),
    hit: document.getElementById('hitSound'),
    point: document.getElementById('pointSound')
};

// Play sound with volume control
function playSound(sound, customVolume = 0.7) {
    try {
        sound.volume = customVolume;
        sound.currentTime = 0; // Reset sound to start
        const playPromise = sound.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Audio play error:', error);
            });
        }
    } catch (error) {
        console.log('Sound playback error:', error);
    }
}

// Initialize sounds and verify loading
sounds.hop.addEventListener('canplaythrough', () => console.log('Hop sound loaded'));
sounds.hit.addEventListener('canplaythrough', () => console.log('Hit sound loaded'));
sounds.point.addEventListener('canplaythrough', () => console.log('Point sound loaded'));

// Set canvas size
canvas.width = 600;
canvas.height = 600;

// Game properties
const GRID_SIZE = 30;
const OBSTACLE_HEIGHT = 20;

// Game state
const gameState = {
    lives: 3,
    score: 0,
    isGameOver: false,
    message: '',
    messageTimer: 0
};

// Frog properties
const frog = {
    x: canvas.width / 2,
    y: canvas.height - GRID_SIZE,
    size: GRID_SIZE,
    speed: GRID_SIZE
};

// Finish line properties
const finishLine = {
    y: GRID_SIZE,
    height: GRID_SIZE,
    color: '#90EE90'
};

// Safe zone properties
const safeZone = {
    y: canvas.height / 2,
    height: GRID_SIZE,
    color: '#90EE90'
};

// Initialize obstacles
const obstacles = [
    // First set of obstacles (bottom)
    // Row 1 (bottom): Slow right-to-left
    {
        x: 0, y: safeZone.y + GRID_SIZE,
        width: 60, height: OBSTACLE_HEIGHT,
        speed: -0.5, color: '#FF0000'
    },
    {
        x: 300, y: safeZone.y + GRID_SIZE,
        width: 60, height: OBSTACLE_HEIGHT,
        speed: -0.5, color: '#FF0000'
    },
    // Row 2: Medium left-to-right
    {
        x: 0, y: safeZone.y + GRID_SIZE * 2,
        width: 80, height: OBSTACLE_HEIGHT,
        speed: 0.75, color: '#0000FF'
    },
    {
        x: 400, y: safeZone.y + GRID_SIZE * 2,
        width: 80, height: OBSTACLE_HEIGHT,
        speed: 0.75, color: '#0000FF'
    },
    // Row 3: Medium right-to-left
    {
        x: 0, y: safeZone.y + GRID_SIZE * 3,
        width: 40, height: OBSTACLE_HEIGHT,
        speed: -1, color: '#800080'
    },
    {
        x: 200, y: safeZone.y + GRID_SIZE * 3,
        width: 40, height: OBSTACLE_HEIGHT,
        speed: -1, color: '#800080'
    },
    {
        x: 400, y: safeZone.y + GRID_SIZE * 3,
        width: 40, height: OBSTACLE_HEIGHT,
        speed: -1, color: '#800080'
    },
    // Row 4: Fast left-to-right
    {
        x: 0, y: safeZone.y + GRID_SIZE * 4,
        width: 50, height: OBSTACLE_HEIGHT,
        speed: 1.25, color: '#FFA500'
    },
    {
        x: 250, y: safeZone.y + GRID_SIZE * 4,
        width: 50, height: OBSTACLE_HEIGHT,
        speed: 1.25, color: '#FFA500'
    },
    {
        x: 500, y: safeZone.y + GRID_SIZE * 4,
        width: 50, height: OBSTACLE_HEIGHT,
        speed: 1.25, color: '#FFA500'
    },
    // Row 5: Medium right-to-left
    {
        x: 0, y: safeZone.y + GRID_SIZE * 5,
        width: 70, height: OBSTACLE_HEIGHT,
        speed: -0.75, color: '#FFD700'
    },
    {
        x: 350, y: safeZone.y + GRID_SIZE * 5,
        width: 70, height: OBSTACLE_HEIGHT,
        speed: -0.75, color: '#FFD700'
    },

    // Second set of obstacles (above safe zone)
    // Row 6: Slow right-to-left
    {
        x: 0, y: safeZone.y - GRID_SIZE,
        width: 60, height: OBSTACLE_HEIGHT,
        speed: -0.5, color: '#00FFFF'
    },
    {
        x: 300, y: safeZone.y - GRID_SIZE,
        width: 60, height: OBSTACLE_HEIGHT,
        speed: -0.5, color: '#00FFFF'
    },
    // Row 7: Medium left-to-right
    {
        x: 0, y: safeZone.y - GRID_SIZE * 2,
        width: 80, height: OBSTACLE_HEIGHT,
        speed: 0.75, color: '#FF00FF'
    },
    {
        x: 400, y: safeZone.y - GRID_SIZE * 2,
        width: 80, height: OBSTACLE_HEIGHT,
        speed: 0.75, color: '#FF00FF'
    },
    // Row 8: Medium right-to-left
    {
        x: 0, y: safeZone.y - GRID_SIZE * 3,
        width: 40, height: OBSTACLE_HEIGHT,
        speed: -1, color: '#32CD32'
    },
    {
        x: 200, y: safeZone.y - GRID_SIZE * 3,
        width: 40, height: OBSTACLE_HEIGHT,
        speed: -1, color: '#32CD32'
    },
    {
        x: 400, y: safeZone.y - GRID_SIZE * 3,
        width: 40, height: OBSTACLE_HEIGHT,
        speed: -1, color: '#32CD32'
    },
    // Row 9: Fast left-to-right
    {
        x: 0, y: safeZone.y - GRID_SIZE * 4,
        width: 50, height: OBSTACLE_HEIGHT,
        speed: 1.25, color: '#8B4513'
    },
    {
        x: 250, y: safeZone.y - GRID_SIZE * 4,
        width: 50, height: OBSTACLE_HEIGHT,
        speed: 1.25, color: '#8B4513'
    },
    {
        x: 500, y: safeZone.y - GRID_SIZE * 4,
        width: 50, height: OBSTACLE_HEIGHT,
        speed: 1.25, color: '#8B4513'
    },
    // Row 10: Medium right-to-left
    {
        x: 0, y: safeZone.y - GRID_SIZE * 5,
        width: 70, height: OBSTACLE_HEIGHT,
        speed: -0.75, color: '#C0C0C0'
    },
    {
        x: 350, y: safeZone.y - GRID_SIZE * 5,
        width: 70, height: OBSTACLE_HEIGHT,
        speed: -0.75, color: '#C0C0C0'
    }
];

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    if (gameState.isGameOver) {
        if (e.code === 'Space') {
            resetGame();
            return;
        }
        return;
    }
    
    switch(e.key) {
        case 'ArrowUp':
            if (frog.y - frog.speed >= 0) {
                frog.y -= frog.speed;
                playSound(sounds.hop, 1.0); // Full volume for movement
            }
            break;
        case 'ArrowDown':
            if (frog.y + frog.speed + frog.size <= canvas.height) {
                frog.y += frog.speed;
                playSound(sounds.hop, 1.0); // Full volume for movement
            }
            break;
        case 'ArrowLeft':
            if (frog.x - frog.speed >= 0) {
                frog.x -= frog.speed;
                playSound(sounds.hop, 1.0); // Full volume for movement
            }
            break;
        case 'ArrowRight':
            if (frog.x + frog.speed + frog.size <= canvas.width) {
                frog.x += frog.speed;
                playSound(sounds.hop, 1.0); // Full volume for movement
            }
            break;
    }
});

// Check collision between frog and obstacle
function checkCollision(obstacle) {
    return frog.x < obstacle.x + obstacle.width &&
           frog.x + frog.size > obstacle.x &&
           frog.y < obstacle.y + obstacle.height &&
           frog.y + frog.size > obstacle.y;
}

// Reset frog position
function resetFrog() {
    frog.x = canvas.width / 2;
    frog.y = canvas.height - GRID_SIZE;
}

// Reset entire game
function resetGame() {
    gameState.lives = 3;
    gameState.score = 0;
    gameState.isGameOver = false;
    gameState.message = '';
    resetFrog();
}

// Update obstacle positions
function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x += obstacle.speed;
        
        // Wrap around screen
        if (obstacle.speed > 0 && obstacle.x > canvas.width) {
            obstacle.x = -obstacle.width;
        } else if (obstacle.speed < 0 && obstacle.x + obstacle.width < 0) {
            obstacle.x = canvas.width;
        }
    });
}

// Draw finish line
function drawFinishLine() {
    ctx.fillStyle = finishLine.color;
    ctx.fillRect(0, finishLine.y, canvas.width, finishLine.height);
}

// Draw safe zone
function drawSafeZone() {
    ctx.fillStyle = safeZone.color;
    ctx.fillRect(0, safeZone.y, canvas.width, safeZone.height);
}

// Draw status
function drawStatus() {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Lives: ${'♥'.repeat(gameState.lives)}`, 10, 25);
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${gameState.score}`, canvas.width - 10, 25);
    
    if (gameState.message && gameState.messageTimer > 0) {
        ctx.textAlign = 'center';
        ctx.fillText(gameState.message, canvas.width / 2, canvas.height / 2);
        gameState.messageTimer--;
    }
    
    if (gameState.isGameOver) {
        ctx.textAlign = 'center';
        ctx.font = '48px Arial';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 80);
    }
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw finish line and safe zone
    drawFinishLine();
    drawSafeZone();
    
    // Update and draw obstacles
    updateObstacles();
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
    // Draw frog
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(frog.x, frog.y, frog.size, frog.size);
    
    // Check for collisions
    if (!gameState.isGameOver) {
        for (let obstacle of obstacles) {
            if (checkCollision(obstacle)) {
                gameState.lives--;
                if (gameState.lives <= 0) {
                    gameState.isGameOver = true;
                } else {
                    gameState.message = 'Hit!';
                    gameState.messageTimer = 30;
                    playSound(sounds.hit, 0.7); // 70% volume for collision
                    resetFrog();
                }
                break;
            }
        }
    }
    
    // Check for win
    if (!gameState.isGameOver && frog.y <= finishLine.y + finishLine.height) {
        gameState.score++;
        gameState.message = 'Point!';
        gameState.messageTimer = 30;
        playSound(sounds.point, 0.7); // 70% volume for scoring
        resetFrog();
    }
    
    // Draw status
    drawStatus();
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Start game
resetGame();
gameLoop();
