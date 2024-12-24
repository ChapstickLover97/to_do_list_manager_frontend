import React, { useState, useEffect } from "react";
import "./TaskManager.css";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]); // State to store tasks
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null); // Tracks task being edited

  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:8080/tasks");
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        } else {
          console.error("Failed to fetch tasks");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchTasks();
  }, []);

  // Handle form submission for creating a task
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTask = {
      title,
      description,
      completed: false, // Default to incomplete
    };

    try {
      const response = await fetch("http://localhost:8080/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks((prevTasks) => [...prevTasks, createdTask]);
        setTitle("");
        setDescription("");
        setShowForm(false);
      } else {
        console.error("Failed to create task");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle task deletion
  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:8080/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle task update
  const handleUpdate = async (taskId) => {
    const updatedTask = tasks.find((task) => task.id === taskId);
    try {
      const response = await fetch(`http://localhost:8080/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? updatedData : task
          )
        );
        setEditingTaskId(null); // Exit editing mode
      } else {
        console.error("Failed to update task");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle edit mode toggle
  const toggleEdit = (taskId) => {
    setEditingTaskId(taskId);
  };

  // Handle changes in title/description/completed while editing
  const handleEditChange = (taskId, field, value) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    );
  };

  return (
    <div>
      <h2>My tasks:</h2>
      <button
        className="create-task-button"
        onClick={() => setShowForm(!showForm)}
      >
        +
      </button>

      {showForm && (
        <form className="task-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Description"
            className="description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" className="add-task-button">
            Add New Task
          </button>
        </form>
      )}

      {/* Display tasks */}
      <ul className="task-list">
        {tasks
          .slice()
          .sort((a, b) => a.completed - b.completed) // Sort by completion status
          .map((task) => (
            <li
              key={task.id}
              className={`task-item ${task.completed ? "completed-task" : ""}`}
            >
              {editingTaskId === task.id ? (
                <>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) =>
                      handleEditChange(task.id, "title", e.target.value)
                    }
                    className="title-input"
                  />
                  <textarea
                    value={task.description}
                    onChange={(e) =>
                      handleEditChange(task.id, "description", e.target.value)
                    }
                    className="description-input"
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) =>
                        handleEditChange(task.id, "completed", e.target.checked)
                      }
                    />
                    Mark Complete
                  </label>
                  <button
                    className="confirm-task-button"
                    onClick={() => handleUpdate(task.id)}
                  >
                    Confirm Updates
                  </button>
                </>
              ) : (
                <>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <p>Status: {task.completed ? "Completed" : "Incomplete"}</p>
                  <button
                    className="update-task-button"
                    onClick={() => toggleEdit(task.id)}
                  >
                    Update Task
                  </button>
                  <button
                    className="delete-task-button"
                    onClick={() => handleDelete(task.id)}
                  >
                    X
                  </button>
                </>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default TaskManager;