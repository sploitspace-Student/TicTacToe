"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { span } from "framer-motion/client";

type Player = "X" | "O";
type Cell = Player | null;
type Mode = "pvp" | "bot";

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board: Cell[]): Player | null {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function getWinningLine(board: Cell[]): number[] | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }
  return null;
}

const CELL = 96;
const GAP = 8;
function center(index: number) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return {
    x: col * (CELL + GAP) + CELL / 2,
    y: row * (CELL + GAP) + CELL / 2,
  };
}

function minimax(board: Cell[], turn: Player, bot: Player): number {
  const winner = getWinner(board);
  if (winner === bot) return 1;
  if (winner) return -1;
  if (board.every((c) => c !== null)) return 0;

  const human: Player = bot === "X" ? "O" : "X";
  const nextTurn: Player = turn === bot ? human : bot;
  const scores: number[] = [];

  board.forEach((cell, i) => {
    if (cell === null) {
      const next = [...board];
      next[i] = turn;
      scores.push(minimax(next, nextTurn, bot));
    }
  });

  return turn === bot ? Math.max(...scores) : Math.min(...scores);
}

function bestMove(board: Cell[], bot: Player): number {
  const human: Player = bot === "X" ? "O" : "X";
  let bestScore = -Infinity;
  let move = -1;

  board.forEach((cell, i) => {
    if (cell === null) {
      const next = [...board];
      next[i] = bot;
      const score = minimax(next, human, bot);
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  });

  return move;
}

export default function Home() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [current, setCurrent] = useState<Player>("X");
  const [mode, setMode] = useState<Mode | null>(null);
  const [humanMark, setHumanMark] = useState<Player | null>(null);
  const [scores, setScores] = useState({ X: 0, Draw: 0, O: 0 });
  const [counted, setCounted] = useState(false);

  const botMark: Player | null =
    humanMark === null ? null : humanMark === "X" ? "O" : "X";
  const winner = getWinner(board);
  const isDraw = !winner && board.every((c) => c !== null);
  const gameOver = winner !== null || isDraw;
  const winningLine = getWinningLine(board);

  useEffect(() => {
    if (mode !== "bot" || !botMark || current !== botMark || gameOver) return;

    const timer = setTimeout(() => {
      const move = bestMove(board, botMark);
      const newBoard = [...board];
      newBoard[move] = botMark;
      setBoard(newBoard);
      setCurrent(botMark === "X" ? "O" : "X");
    }, 400);

    return () => clearTimeout(timer);
  }, [board, current, mode, botMark, gameOver]);

  function handleClick(index: number) {
    if (!mode) return;
    if (mode === "bot" && !humanMark) return;
    if (gameOver || board[index] !== null) return;
    if (mode === "bot" && current === botMark) return;

    const newBoard = [...board];
    newBoard[index] = current;
    setBoard(newBoard);
    setCurrent(current === "X" ? "O" : "X");
  }

  useEffect(() => {
    if (!gameOver || counted) return;

    setScores((prev) =>
      winner
        ? { ...prev, [winner]: prev[winner] + 1 }
        : { ...prev, Draw: prev.Draw + 1 },
    );
    setCounted(true);
  }, [gameOver, counted, winner]);

  function newGame() {
    setBoard(Array(9).fill(null));
    setCurrent("X");
    setMode(null);
    setHumanMark(null);
    setCounted(false);
  }

  function resetAll() {
    setBoard(Array(9).fill(null));
    setCurrent("X");
    setMode(null);
    setHumanMark(null);
    setCounted(false);
    setScores({ X: 0, Draw: 0, O: 0 });
  }

  let status = `Turn: ${current}`;
  if (winner) status = `Winner: ${winner}`;
  else if (isDraw) status = "It's a draw!";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 text-white">
      <h1 className="text-3xl font-bold">Tic-Tac-Toe</h1>

      {mode === null && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg">Choose game mode:</p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode("pvp")}
              className="rounded-lg border-2 border-gray-400 px-5 py-2 font-bold"
            >
              2 Players
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode("bot")}
              className="rounded-lg border-2 border-gray-400 px-5 py-2 font-bold"
            >
              Vs Bot
            </motion.button>
          </div>
        </div>
      )}

      {mode === "bot" && humanMark === null && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg">Choose your mark (X goes first):</p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setHumanMark("X")}
              className="rounded-lg border-2 border-gray-400 px-6 py-2 text-2xl font-bold"
            >
              X
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setHumanMark("O")}
              className="rounded-lg border-2 border-gray-400 px-6 py-2 text-2xl font-bold"
            >
              O
            </motion.button>
          </div>
        </div>
      )}

      {mode !== null && (mode === "pvp" || humanMark !== null) && (
        <AnimatePresence mode="wait">
          <motion.p
            key={status}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="text-lg"
          >
            {status}
          </motion.p>
        </AnimatePresence>
      )}

      <div className="relative">
        <div className="grid grid-cols-3 gap-2">
          {board.map((cell, index) => (
            <motion.button
              key={index}
              onClick={() => handleClick(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={
                winningLine?.includes(index)
                  ? { scale: [1, 1.12, 1, 1.12, 1] }
                  : { scale: 1 }
              }
              transition={{
                duration: 0.6,
                delay: winningLine?.includes(index) ? 0.4 : 0,
              }}
              className={`flex h-24 w-24 items-center justify-center rounded-lg border-2 text-4xl font-bold ${
                winningLine?.includes(index)
                  ? "border-red-500 text-red-400"
                  : "border-gray-400 text-white"
              }`}
            >
              {cell && (
                <motion.span
                  initial={{ scale: 0, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {cell}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>

        {winningLine && (
          <svg
            className="pointer-events-none absolute inset-0"
            width={304}
            height={304}
            viewBox="0 0 304 304"
          >
            <motion.line
              x1={center(winningLine[0]).x}
              y1={center(winningLine[0]).y}
              x2={center(winningLine[2]).x}
              y2={center(winningLine[2]).y}
              stroke="#ef4444"
              strokeWidth="8"
              strokeLinecap="round"
              pathLength="1"
              className="win-line"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </svg>
        )}
      </div>
      <div className="flex gap-4 text-center mt-5">
        <div className="w-24 rounded-lg border-2 border-gray-400 px-3 py-2">
          <p className="text-sm">X Score</p>
          <p className="text-2xl font-bold">{scores.X}</p>
        </div>
        <div className="w-24 rounded-lg border-2 border-gray-400 px-3 py-2">
          <p className="text-sm">Draw</p>
          <p className="text-2xl font-bold">{scores.Draw}</p>
        </div>
        <div className="w-24 rounded-lg border-2 border-gray-400 px-3 py-2">
          <p className="text-sm">O Score</p>
          <p className="text-2xl font-bold">{scores.O}</p>
        </div>
      </div>

      <div className="flex flex-row items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={newGame}
          className="rounded-lg bg-white px-5 py-2 font-bold text-black"
        >
          New Game
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetAll}
          className="rounded-lg bg-black border border-white px-5 py-2 font-bold text-white"
        >
          Reset All
        </motion.button>
      </div>

      <div className="flex text-center">
        <p className="text-sm text-gray-700">
          Built with React 19, next.JS, and tailwindCSS
        </p>
      </div>
    </main>
  );
}
