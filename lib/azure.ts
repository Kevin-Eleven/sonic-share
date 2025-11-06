import { BlobServiceClient } from '@azure/storage-blob';

let blobServiceClientInstance: BlobServiceClient | null = null;

export const getBlobServiceClient = (): BlobServiceClient => {
  if (!blobServiceClientInstance) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('Azure Storage connection string is not configured');
    }
    blobServiceClientInstance = BlobServiceClient.fromConnectionString(connectionString);
  }
  return blobServiceClientInstance;
};

// For backward compatibility, export a getter
export const blobServiceClient = new Proxy({} as BlobServiceClient, {
  get(target, prop) {
    return getBlobServiceClient()[prop as keyof BlobServiceClient];
  }
});
