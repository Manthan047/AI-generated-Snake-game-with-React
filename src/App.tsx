/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-[#00FFFF] font-digital selection:bg-[#FF00FF] selection:text-black overflow-hidden relative">
      {/* Background Effects */}
      <div className="bg-static"></div>
      <div className="scanlines"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen screen-tear">
        {/* Header */}
        <header className="text-center mb-12 border-b-4 border-[#FF00FF] pb-4">
          <h1 
            className="text-6xl md:text-8xl font-black tracking-tighter text-[#00FFFF] glitch-effect uppercase" 
            data-text="SYS.FAIL // SNAKE.EXE"
          >
            SYS.FAIL // SNAKE.EXE
          </h1>
          <p className="text-[#FF00FF] font-digital tracking-widest uppercase text-xl mt-2 animate-pulse">
            {'>'} WARNING: MEMORY CORRUPTION DETECTED
          </p>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-24">
          {/* Game Area */}
          <div className="flex-1 flex justify-center w-full">
            <SnakeGame />
          </div>

          {/* Music Player Area */}
          <div className="w-full xl:w-auto flex justify-center xl:justify-end">
            <MusicPlayer />
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-[#FF00FF] font-digital text-lg uppercase tracking-widest border-t-2 border-[#00FFFF] pt-4">
          <p>{'>'} END_OF_LINE_ // TERMINAL_ID: 0x8F9A</p>
        </footer>
      </div>
    </div>
  );
}


