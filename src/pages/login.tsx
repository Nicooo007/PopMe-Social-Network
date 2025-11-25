import { useState } from "react";
import loginImage from "../assets/Popme.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] text-white p-6">
      <div className="flex flex-col md:flex-row w-full max-w-5xl h-[640px] overflow-hidden rounded-2xl shadow-2xl">
        {/* Panel izquierdo */}
        <div
          className="w-full md:w-1/2 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${loginImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30"></div>
        </div>

        {/* Panel derecho */}
        <div className="w-full md:w-1/2 bg-gradient-to-b from-[#6a0a1a]/90 to-[#38060c]/95 flex flex-col justify-center px-8 md:px-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-sm text-white/60 mb-6">
            Introduce tus datos para continuar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm w-full">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full bg-transparent border border-white/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd08b]/30"
            />

            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full bg-transparent border border-white/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd08b]/30"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-sm"
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs text-white/60 hover:text-white underline">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#ffd08b] hover:bg-[#ffc76a] text-black font-semibold py-2 rounded-full transition"
            >
              Login
            </button>

            <div className="text-center text-white/60 text-sm">Or</div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full py-2 text-sm"
              >
                Sign in with G
              </button>
              <button
                type="button"
                className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-full py-2 text-sm"
              >
                Sign in with f
              </button>
            </div>

            <p className="text-center text-xs text-white/60 mt-2">
              No Have an Account?{" "}
              <a href="#" className="text-[#caa1d0] underline">
                Sign Up!
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}