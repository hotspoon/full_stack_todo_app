// src/App.jsx
import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { TaskItem } from "./components/TaskItem"
import { fetchTasks } from "./utils/fetchTasks"
import { API_URL } from "./constant/config"

export default function App() {
  const [newTask, setNewTask] = useState("")
  const [editingTask, setEditingTask] = useState(null)

  const { data: tasks = [], refetch } = useQuery(["tasks"], fetchTasks)

  const addTask = async (e) => {
    e.preventDefault()
    if (newTask.trim() === "") return

    const newTaskObj = {
      title: newTask,
      status: false
    }

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newTaskObj)
      })

      setNewTask("")
      refetch()
    } catch (error) {
      console.error("Error adding task:", error)
      // Handle error, e.g., show an error message to the user
      alert("Error adding task")
    }
  }

  const editTask = async (id) => {
    if (newTask.trim() === "") return
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: newTask, status: false })
      })
      setEditingTask(null)
      setNewTask("")
      refetch()
    } catch (error) {
      console.error("Error updating task:", error)
      // Handle error, e.g., show an error message to the user
      alert("Error updating task")
    }
  }

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      })
      refetch()
    } catch (error) {
      console.error("Error deleting task:", error)
      // Handle error, e.g., show an error message to the user
      alert("Error deleting task")
    }
  }

  const toggleComplete = async (id) => {
    const task = tasks.find((task) => task.id === id)
    if (!task) return

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: task.title, status: !task.status }) // Only send title and status
      })
      refetch()
    } catch (error) {
      console.error("Error toggling task completion:", error)
      // Handle error, e.g., show an error message to the user
      alert("Error toggling task completion")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (editingTask) {
      // If editingTask is not null, it means we're editing
      editTask(editingTask.id) // Call the editTask function for existing tasks
    } else {
      // Otherwise, we're adding a new task
      addTask(e) // Call the addTask function for new tasks
    }
  }

  const startEditing = (task) => {
    setEditingTask(task)
    setNewTask(task.title)
  }

  const cancelEditing = () => {
    setEditingTask(null)
    setNewTask("")
  }

  const ongoingTasks = tasks
    .filter((task) => !task.status)
    .sort((a, b) => new Date(a.last_update) - new Date(b.last_update)) // Sort by last_update ASC

  const completedTasks = tasks
    .filter((task) => task.status)
    .sort((a, b) => new Date(b.last_update) - new Date(a.last_update)) // Sort by last_update DESC

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-md">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="mb-4 text-4xl text-center text-gray-900">Task Management</h1>
          <form onSubmit={handleSubmit} className="mb-4">
            <label htmlFor="task" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="task"
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none "
            />
            <div className="mt-2">
              {editingTask ? (
                <>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="mr-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#FFB46F] hover:bg-[#ff8c20]"
                    >
                      Update Task
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-[#FF6F6F] hover:bg-[#ff2020]"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#0F0F0F] bg-[#6FCBFF] hover:bg-[#27b0ff] focus:outline-none"
                  >
                    Add Task
                  </button>
                </div>
              )}
            </div>
          </form>

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Ongoing Tasks</h2>
            {ongoingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={deleteTask}
                onToggle={toggleComplete}
                onEdit={startEditing}
              />
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Completed Tasks</h2>
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={deleteTask}
                onToggle={toggleComplete}
                onEdit={startEditing}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
