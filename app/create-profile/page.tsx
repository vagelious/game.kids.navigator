import ProfileForm from "./profile-form";

export default function CreateProfilePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-green-200">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-4 border-green-500">
        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
          Create Your Player
        </h1>
        <ProfileForm />
      </div>
    </main>
  );
}

