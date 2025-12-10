import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const uploadAssetToS3 = async (
    fileContent: Blob | string,
    fileName: string,
    contentType: string
): Promise<string> => {
    const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
    const region = import.meta.env.VITE_AWS_REGION;
    const bucketName = import.meta.env.VITE_S3_BUCKET_NAME;

    if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
        throw new Error('Missing AWS configuration. Please check your .env file.');
    }

    const client = new S3Client({
        region,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent,
        ContentType: contentType,
    });

    try {
        await client.send(command);
        // Construct the public URL (assuming public read or similar, or just return success)
        return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
    }
};
