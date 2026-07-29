import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        syllabusFileUrl: {
            type: String,
            required: true
        },
        rawText: {
            type: String // text extracted from the PDF
        },
        daysToComplete: {
            type: Number
        },
        depthLevel: {
            type: String,
            enum: ["quick", "moderate", "deep"]
        },
        status: {
            type: String,
            enum: ["processing", "ready", "scheduled", "active", "done", "error"],
            default: "processing",
        }
    },
    { timestamps: true }
);

export const Workspace = mongoose.model("Workspace", workspaceSchema);