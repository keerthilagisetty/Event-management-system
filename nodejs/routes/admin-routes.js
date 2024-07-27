const express=require('express')
const {
  addAdmin,
  adminLogin,
  getAdminById,
  getAdmins,
  refreshToken,verifyToken,logouteo
} =require("../controllers/admin-controller");

const adminRouter = express.Router();

adminRouter.post("/registereo", addAdmin);
adminRouter.post("/logineo", adminLogin);
adminRouter.get("/", getAdmins);
adminRouter.get("/:id", getAdminById);
adminRouter.get('/refresheo',refreshToken,verifyToken,getAdminById)
adminRouter.post('/logouteo',verifyToken,logouteo)

module.exports=adminRouter;