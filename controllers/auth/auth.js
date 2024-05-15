import pool from "../../config/config.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import bcrypt from "bcrypt";
const saltRounds = 10; // Number of salt rounds for bcrypt hashing

// importing validators
import * as validators from "../../validators/index.js";
import { generateOTP, sendOTPToEmail } from "../../emailAndOtp/index.js";

export const otpForNewUser = async (req, res) => {
  try {
    // validations
    const emailId = req.body.user_email;
    const user_type = req.body.user_type;

    const emailValRes = validators.emailValidator(emailId);
    if (emailValRes.isInvalid)
      return res
        .status(emailValRes.status)
        .json({ success: false, msg: emailValRes.message });

    const typeValRes = validators.userTypeValidator(user_type);
    if (typeValRes.isInvalid)
      return res
        .status(typeValRes.status)
        .json({ success: false, msg: typeValRes.message });

    const client = await pool.connect();
    try {
      // check if already registered
      const result = await client.query(
        "SELECT COUNT(*) FROM users WHERE user_email = $1 AND user_type = $2",
        [emailId, user_type]
      );
      const count = parseInt(result.rows[0].count);
      if (count > 0) {
        return res.status(400).json({
          success: false,
          msg: `Another user having ${user_type} type already exists with email : ${emailId}.`,
        });
      }
      // check for already sent otp once
      const existingOtpResult = await client.query(
        "SELECT COUNT(*) FROM otpholder WHERE email = $1 AND user_type = $2",
        [emailId, user_type]
      );

      const existingOtpCount = parseInt(existingOtpResult.rows[0].count);
      let OTP;
      if (existingOtpCount > 0) {
        OTP = generateOTP();
        await client.query(
          "UPDATE otpholder SET otp = $1 WHERE email = $2 AND user_type = $3",
          [OTP, emailId, user_type]
        );
      } else {
        OTP = generateOTP();
        await client.query(
          "INSERT INTO otpholder (email, otp, user_type) VALUES ($1, $2, $3)",
          [emailId, OTP, user_type]
        );
      }
      // Send OTP to email
      sendOTPToEmail(emailId, OTP, user_type)
        .then(() => {
          return res
            .status(200)
            .json({ success: true, msg: "OTP has been sent to your email!" });
        })
        .catch((e) => {
          console.error("Error sending OTP email:", e);
          return res.status(500).json({
            success: false,
            msg: "An error occurred while sending OTP on email!",
          });
        });
    } catch (e) {
      console.error("Error during OTP generation:", e);
      return res
        .status(500)
        .json({ success: false, msg: "Internal Server Error" });
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("Error generating OTP for user!:", e);
    return res
      .status(500)
      .json({ success: false, msg: "Internal Server Error" });
  }
};

export const otpForNewUserVerify = async (req, res) => {
  try {
    // Validations
    const emailId = req.body.user_email;
    const user_type = req.body.user_type;
    const otpFromUser = req.body.otp;

    const emailValRes = validators.emailValidator(emailId);
    if (emailValRes.isInvalid)
      return res
        .status(emailValRes.status)
        .json({ success: false, msg: emailValRes.message });

    const typeValRes = validators.userTypeValidator(user_type);
    if (typeValRes.isInvalid)
      return res
        .status(typeValRes.status)
        .json({ success: false, msg: typeValRes.message });

    const OTPValRes = validators.valiadateOTP(otpFromUser);
    if (OTPValRes.isInvalid)
      return res
        .status(OTPValRes.status)
        .json({ success: false, msg: OTPValRes.message });

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT otp FROM otpholder WHERE email = $1 AND user_type = $2",
        [emailId, user_type]
      );
      if (result.rows[0].count == 0)
        return res
          .status(401)
          .json({ success: false, msg: "Regenerate OTP first!" });

      const dbOTP = parseInt(result.rows[0]?.otp);
      console.log(otpFromUser, dbOTP);

      if (parseInt(dbOTP) && parseInt(otpFromUser) === dbOTP) {
        return res
          .status(200)
          .json({ success: true, msg: "OTP verification completed." });
      } else {
        return res.status(400).json({
          success: false,
          msg: "Incorrect OTP, Please enter correct OTP credentials.",
        });
      }
    } catch (e) {
      console.error("Error during OTP validation:", e);
      return res
        .status(500)
        .json({ success: false, msg: "Error during OTP validation." });
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("Error during OTP validation:", e);
    return res
      .status(500)
      .json({ success: false, msg: "Error during OTP validation." });
  }
};

