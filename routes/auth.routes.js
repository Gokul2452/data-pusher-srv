const express = require('express');
const router = express.Router();
const Roles = require('../models/Roles');
const Users = require('../models/Users');
const Account = require('../models/Account');
const AccountMember = require('../models/AccountMember');
const { v4: uuidv4 } = require('uuid');
const authGuardMiddleWare = require('../middleware/auth')
const tokenService = require('../utils/jwt')
const Tokens = require('../models/Tokens');

// registration
router.post('/admin/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        const existing = await Users.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: "User already exists" });

        const role = await Roles.findOne({ role_id: "ADMIN" }).lean();
        if (!role) return res.status(500).json({ success: false, message: "Role not found" });

        const uuid = uuidv4();

        const user = new Users({
            email,
            password,
            sub: uuid,
            role_id: role.role_id,
            created_by: "self",
            updated_by: "self"
        });

        await user.save();
        const adminRole = await Roles.findOne({ role_id: "ADMIN" });

        // Optional: create default account with user
        const newAccount = new Account({
            account_name: user.email,
            account_id: user.sub,
            app_secret_token: uuidv4(),
            email: user.email,
            is_user_account: true,
            created_by: user.sub,
            updated_by: user.sub
        });

        await newAccount.save()

        // Add user to account member table with Admin role
        new AccountMember({
            account_id: newAccount.account_id,
            user_id: user.sub,
            role_id: adminRole.role_id,
            created_by: user.sub,
            updated_by: user.sub
        }).save();

        return res.status(200).json({
            success: true,
            message: 'Registration successfully'
        });

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
})

//login
router.post('/public/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const is_email_exist = await Users.exists({ email })
        if (!is_email_exist) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }

        const user = await Users.findOne({ email, password }, { email: 1, sub: 1 }).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'Invalid email or password' });
        }

        const token = tokenService.generateToken(user);

        // saving the token
        const newToken = new Tokens({
            token: token,
            user_id: user.sub
        });

        await newToken.save();

        return res.status(200).json({
            success: true,
            message: 'Login successfully',
            token
        });

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
})

// invite user
router.post('/invite/user', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(['ADMIN']),
    async (req, res) => {
        try {
            const { email, role_id, account_id, password } = req.body;
            const existingUser = await Users.findOne({ email });
            const sub = req.user.sub;
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            // Fetch role by name
            const role = await Roles.findOne({ role_id });
            if (!role) {
                return res.status(400).json({ success: false, message: 'Invalid role' });
            }

            // Create user
            const user = new Users({
                email,
                password,
                created_by: sub,
                updated_by: sub
            });

            await user.save();

            // Link user to account
            await new AccountMember({
                user_id: user.sub,
                account_id,
                role_id: role.role_id,
                created_by: sub,
                updated_by: sub
            }).save();

            // You can send email with password (use nodemailer if needed)
            res.status(201).json({
                success: true,
                message: 'User invited successfully'
            });

        } catch (err) {
            res.status(500).json({ success: false, message: 'Invite failed', error: err.message });
        }
    });

router.get('/public/logout/:token', async (req, res) => {
    try {

        const token = req.params.token;

        const is_token_exist = await Tokens.findOne({
            token,
            is_active: true
        });

        if (is_token_exist) {
            is_token_exist.is_active = false;
            await is_token_exist.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Logout successfully'
        });

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
})

module.exports = router;