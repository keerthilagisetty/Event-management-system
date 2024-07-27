const User=require('../models/user-model');
const Bookings=require('../models/booking-model');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken')
const register=async (req,res,next)=>{
    const {username,email,password}=req.body
    let existingUser;
    try{
        existingUser=await User.findOne({email:email})
    }
    catch(err){
        console.log(err)
    }
    if(existingUser){
        return res.status(400).json({message:'user already exists!Login Instead'})
    }
    const hashedPassword=bcrypt.hashSync(password)
    const user=new User({
        username,
        email,
        password:hashedPassword,
    });
    try{
        await user.save();
    }
    catch(err){
        console.log(err);
    }
    return res.status(201).json({message:user});
}


const login=async(req,res,next)=>{
    const{email,password}=req.body
    let existingUser;
    try{
        existingUser=await User.findOne({email:email})
    }
    catch(err){
        return new Error(err)
    }
    if(!existingUser){
        return res.status(400).json({message:'User not found!SignUp Please'})
    }
    const isPasswordCorrect=bcrypt.compareSync(password,existingUser.password)
    if(!isPasswordCorrect){
        return res.status(400).json({message:'Invalid Email/Password'})
    }
    const token=jwt.sign({id:existingUser._id},process.env.jwtSecretKey,{
        expiresIn:'1h'
    })
    console.log("Generated Token\n", token);
    if (req.cookies[`${existingUser._id}`]) {
        req.cookies[`${existingUser._id}`] = "";
      }
    res.cookie(String(existingUser._id),token,{
        path:'/',
        expires:new Date(Date.now()+1000* 65 * 60),
        httpOnly:true,
        sameSite:'lax'
    })
    return res.status(200).json({message:'Sucessfully Logged In',userId:existingUser._id,token})//hs8256
}

const getBookingsOfUser = async (req, res, next) => {
    const id = req.params.id;
    let bookings;
    try {
      bookings = await Bookings.find({ user: id })
        .populate("event")
        .populate("user");
    } catch (err) {
      return console.log(err);
    }
    if (!bookings) {
      return res.status(500).json({ message: "Unable to get Bookings" });
    }
    return res.status(200).json({ bookings });
  };


const verifyToken = (req, res, next) => {
  const cookies = req.headers.cookie;

  if (!cookies) {
    return res.status(404).json({ message: 'No token found' });
  }

  const token = cookies.split('=')[1];

  if (!token) {
    return res.status(404).json({ message: 'No token found' });
  }

  console.log(token);

  jwt.verify(String(token), process.env.jwtSecretKey, (err, user) => {
    if (err) {
      return res.status(400).json({ message: 'Invalid Token' });
    }
    console.log(user.id);
    req.id = user.id;
  });

  next();
};


const refreshToken=(req, res, next) => {
    const cookies = req.headers.cookie;
    const prevToken = cookies.split("=")[1];
    if (!prevToken) {
      return res.status(400).json({ message: "Couldn't find token" });
    }
    jwt.verify(String(prevToken), process.env.jwtSecretKey, (err, user) => {
      if (err) {
        console.log(err);
        return res.status(403).json({ message: "Authentication failed" });
      }
      res.clearCookie(`${user.id}`);
      req.cookies[`${user.id}`] = "";
  
      const token = jwt.sign({ id: user.id },process.env.jwtSecretKey, {
        expiresIn: "1h",
      });
      console.log("Regenerated Token\n", token);

    res.cookie(String(user.id), token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 65 *60), // 30 seconds
      httpOnly: true,
      sameSite: "lax",
    });

    req.id = user.id;
    next();
  });
};


const getUser = async (req, res, next) => {
    const id = req.params.id;
    let user;
    try {
      user = await User.findById(id);
    } catch (err) {
      return console.log(err);
    }
    if (!user) {
      return res.status(500).json({ message: "Unexpected Error Occured" });
    }
    return res.status(200).json({ user });
  };

const logout = (req, res, next) => {
    const cookies = req.headers.cookie;
    const prevToken = cookies.split("=")[1];
    if (!prevToken) {
      return res.status(400).json({ message: "Couldn't find token" });
    }
    jwt.verify(String(prevToken), process.env.jwtSecretKey, (err, user) => {
      if (err) {
        console.log(err);
        return res.status(403).json({ message: "Authentication failed" });
      }
      res.clearCookie(`${user.id}`);
      req.cookies[`${user.id}`] = "";
      return res.status(200).json({ message: "Successfully Logged Out" });
    });
  };


exports.register=register;
exports.login=login;
exports.verifyToken=verifyToken;
exports.getUser=getUser;
exports.refreshToken=refreshToken;
exports.logout=logout;
exports.getBookingsOfUser=getBookingsOfUser