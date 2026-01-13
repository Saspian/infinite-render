"use client";

import { TaskType } from "@/utils/types";
import Image from "next/image";
import { useRef, useState } from "react";

type ChildProps = {
  task: TaskType;
  strike: boolean;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
};
export default function Task({ task, strike, setTasks }: ChildProps) {
  const [edit, toggleEdit] = useState<boolean>(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleTextHeight = () => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  };

  const handleComplete = () => {
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, completed: true } : t))
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

  const handleEdit = (e: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  };

  return (
    <div className="flex items-center justify-between w-full h-full py-4 pl-3 mb-4 bg-white rounded-lg">
      <div className={(strike && "line-through") + " w-8/10 h-full text-black"}>
        {edit ? (
          <textarea
            ref={ref}
            className="w-full p-2 overflow-hidden resize-none bg-gray-100 rounded-md focus:border-transparent focus:outline-none focus:ring-0"
            defaultValue={task.text}
            onInput={handleTextHeight}
            onChange={handleEdit}
          />
        ) : (
          task.text
        )}
      </div>
      <div className="flex items-center justify-evenly action w-2/10">
        {!task.completed && (
          <Image
            className="dark:invert cursor-pointer"
            src="/edit.svg"
            alt="edit"
            onClick={() => {
              toggleEdit(!edit);
            }}
            width={20}
            height={20}
            priority
          />
        )}

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