export const register = async (req, res) => {
  try {
    const user_email = req.body.user_email;
    const user_name = req.body.user_name;
    const user_password = req.body.user_password;
    const cnfm_user_password = req.body.user_confirm_password;
    const user_username = req.body.user_username;
    const user_type = req.body.user_type;
    const user_phone_num = req.body.user_phone_num;
    const user_profile_pic = req.body.user_profile_pic;

    // validations
    const emailValRes = validators.emailValidator(user_email);
    if (emailValRes.isInvalid)
      return res
        .status(emailValRes.status)
        .json({ success: false, msg: emailValRes.message });

    const nameValRes = validators.nameValidator(user_name);
    if (nameValRes.isInvalid)
      return res
        .status(nameValRes.status)
        .json({ success: false, msg: nameValRes.message });

    const numValRes = validators.mobNumValidator(user_phone_num);
    if (numValRes.isInvalid)
      return res
        .status(numValRes.status)
        .json({ success: false, msg: numValRes.message });

    const usernameValRes = await validators.usernameValidator(user_username);
    if (usernameValRes.isInvalid)
      return res
        .status(usernameValRes.status)
        .json({ success: false, msg: usernameValRes.message });

    const typeValRes = validators.userTypeValidator(user_type);
    if (typeValRes.isInvalid)
      return res
        .status(typeValRes.status)
        .json({ success: false, msg: typeValRes.message });

    const passwordValRes = validators.passwordValidator(
      user_password,
      cnfm_user_password
    );
    if (passwordValRes.isInvalid)
      return res
        .status(passwordValRes.status)
        .json({ success: false, msg: passwordValRes.message });

    const hashedPassword = await bcrypt.hash(user_password, saltRounds);

    // saving new user to the database
    const client = await pool.connect();
    try {
      await client.query(
        "INSERT INTO users (user_name, user_email, user_password, user_username, user_type, user_phone_no, user_profile_pic) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          user_name,
          user_email,
          hashedPassword,
          user_username,
          user_type,
          user_phone_num,
          user_profile_pic,
        ]
      );
    } catch (e) {
      console.error("Error during user registration.", e);
      if (
        e.message ==
        "Another user with the same email or phone number and same user type already exists"
      )
        return res.json({
          success: false,
          msg: "Another user with this email or phone number already exists. Kindly change credentials or user type atleast.",
        });
      return res
        .status(500)
        .json({ success: false, msg: "Error during user registration." });
    } finally {
      client.release();
    }
    console.log(req.body);
    return res.json({ success: true, msg: "User registered successfully !" });
  } catch (e) {
    console.error("Error during registration", e);
    return res
      .status(500)
      .json({ success: false, msg: "Error during registration." });
  }
};

export const login = async (req, res) => {
  try {
    const { user_email, user_type, user_password } = req.body;

    const emailValRes = validators.emailValidator(user_email);
    if (emailValRes.isInvalid) {
      return res
        .status(emailValRes.status)
        .json({ success: false, msg: emailValRes.message });
    }
    const typeValRes = validators.userTypeValidator(user_type);
    if (typeValRes.isInvalid) {
      return res
        .status(typeValRes.status)
        .json({ success: false, msg: typeValRes.message });
    }
    if (!user_password)
      return res
        .status(400)
        .json({ success: false, msg: "Password field can't be empty." });

    // Find user in the database
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT user_id, user_password, user_type FROM users WHERE LOWER(user_email) = LOWER($1) AND user_type = $2",
        [user_email, user_type]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, msg: "User not found." });
      }
      const userData = result.rows[0];
      const passwordMatch = await bcrypt.compare(
        user_password,
        userData.user_password
      );
      if (passwordMatch) {
        const token = jwt.sign(
          {
            user_id: userData.user_id,
            user_email: user_email,
            user_type: userData.user_type,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        return res.status(200).json({
          success: true,
          msg: "User logged in successfully.",
          token: token,
        });
      } else {
        return res
          .status(400)
          .json({ success: false, msg: "Incorrect password." });
      }
    } catch (error) {
      console.error("Error during user login:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error during user login." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ success: false, msg: "Error during login." });
  }
};

const verifyToken = promisify(jwt.verify);

