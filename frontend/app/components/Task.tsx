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
  const [text, setText] = useState<string>(task.text);
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleTextHeight = () => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  };

  const handleComplete = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id ? { ...t, completed: !task.completed } : t
      )
    );
    try {
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/complete/task/${task._id}`,
        {
          method: "PUT",
          body: JSON.stringify({ completed: !task.completed }),
          headers: { "Content-Type": "application/json" },
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

  const handleEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.currentTarget.value);
  };

  const submitEdit = () => {
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, text } : t))
    );
    try {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/edit/task/${task._id}`, {
        method: "PUT",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error(err);
    } finally {
      toggleEdit(false);
    }
  };

  return (
    <div className="flex items-center justify-between w-full h-full py-4 pl-3 mb-4 bg-white rounded-lg">
      <div className="w-1/10">
        <Image
          className="dark:invert ml-2 cursor-pointer"
          src="/radio.svg"
          alt="radio complete"
          onClick={handleComplete}
          width={15}
          height={30}
          priority
          title="Complete Task"
        />
      </div>
      <div className={(strike && "line-through") + " w-7/10 h-full text-black"}>
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
        {!task.completed &&
          (edit ? (
            <Image
              className="dark:invert ml-2 cursor-pointer"
              src="/check.svg"
              alt="check"
              onClick={submitEdit}
              width={25}
              height={40}
              priority
              title="Finished Edit"
            />
          ) : (
            <Image
              className="dark:invert cursor-pointer"
              src="/edit.svg"
              alt="edit"
              onClick={() => toggleEdit(!edit)}
              width={20}
              height={20}
              priority
              title="Edit Task"
            />
          ))}
        <Image
          className="dark:invert ml-3 cursor-pointer"
          src="/delete.svg"
          alt="delete"
          onClick={handleDelete}
          width={20}
          height={20}
          priority
          title="Delete Task"
        />
      </div>
    </div>
  );
}
