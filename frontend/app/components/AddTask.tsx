"use client";

import { useState } from "react";

export default function AddTask() {
  const [task, setTask] = useState<HTMLInputElement | string>("");

  function onTaskChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTask(event.currentTarget.value);
  }

  const printShit = () => {
  };

  return (
    <div className="flex w-full items-center justify-between mb-4">
      <input
        type="text"
        className="task-input bg-gray-100 p-2 rounded-md w-full mr-5"
        placeholder="What's your plan for today?"
        onChange={onTaskChange}
      ></input>
      <input
        type="button"
        value="Add Task"
        className="add-btn w-28 h-10 rounded-md border-none bg-green-600 text-white text-base cursor-pointer"
        onClick={printShit}
      />
    </div>
  );
}
