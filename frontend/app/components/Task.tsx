"use client";

import { TaskType } from "@/utils/types";
import { useClickOutside } from "@/utils/useClickOutside";
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
  const refDiv = useRef<HTMLDivElement>(null);
  const [isDel, toggleDel] = useState(false);

  const handleTextHeight = () => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  };

  const handleComplete = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id ? { ...t, completed: !task.completed } : t,
      ),
    );
    try {
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/complete/task/${task._id}`,
        {
          method: "PUT",
          body: JSON.stringify({ completed: !task.completed }),
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = () => {
    toggleEdit(false);

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
      prev.map((t) => (t._id === task._id ? { ...t, text } : t)),
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

  const onDelete = () => {
    toggleDel(!isDel);
  };

  useClickOutside(refDiv, () => toggleEdit(false));

  return (
    <div className="mb-4">
      <div
        ref={refDiv}
        className={`flex items-center justify-between w-full h-full py-4 pl-3 bg-white text-neutral-900 dark:bg-input dark:text-neutral-100 rounded-lg  ${isDel && "border border-red-400"}`}
      >
        <div className="w-1/10">
          <Image
            className="ml-2 cursor-pointer text-neutral-900 dark:bg-input dark:text-neutral-100"
            src="/radio.svg"
            alt="radio complete"
            onClick={handleComplete}
            width={15}
            height={30}
            priority
            title="Complete Task"
          />
        </div>
        <div
          className={
            (strike && "line-through") +
            " w-7/10 h-full text-neutral-900 dark:bg-input dark:text-neutral-100 "
          }
        >
          {edit ? (
            <textarea
              ref={ref}
              className="w-full p-2 overflow-hidden resize-none text-neutral-900 dark:bg-input dark:text-neutral-100 rounded-md focus:border-transparent focus:outline-none focus:ring-1"
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
                className="ml-2 cursor-pointer text-neutral-900 dark:bg-input dark:text-neutral-100"
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
                className="cursor-pointer text-neutral-900 dark:bg-input dark:text-neutral-100"
                src="/edit.svg"
                alt="edit"
                onClick={() => {
                  toggleEdit(!edit);
                  toggleDel(false);
                }}
                width={20}
                height={20}
                priority
                title="Edit Task"
              />
            ))}
          <Image
            className="ml-3 cursor-pointer"
            src="/delete.svg"
            alt="delete"
            onClick={onDelete}
            width={20}
            height={20}
            priority
            title="Delete Task"
          />
        </div>
      </div>
      {isDel && (
        <p className="text-right">
          Are you sure want to delete this task. Its not completed.{" "}
          <span
            className="text-green-500 cursor-pointer"
            onClick={handleDelete}
          >
            ✅ Yes
          </span>{" "}
          <span
            className="text-red-500 cursor-pointer"
            onClick={() => toggleDel(false)}
          >
            ❌ No
          </span>
        </p>
      )}
    </div>
  );
}
