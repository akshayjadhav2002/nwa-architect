import { put, del, list, head } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  type: string;
  mimeType: string;
  size: number;
  sizeFormatted: string;
  storage: 'vercel-blob' | 'local';
  downloadUrl?: string;
  pathname?: string;
  uploadedAt: string;
}

export interface StorageStatus {
  provider: 'vercel-blob' | 'local';
  isConfigured: boolean;
  tokenConfigured: boolean;
  resumesFolder: string;
  projectsFolder: string;
  message: string;
}

/**
 * Checks if Vercel Blob storage is configured via BLOB_READ_WRITE_TOKEN
 */
export function isVercelBlobConfigured(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return Boolean(token && token.trim().length > 0);
}

/**
 * Returns the current storage configuration status
 */
export function getStorageStatus(): StorageStatus {
  const configured = isVercelBlobConfigured();
  return {
    provider: configured ? 'vercel-blob' : 'local',
    isConfigured: configured,
    tokenConfigured: configured,
    resumesFolder: 'resumes',
    projectsFolder: 'projects',
    message: configured
      ? 'Vercel Blob Storage active and operational with global CDN delivery.'
      : 'Local server storage active. Set BLOB_READ_WRITE_TOKEN to enable direct Vercel Blob cloud bucket persistence.',
  };
}

/**
 * Determine MIME type and human-readable document type from extension/content
 */
