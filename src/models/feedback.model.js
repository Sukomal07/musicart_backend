import { Schema, model } from "mongoose";

const feedbackSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'user id is required']
    },
    feedback_type: {
        type: String,
        required: [true, 'Feedback Type is required'],
        enum: ["bugs", "feedback", "query"]
    },
    message: {
        type: String,
        required: [true, 'Feedback message is required']
    }
}, { timestamps: true })

const Feedback = model("Feedback", feedbackSchema)

export default Feedback