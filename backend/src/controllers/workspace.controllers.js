import { Workspace } from "../models/workspace.models.js"
import { Topic } from "../models/topic.models.js"
import { extractTopicsFromFile } from "../utils/geminiExtraction.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"

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