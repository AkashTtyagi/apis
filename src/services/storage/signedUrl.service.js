/**
 * Signed URL Service
 * Generates signed URLs for file upload (PUT) and download (GET)
 * Supports AWS S3 / Compatible Storage
 */

const AWS = require('aws-sdk');
const crypto = require('crypto');

// Configure AWS S3 (or compatible storage like MinIO, DigitalOcean Spaces)
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY,
    endpoint: process.env.S3_ENDPOINT || undefined, // For MinIO/DigitalOcean Spaces
    region: process.env.AWS_REGION || 'us-east-1',
    signatureVersion: 'v4',
    s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' || false // For MinIO
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'hrms-documents';
const URL_EXPIRY_SECONDS = parseInt(process.env.SIGNED_URL_EXPIRY || '900'); // 15 minutes default

/**
 * Generate a unique file key with proper structure
 */
const generateFileKey = (companyId, employeeId, folderId, documentTypeId, fileName) => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const fileExtension = fileName.split('.').pop();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    return `company_${companyId}/employee_${employeeId}/folder_${folderId}/type_${documentTypeId}/${timestamp}_${randomString}_${sanitizedFileName}`;
};

/**
 * Generate signed URL for file upload (PUT)
 */
const generateUploadUrl = async (uploadData, userId) => {
    const {
        company_id,
        employee_id,
        folder_id,
        document_type_id,
        file_name,
        file_type,
        file_size_kb
    } = uploadData;

    // Validate required fields
    if (!company_id || !employee_id || !folder_id || !document_type_id || !file_name) {
        throw new Error('Missing required fields: company_id, employee_id, folder_id, document_type_id, file_name');
    }

    // Validate file size (default max 10MB)
    const maxFileSizeMB = parseFloat(process.env.MAX_FILE_SIZE_MB || '10');
    const maxFileSizeKB = maxFileSizeMB * 1024;

    if (file_size_kb && file_size_kb > maxFileSizeKB) {
        throw new Error(`File size exceeds maximum allowed size of ${maxFileSizeMB}MB`);
    }

    // Generate unique file key
    const fileKey = generateFileKey(company_id, employee_id, folder_id, document_type_id, file_name);

    // S3 PUT parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Expires: URL_EXPIRY_SECONDS,
        ContentType: file_type || 'application/octet-stream',
        Metadata: {
            'company-id': company_id.toString(),
            'employee-id': employee_id.toString(),
            'folder-id': folder_id.toString(),
            'document-type-id': document_type_id.toString(),
            'uploaded-by': userId.toString(),
            'original-filename': file_name
        }
    };

    // Generate signed URL
    const signedUrl = await s3.getSignedUrlPromise('putObject', params);

    return {
        upload_url: signedUrl,
        file_key: fileKey,
        file_path: `s3://${BUCKET_NAME}/${fileKey}`,
        expires_in: URL_EXPIRY_SECONDS,
        expires_at: new Date(Date.now() + URL_EXPIRY_SECONDS * 1000).toISOString(),
        metadata: {
            company_id,
            employee_id,
            folder_id,
            document_type_id,
            file_name,
            file_type,
            file_size_kb
        }
    };
};

/**
 * Generate signed URL for file download (GET)
 */
const generateDownloadUrl = async (downloadData, userId) => {
    const { file_key, file_path } = downloadData;

    // Extract file_key from file_path if not provided
    let key = file_key;
    if (!key && file_path) {
        // Extract key from s3://bucket/key or https://bucket.s3.amazonaws.com/key
        if (file_path.startsWith('s3://')) {
            key = file_path.replace(`s3://${BUCKET_NAME}/`, '');
        } else if (file_path.includes(BUCKET_NAME)) {
            const parts = file_path.split(BUCKET_NAME + '/');
            key = parts[1];
        } else {
            key = file_path;
        }
    }

    if (!key) {
        throw new Error('Missing required field: file_key or file_path');
    }

    // S3 GET parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Expires: URL_EXPIRY_SECONDS
    };

    // Check if file exists (optional - comment out for better performance)
    try {
        await s3.headObject({ Bucket: BUCKET_NAME, Key: key }).promise();
    } catch (error) {
        if (error.code === 'NotFound') {
            throw new Error('File not found in storage');
        }
        throw error;
    }

    // Generate signed URL
    const signedUrl = await s3.getSignedUrlPromise('getObject', params);

    return {
        download_url: signedUrl,
        file_key: key,
        expires_in: URL_EXPIRY_SECONDS,
        expires_at: new Date(Date.now() + URL_EXPIRY_SECONDS * 1000).toISOString()
    };
};

/**
 * Generate multiple download URLs (batch)
 */
const generateBatchDownloadUrls = async (fileKeys, userId) => {
    if (!Array.isArray(fileKeys) || fileKeys.length === 0) {
        throw new Error('fileKeys must be a non-empty array');
    }

    const urls = await Promise.all(
        fileKeys.map(async (fileKey) => {
            try {
                const result = await generateDownloadUrl({ file_key: fileKey }, userId);
                return {
                    file_key: fileKey,
                    success: true,
                    ...result
                };
            } catch (error) {
                return {
                    file_key: fileKey,
                    success: false,
                    error: error.message
                };
            }
        })
    );

    return urls;
};

/**
 * Delete file from storage
 */
const deleteFile = async (fileKey) => {
    if (!fileKey) {
        throw new Error('Missing required field: file_key');
    }

    const params = {
        Bucket: BUCKET_NAME,
        Key: fileKey
    };

    await s3.deleteObject(params).promise();

    return { message: 'File deleted successfully', file_key: fileKey };
};

module.exports = {
    generateUploadUrl,
    generateDownloadUrl,
    generateBatchDownloadUrls,
    deleteFile
};
