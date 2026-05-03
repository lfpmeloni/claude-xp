import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-12">
      <h1 className="text-3xl font-bold text-white mb-2">claude-xp</h1>
      <p className="text-gray-500 mb-8">Experiments with Claude Code.</p>
      <Link
        href="/games/soeg"
        className="inline-block px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
      >
        Play Soeg →
      </Link>
    </div>
  );
}
