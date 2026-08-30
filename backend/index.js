// import express from "express";
// import mongoose from "mongoose";
import dotenv from "dotenv";
// import cors from "cors";
// import bodyParser from "body-parser";
// import http from "http";
// import { Server } from "socket.io";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

dotenv.config();

import initRepo from "./commands/init.js";
import addRepo from "./commands/add.js";
import commitRepo from "./commands/commit.js";
import pushRepo from "./commands/push.js";
import pullRepo from "./commands/pull.js";
import revertRepo from "./commands/revert.js";

yargs(hideBin(process.argv))
    // .command("start", "Start the server", {}, startServer)
    .command("init", "Initialize a new repository.", {}, initRepo)
    .command(
        "add <file>",
        "Add a new file to the repository.",
        (yargs) => {
            yargs.positional("file", {
                describe: "The file to add to the staging area.",
                type: "string",
            });
        },
        (argv) => {
            addRepo(argv.file);
        },
    )
    .command(
        "commit <message>",
        "Commit changes to the repository.",
        (yargs) => {
            yargs.positional("message", {
                describe: "The commit message.",
                type: "string",
            });
        },
        (argv) => {
            commitRepo(argv.message);
        },
    )
    .command("push", "Push changes to the remote repository.", {}, pushRepo)
    .command("pull", "Pull changes from the remote repository.", {}, pullRepo)
    .command(
        "revert <commitID>",
        "Revert to a previous commit.",
        (yargs) => {
            yargs.positional("commitID", {
                describe: "The commit ID to revert to.",
                type: "string",
            });
        },
        (argv) => {
            revertRepo(argv.commitID);
        },
    )
    .demandCommand(1, "You need to specify a command.")
    .help().argv;

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(
//     cors((origin) => {
//         if (process.env.NODE_ENV === "production") {
//             return origin === process.env.CLIENT_URL;
//         }
//         return true;
//     }),
// );
// app.use(bodyParser.json());
// app.use(express.json());

// const mongoURI = process.env.MONGO_URI;

// mongoose
//     .connect(mongoURI)
//     .then(() => {
//         console.log("Connected to MongoDB");
//     })
//     .catch((err) => {
//         console.error("Error connecting to MongoDB:", err);
//     });

// let user = "test";
// const httpServer = http.createServer(app);
// const io = new Server(httpServer, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"],
//     },
// });

// io.on("connection", (socket) => {
//     socket.on("joinRoom", (userID) => {
//         user = userID;
//         console.log("=====");
//         console.log(user);
//         console.log("=====");
//         socket.join(userID);
//     });
// });

// const db = mongoose.connection;

// db.once("open", async () => {
//     console.log("CRUD operations called");
// });

// httpServer.listen(port, () => {
//     console.log(`Server is running on PORT ${port}`);
// });
