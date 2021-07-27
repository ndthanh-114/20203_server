import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/users.js'

export const signin = async (req, res) => {
    const {email, password} = req.body;

    try {
        const existingUser = await User.findOne({email});

        if(!existingUser) return res.status(404).json({message: "Không tìm thấy người dùng"});

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if(!isPasswordCorrect) return res.status(400).json({message: "Kiểm tra lại mật khẩu"});

        const token = jwt.sign({email: existingUser.email, id: existingUser._id}, 'test', {expiresIn: "1h"});

        res.status(200).json({result: existingUser, token});
    } catch (error) {
        res.status(500).json({message: "Sai ở đâu đó."});
    }
}

export const signup = async (req, res) => {
    const {email, password, confirmPassword} = req.body;

    try {
        const existingUser = await User.findOne({email});

        if(existingUser) return res.status(404).json({message: "Đã tồn tại người dùng"});

        if(password !== confirmPassword)
            return res.status(400).json({message: 'Kiểm tra lại password'})

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await User.create({email, password: hashedPassword})

        const token = jwt.sign({email: result.email, id: result._id, password}, 'test', {expiresIn: "1h"});

        res.status(200).json({result, token});
    } catch (error) {
        res.status(500).json({message: "Sai ở đâu đó"});
    }
}