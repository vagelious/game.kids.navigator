import ProfileForm from "./profile-form";

export default function CreateProfilePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full border-b-8 border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-4 bg-sky-400"></div>
        <h1 className="text-4xl font-bold text-slate-700 mb-8 text-center">
          Create Player ✨
        </h1>
        <ProfileForm />
      </div>
    </main>
  );
}
