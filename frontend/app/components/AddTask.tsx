"use client";

import { useState } from "react";
import { TaskType } from "@/utils/types";
import { ObjectId } from "bson";

export type ChildProps = { setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>; };
export default function AddTask({setTasks}: ChildProps) {
  const [task, setTask] = useState<string>("");
  const [disabled, isDisabled] = useState<boolean>(true);

  function onTaskChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTask(event.currentTarget.value);
    if (event.currentTarget.value.length) {
      isDisabled(false);
    } else {
      isDisabled(true);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (task.length && e.key === "Enter") {
      addTask();
    }
  };

  const addTask = () => {
    const taskObj: TaskType = {
      _id: new ObjectId().toString(),
      text: task,
    };
    setTasks(prev => [taskObj, ...prev])
    try {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/task`, {
        method: "POST",
        body: JSON.stringify(taskObj),
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      setTasks(prev => prev.filter(t => t._id !== taskObj._id));
      console.error(err);
    } finally {
      setTask("");
      isDisabled(true);
    }
  };

  return (
    <div className="flex w-full items-center justify-between mb-4">
      <input
        type="text"
        className="task-input bg-gray-100 p-2 rounded-md w-full mr-5"
        placeholder="What's your plan for today?"
        value={task as string}
        onChange={onTaskChange}
        onKeyDown={handleKeyDown}
      ></input>
      <input
        type="button"
        value="Add Task"
        className="add-btn w-28 h-10 rounded-md border-none disabled:bg-gray-500 bg-green-500 hover:bg-green-700 text-white text-base cursor-pointer"
        disabled={disabled}
        onClick={addTask}
      />
    </div>
  );
}
