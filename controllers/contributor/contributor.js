import pool from "../../config/config.js";
import { validateToken } from "../auth/auth.js";
import { v4 as uuidv4 } from "uuid";

import multer from "multer";
import fs from "fs";
import path from "path";

import * as validators from "../../validators/index.js";

export const fileById = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Contributor") {
      return res.status(400).json({
        success: false,
        msg: "Restricted Route for this kind of user!",
      });
    }
    const file_id = req.params.file_id;
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT file_id, file_title, file_description, contributor_id, uploaded_at, download_count FROM files WHERE contributor_id = $1 AND file_id = $2",
        [vldnRslt.decodedVals.user_id, file_id]
      );
      const file = result.rows[0];
      console.log(file);
      return res.status(200).json(file);
    } catch (error) {
      console.error("Error in fetching file details:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in fetching file details" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching file details:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error fetching file details." });
  }
};

export const getProfileData = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Contributor") {
      return res.status(400).json({
        success: false,
        msg: "Restricted Route for this kind of user!",
      });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT user_name, user_email, user_phone_no, user_username, user_profile_pic, user_type FROM users WHERE user_id = $1",
        [vldnRslt.decodedVals.user_id]
      );
      const user = result.rows[0];
      console.log(user);
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error in fetching user details:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in fetching User details" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error fetching user details." });
  }
};

export const myFiles = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Contributor") {
      return res.status(400).json({
        success: false,
        msg: "Restricted Route for this kind of user!",
      });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT file_id, file_title, uploaded_at, download_count FROM files WHERE contributor_id = $1",
        [vldnRslt.decodedVals.user_id]
      );
      const files = result.rows;
      console.log(files);
      return res.status(200).json(files);
    } catch (error) {
      console.error("Error in fetching files:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in fetching files" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching files:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error fetching files." });
  }
};

export const updateFile = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Contributor") {
      return res.status(400).json({
        success: false,
        msg: "Restricted Route for this kind of user!",
      });
    }

    let { file_title, file_description, file_type } = req.body;
    let file_id = req.params.file_id;
    console.log(file_id);

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT file_id, file_title, file_description, contributor_id, file_type, uploaded_at, download_count FROM files WHERE contributor_id = $1 AND file_id = $2",
        [vldnRslt.decodedVals.user_id, file_id]
      );

      const file = result.rows[0];
      console.log(file);
      if (!file) {
        return res
          .status(404)
          .json({ success: false, msg: "No file with such ID exists." });
      }

      // Update file in the database
      if (!file_title) file_title = file.file_title;
      if (!file_description) file_description = file.file_description;
      if (!file_type) file_type = file.file_type;

      await client.query(
        "UPDATE files SET file_title = $1, file_description = $2, file_type = $3 WHERE file_id = $4",
        [file_title, file_description, file_type, file_id]
      );

      return res
        .status(200)
        .json({ success: true, msg: "file updated successfully." });
    } catch (error) {
      console.error("Error in updating file:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in updating file." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating file:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error updating file." });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Contributor") {
      return res.status(400).json({
        success: false,
        msg: "Restricted Route for this kind of user!",
      });
    }

    const file_id = req.params.file_id;
    console.log(file_id);

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT file_id, file_title, file_description, contributor_id, file_type, uploaded_at, download_count FROM files WHERE contributor_id = $1 AND file_id = $2",
        [vldnRslt.decodedVals.user_id, file_id]
      );

      const file = result.rows[0];
      console.log(file);
      if (!file) {
        return res
          .status(404)
          .json({ success: false, msg: "No file with such ID exists." });
      }

      // Delete file from the filesystem
      const filePath = path.resolve("../Uploaded_files", file.file_title);
      fs.unlinkSync(filePath);

      await client.query("DELETE FROM files WHERE file_id = $1", [file_id]);

      return res.status(200).json(file);
    } catch (error) {
      console.error("Error in deleting file:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in deleting file." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error deleting file." });
  }
};

function determineFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".doc" || ext === ".docx") {
    return "Document";
  } else if (ext === ".xls" || ext === ".xlsx") {
    return "Spreadsheet";
  } else if (ext === ".ppt" || ext === ".pptx") {
    return "Presentation";
  } else if (ext === ".pdf") {
    return "PDF";
  } else {
    return "Unknown";
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/mnt/data/Uploaded_files');
  },
  filename: async (req, file, cb) => {
    const { originalname } = file;

    cb(null, originalname);
  },
});

