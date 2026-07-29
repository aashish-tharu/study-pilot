import mongoose from "mongoose"

const topicSchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        weightagePercent: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }, 
        order: {
            type: Number,
            required: true
        },
        subtopics: [
            {
                type: String
            }
        ]
    },
    { timestamps: true }
)

export const Topic = mongoose.model("Topic", topicSchema)