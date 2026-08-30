import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
});

const S3_BUCKET = process.env.S3_BUCKET;

export { s3, S3_BUCKET };
