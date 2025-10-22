export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Connexion à OneTool
        </h2>
        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Adresse e-mail</label>
            <input
              type="email"
              placeholder="tonemail@exemple.com"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              placeholder="********"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4">
          Clique{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            ici
          </a>{" "}
          si tu n'as pas de compte.
        </p>
      </div>
    </div>
  );
}
