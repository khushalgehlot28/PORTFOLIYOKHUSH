import { useEffect, useState } from "react";
import { createTask, deleteTask, getTasks, updateTask } from "./api/tasks.js";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setSaving(true);
    setError("");
    try {
      const task = await createTask(trimmedTitle);
      setTasks((currentTasks) => [task, ...currentTasks]);
      setTitle("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(task) {
    setBusyTaskId(task._id);
    setError("");
    try {
      const updatedTask = await updateTask(task._id, {
        completed: !task.completed,
      });
      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === updatedTask._id ? updatedTask : item,
        ),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleDelete(taskId) {
    setBusyTaskId(taskId);
    setError("");
    try {
      await deleteTask(taskId);
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== taskId),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyTaskId(null);
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <main className="page-shell">
      <section className="workspace" aria-labelledby="page-title">
        <header className="topbar">
          <a className="brand" href="/" aria-label="Full-Stack Starter home">
            <span className="brand-mark" aria-hidden="true">
              S
            </span>
            <span>Starter kit</span>
          </a>
          <span className="stack-label">REACT · EXPRESS · MONGODB</span>
        </header>

        <div className="intro">
          <p className="eyebrow">YOUR NEXT PROJECT STARTS HERE</p>
          <h1 id="page-title">
            Make room for
            <br />
            <span>what matters.</span>
          </h1>
          <p className="intro-copy">
            A little space to collect your thoughts and turn them into action.
          </p>
        </div>

        <section className="task-panel" aria-label="Task list">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">THE EVERYDAY LIST</p>
              <h2>Your tasks</h2>
            </div>
            <span className="task-count" aria-live="polite">
              {completedCount} / {tasks.length} done
            </span>
          </div>

          <form className="task-form" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="task-title">
              Add a task
            </label>
            <input
              id="task-title"
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs your attention?"
              value={title}
            />
            <button className="add-button" disabled={saving || !title.trim()}>
              {saving ? "Adding…" : "Add task"}
            </button>
          </form>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <p className="empty-state">Getting your list ready…</p>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">
                ✳
              </span>
              <p>Your list is clear. Add a task to get started.</p>
            </div>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li className="task-item" key={task._id}>
                  <label className="task-label">
                    <input
                      checked={task.completed}
                      disabled={busyTaskId === task._id}
                      onChange={() => handleToggle(task)}
                      type="checkbox"
                    />
                    <span className="custom-checkbox" aria-hidden="true" />
                    <span
                      className={
                        task.completed ? "task-title is-complete" : "task-title"
                      }
                    >
                      {task.title}
                    </span>
                  </label>
                  <button
                    aria-label={`Delete ${task.title}`}
                    className="delete-button"
                    disabled={busyTaskId === task._id}
                    onClick={() => handleDelete(task._id)}
                    type="button"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="footer">
          <span>Built to begin. Made to make your own.</span>
          <span className="status"><span aria-hidden="true" /> API-backed demo</span>
        </footer>
      </section>
    </main>
  );
}
