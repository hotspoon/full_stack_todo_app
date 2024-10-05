import { Pencil, CircleX } from "lucide-react"

export function TaskItem({ task, onDelete, onToggle, onEdit }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-md bg-[#D0D0D0]">
      <div className="flex items-start space-x-2">
        <div>
          <span
            className={`text-sm ${task.status ? "line-through text-[#000000]" : "text-gray-900"}`}
          >
            {task.title}
          </span>
          <br />
          <span className="text-xs text-[#000000]">
            {new Date(task.last_update).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}{" "}
            {new Date(task.last_update).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </span>
        </div>
        <div>
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-[#33363F] rounded-full hover:text-[#000000] focus:outline-none"
          >
            <Pencil className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 text-[#33363F] rounded-full hover:text-[#000000] focus:outline-none"
        >
          <CircleX className="w-5 h-5" />
        </button>
        <input
          type="checkbox"
          checked={task.status}
          onChange={() => onToggle(task.id)}
          className="h-4 w-4 text-[#33363F]  border-[#33363F] rounded"
        />
      </div>
    </div>
  )
}
