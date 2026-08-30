import fs from "fs/promises";
import path from "path";

async function revertRepo(commitID) {
    const repoPath = path.resolve(process.cwd(), ".NexCode");

    const commitsPath = path.join(repoPath, "commits");

    try {
        const commitDir = path.join(commitsPath, commitID);

        const files = await fs.readdir(commitDir);

        const parentDir = path.resolve(repoPath, "..");

        for (const file of files) {
            await fs.copyFile(
                path.join(commitDir, file),
                path.join(parentDir, file)
            );
        }

        console.log(`Commit ${commitID} reverted successfully!`);
    } catch (err) {
        console.error("Unable to revert:", err);
    }
}

export default revertRepo;