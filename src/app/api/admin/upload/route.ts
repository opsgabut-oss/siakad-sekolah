import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Berkas tidak ditemukan' }, { status: 400 });
    }

    // 1. Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Save file locally
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${uniqueSuffix}-${sanitizedFileName}`;
    const localFilePath = path.join(uploadsDir, fileName);

    // Write file to local server
    fs.writeFileSync(localFilePath, buffer);
    const localUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      localUrl,
      tautanBerkas: localUrl,
    });
  } catch (error: any) {
    console.error('File upload general error:', error);
    return NextResponse.json(
      { message: 'Gagal mengunggah berkas', error: error.message },
      { status: 500 }
    );
  }
}
