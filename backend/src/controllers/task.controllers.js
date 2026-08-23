import { getOwnedTask } from "../utils/taskOwnership.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["done", "skipped", "pending"].includes(status)) {
    throw new APIError(400, "status must be done, skipped, or pending");
  }

  const task = await getOwnedTask(req.params.id, req.user._id);

  if (!task) {
    throw new APIError(404, "Task not found");
  }

  task.status = status;
  task.completedAt = status === "done" ? new Date() : null;
  await task.save();

  return res.status(200).json(new APIResponse(200, task, "Task updated"));
});

export const toggleSubtopic = asyncHandler(async (req, res) => {
  const { subtopic, completed } = req.body;
  if (!subtopic || typeof subtopic !== "string") {
    throw new APIError(400, "subtopic name is required")
  }
  if (typeof completed !== "boolean") {
    throw new APIError(400, "invalid data type")
  }

  const task = await getOwnedTask(req.params.id, req.user._id);
  if (!task) throw new APIError(404, 'task not found')

  await task.populate("topic", "subtopics");
  const validSubtopics = task.topic?.subtopics || [];
  if (!validSubtopics.includes(subtopic)) {
    throw new APIError(400, "This subtopic does not belong to this task's topic");
  }
 
  const alreadyMarked = task.completedSubtopics.includes(subtopic);
 
  if (completed && !alreadyMarked) {
    task.completedSubtopics.push(subtopic);
  } else if (!completed && alreadyMarked) {
    task.completedSubtopics = task.completedSubtopics.filter((s) => s !== subtopic);
  }
 
  await task.save();
 
  return res.status(200).json(new APIResponse(200, task, "Subtopic updated"));

})