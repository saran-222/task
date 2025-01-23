import express from "express";
import multer from 'multer';
import * as fs from 'fs'
import UserController from "./userController.js";
import AuthHelper from "../helper/authHelper.js";
import SheetController from "./sheetController.js";

const routesv1 = express.Router({ caseSensitive: true });

createDir("./uploads");
createDir("./uploads/documents");


async function createDir(location) {
    try {
        if (!(await fs.existsSync(location))) {
            await fs.mkdirSync(location);
            return location;
        } else {
            return location;
        }
    } catch (error) {
        return location;
    }
}

const DocumentsImage = multer.diskStorage({
    destination: async function (req, file, cb) {
        cb(null, await createDir("./uploads/documents/" ))
    },
    filename: function (req, file, cb) {
        try {
            let filename = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2) + "." + file.originalname.split('.').pop();
            cb(null, filename);
        } catch (err) {
            cb(null, "");
        }
    }
})
const Documents = multer({ storage: DocumentsImage });



// User COntroller
routesv1.post('/signup',UserController.saveUser);
routesv1.post('/login',UserController.login)

routesv1.use(AuthHelper.authorizationToken)


routesv1.put('/updateuser/:Id',UserController.updateUser);
routesv1.delete('/deleteuser/:Id',UserController.deleteUser);
routesv1.get('/getallusers',UserController.getAllUsers);


//Sheet Controller
routesv1.post('/uploadusers',Documents.single("file"),SheetController.uploadFile)
routesv1.get('/exportusers',SheetController.exportFile)

export { routesv1,createDir }