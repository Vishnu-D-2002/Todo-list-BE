const User = require("../Models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils");
const nodemailer = require("nodemailer");

const userController = {
  signup: async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const user = await User.findOne({ name, email });
      if (!user) {
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({
          name,
          email,
          passwordHash,
        });
        await newUser.save();
        return res.status(200).send({
          message: "Activation Mail Sent Successfull to your Mail",
          newUser,
        });
      } else {
        return res
          .status(201)
          .send({ message: "Existing Email Id , please login" });
      }
    } catch (e) {
      res.status(500).send({ message: "signup Error", e });
      console.log("error", e);
    }
  },
  signin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email, activated: true });
      console.log(user);
      if (user) {
        const passCheck = await bcrypt.compare(password, user.passwordHash);
        if (!passCheck) {
          return res.send({ message: "Password is wrong" });
        }
        let token = await jwt.sign(
          {
            email,
            id: user._id,
          },
          JWT_SECRET
        );
        res.status(200).send({ message: "Signin sucess", token, user });
      } else {
        res.send({ message: "No Users found" });
      }
    } catch (e) {
      res.status(500).send({ message: "signin error", e });
    }
  },
  activationLink: async (req, res) => {
    try {
      const { email } = req.params;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const activationToken = Math.random().toString(36).slice(-7);

      user.activationToken = activationToken;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "143.unstopable@gmail.com",
          pass: "zswy eiiy lqre zznf",
        },
      });

      const message = {
        from: "143.unstopable@gmail.com",
        to: email,
        subject: "Account Activation Link",
        text: `You are requested to Activate your Account ,Click below Link to Activate
        https://notes-take-app.netlify.app/activate/${activationToken}`,
      };

      transporter.sendMail(message, (err, info) => {
        if (err) {
          res.status(404).json({ message: "something went wrong,try again !" });
        }
        res
          .status(200)
          .json({ message: "Activation Link sent successfully", info });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  },

  activateAccount: async (req, res) => {
    try {
      const { activationToken } = req.params;

      const user = await User.findOne({ activationToken, activated: false });

      if (user) {
        (user.activationToken = null), (user.activated = true);
        await user.save();
        res.json({ message: "Account Activated Succeessfully" });
      } else {
        res.json({ message: "Token Invalid or Already Activated" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const randomString = Math.random().toString(36).slice(-7);

      user.randomString = randomString;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "143.unstopable@gmail.com",
          pass: "zswy eiiy lqre zznf",
        },
      });

      const message = {
        from: "143.unstopable@gmail.com",
        to: email,
        subject: "Password Reset Link",
        text: `You are requested to change the password of user login ,So please click this url
        https://notes-take-app.netlify.app/resetPassword/${randomString}`,
      };

      transporter.sendMail(message, (err, info) => {
        if (err) {
          res.status(404).json({ message: "something went wrong,try again !" });
        }
        res.status(200).json({ message: "Email sent successfully", info });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  },

  newPassword: async (req, res) => {
    try {
      const { randomString, newPassword } = req.body;

      const stringMatches = await User.findOne({ randomString });

      if (!stringMatches) {
        return res.status(500).json({ message: "OTP is Incorrect" });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      const user = await User.findOneAndUpdate(
        { email: stringMatches.email },
        { $set: { passwordHash } },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.randomString = "NULL";
      await user.save();

      return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  },
};
module.exports = userController;
