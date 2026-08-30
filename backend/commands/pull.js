import fs from "fs/promises";
import path from "path";

import {
    GetObjectCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";

import { s3, S3_BUCKET } from "../config/aws-config.js";

async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".NexCode");

    const commitsPath = path.join(repoPath, "commits");

    try {
        const data = await s3.send(
            new ListObjectsV2Command({
                Bucket: S3_BUCKET,
                Prefix: "commits/",
            })
        );

        const objects = data.Contents || [];

        for (const object of objects) {
            const key = object.Key;

            if (!key) continue;

            const commitDir = path.join(
                commitsPath,
                path.dirname(key).split("/").pop()
            );

            await fs.mkdir(commitDir, {
                recursive: true,
            });

            const fileContent = await s3.send(
                new GetObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: key,
                })
            );

            if (!fileContent.Body) {
                continue;
            }

            const body = await fileContent.Body.transformToByteArray();

            await fs.writeFile(
                path.join(repoPath, key),
                body
            );
        }

        console.log("All commits pulled from S3.");
    } catch (err) {
        console.error("Unable to pull:", err);
    }
}

export default pullRepo;