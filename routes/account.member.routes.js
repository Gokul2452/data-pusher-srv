const express = require('express');
const router = express.Router();
const AccountMember = require('../models/AccountMember');
const Users = require('../models/Users');
const Account = require('../models/Account');
const Roles = require('../models/Roles');
const authGuardMiddleWare = require('../middleware/auth')
const { createAccountMemberValidator } = require('../validators/common.validator');
const validate = require('../middleware/validate');

router.post('/', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(['ADMIN']),
    createAccountMemberValidator, validate,
    async (req, res) => {
        try {
            const body = req.body;

            const is_account_exist = await Account.findOne({ account_id: body.account_id }).lean();
            if (!is_account_exist) {
                return res.status(404).json({ message: `Invalid account_id ${body.account_id}` });
            }

            const is_user_exist = await Users.findOne({ sub: body.user_id }).lean();
            if (!is_user_exist) {
                return res.status(404).json({ message: `Invalid user_id ${body.user_id}` });
            }

            const is_role_exist = await Roles.findOne({ role_id: body.role_id }).lean();
            if (!is_role_exist) {
                return res.status(404).json({ message: `Invalid role_id ${body.role_id}` });
            }

            const NewAccountMember = new AccountMember(body);
            NewAccountMember.created_by = NewAccountMember.updated_by = req.user.sub;
            await NewAccountMember.save();

            return res.json(NewAccountMember);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    });

router.get('/:id', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(['ADMIN', 'USER']), async (req, res) => {
    try {
        if (!req?.params?.id) {
            throw new Error(`id is required!`);
        }
        const account_member = await AccountMember.findOne({ _id: req.params.id }).lean();
        if (account_member) return res.json(account_member);
        else return res.status(404).json({ message: 'Account member not found' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

router.get('/utils/list', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(['ADMIN', 'USER']), async (req, res) => {
    try {
        const account_member = await AccountMember.find();
        return res.json(account_member);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.put('/:id', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(['ADMIN']), async (req, res) => {
    try {
        const incoming_request = req.body;

        const is_account_exist = await AccountMember.findOne({ _id: req.params.id });

        if (!is_account_exist) {
            return res.status(404).json({ message: 'Account member not found' });
        }

        let is_value_changed = false;
        if (incoming_request?.account_id && incoming_request.account_id !== is_account_exist.account_id) {
            is_account_exist.account_id = incoming_request?.account_id;
            is_value_changed = true;
        }
        if (incoming_request?.user_id && incoming_request.user_id !== is_account_exist.user_id) {
            is_account_exist.user_id = incoming_request?.user_id;
            is_value_changed = true;
        }
        if (incoming_request?.role_id && incoming_request.role_id !== is_account_exist.role_id) {
            is_account_exist.role_id = incoming_request?.role_id;
            is_value_changed = true;
        }
        if (is_value_changed) {
            is_account_exist.updated_by = req.user.sub;
            await is_account_exist.save();
        }

        return res.json(is_account_exist);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(['ADMIN']), async (req, res) => {
    try {
        const is_account_exist = await AccountMember.findOne({ _id: req.params.id });

        if (!is_account_exist) return res.status(404).json({ message: 'Account member not found' });

        await is_account_exist.deleteOne();
        await Users.deleteOne({ sub: is_account_exist.user_id })
        return res.json({ success: true, message: 'Account member deleted successfully' });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

module.exports = router;