import express from "express";
import {registerController,
  loginController, 
  testController, 
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController
} from "../controllers/authController.js";

import {  isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import userModel from "../models/userModel.js";


//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//Forgot Password || POST
router.post("/forgot-password", forgotPasswordController);

//test routes
router.get("/test",requireSignIn,isAdmin,testController);

//protected User route auth
router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
  });

  //protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", requireSignIn, updateProfileController);


//orders
router.get("/orders", requireSignIn, getOrdersController);

//all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// order status update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

// Get all users
router.get("/all-users", requireSignIn, isAdmin, async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    res.status(200).send({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting users",
      error,
    });
  }
});

// Update user role
router.put("/update-user-role/:id", requireSignIn, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating user role",
      error,
    });
  }
});

// Delete user
router.delete("/delete-user/:id", requireSignIn, isAdmin, async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting user",
      error,
    });
  }
});

export default router;