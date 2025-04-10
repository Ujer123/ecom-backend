import jwt from "jsonwebtoken";

const userAuth = async(req, res, next)=>{
    const {token}= req.cookies;
    if(!token){
        return res.status(401).json({message: "Unauthorized", success: false});
    }
    try{

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)

        if(tokenDecode.id){
            req.body.userId = tokenDecode.id
        }else{
            return res.status(401).json({message: "Unauthorized", success: false});
        }
        next();

    }catch(error){
        return res.status(500).json({message: error.message, success: false});
    }
}

export default userAuth;