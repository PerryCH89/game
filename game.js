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
const OBSTACLE_HEIGHT = 30;

// Game state
const gameState = {
    lives: 3,
    score: 0,
    bonusPoints: 0,
    isGameOver: false,
    message: '',
    messageTimer: 0,
    startTime: null,
    completionTime: 0,
    hasStartedMoving: false,
    highScore: parseInt(localStorage.getItem('froggerHighScore')) || 0
};

// Update high score
function updateHighScore(totalScore) {
    if (totalScore > gameState.highScore) {
        gameState.highScore = totalScore;
        localStorage.setItem('froggerHighScore', totalScore);
        return true;
    }
    return false;
}

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
        width: 80, height: OBSTACLE_HEIGHT,
        speed: -0.2, color: '#FF0000'
    },
    {
        x: 300, y: safeZone.y + GRID_SIZE,
        width: 80, height: OBSTACLE_HEIGHT,
        speed: -0.2, color: '#FF0000'
    },
    // Row 2: Medium left-to-right
    {
        x: 0, y: safeZone.y + GRID_SIZE * 2,
        width: 100, height: OBSTACLE_HEIGHT,
        speed: 0.3, color: '#0000FF'
    },
    {
        x: 400, y: safeZone.y + GRID_SIZE * 2,
        width: 100, height: OBSTACLE_HEIGHT,
        speed: 0.3, color: '#0000FF'
    },
    // Row 3: Medium right-to-left
    {
        x: 0, y: safeZone.y + GRID_SIZE * 3,
        width: 120, height: OBSTACLE_HEIGHT,
        speed: -0.4, color: '#800080'
    },
    {
        x: 200, y: safeZone.y + GRID_SIZE * 3,
        width: 120, height: OBSTACLE_HEIGHT,
        speed: -0.4, color: '#800080'
    },
    {
        x: 400, y: safeZone.y + GRID_SIZE * 3,
        width: 120, height: OBSTACLE_HEIGHT,
        speed: -0.4, color: '#800080'
    },
    // Row 4: Fast left-to-right
    {
        x: 0, y: safeZone.y + GRID_SIZE * 4,
        width: 70, height: OBSTACLE_HEIGHT,
        speed: 0.5, color: '#FFA500'
    },
    {
        x: 250, y: safeZone.y + GRID_SIZE * 4,
        width: 70, height: OBSTACLE_HEIGHT,
        speed: 0.5, color: '#FFA500'
    },
    {
        x: 500, y: safeZone.y + GRID_SIZE * 4,
        width: 70, height: OBSTACLE_HEIGHT,
        speed: 0.5, color: '#FFA500'
    },
    // Row 5: Medium right-to-left
    {
        x: 0, y: safeZone.y + GRID_SIZE * 5,
        width: 90, height: OBSTACLE_HEIGHT,
        speed: -0.3, color: '#FFD700'
    },
    {
        x: 350, y: safeZone.y + GRID_SIZE * 5,
        width: 90, height: OBSTACLE_HEIGHT,
        speed: -0.3, color: '#FFD700'
    },

    // Second set of obstacles (above safe zone)
    // Row 6: Slow right-to-left
    {
        x: 0, y: safeZone.y - GRID_SIZE,
        width: 80, height: OBSTACLE_HEIGHT,
        speed: -0.2, color: '#00FFFF'
    },
    {
        x: 300, y: safeZone.y - GRID_SIZE,
        width: 80, height: OBSTACLE_HEIGHT,
        speed: -0.2, color: '#00FFFF'
    },
    // Row 7: Medium left-to-right
    {
        x: 0, y: safeZone.y - GRID_SIZE * 2,
        width: 100, height: OBSTACLE_HEIGHT,
        speed: 0.3, color: '#FF00FF'
    },
    {
        x: 400, y: safeZone.y - GRID_SIZE * 2,
        width: 100, height: OBSTACLE_HEIGHT,
        speed: 0.3, color: '#FF00FF'
    },
    // Row 8: Medium right-to-left
    {
        x: 0, y: safeZone.y - GRID_SIZE * 3,
        width: 120, height: OBSTACLE_HEIGHT,
        speed: -0.4, color: '#32CD32'
    },
    {
        x: 200, y: safeZone.y - GRID_SIZE * 3,
        width: 120, height: OBSTACLE_HEIGHT,
        speed: -0.4, color: '#32CD32'
    },
    {
        x: 400, y: safeZone.y - GRID_SIZE * 3,
        width: 120, height: OBSTACLE_HEIGHT,
        speed: -0.4, color: '#32CD32'
    },
    // Row 9: Fast left-to-right
    {
        x: 0, y: safeZone.y - GRID_SIZE * 4,
        width: 70, height: OBSTACLE_HEIGHT,
        speed: 0.5, color: '#8B4513'
    },
    {
        x: 250, y: safeZone.y - GRID_SIZE * 4,
        width: 70, height: OBSTACLE_HEIGHT,
        speed: 0.5, color: '#8B4513'
    },
    {
        x: 500, y: safeZone.y - GRID_SIZE * 4,
        width: 70, height: OBSTACLE_HEIGHT,
        speed: 0.5, color: '#8B4513'
    },
    // Row 10: Medium right-to-left
    {
        x: 0, y: safeZone.y - GRID_SIZE * 5,
        width: 90, height: OBSTACLE_HEIGHT,
        speed: -0.3, color: '#C0C0C0'
    },
    {
        x: 350, y: safeZone.y - GRID_SIZE * 5,
        width: 90, height: OBSTACLE_HEIGHT,
        speed: -0.3, color: '#C0C0C0'
    }
];

