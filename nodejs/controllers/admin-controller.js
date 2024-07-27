const Admin = require('../models/admin-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addAdmin = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email.trim() || !password.trim()) {
    return res.status(422).json({ message: "Invalid Inputs" });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const admin = new Admin({ username, email, password: hashedPassword });

    await admin.save();

    return res.status(201).json({ admin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const adminLogin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email.trim() || !password.trim()) {
    return res.status(422).json({ message: "Invalid Inputs" });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });

    if (!existingAdmin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, existingAdmin.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign({ id: existingAdmin._id }, process.env.jwtSecretKey, {
      expiresIn: "1h",
    });
    res.clearCookie(String(existingAdmin._id), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });
    res.cookie(String(existingAdmin._id), token, {
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 65), 
      httpOnly: true,
      sameSite: 'lax',
    });

    return res.status(200).json({
      message: "Authentication Complete",
      token,
      adminId:existingAdmin._id,
      // admin: { id: existingAdmin._id, email: existingAdmin.email },

    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find();
    return res.status(200).json({ admins });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAdminById = async (req, res, next) => {
  const id = req.params.id;

  try {
    const admin = await Admin.findById(id).populate("addedEvents");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({ admin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyToken=(req,res,next)=>{
  const cookies=req.headers.cookie
  const token=cookies.split('=')[1]
  console.log(token)


  if(!token){
      res.status(404).json({message:'No token found'})
  }
  jwt.verify(String(token),process.env.jwtSecretKey,(err,admin)=>{
      if(err){
      return res.status(400).json({message:'Invalid Token'})}
      console.log(admin.id)
      req.id=admin.id
  })
  next()
}

const refreshToken=(req, res, next) => {
  const cookies = req.headers.cookie;
  const prevToken = cookies.split("=")[1];
  if (!prevToken) {
    return res.status(400).json({ message: "Couldn't find token" });
  }
  jwt.verify(String(prevToken), process.env.jwtSecretKey, (err, admin) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Authentication failed" });
    }
    res.clearCookie(`${admin.id}`);
    req.cookies[`${admin.id}`] = "";

    const token = jwt.sign({ id: admin.id },process.env.jwtSecretKey, {
      expiresIn: "1h",
    });
    console.log("Regenerated Token\n", token);

  res.cookie(String(admin.id), token, {
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 *65),
    httpOnly: true,
    sameSite: "lax",
  });

  req.id = admin.id;
  next();
});
};

const logouteo = (req, res, next) => {
  const cookies = req.headers.cookie;
  const prevToken = cookies.split("=")[1];
  if (!prevToken) {
    return res.status(400).json({ message: "Couldn't find token" });
  }
  jwt.verify(String(prevToken), process.env.jwtSecretKey, (err, admin) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Authentication failed" });
    }
    res.clearCookie(`${admin.id}`);
    req.cookies[`${admin.id}`] = "";
    return res.status(200).json({ message: "Successfully Logged Out" });
  });
};


exports.addAdmin = addAdmin;
exports.adminLogin = adminLogin;
exports.getAdmins = getAdmins;
exports.getAdminById = getAdminById;
exports.logouteo=logouteo
exports.verifyToken=verifyToken
exports.refreshToken=refreshToken
