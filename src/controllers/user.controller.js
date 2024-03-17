import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from '../utils/error.js'
import { apiResponse } from '../utils/apiResponse.js'
import User from "../models/user.model.js";


export const registerUser = asyncHandler(async (req, res) => {
    const { name, mobile, email, password } = req.body

    if (!name || !mobile || !email || !password) {
        throw new apiError(400, "All feilds are required")
    }

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] })

    if (existingUser) {
        throw new apiError(409, "User with this email or mobile already exists")
    }

    const user = new User({
        name,
        mobile,
        email,
        password
    })

    try {
        await user.validate()
    } catch (error) {
        const validationErrors = [];
        for (const key in error.errors) {
            validationErrors.push(error.errors[key].message);
        }
        throw new apiError(400, validationErrors.join(', '));
    }

    await user.save()
    user.password = undefined

    const accessToken = await user.generateAccessToken()

    const options = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }

    res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .json(new apiResponse(201, user, "User created successfully"))
})

export const loginUser = asyncHandler(async (req, res) => {
    const { email, mobile, password } = req.body

    if ((!email && !mobile) || !password) {
        throw new apiError(400, 'Email or mobile number and password are required');
    }


    const user = await User.findOne({ $or: [{ email }, { mobile }] }).select("+password")

    if (!user) {
        throw new apiError(404, "User does not exists")
    }

    const isCorrectPassword = await user.isPasswordCorrect(password)

    if (!isCorrectPassword) {
        throw new apiError(401, 'Invalid user credentials')
    }

    user.password = undefined

    const accessToken = await user.generateAccessToken()

    const options = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }

    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(new apiResponse(201, user, `Welcome back ${user.name}`))
})

export const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true,
    }

    res
        .status(200)
        .clearCookie("accessToken", options)
        .json(
            new apiResponse(200, '', "logout successfully")
        )
})

export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new apiError(404, 'user does not exist')
    }

    res.status(200).json(
        new apiResponse(200, user, 'user fetched successfully')
    )
})
