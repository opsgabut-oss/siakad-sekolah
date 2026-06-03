const http = require('http');

// Konfigurasi
const CRON_SECRET = process.env.CRON_SECRET || 'siakad-cron-secure-secret-token-123';
const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api/cron/wa-absensi?token=${CRON_SECRET}`;

console.log('=== Scheduler Otomatisasi WA SIAKAD Dimulai ===');
console.log(`Menargetkan rute: ${API_URL}`);
console.log('Menunggu waktu pemicu pukul 16:00 WIB harian...');

// Fungsi untuk memicu API Cron
function triggerAbsensiCron() {
  console.log(`[${new Date().toLocaleString()}] Menjalankan scheduled task absensi alpa harian...`);
  
  http.get(API_URL, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`[RESPON CRON] Status: ${res.statusCode}`);
      console.log(`[RESPON CRON] Body: ${data}`);
    });
  }).on('error', (err) => {
    console.error(`[ERROR CRON] Gagal memicu API:`, err.message);
  });
}

// Cek waktu setiap menit (Internal Scheduler Fallback)
setInterval(() => {
  const now = new Date();
  
  // Konversi ke Waktu Indonesia Barat (WIB) - UTC+7
  // Kita ambil jam dan menit lokal Indonesia Barat
  const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  const hours = wibTime.getHours();
  const minutes = wibTime.getMinutes();

  // Pemicu tepat pada pukul 16:00 WIB
  if (hours === 16 && minutes === 0) {
    // Jalankan pemicu sekali pada menit tersebut
    triggerAbsensiCron();
  }
}, 60000); // Setiap 60 detik

// Jika ingin langsung menguji saat skrip dijalankan (opsional/development)
if (process.argv.includes('--test')) {
  console.log('Menjalankan uji coba pemicu instan...');
  triggerAbsensiCron();
}
