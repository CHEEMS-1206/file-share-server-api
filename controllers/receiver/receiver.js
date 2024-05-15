import pool from "../../config/config.js";
import { validateToken } from "../auth/auth.js";

export const allFiles = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Receiver") {
      return res
        .status(400)
        .json({
          success: false,
          msg: "Restricted Route for this kind of user!",
        });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT file_id, file_title, uploaded_at, download_count FROM files ORDER BY uploaded_at"
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

export const fileById = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Receiver") {
      return res
        .status(400)
        .json({
          success: false,
          msg: "Restricted Route for this kind of user!",
        });
    }

    const file_id = req.params.file_id;
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT files.file_id, files.file_title, files.file_description, files.contributor_id, files.uploaded_at, files.download_count, users.user_username FROM files JOIN users ON files.contributor_id = users.user_id WHERE files.file_id = $1;",
        [file_id]
      );
      const file = result.rows[0];
      console.log(file);
      return res.status(200).json(file);
    } catch (error) {
      console.error("Error in fetching file:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in fetching file" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching file:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error fetching file." });
  }
};

export const allContributors = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Receiver") {
      return res
        .status(400)
        .json({
          success: false,
          msg: "Restricted Route for this kind of user!",
        });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT user_username, user_id FROM users WHERE user_type = 'Contributor'"
      );
      const contributors = result.rows;
      console.log(contributors);
      return res.status(200).json(contributors);
    } catch (error) {
      console.error("Error in fetching contributors:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in fetching contributors" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error fetching contributors." });
  }
};

export const contributorByUserId = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Receiver") {
      return res
        .status(400)
        .json({
          success: false,
          msg: "Restricted Route for this kind of user!",
        });
    }

    const client = await pool.connect();
    const userId = req.params.contributor_id;
    try {
      const result = await client.query(
        "SELECT user_name, user_email, user_phone_no, user_username, user_profile_pic, user_type FROM users WHERE user_id = $1",
        [userId]
      );
      const contributor = result.rows[0];
      console.log(contributor);
      return res.status(200).json(contributor);
    } catch (error) {
      console.error("Error in fetching contributor details:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in fetching contributor details" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching contributor details:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error fetching contributor details." });
  }
};

export const filesByContributorId = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Receiver") {
      return res
        .status(400)
        .json({
          success: false,
          msg: "Restricted Route for this kind of user!",
        });
    }

    const client = await pool.connect();
    const userId = req.params.contributor_id;
    try {
      const result2 = await client.query(
        "SELECT file_id, file_title, uploaded_at, download_count FROM files WHERE contributor_id = $1",
        [userId]
      );
      const files = result2.rows;
      console.log(files);
      return res.status(200).json(files);
    } catch (error) {
      console.error("Error in fetching contributor files:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in fetching contributor files" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching contributor details:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error fetching contributor details." });
  }
};

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const downloadFile = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Receiver") {
      return res
        .status(400)
        .json({
          success: false,
          msg: "Restricted Route for this kind of user!",
        });
    }

    const client = await pool.connect();
    const file_id = req.params.file_id;
    const password = req.body.file_password;
    try {
      const result = await client.query(
        "SELECT file_password, file_path, file_title FROM files WHERE file_id = $1",
        [file_id]
      );
      const file = result.rows[0];
      if (!file)
        return res
          .status(401)
          .json({ success: false, msg: "No such file exists." });
      console.log(file);
      if (file.file_password !== password) {
        return res
          .status(400)
          .json({ success: false, msg: "Incorrect password." });
      }

      const filePath = join(__dirname, file.file_path);
      console.log(file.file_path);
      res.download(filePath, file.file_title); // Send the file to the user for download
      // Update download count in the database
      await client.query(
        "UPDATE files SET download_count = download_count + 1 WHERE file_id = $1",
        [file_id]
      );
      // Update history table
      await client.query(
        "INSERT INTO history (downloader_id, file_id) VALUES ($1, $2)",
        [vldnRslt.decodedVals.user_id, file_id]
      );
    } catch (error) {
      console.error("Error in downloading file:", error);
      return res
        .status(500)
        .json({ success: false, msg: "Error in downloading file." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in downloading file:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error in downloading file." });
  }
};

export const downloadHistory = async (req, res) => {
  try {
    const vldnRslt = await validateToken(req);
    if (vldnRslt.isInvalid) {
      return res.status(vldnRslt.status).json({ msg: vldnRslt.message });
    }

    if (vldnRslt.decodedVals.user_type !== "Receiver") {
      return res
        .status(400)
        .json({ msg: "Restricted Route for this kind of user!" });
    }

    const client = await pool.connect();
    try {
      // Fetch download history records for the receiver
      const query = `
        SELECT 
          h.record_id, 
          h.downloaded_at, 
          f.file_title AS file_name, 
          u.user_name AS contributor_name
        FROM history h
        JOIN files f ON h.file_id = f.file_id
        JOIN users u ON f.contributor_id = u.user_id
        WHERE h.downloader_id = $1
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
        .json({ msg: "Error in fetching download history" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching download history:", error);
    return res.status(500).json({ msg: "Error fetching download history." });
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

    if (vldnRslt.decodedVals.user_type !== "Receiver") {
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