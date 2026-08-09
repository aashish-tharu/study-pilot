import { Task } from "../models/task.models.js";

export async function getOwnedTask(taskId, userId) {
  const task = await Task.findById(taskId).populate({
    path: "scheduleDay",
    populate: {
      path: "workspace",
      select: "user",
    },
  });

  if (!task) return null;
  if (!task.scheduleDay || !task.scheduleDay.workspace) return null;

  const ownerId = task.scheduleDay.workspace.user.toString();
  if (ownerId !== userId.toString()) return null;

  return task;
}