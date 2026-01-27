// [Task]: T-047
// [From]: tasks.md §T-047 (Delete Task - Global Modal Management)
// [Reference]: Constitution §I (Single Modal at a Time)

"use client"

import { createContext, useContext, useState } from "react"

interface TaskModalContextType {
  openDeleteTaskId: string | null
  setOpenDeleteTaskId: (id: string | null) => void
}

const TaskModalContext = createContext<TaskModalContextType | undefined>(undefined)

export function TaskModalProvider({ children }: { children: React.ReactNode }) {
  const [openDeleteTaskId, setOpenDeleteTaskId] = useState<string | null>(null)

  return (
    <TaskModalContext.Provider value={{ openDeleteTaskId, setOpenDeleteTaskId }}>
      {children}
    </TaskModalContext.Provider>
  )
}

export function useTaskModal() {
  const context = useContext(TaskModalContext)
  if (!context) {
    throw new Error("useTaskModal must be used within TaskModalProvider")
  }
  return context
}
