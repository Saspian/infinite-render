"use client";

import { Priority, TaskType } from "@/utils/types";
import { useClickOutside } from "@/utils/useClickOutside";
import { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Ellipsis,
  Pencil,
  Trash2,
  Check,
  Circle,
  CircleCheckBig,
  CalendarArrowUp
} from "lucide-react";
import PriorityChip from "./PriorityChip";

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
  const [isPChange, togglePChange] = useState(false);
  const [open, setOpen] = useState(false);

  // ─── dnd-kit sortable ───────────────────────────────────────────────────────
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Keep row visible (but faded) in its original slot while ghost is shown
    opacity: isDragging ? 0.4 : 1,
  };
  // ────────────────────────────────────────────────────────────────────────────

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
    toggleDel(false);
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

  const handlePriorityChange = (priority: Priority) => {
    togglePChange(false);
    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id ? { ...t, priority } : t,
      ),
    );
    try {
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/task/priority/${task._id}`,
        {
          method: "PUT",
          body: JSON.stringify({ priority }),
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error(e);
    }
  }

  useClickOutside(refDiv, () => {
    toggleEdit(false);
    setOpen(false);
  });

  return (
    // setNodeRef + style go on the outermost wrapper so the whole row moves
    <div ref={setNodeRef} style={style} className="mb-4">
      <div
        ref={refDiv}
        className={`relative flex items-center justify-around w-full h-full py-4 pl-3 bg-white text-neutral-900 dark:bg-input dark:text-neutral-100 rounded-lg ${isDel && "border border-red-400"}`}
      >
        {/* ── Drag handle — only rendered for uncompleted (non-strike) tasks ── */}
        <div className="flex items-center justify-start w-full">
          {!strike && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing px-2 text-neutral-300 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400 transition-colors shrink-0"
              aria-label="Drag to reorder"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-5 h-5 text-neutral-300 dark:text-neutral-300" />
            </button>
          )}

          {/* ── Complete radio ── */}
          {task.completed ? (
            <CircleCheckBig
              className="mx-3 cursor-pointer text-green-500"
              onClick={handleComplete}
              width={20}
              height={40}
            />
          ) : (
            <Circle
              className="mx-3 cursor-pointer text-neutral-300 dark:bg-input dark:text-neutral-100"
              onClick={handleComplete}
              width={20}
              height={40}
            />
          )}

          {/* ── Task text / edit textarea ── */}
          <div
            className={
              (strike ? "line-through " : "") +
              "w-[80%] h-full text-neutral-900 dark:bg-input dark:text-neutral-100"
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
          <PriorityChip priority={task.priority}/>
        </div>

        {edit ? (
          <Check
            className="mr-6 cursor-pointer text-neutral-300 dark:bg-input dark:text-neutral-100"
            onClick={submitEdit}
            width={25}
            height={40}
          />
        ) : (
          <Ellipsis
            className="h-5 mx-4 text-neutral-300 dark:text-neutral-300 action cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        )}

        {/* ── Action buttons ── */}

        {open && (
          <div className="flex-col items-center justify-evenly absolute right-2 top-10 z-10 overflow-hidden bg-neutral-100 dark:bg-input rounded-lg shadow-lg">
            {!task.completed && (
              <>
              <div
                className="flex items-center justify-start p-3 min-w-25 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-300 cursor-pointer"
                aria-label="Toggle theme"
                onClick={() => {
                  toggleEdit(!edit);
                  toggleDel(false);
                  setOpen(false);
                }}
              >
                <Pencil className="w-4 h-5 mr-2 text-neutral-700 dark:text-neutral-300" />
                <p>Edit</p>
              </div>
               <div
                className="flex items-center justify-start p-3 min-w-25 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-300 cursor-pointer"
                aria-label="Toggle theme"
                onClick={() => {
                  
                  togglePChange(true);
                  setOpen(false);
                }}
              >
                <CalendarArrowUp className="w-4 h-5 mr-2 text-neutral-700 dark:text-neutral-300" />
                <p>Priority</p>
              </div>
              </>
            )}
            <div
              className="flex items-center justify-start p-3 min-w-25 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-300 cursor-pointer"
              aria-label="Toggle theme"
              onClick={() => {
                toggleDel(!isDel);
                setOpen(false);
              }}
            >
              <Trash2 className="w-4 h-5 mr-2 text-neutral-700 dark:text-neutral-300" />
              <p>Delete</p>
            </div>
          </div>
        )}
      </div>

      {isDel && (
        <p className="text-right">
          Are you sure want to delete this task.{" "}
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

      {isPChange && (
        <p className="text-right">
          Select the new priority{" "}
          <span
            className="cursor-pointer text-xs px-4 rounded-full border bg-red-100 text-red-700 border-red-300"
            onClick={() => handlePriorityChange('high')}
          >
           High
          </span>{" "}
          <span
            className="cursor-pointer text-xs px-4 rounded-full border bg-amber-100 text-amber-700 border-amber-300"
            onClick={() => handlePriorityChange('medium')}
          >
            Medium 
          </span>{" "}
          <span
            className="cursor-pointer text-xs px-4 rounded-full border bg-green-100 text-green-700 border-green-300"
            onClick={() => handlePriorityChange('low')}
          >
            Low
          </span>
        </p>
      )}
    </div>
  );
}
