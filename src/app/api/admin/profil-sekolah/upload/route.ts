import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
    
    // Tentukan direktori
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Pastikan direktori ada
    await mkdir(uploadDir, { recursive: true });
    
    // Simpan berkas
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}` 
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ message: error.message || 'Gagal mengunggah berkas' }, { status: 500 });
  }
}
