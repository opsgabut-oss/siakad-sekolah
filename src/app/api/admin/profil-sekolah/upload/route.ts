import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { isGDriveConfigured, uploadToGoogleDrive } from '@/lib/gdrive';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null; // 'pemda' | 'sekolah'

    if (!file) {
      return NextResponse.json({ message: 'Tidak ada berkas yang diunggah' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dapatkan ekstensi file original
    const originalName = file.name;
    const ext = originalName.split('.').pop() || 'png';
    const cleanExt = ext.toLowerCase();

    // Validasi tipe file
    const allowedExts = ['png', 'jpg', 'jpeg', 'svg', 'webp'];
    if (!allowedExts.includes(cleanExt)) {
      return NextResponse.json({ message: 'Format berkas tidak diizinkan. Gunakan PNG, JPG, JPEG, SVG, atau WEBP.' }, { status: 400 });
    }

    // Nama file unik
    const filename = `logo-${type || 'upload'}-${Date.now()}.${cleanExt}`;
    
    let localUrl = null;
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);
      localUrl = `/uploads/${filename}`;
    } catch (localErr) {
      console.warn('Local filesystem is read-only (normal for serverless platforms like Netlify/Vercel):', localErr);
    }

    let driveUrl = null;
    let driveError = null;

    if (isGDriveConfigured()) {
      try {
        const uploadResult = await uploadToGoogleDrive(
          filename,
          file.type || 'image/png',
          buffer,
          'Logo'
        );
        driveUrl = uploadResult.webViewLink;
      } catch (err: any) {
        console.error('Google Drive Profile Upload Error:', err);
        driveError = err.message || 'Error occurred during Google Drive upload';
      }
    }

    const url = driveUrl || localUrl;

    if (!url) {
      return NextResponse.json({ 
        message: 'Gagal mengunggah berkas. Server lokal read-only dan Google Drive tidak terkonfigurasi dengan benar.',
        driveError 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      url: url,
      localUrl,
      driveUrl
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ message: error.message || 'Gagal mengunggah berkas' }, { status: 500 });
  }
}

