import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    scheduleDay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduleDay",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "done", "skipped"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);