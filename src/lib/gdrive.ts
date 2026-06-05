import jwt from 'jsonwebtoken';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

export function isGDriveConfigured(): boolean {
  return !!(FOLDER_ID && CLIENT_EMAIL && PRIVATE_KEY);
}

async function getAccessToken(): Promise<string> {
  if (!CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error('Google Drive service account credentials are not configured.');
  }

  const payload = {
    iss: CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  const assertion = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`Failed to obtain Google Drive access token: ${res.statusText}. ${JSON.stringify(errorData)}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function getOrCreateSubFolder(
  categoryName: string,
  parentId: string,
  accessToken: string
): Promise<string> {
  // 1. Search if folder already exists
  const query = `mimeType = 'application/vnd.google-apps.folder' and name = '${categoryName}' and '${parentId}' in parents and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&spaces=drive`;

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!searchRes.ok) {
    throw new Error(`Failed to search folder: ${searchRes.statusText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // 2. Folder does not exist, create it
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: categoryName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create subfolder: ${createRes.statusText}`);
  }

  const createData = await createRes.json();
  return createData.id;
}

export interface GDriveUploadResult {
  fileId: string;
  webViewLink: string;
}

export async function uploadToGoogleDrive(
  fileName: string,
  mimeType: string,
  buffer: Buffer,
  categoryName: string
): Promise<GDriveUploadResult> {
  if (!isGDriveConfigured()) {
    throw new Error('Google Drive integration is not fully configured.');
  }

  const accessToken = await getAccessToken();
  const parentId = FOLDER_ID!;

  // 1. Get or create the subfolder corresponding to the category
  const folderId = await getOrCreateSubFolder(categoryName, parentId, accessToken);

  // 2. Create the file metadata
  const metadataRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: fileName,
      parents: [folderId],
      mimeType: mimeType,
    }),
  });

  if (!metadataRes.ok) {
    const errorData = await metadataRes.json().catch(() => ({}));
    throw new Error(`Failed to create file metadata: ${metadataRes.statusText}. ${JSON.stringify(errorData)}`);
  }

  const fileMetadata = await metadataRes.json();
  const fileId = fileMetadata.id;

  // 3. Upload file content to the created file ID
  const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': mimeType,
    },
    body: new Uint8Array(buffer),
  });

  if (!uploadRes.ok) {
    throw new Error(`Failed to upload file content: ${uploadRes.statusText}`);
  }

  // 4. Set permission to "anyone with link can view"
  const permissionRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  });

  if (!permissionRes.ok) {
    console.error(`Warning: Failed to set public permission: ${permissionRes.statusText}`);
  }

  // 5. Retrieve the webViewLink
  const getFileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!getFileRes.ok) {
    throw new Error(`Failed to retrieve file details: ${getFileRes.statusText}`);
  }

  const fileDetails = await getFileRes.json();
  return {
    fileId,
    webViewLink: fileDetails.webViewLink,
  };
}
