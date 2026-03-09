import React, { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

type Point = { x: number; y: number };

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };
const MOVE_INTERVAL = 70; // ms per move

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);
  const lastMoveTimeRef = useRef(0);
  const requestRef = useRef<number>();

  // Keep refs in sync with state for the animation loop
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    lastMoveTimeRef.current = performance.now();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOverRef.current) return;

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault();
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          e.preventDefault();
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          e.preventDefault();
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          e.preventDefault();
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          e.preventDefault();
          setIsPaused((p) => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const gameLoop = useCallback((time: number) => {
    if (gameOverRef.current || isPausedRef.current) {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (time - lastMoveTimeRef.current >= MOVE_INTERVAL) {
      lastMoveTimeRef.current = time;

      const currentSnake = snakeRef.current;
      const head = currentSnake[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      // Check collision with walls
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return;
      }

      // Check collision with self
      if (currentSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return;
      }

      const newSnake = [newHead, ...currentSnake];

      // Check food collision
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore((s) => {
          const newScore = s + 10;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [generateFood, highScore]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid lines (glitchy/raw)
    ctx.strokeStyle = '#00FFFF';
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Draw food (Magenta block)
    ctx.fillStyle = '#FF00FF';
    // Random glitch offset for food
    const glitchX = Math.random() > 0.9 ? (Math.random() * 4 - 2) : 0;
    ctx.fillRect(
      food.x * CELL_SIZE + 2 + glitchX,
      food.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4
    );

    // Draw snake (Cyan blocks)
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#FFFFFF' : '#00FFFF';
      
      // Glitch effect on snake body occasionally
      const sGlitchX = Math.random() > 0.95 ? (Math.random() * 6 - 3) : 0;
      
      ctx.fillRect(
        segment.x * CELL_SIZE + 1 + sGlitchX,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });
  }, [snake, food]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[500px]">
      {/* Score Board */}
      <div className="flex items-center justify-between w-full px-6 py-4 bg-black border-4 border-[#00FFFF] relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#FF00FF]"></div>
        <div className="flex flex-col pl-4">
          <span className="text-[#FF00FF] text-lg uppercase tracking-widest mb-1">{'>'} DATA_HARVESTED</span>
          <span 
            className="text-[#00FFFF] text-6xl glitch-effect"
            data-text={score.toString().padStart(4, '0')}
          >
            {score.toString().padStart(4, '0')}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[#FF00FF] text-lg uppercase tracking-widest mb-1">{'>'} MAX_CORRUPTION</span>
          <span 
            className="text-[#00FFFF] text-4xl"
          >
            {highScore.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative p-2 border-4 border-[#FF00FF] bg-black">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-black"
        />

        {/* Overlays */}
        {(gameOver || isPaused) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90">
            <div className="text-center flex flex-col items-center gap-6 border-2 border-[#00FFFF] p-8 bg-black">
              <h2 
                className="text-5xl font-black text-[#FF00FF] uppercase tracking-widest glitch-effect"
                data-text={gameOver ? 'SYSTEM_FAILURE' : 'EXECUTION_PAUSED'}
              >
                {gameOver ? 'SYSTEM_FAILURE' : 'EXECUTION_PAUSED'}
              </h2>
              {gameOver && (
                <p className="text-[#00FFFF] text-2xl">{'>'} FINAL_HARVEST: {score}</p>
              )}
              <button
                onClick={gameOver ? resetGame : () => setIsPaused(false)}
                className="mt-4 px-8 py-4 bg-black border-4 border-[#00FFFF] text-[#00FFFF] text-2xl uppercase tracking-widest hover:bg-[#00FFFF] hover:text-black transition-none"
              >
                {gameOver ? '> REBOOT_SYS' : '> RESUME_EXEC'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls Hint */}
      <div className="text-[#FF00FF] text-xl flex gap-8 border-b-2 border-[#00FFFF] pb-2">
        <span>{'>'} INPUT: [W,A,S,D] / [ARROWS]</span>
        <span>{'>'} HALT: [SPACE]</span>
      </div>
    </div>
  );
}
