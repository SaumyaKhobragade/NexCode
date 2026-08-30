import fs from "fs/promises";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { s3, S3_BUCKET } from "../config/aws-config.js";

async function pushRepo() {
    const repoPath = path.resolve(process.cwd(), ".NexCode");

    const commitsPath = path.join(repoPath, "commits");

    try {
        const commitDirs = await fs.readdir(commitsPath);

        for (const commitDir of commitDirs) {
            const commitPath = path.join(commitsPath, commitDir);

            const files = await fs.readdir(commitPath);

            for (const file of files) {
                const filePath = path.join(commitPath, file);

                const fileContent = await fs.readFile(filePath);

                const command = new PutObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: `commits/${commitDir}/${file}`,
                    Body: fileContent,
                });

                await s3.send(command);
            }
        }

        console.log("All commits pushed to S3.");
    } catch (err) {
        console.error("Error pushing to S3:", err);
    }
}

export default pushRepo;
