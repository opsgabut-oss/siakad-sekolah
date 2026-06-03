import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords
  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordGuru1 = await bcrypt.hash('guru123', 10);
  const passwordGuru2 = await bcrypt.hash('guru123', 10);

  // 1. Create Admin TU User if not exists
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin.tu' },
    update: {},
    create: {
      username: 'admin.tu',
      password: passwordAdmin,
      role: Role.ADMIN,
    },
  });
  console.log('Upserted Admin TU User:', adminUser.username);

  // 2. Create Tahun Ajaran
  const tahunAjaran = await prisma.tahunAjaran.create({
    data: {
      tahun: '2025/2026',
      aktif: true,
    },
  });
  console.log('Created Tahun Ajaran:', tahunAjaran.tahun);

  // 3. Create Kelas
  const kelasA = await prisma.kelas.create({
    data: {
      nama: 'Kelas X-A',
      tahunAjaranId: tahunAjaran.id,
    },
  });
  const kelasB = await prisma.kelas.create({
    data: {
      nama: 'Kelas X-B',
      tahunAjaranId: tahunAjaran.id,
    },
  });
  console.log('Created Classes:', kelasA.nama, ',', kelasB.nama);

  // 4. Create Guru Users and Guru Profiles
  const userGuru1 = await prisma.user.upsert({
    where: { username: 'guru.budi' },
    update: {},
    create: {
      username: 'guru.budi',
      password: passwordGuru1,
      role: Role.GURU,
    },
  });

  const guru1 = await prisma.guru.create({
    data: {
      nuptk: '1234567890123456',
      nama: 'Budi Santoso, S.Pd.',
      kontak: '081234567890',
      userId: userGuru1.id,
    },
  });

  const userGuru2 = await prisma.user.upsert({
    where: { username: 'guru.siti' },
    update: {},
    create: {
      username: 'guru.siti',
      password: passwordGuru2,
      role: Role.GURU,
    },
  });

  const guru2 = await prisma.guru.create({
    data: {
      nuptk: '9876543210987654',
      nama: 'Siti Aminah, M.Pd.',
      kontak: '089876543210',
      userId: userGuru2.id,
    },
  });
  console.log('Created Guru profiles for:', guru1.nama, 'and', guru2.nama);

  // 5. Create Siswa
  const siswa1 = await prisma.siswa.create({
    data: {
      nisn: '1234567890',
      nama: 'Rian Hidayat',
      kelasId: kelasA.id,
      kontakOrangTua: '085222333444',
    },
  });

  const siswa2 = await prisma.siswa.create({
    data: {
      nisn: '0987654321',
      nama: 'Laras Ati',
      kelasId: kelasA.id,
      kontakOrangTua: '081333444555',
    },
  });

  const siswa3 = await prisma.siswa.create({
    data: {
      nisn: '1122334455',
      nama: 'Dian Permana',
      kelasId: kelasB.id,
      kontakOrangTua: '087888999000',
    },
  });
  console.log('Created Siswa profiles for:', siswa1.nama, ',', siswa2.nama, ',', siswa3.nama);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
