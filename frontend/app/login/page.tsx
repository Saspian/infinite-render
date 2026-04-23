"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [errorMSG, setErrorMSG] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    if (!res.ok) {
      setError(true);
      setErrorMSG(response.msg);
      return;
    }
    localStorage.setItem("loggedIn", JSON.stringify(true));
    localStorage.setItem("_t", response.token);
    localStorage.setItem("_id", response.id);
    router.push("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-200 dark:bg-accent text-neutral-900 dark:text-neutral-100 transition-colors duration-300 font-sans">
      <div className="absolute top-6 right-6 w-[6%] flex justify-between items-center flex-row-reverse">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          ) : (
            <Sun className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          )}
        </button>
      </div>
      <div className="w-full max-w-sm bg-white text-neutral-900 dark:bg-input dark:text-neutral-100 rounded-2xl shadow-lg p-8 animate-slide-up delay-100">
        <h1 className="text-2xl font-semibold text-center mb-6 text-black dark:text-neutral-100">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-neutral-900 dark:bg-input dark:text-neutral-100 outline-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-neutral-900 dark:bg-input dark:text-neutral-100 outline-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer"
          >
            Login
          </button>
        </form>
        {error && (
          <p className="text-red-500 cursor-pointer text-center">{errorMSG}</p>
        )}
      </div>
    </div>
  );
}