export function getMimeAndDocType(ext: string, mimeHint?: string): { mimeType: string; docType: string } {
  const cleanExt = ext.toLowerCase().replace(/^\./, '');
  
  if (mimeHint && mimeHint.includes('/')) {
    if (mimeHint.includes('pdf')) return { mimeType: 'application/pdf', docType: 'PDF Document' };
    if (mimeHint.includes('png')) return { mimeType: 'image/png', docType: 'PNG Image' };
    if (mimeHint.includes('webp')) return { mimeType: 'image/webp', docType: 'WebP Image' };
    if (mimeHint.includes('jpeg') || mimeHint.includes('jpg')) return { mimeType: 'image/jpeg', docType: 'JPEG Image' };
    if (mimeHint.includes('svg')) return { mimeType: 'image/svg+xml', docType: 'SVG Vector' };
    if (mimeHint.includes('gif')) return { mimeType: 'image/gif', docType: 'GIF Image' };
    if (mimeHint.includes('docx') || mimeHint.includes('wordprocessingml')) return { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', docType: 'Word Document' };
    if (mimeHint.includes('doc') || mimeHint.includes('msword')) return { mimeType: 'application/msword', docType: 'Word Document' };
  }

  switch (cleanExt) {
    case 'pdf':
      return { mimeType: 'application/pdf', docType: 'PDF Document' };
    case 'png':
      return { mimeType: 'image/png', docType: 'PNG Image' };
    case 'jpg':
    case 'jpeg':
      return { mimeType: 'image/jpeg', docType: 'JPEG Image' };
    case 'webp':
      return { mimeType: 'image/webp', docType: 'WebP Image' };
    case 'svg':
      return { mimeType: 'image/svg+xml', docType: 'SVG Vector' };
    case 'gif':
      return { mimeType: 'image/gif', docType: 'GIF Image' };
    case 'docx':
      return { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', docType: 'Word Document' };
    case 'doc':
      return { mimeType: 'application/msword', docType: 'Word Document' };
    case 'txt':
      return { mimeType: 'text/plain', docType: 'Text Document' };
    default:
      return { mimeType: 'application/octet-stream', docType: 'File Attachment' };
  }
}

/**
 * Format bytes to readable string (KB / MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Upload a candidate resume or project image to Vercel Blob Storage, with graceful local fallback
 */
export async function uploadToStorage(options: {
  buffer: Buffer;
  filename: string;
  category: 'resume' | 'project' | 'general';
  mimeType?: string;
  localFallbackDir?: string;
}): Promise<UploadResult> {
  const { buffer, filename, category, mimeType: explicitMime, localFallbackDir } = options;
  
  const ext = path.extname(filename).replace('.', '').toLowerCase() || (category === 'resume' ? 'pdf' : 'jpg');
  const { mimeType, docType } = getMimeAndDocType(ext, explicitMime);
  const sizeBytes = buffer.length;
  const sizeFormatted = formatBytes(sizeBytes);

  const cleanBaseName = path
    .basename(filename, path.extname(filename))
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .toLowerCase()
    .slice(0, 50) || 'file';

  const folderPrefix = category === 'resume' ? 'resumes' : category === 'project' ? 'projects' : 'uploads';
  const blobPath = `${folderPrefix}/${Date.now()}-${cleanBaseName}.${ext}`;
  const uniqueFilename = path.basename(blobPath);

  // Try Vercel Blob Storage first if token exists
  if (isVercelBlobConfigured()) {
    try {
      console.log(`[Vercel Blob] Uploading ${docType} to ${blobPath} (${sizeFormatted})...`);
      
      const blob = await put(blobPath, buffer, {
        access: 'public',
        contentType: mimeType,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      console.log(`[Vercel Blob] Successfully stored to Vercel Blob: ${blob.url}`);

      return {
        url: blob.url,
        filename: uniqueFilename,
        originalName: filename,
        type: docType,
        mimeType,
        size: sizeBytes,
        sizeFormatted,
        storage: 'vercel-blob',
        downloadUrl: blob.downloadUrl || blob.url,
        pathname: blob.pathname,
        uploadedAt: new Date().toISOString(),
      };
    } catch (blobErr: any) {
      console.error(`[Vercel Blob] Upload to Vercel Blob failed, falling back to server disk storage:`, blobErr?.message || blobErr);
    }
  } else {
    console.log(`[Storage] BLOB_READ_WRITE_TOKEN not detected in environment. Using local disk storage for ${blobPath}.`);
  }

  // Fallback: Local Server Storage
  const fallbackDir = localFallbackDir || path.resolve(process.cwd(), 'uploads', folderPrefix);
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }

  const localFilePath = path.join(fallbackDir, uniqueFilename);
  fs.writeFileSync(localFilePath, buffer);

  const fileUrl = category === 'resume' ? `/uploads/resumes/${uniqueFilename}` : `/uploads/${folderPrefix}/${uniqueFilename}`;

  return {
    url: fileUrl,
    filename: uniqueFilename,
    originalName: filename,
    type: docType,
    mimeType,
    size: sizeBytes,
    sizeFormatted,
    storage: 'local',
    downloadUrl: fileUrl,
    pathname: blobPath,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Delete a file from Vercel Blob or local storage
 */
export async function deleteFromStorage(urlOrPath: string): Promise<boolean> {
  if (!urlOrPath || typeof urlOrPath !== 'string') return false;

  const trimmed = urlOrPath.trim();
  if (!trimmed) return false;

  // Ignore external third-party placeholder domains (like Unsplash, Google avatars, etc.)
  if (
    trimmed.includes('images.unsplash.com') ||
    trimmed.includes('unsplash.com') ||
    trimmed.includes('lh3.googleusercontent.com') ||
    trimmed.includes('placehold.co')
  ) {
    return false;
  }

  let deletedAny = false;

  // 1. Check if it is a Vercel Blob URL or blob pathname
  if (
    trimmed.includes('blob.vercel-storage.com') ||
    trimmed.includes('vercel-storage') ||
    trimmed.includes('vercel-blob') ||
    (isVercelBlobConfigured() && trimmed.startsWith('https://'))
  ) {
    if (isVercelBlobConfigured()) {
      try {
        console.log(`[Vercel Blob] Attempting deletion of blob file: ${trimmed}`);
        await del(trimmed, { token: process.env.BLOB_READ_WRITE_TOKEN });
        console.log(`[Vercel Blob] Successfully deleted blob: ${trimmed}`);
        deletedAny = true;
      } catch (err: any) {
        console.warn(`[Vercel Blob] Failed to delete blob (${trimmed}):`, err?.message || err);
      }
    }
  }

  // 2. Local storage deletion (handle both relative /uploads/... paths and standalone filenames)
  try {
    const cleanPath = trimmed.split('?')[0];
    const filename = path.basename(cleanPath);

    // List of candidate paths on the server
    const possiblePaths = [
      path.resolve(process.cwd(), 'uploads', filename),
      path.resolve(process.cwd(), 'uploads', 'resumes', filename),
      path.resolve(process.cwd(), 'uploads', 'projects', filename),
      path.resolve(process.cwd(), cleanPath.replace(/^\/+/, '')),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        const stat = fs.statSync(p);
        if (stat.isFile()) {
          fs.unlinkSync(p);
          console.log(`[Storage] Deleted local file: ${p}`);
          deletedAny = true;
        }
      }
    }
  } catch (err: any) {
    console.warn(`[Storage] Error deleting local file (${trimmed}):`, err?.message || err);
  }

  return deletedAny;
}
