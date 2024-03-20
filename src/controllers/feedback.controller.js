import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from '../utils/error.js'
import { apiResponse } from '../utils/apiResponse.js'
import Feedback from "../models/feedback.model.js";

export const sendFeedback = asyncHandler(async (req, res) => {
    const { feedback_type, message } = req.body

    if (!feedback_type || !message) {
        throw new apiError(400, 'All feilds required')
    }

    const feedback = new Feedback({
        userId: req.user?._id,
        feedback_type,
        message
    })

    try {
        await feedback.validate()
    } catch (error) {
        const validationErrors = [];
        for (const key in error.errors) {
            validationErrors.push(error.errors[key].message);
        }
        throw new apiError(400, validationErrors.join(', '));
    }

    await feedback.save()

    res.status(201).json(
        new apiResponse(201, feedback, 'Feedback send successfully')
    )
})