import mongoose from "mongoose";

const scheduleDaySchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

scheduleDaySchema.index({ workspace: 1, date: 1 }, { unique: true });

export const ScheduleDay = mongoose.model("ScheduleDay", scheduleDaySchema);