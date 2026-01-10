"use client";

import { TaskType } from "@/utils/types";
import Image from "next/image";

export default function Task({task, strike}: {task: TaskType, strike: boolean}) {
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
          width={20}
          height={20}
          priority
        />
        <Image
          className="dark:invert ml-2 cursor-pointer"
          src="/check.svg"
          alt="check"
          width={25}
          height={40}
          priority
        />
      </div>
    </div>
);
}
