import User from '../models/user.js'
import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken'


// create user
export const createUser = async (req, res) => {
  try {
    const {name,password,email}=req.body
    // user already exists ?
    const existingUser=await User.findOne({ email })
    if (existingUser) {
      console.log('user already exists')
      return res.status(400).json({ message:'User already exists'})
    }
    const HashedPass=await bcrypt.hash(String(password), 10)
    
    const newUser = await User.create(
        {
            ...req.body,
            password:HashedPass,
        }
    )
    console.log('user created successfully')
    // const {name,email,password}=req.body
    console.log(req.body.name,newUser.email)
    res.status(201).json(newUser)
    } catch (err) {
    console.error(err)
    res.status(500).json({ message:'Server error'})
  }
}
// login
export const loginUser =async(req,res)=>{
try{
    const {email,password}=req.body;


    // check user exists?
    const user = await User.findOne({email});
    if (!user){
        console.log("user does not exists ")
        return res.status(400).json({message: "user not found "})
    }

     // then verify password
const isValidPass= await bcrypt.compare(String(password),user.password)
if (!isValidPass){
    return res.status(400).json({message:"invalid password "})
}
// create token
const token=jwt.sign(
    { userId:user._id},
    process.env.JWT_SECRET,
    {expiresIn : "1h"}
);

// send response
//  res.cookie("token", token, {
//       httpOnly: true,
//       sameSite: "lax",
//       secure: false, // MUST be false on localhost
// });
  // send response
res.cookie("token", token, {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // ← CHANGE THIS
  secure: process.env.NODE_ENV === 'production',  // ← CHANGE THIS (true in production)
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

console.log('=====login success======')
console.log(email,req.body.password)

return res.status(200).json({
    message:"Login Success ",
    token,
    user:{
        id:user._id,
        name:user.name,
        email:user.email,
        }
    })
console.log("token on backend : ",token);

    // create cookies store it in users browser 

}catch(err){
    console.log("err in login : ",err);
    res.status(500).json({message:'server error'})
}
}

export const logoutUser=async (req,res)=>{
    
 res.clearCookie("token");
console.log('=====logout success======')
console.log(req.body.name,req.body.password)

res.status(200).json({ message: "User logged out" });


}
