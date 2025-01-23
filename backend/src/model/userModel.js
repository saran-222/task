import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
const SALT_ROUND = 10;

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    gender: { type: String, required: true,enum: ["male","female","others"] },
    dob: {type:Date},
    email: {type:String},
    city: { type: String, required: true },
    state: { type: String, required: true },
    created_at: { type: Date,default: Date.now },
    updated_at: { type: Date,default: Date.now }

}, {
    versionKey: false
})

userSchema.pre("save", async function (next) {
    const user = this;
    try {
        if (user.isModified('password')) {  
            const salt = await bcrypt.genSalt(SALT_ROUND);
            const hash = await bcrypt.hash(user.password, salt);
            user.password = hash;
        }
        if (!user.created_at) {
            user.created_at = new Date();
        }
        next();
    } catch (error) {
        next(error);
    }
});

const USER = mongoose.model('user', userSchema, "user");
export { USER }