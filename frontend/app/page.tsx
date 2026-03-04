"use client";

import { TaskType } from "@/utils/types";
import AddTask from "./components/AddTask";
import Task from "./components/Task";
import { useEffect, useMemo, useState } from "react";
import { Github, Linkedin, Twitter, Sun, Moon } from "lucide-react";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCompleted, toggleCompleted] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  function getTask() {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks`, {
      method: "GET",
      cache: "no-store",
      next: { revalidate: 60 },
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.data);
        setLoading(false);
      });
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Check system preference
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

    getTask();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const completedTask = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks],
  );
  const unCompletedTask = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks],
  );

  const handleCompletedTask = () => {
    toggleCompleted(!showCompleted);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-200 dark:bg-accent text-neutral-900 dark:text-neutral-100 transition-colors duration-300 font-sans">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
        ) : (
          <Sun className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
        )}
      </button>
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 sm:items-start">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left mb-4">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-neutral-100 animate-slide-up delay-100">
            Task Manager
          </h1>
          <p className="max-w-md text-lg leading-8 text-black dark:text-neutral-100 animate-slide-up delay-100">
            Stay organized and productive with your daily tasks{" "}
          </p>
        </div>
        <div className="flex-col gap-4 text-base font-medium w-full sm:flex-row">
          <AddTask setTasks={setTasks} />
          {unCompletedTask.length ? (
            unCompletedTask.map((task: TaskType, index) => (
              <div
                className="animate-slide-up delay-100"
                key={task.text}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Task
                  task={task}
                  key={index}
                  strike={false}
                  setTasks={setTasks}
                />
              </div>
            ))
          ) : (
            <h3 className="pl-3 mb-3 text-red-600">
              There are no active task at the moment!
            </h3>
          )}
          {loading && <h3 className="pl-3 mb-3">Loading...</h3>}
          {completedTask.length ? (
            <>
              <h3
                className="pl-3 mb-3 cursor-pointer"
                onClick={handleCompletedTask}
              >
                Completed ({completedTask.length})
              </h3>
              {showCompleted &&
                completedTask.map((task: TaskType, index) => (
                  <div key={index}>
                    <Task task={task} strike={true} setTasks={setTasks} />
                  </div>
                ))}
            </>
          ) : (
            <></>
          )}
        </div>
      </main>
    </div>
  );
}
