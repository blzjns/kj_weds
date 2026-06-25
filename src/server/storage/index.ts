import { S3Client, type S3ListObjectsResponse } from "bun";

const { SUPABASE_S3_ACCESS_KEY_ID, SUPABASE_S3_SECRET_ACCESS_KEY, SUPABASE_S3_REGION, SUPABASE_S3_ENDPOINT, SUPABASE_S3_BUCKET_IMAGES, SUPABASE_S3_BUCKET_VIDEOS } = process.env;

const s3Config = {
    region: SUPABASE_S3_REGION,
    endpoint: SUPABASE_S3_ENDPOINT,
    accessKeyId: SUPABASE_S3_ACCESS_KEY_ID,
    secretAccessKey: SUPABASE_S3_SECRET_ACCESS_KEY,
}

const s3BucketClients = {
    images: new S3Client({ ...s3Config, bucket: SUPABASE_S3_BUCKET_IMAGES }),
    videos: new S3Client({ ...s3Config, bucket: SUPABASE_S3_BUCKET_VIDEOS }),
}

type BucketType = keyof typeof s3BucketClients;

export async function listFiles(bucket: BucketType = 'images') {
    return (await s3BucketClients[bucket].list()).contents;
}

export function getFile(key: string, bucket: BucketType = 'images') {
    return s3BucketClients[bucket].file(key);
}

export async function uploadFile(file: File, bucket: BucketType = 'images') {
    return await s3BucketClients[bucket].write(file.name, file, { type: file.type });
}
