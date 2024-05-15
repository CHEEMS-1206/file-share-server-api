// Server entry point //

// Nescessary imports
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

// importing all routers
import authRouter from "./routes/authenticationRoutes.js";
import contributorRouter from "./routes/contributorRoutes.js";
import receiverRouter from "./routes/receiverRoutes.js";

// importing pool (database) from config
import pool from "./config/config.js";

// constructed a server
const SERVER = express();

// parsing the json, cors policy url encoding and json formatting
SERVER.use(bodyParser.json());
SERVER.use(cors());
SERVER.use(express.urlencoded({ extended: true }));
SERVER.use(express.json());

//MIDDLEWARES
SERVER.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

SERVER.use("/api", authRouter);
SERVER.use("/api/contributor", contributorRouter);
SERVER.use("/api/receiver", receiverRouter);

// defining port for backend rest server
const PORT = 5001;

// run the server at PORT
SERVER.listen(PORT, () =>
  console.log(`server running at: http://localhost:${PORT} `)
);
