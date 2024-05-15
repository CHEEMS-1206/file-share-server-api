import validator from "validator";
import pool from "../config/config.js";

export const emailValidator = (emailId) => {
  const res = {
    isInvalid: false,
    message: "Error message",
    status: 500,
  };
  if (!emailId) {
    res.status = 400;
    res.message = "Email field can't be empty!";
    res.isInvalid = true;
    return res;
  }
  if (!validator.isEmail(emailId)) {
    res.status = 400;
    res.message = "Please enter a valid email!";
    res.isInvalid = true;
    return res;
  }
  return res;
};

export const valiadateOTP = (otp) => {
  const res = {
    isInvalid: false,
    message: "Error message",
    status: 500,
  };
  if (!otp) {
    res.status = 400;
    res.message = "OTP field can't be empty!";
    res.isInvalid = true;
    return res;
  }
  if (otp.length != 6) {
    res.status = 400;
    res.message = "OTP must be 6 characters long.";
    res.isInvalid = true;
    return res;
  }
  if (!/^\d+$/.test(otp)) {
    res.status = 400;
    res.message = "Invalid OTP format.";
    res.isInvalid = true;
  }
  return res;
};

export const passwordValidator = (password, confirm_password) => {
  const res = {
    isInvalid: false,
    message: "Error message",
    status: 500,
  };
  if (!password || !confirm_password) {
    res.status = 400;
    res.message = "Password fields can't be empty!";
    res.isInvalid = true;
    return res;
  }
  if (!(password.length >= 6 && password.length <= 12)) {
    res.status = 400;
    res.message = "Password must be atleast 6 and atmost 10 chars long.";
    res.isInvalid = true;
    return res;
  }
  if (!(password == confirm_password)) {
    res.status = 400;
    res.message = "Passwords entered by you do not match !";
    res.isInvalid = true;
  }
  return res;
};

export const usernameValidator = async (userName) => {
  const res = {
    isInvalid: false,
    message: "Error message",
    status: 500,
  };
  if (!userName) {
    res.status = 400;
    res.message = "Username field can't be empty!";
    res.isInvalid = true;
    return res;
  }
  if (!(userName.length >= 3 && userName.length <= 20)) {
    res.status = 400;
    res.message = "Please enter valid username.";
    res.isInvalid = true;
    return res;
  }
  const client = await pool.connect();
  try {
    // check if already registered
    const result = await client.query(
      "SELECT COUNT(*) FROM users WHERE user_username = $1",
      [userName]
    );
    const count = parseInt(result.rows[0].count);
    if (count > 0) {
      res.status = 400;
      res.message = "This username has already been taken.";
      res.isInvalid = true;
      return res;
    }
  } catch (e) {
    console.error("Error during OTP generation:", e);
    return res.status(500).json({ msg: "Internal Server Error" });
  } finally {
    client.release();
  }
  return res;
};

export const nameValidator = (name) => {
  const res = {
    isInvalid: false,
    message: "Error message",
    status: 500,
  };
  if (!name) {
    res.status = 400;
    res.message = "Name field can't be empty!";
    res.isInvalid = true;
    return res;
  }
  if (!(name.length >= 3 && name.length <= 25)) {
    res.status = 400;
    res.message = "Please enter valid Full name.";
    res.isInvalid = true;
    return res;
  }
  return res;
};

export const mobNumValidator = (phone_num) => {
  const res = {
    isInvalid: false,
    message: "Error message",
    status: 500,
  };
  if (!phone_num) {
    res.status = 400;
    res.message = "Contact field can't be empty!";
    res.isInvalid = true;
    return res;
  }
  if (phone_num.length != 10) {
    res.status = 400;
    res.message = "Please enter valid Contact number.";
    res.isInvalid = true;
    return res;
  }
  return res;
};

export const userTypeValidator = (usertype) => {
  const res = {
    isInvalid: false,
    message: "Error message",
    status: 500,
  };
  if (!usertype) {
    res.status = 400;
    res.message = "Please chose a user type!";
    res.isInvalid = true;
    return res;
  }
  if (usertype != "Contributor" && usertype != "Receiver") {
    res.status = 400;
    res.message = "Please select a valid user type!";
    res.isInvalid = true;
    return res;
  }
  return res;
};

export const fileDescValidator = (fileDesc) => {
  const res = {
    isInvalid: false,
    message: "Error message",
    status: 500,
  };
  if (!fileDesc) {
    res.status = 400;
    res.message = "Please provide description for the file !";
    res.isInvalid = true;
    return res;
  }
  if (fileDesc.length < 6 || fileDesc.length > 200) {
    res.status = 400;
    res.message = "Please provide precise and breif description !";
    res.isInvalid = true;
    return res;
  }
  return res;
};
