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