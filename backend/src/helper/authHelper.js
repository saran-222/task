
import 'dotenv/config'
import jwt from 'jsonwebtoken';

export default class AuthHelper {


    static formatDate(dob) {
        const dobDate = new Date(dob);
        return !isNaN(dobDate) ? dobDate.toISOString().split('T')[0] : null;
    };

    static generateAccessToken(user) {
        try {
            return jwt.sign({ user }, process.env.JWTSECRET)
        }
        catch (error) {
            throw new Error(error.message);
        }
    }


    static authorizationToken(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                return res.status(401).send({ error: "Authorization header is missing" });
            }
            const [tknType, token] = authHeader.split(' ');
            if (tknType !== 'Bearer' || !token) {
                return res.status(401).send({ error: "Unauthorized token type or missing token" });
            }
            const decoded = jwt.verify(token, process.env.JWTSECRET);
            if (!decoded) { return res.status(403).send({ error: "AccessToken Not Valid Forbidden" }); }
            req.user = decoded.user;
            let tokenDate = new Date(req.user.date);
            let currentdate = new Date();
            const diffTime = currentdate.getTime() - tokenDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            if (diffDays > 7) {
                return res.status(401).send({ error: "token expired" })
            } 
            next();
        } catch (error) {
            console.error("Error verifying token:", error.message);
            return res.status(500).send({ error: "Failed to authenticate token" });
        }
    }





}






