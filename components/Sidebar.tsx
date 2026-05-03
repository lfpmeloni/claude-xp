'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const GAMES = [
  { name: 'Soeg', href: '/games/soeg' },
  { name: 'Tic-Tac-Toe', href: '/games/tictactoe' },
];

export default function Sidebar() {
  const [gamesOpen, setGamesOpen] = useState(true);
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-gray-900 border-r border-gray-800 flex flex-col z-10">
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="text-white font-bold text-sm">claude-xp</div>
        <div className="text-gray-600 text-xs mt-0.5">experiments</div>
      </div>

      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {/* Games group */}
        <div>
          <button
            onClick={() => setGamesOpen(!gamesOpen)}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-gray-200 rounded-md hover:bg-gray-800 transition-colors text-xs font-medium tracking-wider uppercase"
          >
            <span className="text-gray-600">{gamesOpen ? '▾' : '▸'}</span>
            <span>Games</span>
          </button>

          {gamesOpen && (
            <div className="mt-1 ml-2 space-y-0.5">
              {GAMES.map((game) => (
                <Link
                  key={game.href}
                  href={game.href}
                  className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                    pathname === game.href
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {game.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
