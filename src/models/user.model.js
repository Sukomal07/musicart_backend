import { Schema, model } from 'mongoose'
import JWT from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minLength: [3, 'Name must be at least 3 character'],
        maxLength: [15, 'Name should be less than 15 character'],
        trim: true
    },
    mobile: {
        type: String,
        unique: true,
        required: [true, 'Mobile number is required'],
        match: [/^\d{10}$/, 'Please enter valid number']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Please Enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [6, 'Password must be at least 6 character '],
        match: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, 'Password must be contains number and letter'],
        select: false
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods = {
    isPasswordCorrect: async function (password) {
        return await bcrypt.compare(password, this.password);
    },
    generateAccessToken: async function () {
        return JWT.sign({
            _id: this._id,
            name: this.name,
            email: this.email
        }, process.env.ACCESS_TOKEN_SECRET
        )
    }
}

const User = model("User", userSchema);

export default User;