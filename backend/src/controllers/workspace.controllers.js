import { Workspace } from "../models/workspace.models.js"
import { Topic } from "../models/topic.models.js"
import { ScheduleDay } from '../models/scheduleDaySchema.models.js'
import { Task } from "../models/task.models.js";
import { extractTopicsFromFile } from "../utils/geminiExtraction.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { generateSchedule } from "../utils/generateSchedule.js"

export const createWorkspace = asyncHandler( async (req, res) => {
    const { name, daysToComplete, depthLevel } = req.body;

    if (!name?.trim()) throw new APIError(400, "workspace name is required.")
    if (!req.file) throw new APIError(400, "syllabus file is required")
    if (!daysToComplete) throw new APIError(400, "days to complete is required.")
    if (!["quick", "moderate", "deep"].includes(depthLevel)) {
        throw new APIError(400, "invalid depthlevel")
    }

    const workspace = await Workspace.create({
        user: req.user._id,
        name: name.trim(),
        daysToComplete,
        depthLevel,
        status: "processing"
    })

    let topics
    try {
        topics = await extractTopicsFromFile(req.file.buffer, req.file.mimetype);
    } catch (err) {
        workspace.status = "error";
        workspace.save();
        throw new APIError(500, err.message || "something went wrong while extracting topic from file")
    }

    await Topic.insertMany(
        topics.map((t, i) => ({
        workspace: workspace._id,
        name: t.name,
        weightagePercent: t.weightagePercent,
        order: i,
        subtopics: t.subtopics || [],
        }))
    )

    workspace.status = "ready";
    await workspace.save();

    return res.status(200).json(new APIResponse(200, workspace, "workspace created"))
})

export const getUserWorkspaces = asyncHandler( async (req, res) => {
    const workspace = await Workspace.find({user: req.user._id}).sort({ createdAt: -1})
    return res.status(200).json(new APIResponse(200, workspace, "workspace fetched."))
})

export const getWorkspaceById = asyncHandler( async (req, res) => {
    const workspace = await Workspace.findOne({_id: req.params.id, user: req.user._id});

    if (!workspace) throw new APIError(404, "workspace not found");

    const topics = await Topic.find({workspace: workspace._id}).sort("order");

    return res.status(200).json(new APIResponse(200, {workspace, topics}, "workspace fetched."))
})

export const createSchedule = asyncHandler( async (req, res) => {
  const workspace = await Workspace.findOne({ _id: req.params.id, user: req.user._id });
  if (!workspace) throw new APIError(404, "workspace not found");

    if (workspace.status != 'ready') {
        throw new APIError(400, "cannot generated the schedule");
    }

    const topics = await Topic.find({
        workspace: workspace._id
    }).sort("order").lean();

    const { scheduleDays, warning } = generateSchedule(
        topics,
        new Date(),
        workspace.daysToComplete,
        workspace.depthLevel
    );

    for (const day of scheduleDays) {
        const scheduleDay = await ScheduleDay.create({
                workspace: workspace._id,
                date: day.date
            })

        await Task.insertMany(
            day.tasks.map((t) => ({
                topic: t.topicId,
                scheduleDay: scheduleDay._id,
            }))
        );    
    }

    workspace.status = 'scheduled';
    await workspace.save();

    return res.status(201).json(
        new APIResponse(201, { scheduleDays, warning }, "Schedule generated")
    )
})

export const getTodayTasks = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findOne({ _id: req.params.id, user: req.user._id });
  if (!workspace) throw new APIError(404, "Workspace not found");
 
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
 
  const scheduleDays = await ScheduleDay.find({
    workspace: workspace._id,
    date: { $gte: startOfToday, $lte: endOfToday },
  });
 
  const dayIds = scheduleDays.map((d) => d._id);
 
  let tasks = await Task.find({
    scheduleDay: { $in: dayIds },
    status: "pending",
  })
    .populate("topic", "name subtopics")
    .populate("scheduleDay", "date");

  const sortedTasks = tasks.sort((a, b) => a.scheduleDay.date - b.scheduleDay.date);
 
  return res.status(200).json(
    new APIResponse(200, { tasks: sortedTasks, remainingCount: sortedTasks.length }, "Today's tasks fetched")
  );
});

export const getAllTasks = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findOne({ _id: req.params.id, user: req.user._id });
  if (!workspace) throw new APIError(404, "Workspace not found");

  const topicIds = await Topic.find({ workspace: workspace._id }).distinct("_id");

  const tasks = await Task.find({
    topic: { $in: topicIds },
  })
    .populate("topic", "name subtopics")
    .populate("scheduleDay", "date")
    .sort({ createdAt: -1 });

  const tasksByStatus = {
    pending: tasks.filter(t => t.status === 'pending'),
    done: tasks.filter(t => t.status === 'done'),
    skipped: tasks.filter(t => t.status === 'skipped'),
  };

  return res.status(200).json(
    new APIResponse(200, { tasks, tasksByStatus, total: tasks.length }, "All tasks fetched")
  );
});

export const getWorkspaceProgress = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findOne({ _id: req.params.id, user: req.user._id });
  if (!workspace) throw new APIError(404, "Workspace not found");
 
  const topicIds = await Topic.find({ workspace: workspace._id }).distinct("_id");
 
  const [totalTasks, completedTasks] = await Promise.all([
    Task.countDocuments({ topic: { $in: topicIds } }),
    Task.countDocuments({ topic: { $in: topicIds }, status: "done" }),
  ]);
 
  const percentComplete = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
 
  return res.status(200).json(
    new APIResponse(200, { totalTasks, completedTasks, percentComplete }, "Progress fetched")
  );
});