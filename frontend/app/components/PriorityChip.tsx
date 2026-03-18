import React from "react"

type Priority = "high" | "medium" | "low"

type Props = {
  priority: Priority
}

export default function PriorityChip({ priority }: Props) {
  const styles = {
    high: "bg-red-50 text-red-700 border-red-300",
    medium: "bg-amber-50 text-amber-700 border-amber-300",
    low: "bg-green-50 text-green-700 border-green-300",
  }

  return (
    <span
      className={`px-1 ml-2 text-[0.70rem] font-bold rounded-sm uppercase border ${styles[priority]}`}
    >
      {priority.charAt(0) + priority.slice(1)}
    </span>
  )
}