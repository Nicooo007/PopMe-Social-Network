export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] text-white p-6">
      <div className="w-full max-w-md bg-gradient-to-b from-[#6a0a1a]/90 to-[#38060c]/95 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Forgot Password</h1>
        <p className="text-white/60 mb-4 text-center">Introduce tu email para recuperar la contraseña.</p>
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-full bg-transparent border border-white/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd08b]/30 mb-4"
        />
        <button className="w-full bg-[#ffd08b] hover:bg-[#ffc76a] text-black font-semibold py-2 rounded-full transition">
          Send Recovery Email
        </button>
      </div>
    </div>
  );
}