const upload = multer({ storage }).single("file");

export const addNewFile = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Contributor") {
      return res.status(400).json({
        success: false,
        msg: "Restricted Route for this kind of user!",
      });
    }

    upload(req, res, async (err) => {
      console.log(req.body);
      if (err) {
        console.error("Error uploading file:", err);
        if (err instanceof multer.MulterError) {
          return res
            .status(500)
            .json({ success: false, msg: "Multer error: " + err.message });
        } else {
          return res
            .status(500)
            .json({ success: false, msg: "Error uploading file." });
        }
      }
      const { file_description, file_password } = await req.body;
      console.log(file_description);

      // Validate file description
      const fileDescValRes = validators.fileDescValidator(file_description);
      if (fileDescValRes.isInvalid) {
        return res
          .status(fileDescValRes.status)
          .json({ success: false, msg: fileDescValRes.message });
      }
      // Validate password
      const passwordValRes = validators.passwordValidator(
        file_password,
        file_password
      );
      if (passwordValRes.isInvalid) {
        return res
          .status(passwordValRes.status)
          .json({ success: false, msg: passwordValRes.message });
      }
      // Check if a file was uploaded
      if (!req.file) {
        return res
          .status(401)
          .json({ success: false, msg: "Please choose a file to upload." });
      }

      const file_type = determineFileType(req.file.originalname);
      // Check if the file type is unknown
      if (file_type === "Unknown") {
        return res.status(401).json({
          success: false,
          msg: "Please choose either Docs, Excel, Ppt, or PDF files only.",
        });
      }
      const filename = req.file.originalname;
      const contributor_id = vldnRslt.decodedVals.user_id;
      const uploaded_at = new Date().toISOString();
      const download_count = 0;
      const file_path = `../../../Uploaded_files/${filename}`;
      const file_title = filename;

      const client = await pool.connect();
      try {
        const result = await client.query(
          "INSERT INTO files (file_title, file_description, file_type, file_path, file_password, contributor_id, uploaded_at, download_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
          [
            file_title,
            file_description,
            file_type,
            file_path,
            file_password,
            contributor_id,
            uploaded_at,
            download_count,
          ]
        );

        const newFile = result.rows[0];
        return res
          .status(200)
          .json({ success: true, msg: "Your file uploaded successfully." });
      } catch (error) {
        console.error("Error in uploading file:", error);
        if (error.code == "23505")
          return res
            .status(500)
            .json({ success: false, msg: "Select an unique file." });
        return res
          .status(500)
          .json({ success: false, msg: "Error in uploading file." });
      } finally {
        client.release();
      }
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error uploading file." });
  }
};

export const downloadHistory = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Contributor") {
      return res.status(400).json({
        success: false,
        msg: "Restricted Route for this kind of user!",
      });
    }

    const client = await pool.connect();
    try {
      // Fetch all download history records for files uploaded by the contributor
      const query = `
        SELECT 
          h.record_id, 
          f.file_title,
          h.downloaded_at, 
          u.user_name AS downloader_name,
          h.file_id
        FROM history h
        JOIN users u ON h.downloader_id = u.user_id
        JOIN files f ON h.file_id = f.file_id
        WHERE f.contributor_id = $1
        ORDER BY h.downloaded_at DESC;
      `;

      const result = await client.query(query, [vldnRslt.decodedVals.user_id]);
      const downloadHistory = result.rows;

      console.log(downloadHistory);
      return res.status(200).json(downloadHistory);
    } catch (error) {
      console.error("Error in fetching download history:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in fetching download history" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching download history:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error fetching download history." });
  }
};

export const resetPasswordForFile = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Contributor") {
      return res.status(400).json({
        success: false,
        msg: "Restricted Route for this kind of user!",
      });
    }
    const new_pass = req.body.file_password;
    const file_id = req.params.file_id;
    const client = await pool.connect();
    try {
      const result1 = await client.query(
        "SELECT file_password FROM files WHERE file_id = $1",
        [file_id]
      );
      console.log(result1.rows);
      if (result1.rows.length === 0)
        return res
          .status(400)
          .json({ success: false, msg: "No such file found !" });
      await client.query(
        "UPDATE files SET file_password = $1 WHERE file_id = $2",
        [new_pass, file_id]
      );
      return res
        .status(200)
        .json({ success: true, msg: "Password updated successfully." });
    } catch (error) {
      console.error("Error in resetting file password:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in resetting file password." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error resetting file password:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error resetting file password." });
  }
};
