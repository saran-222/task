import UserService from "../service/userService.js"
import AuthHelper from "../helper/authHelper.js";
import bcrypt from "bcryptjs"



export default class UserController {

  

    static async saveUser(req, res, next) {
        try {
            const { first_name, last_name, dob, email, password, gender, state, city, mobile } = req.body;
            if (!email) return res.status(400).send({ error: "email required" });
            const checkUser = await UserService.getOne({ email });
            if (checkUser) {
                return res.status(400).json({ error: "User already exists" });
            }
            const dobDate = new Date(dob);
            const dobFormatted = AuthHelper.formatDate(dobDate);
            const user = await UserService.Save({
                email,
                first_name,     
                last_name,       
                dob: dobFormatted,  
                role: "User",          
                state,
                city,
                password,
                gender,
            });
            res.status(201).send({ message: "User created" });
        } catch (error) {
            res.status(500).send({ error: "Error creating user", details: error.message });
        }
    }
    

    static async login(req, res, next) {
        try {
            const {email,password } = req.body;
            if (!email) return res.status(400).send({ error: "email required" });
            if (!password) return res.status(400).send({ error: "password required" });
            const user = await UserService.getOne({ email });
            if (!user) return res.status(400).send({ error: "User not found" });
            const isPasswordCorrect = await bcrypt.compare(password,user.password || "")
            if (!isPasswordCorrect) return res.status(400).send({ error: "Invalid password" });
            let createdToken = await AuthHelper.generateAccessToken({
                id: user._id,
                role: user.role,
                mobile: user.mobile,
                email: user.email,
                date: new Date(),
            })
                res.status(201).send({
                    result: {
                      _id: user._id,
                      token: createdToken,
                    },
                  });
        } catch (error) {
            res.status(500).send({ error: "Error in login", details: error.message });
        }
    }

    static async updateUser(req, res, next) {
        try {
            const { Id } = req.params;  
            const updateData = req.body;    
            if (!Id) return res.status(400).send({ error: "User ID required" });
            if (!updateData) return res.status(400).send({ error: "Update data required" });
            const user = await UserService.getById(Id);
            if (!user) return res.status(400).send({ error: "User not found" });
            Object.keys(updateData).forEach(key => {
                user[key] = updateData[key];
            });
            await user.save();
            res.status(200).send({message : "User upated"});
        } catch (error) {
            res.status(500).send({ error: "Error updating user", details: error.message });
        }
    }

    static async deleteUser(req, res, next) {
        try {
            const { Id } = req.params;  
            if (!Id) return res.status(400).send({ error: "User ID required" });
            const user = await UserService.deleteUser(Id)
            if (!user) return res.status(400).send({ error: "User not found" });
            res.status(200).send({message: "User deleted successfully"});
        } catch (error) {
            res.status(500).send({ error: "Error deleting user", details: error.message });
        }
    }


    static async getAllUsers(req, res, next) {
        try {
            const users = await UserService.getAllUsers();
            if (!users || users.length === 0) {
                return res.status(200).send([]);
            }
            const formattedUsers = users.map(user => {
                const formattedDob = user.dob && user.dob instanceof Date ? user.dob.toISOString().split('T')[0] : '';
                return {
                    ...user.toObject(),
                    dob: formattedDob
                };
            });
            res.status(200).send({ result: formattedUsers });
        } catch (error) {
            res.status(500).send({ error: "Error fetching users", details: error.message });
        }
    }
    
    
}



