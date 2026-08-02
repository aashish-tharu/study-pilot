import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { User } from "../models/user.models.js"
import jwt from "jsonwebtoken"


const registerUser = asyncHandler(async (req, res) => {
    //steps i have followed.
    //get user details
    // validation
    // check if user already exist through email and username
    // check for for image and avatar
    // uploading file to cloudinary
    // create user object 
    // remove password and response from token
    // check for user creation
    // return response
    
    const {username, fullName, email, password } = req.body;
    
    if (
        [username, fullName, email, password].some((field) => !field || String(field).trim() === "")
    ) {
        throw new APIError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new APIError(409, "User with email or username already exists")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new APIError(500, "Something went wrong while creating user")
    }

    return res.status(200).json(
        new APIResponse(200, createdUser, "User created successfully")
    )
});

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) throw new Error("User not found")
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new APIError(500, "Something went wrong while generating refresh and access token.")
    }
}

const loginUser = asyncHandler( async (req, res) => {
    // req body -> data
    // username or email
    // find the user 
    // password check
    // access and refresh token
    // send cookies
    
    const { username, email, password } = req.body;
    if (!username && !email) {
        throw new APIError(400, "username or email is required.")
    }

    const user = await User.findOne({
        $or : [{username}, {email}]
    })
    if (!user) {
        throw new APIError(400, "user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new APIError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new APIResponse(
            200,
            {
                user: loggedUser,
                accessToken,
                refreshToken
            },
            "User logged in successful."
        )
    )
})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new APIResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new APIError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new APIError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new APIError(401, "refresh token is expired or used")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIResponse(
                200,
                {
                    accessToken,
                    refreshToken
                },
                "access token refresh"
            )
        )
    } catch (error) {
        throw new APIError(401, error?.message || "Invalid refresh token")
    }
})

const updatePassword = asyncHandler( async (req, res) => {
    const { oldPassword, newPassword} = req.body;
    if (!oldPassword || !newPassword) {
        throw new APIError(404, "password field is empty")
    }

    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new APIError(400, "user not found")
    }

    const validUserDetails = await user.isPasswordCorrect(oldPassword);
    if (!validUserDetails) {
        throw new APIError(400, "incorrect password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new APIResponse(200, {}, "password changed."))
})

const getCurrentUser = asyncHandler( async (req, res) => {
    return res.status(200).json(new APIResponse(200, req.user, "current user fetched successfully"))
})

export { registerUser, loginUser, logoutUser, updatePassword,  getCurrentUser, refreshAccessToken };