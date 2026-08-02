import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
})

//hashing user's password
userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, 10);
})

//comparing password during login
userSchema.methods.isPasswordCorrect = async function(inputPassword) {
    return await bcrypt.compare(inputPassword, this.password)
}

//generating access token
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id: this._id,
            email:this.email,
            username: this.username,
            fullname: this.fullName
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

//generating refresh token
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id: this._id,
        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema)