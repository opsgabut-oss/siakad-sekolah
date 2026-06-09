import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

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

    // Convert file to Buffer then Base64 Data URL
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Return the Base64 Data URL as tautanBerkas
    return NextResponse.json({
      success: true,
      localUrl: dataUrl,
      driveUrl: dataUrl,
      tautanBerkas: dataUrl,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { message: `Gagal mengunggah berkas: ${error.message}`, error: error.message },
      { status: 500 }
    );
  }
}


