import GameCanvas from "./game-canvas";

export default function GamePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sky-100 overflow-hidden">
      <GameCanvas />
    </main>
  );
}
