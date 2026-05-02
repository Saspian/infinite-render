"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, Loader } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [errorMSG, setErrorMSG] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [showPassword, toggleShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError(true);
    setErrorMSG("");

    e.preventDefault();
    const payload = {
      username,
      password,
    };
    // call your backend login API
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    const response = await res.json();
    if (res.ok) {
      localStorage.setItem("loggedIn", JSON.stringify(true));
      localStorage.setItem("_t", response.token);
      localStorage.setItem("_u", response.username);
      localStorage.setItem("_id", response.id);
      setLoading(false);
      router.push("/");
      return;
    } else {
      setError(true);
      setErrorMSG(response.msg);
      setLoading(false);
      return;
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  function togglePasswordView() {
    toggleShowPassword(!showPassword);
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-200 dark:bg-accent text-neutral-900 dark:text-neutral-100 transition-colors duration-300 font-sans p-4 sm:p-6">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={toggleTheme}
          className="p-2 sm:p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700 dark:text-neutral-300" />
          ) : (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700 dark:text-neutral-300" />
          )}
        </button>
      </div>
      <div className="w-full max-w-sm bg-white text-neutral-900 dark:bg-input dark:text-neutral-100 rounded-2xl shadow-lg p-6 sm:p-8 animate-slide-up delay-100 mx-auto">
        <h1 className="text-xl sm:text-2xl font-semibold text-center mb-4 sm:mb-6 text-black dark:text-neutral-100">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
            className="w-full border rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 text-neutral-900 dark:bg-input dark:text-neutral-100 outline-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            autoComplete="password"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 text-neutral-900 dark:bg-input dark:text-neutral-100 outline-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
          {error && (
            <p className="text-red-500 cursor-pointer text-center text-sm sm:text-base">
              {errorMSG}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm sm:text-base">
            <input
              type="checkbox"
              onChange={togglePasswordView}
              checked={showPassword}
              className="cursor-pointer"
            />
            <label className="cursor-pointer">Show password</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-black py-2 text-sm sm:text-base rounded-lg transition border-2 border-black hover:bg-black hover:text-white ${loading ? "bg-green-500" : "bg-white cursor-pointer"}`}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <Loader className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700 dark:text-neutral-300 animate-spin" />
              </div>
            ) : (
              "Login"
            )}
          </button>
          <p
            className="hover:underline cursor-pointer text-sm sm:text-base text-center"
            onClick={() => router.push("/signup")}
          >
            New here? Create an account!
          </p>
        </form>
      </div>
    </div>
  );
}
