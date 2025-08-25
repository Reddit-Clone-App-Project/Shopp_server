import { Storage } from "@google-cloud/storage";

const credentials = JSON.parse(
    Buffer.from(process.env.GCP_SA_KEY_B64!, "base64").toString("utf8")
);

export const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials,
});

export const bucket = storage.bucket(process.env.GCS_BUCKET!);