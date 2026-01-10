"use client";

import { TaskType } from "@/utils/types";
import AddTask from "./components/AddTask";
import Task from "./components/Task";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const tasks: TaskType[] = [
    {
      text: "Buy groceries, but how long will this task go? I mean will it be able to handle few line of Groceries like Eggs, milk, bread. What about daily routine of going classes and attending lecture or going to the work?",
      completed: false,
      dueDate: "02.07.2026",
      isDeleted: false,
      deletedAt: null,
    },
    {
      text: "Buy groceries, but how long will this task go? I mean will it be able to handle few line of Groceries like Eggs, milk, bread. What about daily routine of going classes and attending lecture or going to the work?",
      completed: false,
      dueDate: "02.07.2026",
      isDeleted: false,
      deletedAt: null,
    },
    {
      text: "What about daily routine of going classes and attending lecture or going to the work?",
      completed: true,
      dueDate: "02.07.2026",
      isDeleted: false,
      deletedAt: null,
    },
    {
      text: "What about daily routine of going classes and attending lecture or going to the work?",
      completed: true,
      dueDate: "02.07.2026",
      isDeleted: false,
      deletedAt: null,
    },
  ];

  const completedTask = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks]
  );
  const unCompletedTask = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-200 font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 sm:items-start">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left mb-4">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black">
            Task Manager
          </h1>
          <p className="max-w-md text-lg leading-8 text-black">
            Stay organized and productive with your daily tasks{" "}
          </p>
        </div>
        <div className="flex-col gap-4 text-base font-medium w-full sm:flex-row">
          <AddTask />
          {unCompletedTask.length &&
            unCompletedTask.map((task: TaskType, index) => (
              <Task task={task} key={index} strike={false} />
            ))}
          <h3 className="pl-3 mb-3">Completed ({completedTask.length})</h3>
          {completedTask.length &&
            completedTask.map((task: TaskType, index) => (
              <div key={index}>
                <Task task={task} strike={true} />
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
