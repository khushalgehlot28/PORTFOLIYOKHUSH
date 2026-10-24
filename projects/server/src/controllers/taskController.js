import { Task } from "../models/Task.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateTaskInput } from "../utils/validateTask.js";

function sendValidationError(result, res) {
  if (result.error) {
    res.status(400).json({ error: result.error });
    return true;
  }
  return false;
}

export const listTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

export const createTask = asyncHandler(async (req, res) => {
  const result = validateTaskInput(req.body);
  if (sendValidationError(result, res)) return;

  const task = await Task.create(result.value);
  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const result = validateTaskInput(req.body, { partial: true });
  if (sendValidationError(result, res)) return;

  const task = await Task.findByIdAndUpdate(req.params.id, result.value, {
    new: true,
    runValidators: true,
  });
  if (!task) {
    res.status(404).json({ error: "Task not found." });
    return;
  }

  res.json(task);
});

export const removeTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    res.status(404).json({ error: "Task not found." });
    return;
  }

  res.status(204).end();
});
