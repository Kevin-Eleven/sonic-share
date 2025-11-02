import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connectionString) {
  throw new Error('Azure Storage connection string is not configured');
}

export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
