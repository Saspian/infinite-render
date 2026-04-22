"use client";

import { useEffect, useState, } from "react";
import { Sun, Moon, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoggedIn, toggleLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const logged = localStorage.getItem("loggedIn");
    if (logged) {
      toggleLoggedIn(JSON.parse(logged));
    }

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.classList.toggle(
        "dark",
        initialTheme === "dark",
      );
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("_t");
    localStorage.removeItem("loggedIn");
    toggleLoggedIn(false);
    router.push("/login");
  };

  if (!mounted) return null;

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

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          </button>
        )}
      </div>
    </div>
  );
}
