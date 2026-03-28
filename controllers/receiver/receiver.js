import pool from "../../config/config.js";
import bcrypt from "bcrypt";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  s3ForcePathStyle: true,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});


export const allFiles = async (req, res) => {
  try {
    const user = req.user;

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT file_id, file_title, uploaded_at, download_count FROM files ORDER BY uploaded_at"
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

export const fileById = async (req, res) => {
  try {
    const user = req.user;

    const file_id = req.params.file_id;
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT files.file_id, files.file_title, files.file_description, files.contributor_id, files.uploaded_at, files.download_count, users.user_username FROM files JOIN users ON files.contributor_id = users.user_id WHERE files.file_id = $1;",
        [file_id]
      );
      const file = result.rows[0];
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
    const user = req.user;

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT user_username, user_id FROM users WHERE user_type = 'Contributor'"
      );
      const contributors = result.rows;
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
    const user = req.user;

    const client = await pool.connect();
    const userId = req.params.contributor_id;
    try {
      const result = await client.query(
        "SELECT user_name, user_email, user_phone_no, user_username, user_profile_pic, user_type FROM users WHERE user_id = $1",
        [userId]
      );
      const contributor = result.rows[0];
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
    const user = req.user;

    const client = await pool.connect();
    const userId = req.params.contributor_id;
    try {
      const result2 = await client.query(
        "SELECT file_id, file_title, uploaded_at, download_count FROM files WHERE contributor_id = $1",
        [userId]
      );
      const files = result2.rows;
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

// for local and file system
/*
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
*/

export const downloadFile = async (req, res) => {
  let client;
  try {
    const user = req.user;
    client = await pool.connect();
    const file_id = req.params.file_id;
    const file_password = req.body.file_password;
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

      const isMatch = await bcrypt.compare(file_password, file.file_password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, msg: "Incorrect password." });
      }

      // local file storage code
      /*
      const filePath = join(__dirname, file.file_path);
      res.download(filePath, file.file_title); // Send the file to the user for download
      */
      const filekey = file.file_path;
      const s3Stream = s3.getObject({
        Bucket: process.env.S3_BUCKET,
        Key: filekey,
      }).createReadStream();

      s3Stream.on("error", (err) => {
        console.error("S3 Stream Error:", err);
        if (!res.headersSent) res.status(500).send("Error streaming file.");
      });

      
      // ✅ Update download count
      await Promise.all([
        client.query(
          "UPDATE files SET download_count = download_count + 1 WHERE file_id = $1",
          [file_id]
          ),
          client.query(
            "INSERT INTO history (downloader_id, file_id) VALUES ($1, $2)",
            [user.user_id, file_id]
            ),
          ]);
          
          // Set headers for download
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${file.file_title}"`
          );
          s3Stream.pipe(res);

          s3Stream.on("end", () => {
            console.log("Download complete for file:", file_id);
            // You don't need res.send() here because pipe() handles the closing of the connection
          });

          s3Stream.on("error", (err) => {
            console.error("S3 Stream Error:", err);
            if (!res.headersSent) {
              res
                .status(500)
                .json({ success: false, msg: "Streaming failed." });
            }
          });
          
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
    const user = req.user;
    const client = await pool.connect();
    try {
      // Fetch download history records for the receiver
      const query = `
        SELECT 
          h.record_id, 
          h.downloaded_at, 
          f.file_title AS file_name, 
          u.user_name AS contributor_name,
          u.user_id AS contributor_id
        FROM history h
        JOIN files f ON h.file_id = f.file_id
        JOIN users u ON f.contributor_id = u.user_id
        WHERE h.downloader_id = $1
        ORDER BY h.downloaded_at DESC;
      `;

      const result = await client.query(query, [user.user_id]);
      
      const downloadHistory = result.rows;

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