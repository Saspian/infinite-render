"use client";

import { priorityOrder, TaskType } from "@/utils/types";
import AddTask from "./components/AddTask";
import Task from "./components/Task";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Sun, Moon, LogOut, GripVertical, ListFilter } from "lucide-react";
import LoginPage from "./login/page";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useInitialAnimation } from "@/utils/useInitialAnimation";
import { useDebounce } from "@/utils/useDebounce";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  //   const [tasks, setTasks] = useState<TaskType[]>([]);
  //   const [loading, setLoading] = useState<boolean>(true);
  //   const [showCompleted, toggleCompleted] = useState<boolean>(false);
  // const [enableCompleted, setToggleCompleted] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoggedIn, toggleLoggedIn] = useState<boolean>(false);
  //   const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  //   const [isSaving, setIsSaving] = useState<boolean>(false);
  //   const [open, toggleOpen] = useState<boolean>(false);

  //   const sensors = useSensors(
  //     useSensor(PointerSensor, {
  //       // Require 8px movement before drag starts — prevents accidental drags
  //       // when the user just wants to click edit/delete
  //       activationConstraint: { distance: 8 },
  //     }),
  //     useSensor(KeyboardSensor, {
  //       coordinateGetter: sortableKeyboardCoordinates,
  //     }),
  //   );

  //   function getTask() {
  //     fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/task`, {
  //       method: "GET",
  //       cache: "no-store",
  //       next: { revalidate: 60 },
  //     })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         setTasks(data.data);
  //         setLoading(false);
  //       });
  //   }

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
  );
}
