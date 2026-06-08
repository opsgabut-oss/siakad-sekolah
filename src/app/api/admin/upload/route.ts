import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { isGDriveConfigured, uploadToGoogleDrive } from '@/lib/gdrive';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const kategori = (formData.get('kategori') as string) || 'LAINNYA';

    if (!file) {
      return NextResponse.json({ message: 'Berkas tidak ditemukan' }, { status: 400 });
    }

    // 1. Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Try saving file locally (works on standard hosting/VPS, fails gracefully on Serverless Netlify/Vercel)
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${uniqueSuffix}-${sanitizedFileName}`;
    
    let localUrl = null;
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(localFilePath, buffer);
      localUrl = `/uploads/${fileName}`;
    } catch (localErr) {
      console.warn('Local filesystem is read-only (normal for serverless platforms like Netlify/Vercel):', localErr);
    }

    let driveUrl = null;
    let driveError = null;

    // Log configuration status
    const driveConfigured = isGDriveConfigured();
    console.log('Google Drive Configuration Check:', {
      configured: driveConfigured,
      hasFolderId: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
      hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    });

    // 3. Upload to Google Drive if configured
    if (driveConfigured) {
      try {
        const categoryMap: { [key: string]: string } = {
          SURAT_MASUK: 'Surat Masuk',
          SURAT_KELUAR: 'Surat Keluar',
          RAPOR: 'Rapor',
          IJAZAH: 'Ijazah',
          DOKUMEN_GURU: 'Dokumen Guru',
          LAINNYA: 'Lainnya',
        };
        const folderName = categoryMap[kategori] || 'Lainnya';

        const uploadResult = await uploadToGoogleDrive(
          file.name,
          file.type || 'application/octet-stream',
          buffer,
          folderName
        );
        driveUrl = uploadResult.webViewLink;
      } catch (err: any) {
        console.error('Google Drive Upload Error:', err);
        driveError = err.message || 'Error occurred during Google Drive upload';
      }
    } else {
      console.warn('Google Drive is not configured. Details of missing environment variables:', {
        GOOGLE_DRIVE_FOLDER_ID_missing: !process.env.GOOGLE_DRIVE_FOLDER_ID,
        GOOGLE_SERVICE_ACCOUNT_EMAIL_missing: !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_missing: !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      });
    }

    const tautanBerkas = driveUrl || localUrl;

    if (!tautanBerkas) {
      return NextResponse.json({
        message: 'Gagal mengunggah berkas. Server lokal read-only dan Google Drive tidak terkonfigurasi dengan benar.',
        driveError,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      localUrl,
      driveUrl,
      tautanBerkas,
      driveError,
    });
  } catch (error: any) {
    console.error('File upload general error:', error);
    return NextResponse.json(
      { message: 'Gagal mengunggah berkas', error: error.message },
      { status: 500 }
    );
  }
}
