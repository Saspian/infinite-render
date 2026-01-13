"use client";

import { TaskType } from "@/utils/types";
import AddTask from "./components/AddTask";
import Task from "./components/Task";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
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
  }, []);

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
          <AddTask setTasks={setTasks}/>
          {unCompletedTask.length ? (
            unCompletedTask.map((task: TaskType, index) => (
              <Task task={task} key={index} strike={false} setTasks={setTasks} />
            ))
          ) : (
            <h3 className="pl-3 mb-3 text-red-600">
              There are no task at the moment!
            </h3>
          )}
          {loading && <h3 className="pl-3 mb-3">Loading...</h3>}
          {completedTask.length ? (
            <>
              <h3 className="pl-3 mb-3">Completed ({completedTask.length})</h3>
              {completedTask.map((task: TaskType, index) => (
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
