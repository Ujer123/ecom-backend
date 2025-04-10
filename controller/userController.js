import userModel from "../model/userModel.js";

export const getUserData = async (req, res)=>{
    try {

        const{userId}= req.body;

        const user = await userModel.findById(userId);

        if(!user){
            return res.json({message: 'User not found', success: false})
        }

        res.json({success: true, userData: {
            name: user.name,
            isAccountVerified: user.isAccountVerified
        }})
        
    } catch (error) {
        res.json({message: error.message, success: false})
    }
}