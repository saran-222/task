import xlsx from 'xlsx';
import fs from "fs"
import {USER} from "../model/userModel.js"
import bcrypt from "bcryptjs"



export default class SheetController {


    static async uploadFile(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            const filePath = req.file.path;
            const fileBuffer = fs.readFileSync(filePath);
            const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                return res.status(400).json({ message: 'No sheets found in the file' });
            }
            const sheetName = workbook.SheetNames[0];
            const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
            if (!sheetData || sheetData.length === 0) {
                return res.status(400).json({ message: 'No data found in the sheet' });
            }
            const usersToInsert = [];
            const saltRounds = 10;
            for (const row of sheetData) {
                const existingUser = await USER.findOne({ email: row.email });
                if (existingUser) {
                    continue;
                }
                if (!row.password) {
                    return res.status(400).json({ message: 'Password is required for user: ' + row.email });
                }
                const password = String(row.password);
                if (typeof password !== 'string') {
                    return res.status(400).json({ message: 'Password must be a string for user: ' + row.email });
                }
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                const dob = new Date(row.dob);
                if (isNaN(dob)) {
                    return res.status(400).json({ message: `Invalid date of birth for ${row.email}` });
                }
                const user = {
                    first_name: row.first_name,
                    last_name: row.last_name,
                    password: hashedPassword,
                    gender: row.gender,
                    role: row.role,
                    dob: dob,
                    email: row.email,
                    city: row.city,
                    state: row.state,
                    created_at: new Date(),  
                    updated_at: new Date()   
                };
                usersToInsert.push(user);
            }
            if (usersToInsert.length > 0) {
                await USER.insertMany(usersToInsert);
            }
            if (!res.headersSent) {
                return res.status(200).json({ message: 'Data imported successfully', users: usersToInsert });
            }
        } catch (error) {
            console.error('Error during file upload:', error);
                return res.status(500).json({message: 'An error occurred during file upload',})
        }
    }
    
    

    static async exportFile(req, res, next) {
        try {
            const users = await USER.find({}, { password: 0,_id:0 }); 
            if (users.length === 0) {return res.status(400).json({ message: "No users found" });}
            const columnNames = Object.keys(users[0].toObject());  
            const usersFormatted = users.map(user => {
                const userObj = user.toObject(); 
                userObj.dob = userObj.dob ? userObj.dob.toISOString().split('T')[0] : '';
                userObj.created_at = userObj.created_at ? userObj.created_at.toISOString().split('T')[0] : '';
                userObj.updated_at = userObj.updated_at ? userObj.updated_at.toISOString().split('T')[0] : '';
                return userObj;
            });
            const worksheet = xlsx.utils.json_to_sheet(usersFormatted, {
                header: columnNames  
            });
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Users');
            const fileBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=users_export.xlsx');
            res.setHeader('Content-Length', fileBuffer.length);
            res.send(fileBuffer);
        } catch (error) {
            console.error("Error exporting users:", error);
            return res.status(500).json({ message: 'An error occurred during export', error: error.message });
        }
    }
    
    
    
    
    



}
