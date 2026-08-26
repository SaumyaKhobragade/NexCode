import fs from "fs/promises";
import path from "path";

async function initRepo() {
    const repoPath = path.resolve(process.cwd(), ".NexCode");
    const commitsPath = path.join(repoPath, "commits");

    try {
        await fs.mkdir(repoPath, { recursive: true });
        await fs.mkdir(commitsPath, { recursive: true });
        await fs.writeFile(
            path.join(repoPath, "config.json"),
            JSON.stringify({ bucket: process.env.S3_BUCKET }),
        );
        console.log("Repository initialised!");
    } catch (err) {
        console.error("Error initialising repository", err);
    }
}

export default initRepo;
