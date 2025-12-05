import GameCanvas from "./game-canvas";

export default function GamePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-800 overflow-hidden">
      <GameCanvas />
    </main>
  );
}

