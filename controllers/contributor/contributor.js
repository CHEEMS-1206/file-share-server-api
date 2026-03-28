import pool from "../../config/config.js";
import { v4 as uuidv4 } from "uuid";

import { fileTypeFromBuffer } from "file-type";
import bcrypt from "bcrypt";
import multer from "multer";
import fs from "fs"; // for local setup
import path from "path";

import * as validators from "../../validators/index.js";

// adding AWS for s3
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  s3ForcePathStyle: true,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Getting the file type of the uploaded file
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

// Mime based validation
const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const fileById = async (req, res) => {
  try {
    const user = req.user;
    const file_id = req.params.file_id;
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT file_id, file_title, file_description, contributor_id, uploaded_at, download_count FROM files WHERE contributor_id = $1 AND file_id = $2",
        [user.user_id, file_id]
      );
      const file = result.rows[0];
      // console.log(file);
      if (!file) {
        return res.status(404).json({
          success: false,
          msg: "File not found",
        });
      }
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
    const user = req.user;

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT user_name, user_email, user_phone_no, user_username, user_profile_pic, user_type FROM users WHERE user_id = $1",
        [user.user_id]
      );
      const userFromDb = result.rows[0];
      return res.status(200).json(userFromDb);
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
    const user = req.user;

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT file_id, file_title, uploaded_at, download_count FROM files WHERE contributor_id = $1",
        [user.user_id]
      );
      const files = result.rows;
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
    const user = req.user;

    let { file_title, file_description, file_type } = req.body;
    let file_id = req.params.file_id;

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT file_id, file_title, file_description, contributor_id, file_type, uploaded_at, download_count FROM files WHERE contributor_id = $1 AND file_id = $2",
        [user.user_id, file_id]
      );

      const file = result.rows[0];
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
        "UPDATE files SET file_title = $1, file_description = $2, file_type = $3 WHERE file_id = $4 AND contributor_id = $5",
        [
          file_title,
          file_description,
          file_type,
          file_id,
          user.user_id,
        ]
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
    const user = req.user;

    const client = await pool.connect();
    const file_id = req.params.file_id;
    await client.query("BEGIN");

    try {
      const result = await client.query(
        "SELECT file_path FROM files WHERE contributor_id = $1 AND file_id = $2",
        [user.user_id, file_id]
      );

      const file = result.rows[0];
      if (!file) {
        await client.query("ROLLBACK");
        return res
          .status(404)
          .json({ success: false, msg: "No file with such ID exists." });
      }

      // Delete file from the filesystem in local 
      /*
      const filePath = path.resolve("../Uploaded_files", file.file_title);
      fs.unlinkSync(filePath);
      */

      // Delete file from s3 in localstack
      const fileKey = file.file_path;
      
      await s3
        .deleteObject({
          Bucket: process.env.S3_BUCKET,
          Key: fileKey,
        })
        .promise();

      await client.query(
        "DELETE FROM files WHERE file_id = $1 AND contributor_id = $2",
        [file_id, user.user_id]
        );
        await client.query("COMMIT");

      return res.status(200).json({
        success: true,
        msg: "File deleted successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
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

// -> making changes to existing method here we were using disk storage on local but now we will use s3 for localstack
/*
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "/mnt/data/uploaded-files";
    console.log("Attempting to save to:", uploadDir);

    fs.exists(uploadDir, (exists) => {
      if (!exists) {
        console.log("Directory does not exist, creating it...");
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    });
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  },
});
*/

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max file size 10 mb
}).single("file");

export const addNewFile = async (req, res) => {
  try {
    const user = req.user;

    // local disk storage
    /*
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
    */

    // newer used for localstack
        return upload(req, res, async (err) => {
          if (err) {
            if (err instanceof multer.MulterError) {
              return res.status(400).json({
                success: false,
                msg:
                  err.code === "LIMIT_FILE_SIZE"
                    ? "File too large. Max size is 10MB."
                    : err.message,
              });
            }

            return res.status(500).json({
              success: false,
              msg: "File upload failed.",
            });
          }

          try {
            const { file_description, file_password } = req.body;
            // Check if a file was uploaded
            if (!req.file) {
              return res
                .status(400)
                .json({
                  success: false,
                  msg: "Please choose a file to upload.",
                });
            }

            // Validate file description
            const fileDescValRes =
              validators.fileDescValidator(file_description);
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

            const detected = await fileTypeFromBuffer(req.file.buffer);
            const file_type = determineFileType(req.file.originalname);
            const actualMime = detected?.mime || detected?.mimetype;
            // Check if the file type is unknown
            if (
              !actualMime || 
              file_type === "Unknown" ||
              !allowedMimeTypes.includes(actualMime)
            ) {
              return res.status(400).json({
                success: false,
                msg: "Please choose either Docs, Excel, Ppt, or PDF files only.",
              });
            }

            // Code for local use, using diskstorage for file storage
            /*
            const filename = req.file.originalname; // for local
            const file_path = `../../../Uploaded_files/${filename}`;
            */

           const contributor_id = user.user_id;
            const safeFileName = req.file.originalname
              .replace(/[^a-zA-Z0-9.]/g, "_")
              .slice(0, 100);
            const fileKey = `users/${contributor_id}/files/${uuidv4()}-${safeFileName}`;
            await s3
              .upload({
                Bucket: process.env.S3_BUCKET,
                Key: fileKey,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
                ContentDisposition: `attachment; filename="${req.file.originalname}"`,
              })
              .promise();

            const file_title = req.file.originalname;
            const file_path = fileKey; // for s3 and localstack we will use this
            const uploaded_at = new Date().toISOString();
            const download_count = 0;
            const hashedFilePassword = await bcrypt.hash(file_password, 10);
            const client = await pool.connect();
            try {
              await client.query("BEGIN");
              const result = await client.query(
                "INSERT INTO files (file_title, file_description, file_type, file_path, file_password, contributor_id, uploaded_at, download_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
                [
                  file_title,
                  file_description,
                  file_type,
                  file_path,
                  hashedFilePassword,
                  contributor_id,
                  uploaded_at,
                  download_count,
                ]
              );
              await client.query("COMMIT");
              return res
                .status(200)
                .json({
                  success: true,
                  msg: "Your file uploaded successfully.",
                });
            } catch (dbErr) {
              await client.query("ROLLBACK");
              // rollback S3 upload
              await s3
                .deleteObject({
                  Bucket: process.env.S3_BUCKET,
                  Key: fileKey,
                })
                .promise();
              console.error("DB Error:", dbErr);
              return res
                .status(500)
                .json({
                  success: false,
                  msg: "Database error. Storage rolled back, file could not be saved !.",
                });
            } finally {
              client.release();
            }
          } catch (innerError) {
            console.error("Internal Logic Error:", innerError);
            return res
              .status(500)
              .json({ success: false, msg: "Server error during processing." });
          }
        });     
    } catch (error) {
    console.error("Error uploading file:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error uploading file." });
  }
}

export const downloadHistory = async (req, res) => {
  try {
    const user = req.user;

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

      const result = await client.query(query, [user.user_id]);
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
    const user = req.user;

    const new_pass = req.body.file_password;
    // validate new password
    const passwordValRes = validators.passwordValidator(new_pass, new_pass);
    if (passwordValRes.isInvalid) {
      return res
        .status(passwordValRes.status)
        .json({ success: false, msg: passwordValRes.message });
    }

    const new_hashed_password = await bcrypt.hash(new_pass, 10);
    const file_id = req.params.file_id;
    const contributor_id = user.user_id;
    const client = await pool.connect();
    try {
      const result1 = await client.query(
        "SELECT file_password FROM files WHERE file_id = $1 AND contributor_id = $2",
        [file_id, contributor_id]
      );
      // console.log(result1.rows);
      if (result1.rows.length === 0)
        return res
          .status(400)
          .json({ success: false, msg: "No such file found !" });
      await client.query(
        "UPDATE files SET file_password = $1 WHERE file_id = $2 AND contributor_id = $3",
        [new_hashed_password, file_id, contributor_id]
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
