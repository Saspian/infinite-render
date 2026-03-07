import React from "react"

type Priority = "high" | "medium" | "low"

type Props = {
  priority: Priority
}

export default function PriorityChip({ priority }: Props) {
  const styles = {
    high: "bg-red-100 text-red-700 border-red-300",
    medium: "bg-amber-100 text-amber-700 border-amber-300",
    low: "bg-green-100 text-green-700 border-green-300",
  }

  return (
    <span
      className={`px-2 py-0.5 ml-2 text-xs font-medium rounded-full border ${styles[priority]}`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}