export const validateToken = async (req) => {
  try {
    const res = {
      isInvalid: false,
      message: "Error message",
      status: 500,
      decodedVals: "",
    };

    const token = req.headers.authorization.split(" ")[1];
    // console.log(token);

    if (!token || token === "undefined") {
      res.isInvalid = true;
      res.status = 401;
      res.message = "Token is missing.";
      return res;
    }

    // Verify token
    const decoded = await verifyToken(token, process.env.JWT_SECRET);
    // console.log(decoded);

    res.isInvalid = false;
    res.status = 200;
    res.message = "Token is valid.";
    res.decodedVals = decoded;

    return res;
  } catch (error) {
    console.error("Error validating token:", error);
    return {
      isInvalid: true,
      status: 401,
      message: "Token is invalid or expired.",
    };
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { user_email, user_type } = req.body;

    const emailValRes = validators.emailValidator(user_email);
    if (emailValRes.isInvalid) {
      return res
        .status(emailValRes.status)
        .json({ success: false, msg: emailValRes.message });
    }
    const typeValRes = validators.userTypeValidator(user_type);
    if (typeValRes.isInvalid) {
      return res
        .status(typeValRes.status)
        .json({ success: false, msg: typeValRes.message });
    }

    // Find user in the database
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT COUNT(*) FROM users WHERE LOWER(user_email) = LOWER($1) AND user_type = $2",
        [user_email, user_type]
      );
      const count = parseInt(result.rows[0].count);
      if (count > 0) {
        const OTP = generateOTP();
        // save OTP in db
        await client.query(
          "UPDATE otpholder SET otp = $1 WHERE LOWER(email) = LOWER($2) AND user_type = $3",
          [OTP, user_email, user_type]
        );
        // Send OTP to email
        sendOTPToEmail(user_email, OTP, user_type)
          .then(() => {
            return res.status(200).json({
              success: true,
              msg: "OTP has been sent to your email!",
            });
          })
          .catch((e) => {
            console.error("Error sending OTP email:", e);
            return res.status(500).json({
              success: false,
              msg: "An error occurred while sending OTP email!",
            });
          });
      } else
        return res.status(404).json({ success: false, msg: "User not found." });
    } catch (error) {
      console.error("Error in changing passwords:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in changing passwords" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in changing passwords:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error in changing passwords" });
  }
};

export const otpVerifyForPasswordChange = async (req, res) => {
  try {
    const { user_email, user_type, otp } = req.body;

    const emailValRes = validators.emailValidator(user_email);
    if (emailValRes.isInvalid) {
      return res
        .status(emailValRes.status)
        .json({ success: false, msg: emailValRes.message });
    }
    const typeValRes = validators.userTypeValidator(user_type);
    if (typeValRes.isInvalid) {
      return res
        .status(typeValRes.status)
        .json({ success: false, msg: typeValRes.message });
    }
    const OTPValRes = validators.valiadateOTP(otp);
    if (OTPValRes.isInvalid)
      return res
        .status(OTPValRes.status)
        .json({ success: false, msg: OTPValRes.message });

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT otp FROM otpholder WHERE LOWER(email) = LOWER($1) AND user_type = $2",
        [user_email, user_type]
      );
      if (result.rows[0].count == 0)
        return res
          .status(400)
          .json({ success: false, msg: "Rgenerate OTP first!" });
      const dbOTP = parseInt(result.rows[0]?.otp);
      console.log(otp, dbOTP);

      if (parseInt(dbOTP) && parseInt(otp) === dbOTP) {
        return res
          .status(200)
          .json({ success: true, msg: "OTP verification completed." });
      } else {
        return res.status(400).json({ success: false, msg: "Incorrect OTP." });
      }
    } catch (e) {
      console.error("Error during OTP validation:", e);
      return res
        .status(500)
        .json({ success: false, msg: "Error during OTP validation." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in OTP validation:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error in OTP validation" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { user_email, user_type, new_password, confirm_new_password } =
      req.body;

    const emailValRes = validators.emailValidator(user_email);
    if (emailValRes.isInvalid)
      return res
        .status(emailValRes.status)
        .json({ success: false, msg: emailValRes.message });
    const typeValRes = validators.userTypeValidator(user_type);
    if (typeValRes.isInvalid)
      return res
        .status(typeValRes.status)
        .json({ success: false, msg: typeValRes.message });
    const passwordValRes = validators.passwordValidator(
      new_password,
      confirm_new_password
    );
    if (passwordValRes.isInvalid)
      return res
        .status(passwordValRes.status)
        .json({ success: false, msg: passwordValRes.message });

    const hashedPassword = await bcrypt.hash(new_password, saltRounds);
    // updating record in db
    const client = await pool.connect();
    try {
      await client.query(
        "UPDATE users SET user_password = $1 WHERE LOWER(user_email) = LOWER($2) AND user_type = $3",
        [hashedPassword, user_email, user_type]
      );
    } catch (e) {
      console.error("Error during updating new password.", e);
      return res
        .status(500)
        .json({ success: false, msg: "Error during updating new password." });
    } finally {
      client.release();
    }
    console.log(req.body);
    return res
      .json({ success: true, msg: "Password changed successfully !" });
  } catch (e) {
    console.error("Error during updating new password.", e);
    return res
      .status(500)
      .json({ success: false, msg: "Error during updating new password." });
  }
};
