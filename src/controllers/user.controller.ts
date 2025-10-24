import { Request, Response } from "express";
import User from "../models/user";

export const getUser = (req: Request, res: Response) => {
  try {
    const user = req.user;
    return res.status(200).json({ data: user });
  } catch (error) {
    console.log("Error in getUser controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.user._id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name;
    user.addressLine1 = req.body.addressLine1;
    user.country = req.body.country;
    user.city = req.body.city;
    const updatedUser = await user.save();

    return res.status(200).json({
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        addressLine1: updatedUser.addressLine1,
        country: updatedUser.country,
        city: updatedUser.city,
      },
    });
  } catch (error) {
    console.log("Error in updateUser controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
