"use client";

import { TaskType } from "@/utils/types";
import AddTask from "./components/AddTask";
import Task from "./components/Task";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Sun, Moon, LogOut, Eye, EyeOff, GripVertical } from "lucide-react";
import LoginPage from "./components/Login";
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

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCompleted, toggleCompleted] = useState<boolean>(false);
  const [enableCompleted, setToggleCompleted] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoggedIn, toggleLoggedIn] = useState<boolean>(false);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before drag starts — prevents accidental drags
      // when the user just wants to click edit/delete
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
    const showCompleted = localStorage.getItem("showCompleted");

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
    if (showCompleted) {
      setToggleCompleted(JSON.parse(showCompleted));
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

  const { animated } = useInitialAnimation(!loading, {
    itemCount: unCompletedTask.length,
    perItemDelay: 200,
    duration: 200,
  });

  const handleCompletedTask = () => {
    toggleCompleted(!showCompleted);
  };

  const handleLogout = () => {
    localStorage.clear();
    toggleLoggedIn(false);
  };

  const handleToggleCompleted = () => {
    setToggleCompleted(!enableCompleted);
    localStorage.setItem("showCompleted", JSON.stringify(!enableCompleted));
  };

  // ─── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const found = unCompletedTask.find((t) => t._id === event.active.id);
      setActiveTask(found ?? null);
    },
    [unCompletedTask],
  );

  const debounceReorder = useDebounce(async (updates) => {
    try {
      setIsSaving(true);
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: updates }),
      });
    } catch (err) {
      console.error("Failed to persist order:", err);
      // Roll back on error
      getTask();
    } finally {
      setIsSaving(false);
    }
  }, 1500);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = unCompletedTask.findIndex((t) => t._id === active.id);
      const newIndex = unCompletedTask.findIndex((t) => t._id === over.id);
      const reorderedUncompleted = arrayMove(
        unCompletedTask,
        oldIndex,
        newIndex,
      );

      // Merge back with completed tasks (keep completed tasks at their positions)
      setTasks([...reorderedUncompleted, ...completedTask]);

      // Build payload: [{ id, order }]
      const updates = reorderedUncompleted.map((task, index) => ({
        id: task._id,
        order: index,
      }));

      debounceReorder(updates);
    },
    [unCompletedTask, completedTask],
  );

  // ────────────────────────────────────────────────────────────────────────────

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-200 dark:bg-accent text-neutral-900 dark:text-neutral-100 transition-colors duration-300 font-sans">
      <div className="absolute top-6 right-6 w-[15%] flex justify-between items-center flex-row-reverse">
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

        {isLoggedIn && (
          <button
            onClick={handleToggleCompleted}
            className="flex items-center p-3 px-7 rounded-full bg-neutral-100 dark:bg-input hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Toggle theme"
            title={
              enableCompleted ? "Hide Completed Task" : "Show Completed Task"
            }
          >
            {enableCompleted ? (
              <EyeOff className="w-5 h-5 mr-2 text-neutral-700 dark:text-neutral-300" />
            ) : (
              <Eye className="w-5 h-5 mr-2 text-neutral-700 dark:text-neutral-300" />
            )}
            Completed
          </button>
        )}
      </div>

      {isLoggedIn ? (
        <main className="flex min-h-screen w-full max-w-4xl flex-col items-center py-32 px-16 sm:items-start">
          <div
            className={`flex flex-col items-center text-center sm:items-start sm:text-left mb-4`}
          >
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-neutral-100 ">
              Task Manager
            </h1>
            <p className="max-w-md text-lg leading-8 text-black dark:text-neutral-100">
              Stay organized and productive with your daily tasks{" "}
            </p>
          </div>

          <div className="flex-col gap-4 text-base font-medium w-full sm:flex-row">
            <AddTask setTasks={setTasks} taskLength={tasks.length} />

            {/* ── Sortable uncompleted tasks ── */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={unCompletedTask.map((t) => t._id)}
                strategy={verticalListSortingStrategy}
              >
                {unCompletedTask.length ? (
                  <>
                    {isSaving && (
                      <p className="text-xs text-neutral-400 pl-3 mb-1">
                        Saving order…
                      </p>
                    )}
                    {unCompletedTask.map((task: TaskType, index: number) => (
                      <div
                        className={
                          !animated ? "animate-slide-up delay-100" : ""
                        }
                        key={task._id}
                        style={
                          !animated
                            ? { animationDelay: `${index * 150}ms` }
                            : {}
                        }
                      >
                        <Task task={task} strike={false} setTasks={setTasks} />
                      </div>
                    ))}
                  </>
                ) : (
                  <h3 className="pl-3 mb-3 text-red-600">
                    There are no active tasks at the moment!
                  </h3>
                )}
              </SortableContext>

              {/* Ghost card shown while dragging */}
              <DragOverlay>
                {activeTask && (
                  <div className="flex items-center w-full py-4 pl-3 bg-white dark:bg-input rounded-lg shadow-xl opacity-90 border border-blue-400">
                    <span className="ml-2 mr-4 text-neutral-400">
                      <GripVertical className="w-5 h-5 text-neutral-300 dark:text-neutral-300" />
                    </span>
                    <span className="text-neutral-900 dark:text-neutral-100">
                      {activeTask.text}
                    </span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>

            {loading && <h3 className="pl-3 mb-3">Loading...</h3>}

            {/* ── Completed tasks (not sortable) ── */}
            {enableCompleted && completedTask.length ? (
              <>
                <h3
                  className="pl-3 mt-10 mb-4 cursor-pointer"
                  onClick={handleCompletedTask}
                >
                  Completed ({completedTask.length})
                </h3>
                {showCompleted &&
                  completedTask.map((task: TaskType, index: number) => (
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
      ) : (
        <LoginPage setLogin={toggleLoggedIn} />
      )}
    </div>
  );
}
