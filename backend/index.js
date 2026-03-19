const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

dotenv.config();

yargs(hideBin(process.argv))
  .command("start", "Start a new server", {}, startServer)

  .command(
    "init [repoId]",
    "Initialise a new repository and login",
    (yargs) => {
      yargs.positional("repoId", {
        describe: "Repository ID from the web dashboard URL",
        type: "string",
      });
    },
    async (argv) => {
      // Prompt for email+password automatically inside initRepo
      await initRepo(argv.repoId || null);
    }
  )

  .command(
    "add <file>",
    "Add a file to the staging area",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.file);
    }
  )

  .command(
    "commit <message>",
    "Commit the staged files",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    async (argv) => {
      await commitRepo(argv.message);
    }
  )

  .command("push", "Push commits to S3", {}, pushRepo)
  .command("pull", "Pull commits from S3", {}, pullRepo)

  .command(
    "revert <commitID>",
    "Revert to a specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Commit ID to revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitID);
    }
  )

  .demandCommand(1, "You need at least one command")
  .help()
  .argv;

function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors({ origin: "*" }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

  app.use("/", mainRouter);

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    socket.on("JoinRoom", (userID) => {
      socket.join(userID);
    });
  });

  mongoose.connection.once("open", () => {
    console.log("CRUD Operations called!");
  });

  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}