import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Upserting Merdeka curriculum subjects...');
  
  const subjects = [
    { nama: 'Pendidikan Agama dan Budi Pekerti', kode: 'PABP' },
    { nama: 'Pendidikan Pancasila', kode: 'PP' },
    { nama: 'Bahasa Indonesia', kode: 'IND' },
    { nama: 'Matematika', kode: 'MTK' },
    { nama: 'Ilmu Pengetahuan Alam dan Sosial', kode: 'IPAS' },
    { nama: 'Seni dan Budaya', kode: 'SB' },
    { nama: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', kode: 'PJOK' },
    { nama: 'Bahasa Inggris', kode: 'ING' },
    { nama: 'Bahasa Jawa', kode: 'BJAW' }
  ];

  for (const sub of subjects) {
    const existing = await prisma.mataPelajaran.findUnique({
      where: { kode: sub.kode }
    });

    if (existing) {
      await prisma.mataPelajaran.update({
        where: { kode: sub.kode },
        data: { nama: sub.nama }
      });
      console.log(`Updated subject: ${sub.kode} - ${sub.nama}`);
    } else {
      await prisma.mataPelajaran.create({
        data: sub
      });
      console.log(`Created subject: ${sub.kode} - ${sub.nama}`);
    }
  }

  console.log('Subjects sync completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
