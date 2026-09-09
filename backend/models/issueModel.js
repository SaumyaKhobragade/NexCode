import mongoose from "mongoose";

const { Schema } = mongoose;

const IssueSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open",
        },
        author: {
            type: String,
            default: "developer",
        },
        labels: [
            {
                type: String,
            },
        ],
        comments: [
            {
                author: {
                    type: String,
                    default: "developer",
                },
                text: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        repository: {
            type: Schema.Types.ObjectId,
            ref: "Repository",
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const Issue = mongoose.model("Issue", IssueSchema);
export default Issue;
