"use client";

import { TaskType } from "@/utils/types";
import Image from "next/image";

type ChildProps = {
  task: TaskType;
  strike: boolean;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
};
export default function Task({ task, strike, setTasks }: ChildProps) {
  const handleComplete = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id ? { ...t, completed: true } : t
      )
    );
    try {
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/complete/task/${task._id}`,
        {
          method: "PUT",
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = () => {
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
    try {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/task/${task._id}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div className="flex items-center justify-between w-full py-4 pl-3 mb-4 bg-white rounded-lg">
      <div className={(strike && "line-through") + " w-8/10 text-black"}>
        {task.text}
      </div>
      <div className="flex items-center justify-evenly action w-2/10">
        <Image
          className="dark:invert cursor-pointer"
          src="/edit.svg"
          alt="edit"
          width={20}
          height={20}
          priority
        />
        <Image
          className="dark:invert ml-3 cursor-pointer"
          src="/delete.svg"
          alt="delete"
          onClick={handleDelete}
          width={20}
          height={20}
          priority
        />
        <Image
          className="dark:invert ml-2 cursor-pointer"
          src="/check.svg"
          alt="check"
          onClick={handleComplete}
          width={25}
          height={40}
          priority
        />
      </div>
    </div>
  );
}
