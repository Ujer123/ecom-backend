import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userModel from '../model/userModel.js';
import tranporter from '../config/nodemailer.js';

export const register = async(req, res)=>{
    const{name, email, password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({message: "All fields are required", success: false});
    }
    try{

        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exists", success: false});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({name, email, password: hashedPassword});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict',
            maxAge: 7*24*60*60*1000
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to our website',
            text: `Hello ${name}, welcome to our website.Your accoutn has been created successfully with email id: ${email}`
        }

        await tranporter.sendMail(mailOptions)

        return res.json({message: "Registration successful", success: true});

    }catch(error){
        res.status(500).json({message: "Internal server error", success: false});
    }
}

export const login = async(req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: "All fields are required", success: false});
    }

    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid email", success: false});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid password", success: false});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict',
            maxAge: 7*24*60*60*1000
        })

        return res.json({message: "Login successful", success: true});

    }catch(error){
        return res.status(500).json({message: "Internal server error", success: false});
    }
}

export const logout = async(req, res)=>{
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict',
            maxAge: 7*24*60*60*1000
        });

        return res.json({message: "Logged out", success: true});

    }catch(error){
        return res.status(500).json({message: error.message, success: false});
    }
}

export const sendVerifyOTP = async(req, res)=>{
    try{
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success: false, message: "Account already verified"});
        }
        const otp = String(Math.floor(100000 + Math.random()*900000))
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
        }
        await tranporter.sendMail(mailOptions);
        res.json({success: true, message: "OTP sent successfully"});
    }catch(error){
        return res.status(500).json({message: error.message, success: false});
    }

}

export const verifyEmail = async(req, res)=>{
    const{userId, otp} = req.body;

    if(!userId || !otp){
        return res.status(400).json({message: "All fields are required", success: false});
    }
    try{
        const user = await userModel.findById(userId);
        if(!user){
            return res.status(404).json({message: "User not found", success: false});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.status(400).json({message: "Invalid OTP", success: false});
        }
        if(user.verifyOtpExpireAt < Date.now()){
            return res.status(400).json({message: "OTP expired", success: false});
        }
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();
        return res.json({message: "Account verified successfully", success: true});

    }catch(error){
        return res.status(500).json({message: error.message, success: false});
    }
}

export const isAuthenticated = async(req, res)=>{
    try {
        return res.json({message: 'Success', success: true});
    } catch (error) {
        return res.status(404).json({message: error.message, success: false})
    }
}

export const sendResetOtp = async(req, res)=>{
    const{email} = req.body;

    if(!email){
        return res.status(404).json({message: 'Email is required', success: false})
    }

    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(404).json({message: 'User is required', success: false});
        }

        const otp = String(Math.floor(100000 + Math.random()*900000))
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Use this OTP to proceed with resetting your password.`
        }
        await tranporter.sendMail(mailOptions);

        return res.json({message: 'OTP sent to your email', success: true});
        
    }catch(error){
        return res.status(500).json({message: error.message, success: false})
    }
}


export const resetPassword = async(req, res)=>{
    const{email, otp, newPassword}= req.body;

    if(!email || !otp || !newPassword){
        return res.status(404).json({message: 'All fields are required', success: false})
    }
    try{

        const user = await userModel.findOne({email});
        if(!user){
            return res.status(404).json({message: 'User is required', success: false});
        }

        if(user.resetOtp === '' || user.resetOtp !== otp){
            return res.status(404).json({message: 'Invalid OTP', success: false});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.status(404).json({message: 'Otp expired', success: false});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();
        
        return res.json({success: true, message: 'Password has been reset successfully'});
    }catch(error){
        return res.status(500).json({message: error.message, success: false})
    }
}