// Calculate time bonus based on completion time
function calculateTimeBonus(completionTime) {
    if (completionTime <= 5) return 10;
    if (completionTime <= 10) return 5;
    if (completionTime <= 15) return 3;
    return 0;
}

// Format time for display
function formatTime(seconds) {
    return seconds.toFixed(1);
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    if (gameState.isGameOver) {
        if (e.code === 'Space') {
            resetGame();
            return;
        }
        return;
    }
    
    // Start timer on first movement
    if (!gameState.hasStartedMoving) {
        gameState.startTime = Date.now();
        gameState.hasStartedMoving = true;
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
    // Reset timer when returning to start
    if (!gameState.isGameOver) {
        gameState.startTime = null;
        gameState.hasStartedMoving = false;
    }
}

// Reset entire game
function resetGame() {
    gameState.lives = 3;
    gameState.score = 0;
    gameState.bonusPoints = 0;
    gameState.isGameOver = false;
    gameState.message = '';
    gameState.startTime = null;
    gameState.completionTime = 0;
    gameState.hasStartedMoving = false;
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

// Draw finish line with pixel pattern
function drawFinishLine() {
    const patternSize = 10;
    for (let x = 0; x < canvas.width; x += patternSize) {
        for (let y = finishLine.y; y < finishLine.y + finishLine.height; y += patternSize) {
            if ((x + y) % (patternSize * 2) === 0) {
                ctx.fillStyle = '#90EE90';
            } else {
                ctx.fillStyle = '#70CF70';
            }
            ctx.fillRect(x, y, patternSize, patternSize);
        }
    }
}

// Draw safe zone with pixel pattern
function drawSafeZone() {
    const patternSize = 10;
    for (let x = 0; x < canvas.width; x += patternSize) {
        for (let y = safeZone.y; y < safeZone.y + safeZone.height; y += patternSize) {
            if ((x + y) % (patternSize * 2) === 0) {
                ctx.fillStyle = '#90EE90';
            } else {
                ctx.fillStyle = '#70CF70';
            }
            ctx.fillRect(x, y, patternSize, patternSize);
        }
    }
}

// Draw status
function drawStatus() {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px "Press Start 2P"';
    
    // Draw lives and scores
    ctx.textAlign = 'left';
    // Draw lives on the left
    ctx.fillText(`Lives: ${'♥'.repeat(gameState.lives)}`, 10, 30);
    
    const totalScore = gameState.score + gameState.bonusPoints;
    
    // Draw timer at the top if game is active
    if (gameState.hasStartedMoving && !gameState.isGameOver) {
        ctx.textAlign = 'center';
        const currentTime = (Date.now() - gameState.startTime) / 1000;
        ctx.fillText(`Time: ${formatTime(currentTime)}s`, canvas.width / 2, 30);
    }
    
    // Draw score and high score on separate lines on the right
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${totalScore}`, canvas.width - 10, 30);
    ctx.fillText(`High Score: ${gameState.highScore}`, canvas.width - 10, 60);
    
    // Draw messages
    if (gameState.message && gameState.messageTimer > 0) {
        ctx.textAlign = 'center';
        ctx.fillText(gameState.message, canvas.width / 2, canvas.height / 2);
        gameState.messageTimer--;
    }
    
    // Draw game over screen
    if (gameState.isGameOver) {
        const totalScore = gameState.score + gameState.bonusPoints;
        const isNewHighScore = updateHighScore(totalScore);
        
        ctx.textAlign = 'center';
        ctx.font = '32px "Press Start 2P"';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60);
        
        if (isNewHighScore) {
            ctx.fillStyle = '#FFD700'; // Gold color for new high score
            ctx.fillText('NEW HIGH SCORE!', canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = '#FFFFFF'; // Reset to white
        }
        
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText(`Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 60);
        ctx.fillText(`Bonus Points: ${gameState.bonusPoints}`, canvas.width / 2, canvas.height / 2 + 90);
        ctx.fillText(`Total Score: ${totalScore}`, canvas.width / 2, canvas.height / 2 + 120);
        ctx.fillText(`High Score: ${gameState.highScore}`, canvas.width / 2, canvas.height / 2 + 150);
        ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 190);
    }
}

