const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
const AccountMember = require("../models/AccountMember");
const Roles = require("../models/Roles");
const authGuardMiddleWare = require('../middleware/auth')
const Tokens = require('../models/Tokens');

function isTokenExpired(token) {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return true;

        const currentTime = Date.now();
        const expiryTime = decoded.exp * 1000; // exp is in seconds
        return currentTime >= expiryTime;
    } catch (err) {
        return true;
    }
}

function roleGuard(requiredRoles) {
    return async (req, res, next) => {
        const userId = req.user.sub;
        const member = await AccountMember.findOne({ user_id: userId }).lean();
        if (!member) {
            return res.status(403).json({ success: false, message: "User not found in Account member." });
        }
        if (!member || !requiredRoles.includes(member.role_id)) {
            return res.status(403).json({ success: false, message: "Permission denied." });
        }

        next();
    };
}


const authGuard = () => async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    //Check manually before verifying
    if (isTokenExpired(token)) {
        return res.status(401).json({ success: false, message: "Token is expired" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const is_valid_token = await Tokens.exists({ token, is_active: false });
        if (is_valid_token) {
            return res.status(401).json({ success: false, message: "Not a valid token" });
        }

        const user = await Users.findOne({ sub: decoded.sub });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Not a valid token" });
    }
};

module.exports = { authGuard, roleGuard };
