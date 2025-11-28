import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [nombre, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (!username.startsWith("@")) {
            setError("Tu nombre de usuario debe empezar con @");
            return;
        }

        setLoading(true);

        try {
            // --- 1) Crear usuario en Auth ---
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            const authUser = data.user;
            if (!authUser) {
                setError("No se pudo crear el usuario");
                setLoading(false);
                return;
            }

            // --- 2) Subir imagen si existe ---
            let imageUrl: string | null = null;

            if (profileImage) {
                const fileExt = profileImage.name.split(".").pop();
                const fileName = `${authUser.id}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("avatars")
                    .upload(fileName, profileImage, {
                        upsert: true,
                    });

                if (uploadError) {
                    setError("Error subiendo la imagen");
                    setLoading(false);
                    return;
                }

                const { data: publicUrl } = supabase.storage
                    .from("avatars")
                    .getPublicUrl(fileName);

                imageUrl = publicUrl.publicUrl;
            }

            // --- 3) Insertar en tu tabla "users" ---
            const { error: userInsertError } = await supabase
                .from("users")
                .insert([
                    {
                        id: authUser.id,
                        name: nombre,
                        username, // lo guardas con @ tal como lo usas en el front
                        email,
                        profile_image: imageUrl,
                    },
                ]);

            if (userInsertError) {
                console.error("Error insertando en users:", userInsertError);

                // 23505 = unique_violation (duplicado)
                if (userInsertError.code === "23505") {
                    setError("El email o el nombre de usuario ya están en uso.");
                } else {
                    setError("Usuario creado pero error guardando datos.");
                }

                setLoading(false);
                return;
            }

            setLoading(false);
            alert("Registro exitoso. Inicia sesión.");
            navigate("/");
        } catch (err: any) {
            console.error("Error en registro:", err);
            setError("Ocurrió un error inesperado en el registro.");
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-[#111] text-white p-6">
            <div className="w-full max-w-md bg-gradient-to-b from-[#6a0a1a]/90 to-[#38060c]/95 rounded-2xl shadow-2xl p-8">

                <h1 className="text-3xl font-bold mb-6 text-center">
                    Create your Account
                </h1>

                <form onSubmit={handleRegister} className="space-y-4">

                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                    />

                    <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={nombre}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                    />

                    <input
                        type="text"
                        placeholder="@username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-field"
                    />

                    {/* Foto de perfil */}
                    <div>
                        <label className="block text-sm text-white/70 mb-1">
                            Profile Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setProfileImage(e.target.files ? e.target.files[0] : null)
                            }
                            className="text-sm"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#ffd08b] hover:bg-[#ffc76a] text-black font-semibold py-2 rounded-full transition"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
            </div>
        </div>
    );
}