// Function to draw vehicles (8-bit style)
function drawVehicle(vehicle) {
    const height = OBSTACLE_HEIGHT - 6; // Reduced height
    const whiteBlockSize = OBSTACLE_HEIGHT - 6; // Match reduced height
    const totalWidth = (OBSTACLE_HEIGHT - 6) * 3; // Three times height
    
    // Center vehicle in its allocated space
    const x = vehicle.x + (vehicle.width - totalWidth) / 2;
    const y = vehicle.y + (vehicle.height - height) / 2;

    const dotSize = 3; // Smaller details
    
    // Draw base vehicle body
    ctx.fillStyle = vehicle.color;
    ctx.fillRect(x, y, totalWidth, height);

    // Draw white block and details based on vehicle type
    switch(vehicle.color.toUpperCase()) {
        case '#FF0000': // Red car - middle block
            // White section
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + totalWidth/3, y, whiteBlockSize, height);
            // Headlights
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(x + dotSize, y + height/3, dotSize, dotSize);
            ctx.fillRect(x + dotSize, y + height*2/3, dotSize, dotSize);
            // Taillights
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(x + totalWidth - dotSize*2, y + height/3, dotSize, dotSize);
            ctx.fillRect(x + totalWidth - dotSize*2, y + height*2/3, dotSize, dotSize);
            break;

        case '#0000FF': // Blue truck
            // White cab section
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x, y, whiteBlockSize, height);
            // Cab-cargo separator
            ctx.fillStyle = '#0000AA';
            ctx.fillRect(x + whiteBlockSize, y, dotSize, height);
            // Headlights
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(x + dotSize, y + height/3, dotSize, dotSize);
            ctx.fillRect(x + dotSize, y + height*2/3, dotSize, dotSize);
            break;

        case '#800080': // Purple bus
            // White back section
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + totalWidth - whiteBlockSize, y, whiteBlockSize, height);
            // Windows
            ctx.fillStyle = '#FFFFFF';
            for(let wx = x + dotSize*3; wx < x + totalWidth - whiteBlockSize - dotSize*2; wx += dotSize*3) {
                ctx.fillRect(wx, y + height/3, dotSize*2, dotSize*2);
            }
            break;

        case '#FFA500': // Orange sports car
            // White middle section
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + totalWidth/3, y, whiteBlockSize, height);
            // Racing stripes
            ctx.fillStyle = '#000000';
            ctx.fillRect(x + dotSize*2, y, dotSize, height);
            ctx.fillRect(x + totalWidth - dotSize*3, y, dotSize, height);
            // Headlights
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(x + dotSize, y + height/3, dotSize, dotSize);
            break;

        case '#FFD700': // Yellow taxi
            // White front section with checker pattern
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x, y, whiteBlockSize, height);
            // Checker pattern
            ctx.fillStyle = '#000000';
            for(let cx = 0; cx < 3; cx++) {
                for(let cy = 0; cy < 3; cy++) {
                    if((cx + cy) % 2 === 0) {
                        ctx.fillRect(x + cx*dotSize*2, y + cy*dotSize*2, dotSize*2, dotSize*2);
                    }
                }
            }
            // Roof light
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(x + whiteBlockSize/2 - dotSize/2, y - dotSize, dotSize, dotSize);
            break;

        case '#00FFFF': // Cyan police car
            // White back section
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + totalWidth - whiteBlockSize, y, whiteBlockSize, height);
            // Side stripe
            ctx.fillStyle = '#0000FF';
            ctx.fillRect(x, y + height/2 - dotSize/2, totalWidth - whiteBlockSize, dotSize);
            // Light bar
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(x + totalWidth/2 - dotSize*2, y - dotSize, dotSize, dotSize);
            ctx.fillStyle = '#0000FF';
            ctx.fillRect(x + totalWidth/2 + dotSize, y - dotSize, dotSize, dotSize);
            break;

        default: // Generic vehicle
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + totalWidth/3, y, whiteBlockSize, height);
    }
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    const gridSize = 20;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw finish line and safe zone
    drawFinishLine();
    drawSafeZone();
    
    // Update and draw vehicles
    updateObstacles();
    obstacles.forEach(obstacle => {
        drawVehicle(obstacle);
    });
    
    // Draw frog (pixel art style)
    const pixelSize = 3;
    ctx.fillStyle = '#00ff00';
    
    // Body
    ctx.fillRect(frog.x + pixelSize*3, frog.y + pixelSize*3, pixelSize*4, pixelSize*4);
    
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(frog.x + pixelSize*2, frog.y + pixelSize*2, pixelSize*2, pixelSize*2);
    ctx.fillRect(frog.x + pixelSize*6, frog.y + pixelSize*2, pixelSize*2, pixelSize*2);
    
    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(frog.x + pixelSize*2, frog.y + pixelSize*2, pixelSize, pixelSize);
    ctx.fillRect(frog.x + pixelSize*6, frog.y + pixelSize*2, pixelSize, pixelSize);
    
    // Legs
    ctx.fillStyle = '#00cc00';
    // Front legs
    ctx.fillRect(frog.x + pixelSize*2, frog.y + pixelSize*6, pixelSize*2, pixelSize*2);
    ctx.fillRect(frog.x + pixelSize*6, frog.y + pixelSize*6, pixelSize*2, pixelSize*2);
    // Back legs
    ctx.fillRect(frog.x + pixelSize*1, frog.y + pixelSize*4, pixelSize*2, pixelSize*2);
    ctx.fillRect(frog.x + pixelSize*7, frog.y + pixelSize*4, pixelSize*2, pixelSize*2);
    
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
        // Calculate completion time and bonus
        if (gameState.startTime) {
            gameState.completionTime = (Date.now() - gameState.startTime) / 1000;
            const bonus = calculateTimeBonus(gameState.completionTime);
            gameState.bonusPoints += bonus;
            gameState.message = bonus > 0 ? `+10 Points! +${bonus} Time Bonus!` : '+10 Points!';
        } else {
            gameState.message = '+10 Points!';
        }
        
        gameState.score += 10;
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
