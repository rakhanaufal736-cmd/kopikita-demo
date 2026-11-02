# Kopi Kita

Kopi Kita mencatat penjualan dan stok bahan sekaligus. Tiap penjualan memotong stok sesuai resep, bahan yang hampir kedaluwarsa dipakai duluan, dan aplikasi menyarankan apa yang perlu dipesan.

**Demo:** https://rakhanaufal736-cmd.github.io/kopikita-demo/

| Peran | Username | Password |
|---|---|---|
| Admin | `admin` | `admin1234` |
| Kasir | `kasir` | `kasir1234` |

*Catatan: Di halaman login, tersedia tombol untuk masuk secara instan.*

## Tentang Demo Ini

Versi yang Anda coba ini hanya menjalankan sisi frontend saja. Karena tidak ada server, semua panggilan ke `/api/*` ditangani oleh `demo-api.js` dan datanya disimpan di `localStorage` browser Anda. Hal ini berarti data tidak tersinkronisasi antar perangkat dan akan hilang jika data browser dihapus. Jika ingin mengembalikan data ke kondisi awal, gunakan fitur "Reset data contoh" di menu Pengaturan.

Sebagai informasi, versi aslinya berjalan di Node.js dengan SQLite tanpa dependensi npm, serta sudah mendukung sistem login dan sinkronisasi antar-perangkat. Kode servernya sendiri tidak disertakan dalam repositori ini.

## Fitur Utama

- **Kasir:** Melayani pemesanan lengkap (pilih menu, ukuran, ekstra shot, catatan, diskon), pilihan pembayaran (tunai atau QRIS), serta manajemen buka/tutup shift.
- **Stok:** Pencatatan bahan per batch dengan sistem FEFO (*First Expired, First Out*). Tersedia juga fitur pencatatan *waste* dan stok opname.
- **Pembelian:** Sistem memberikan saran pemesanan berdasarkan pemakaian (menggunakan perhitungan *safety stock*, titik pesan ulang, dan EOQ), yang kemudian bisa langsung dijadikan PO ke supplier.
- **Laporan:** Analisis persediaan dan laporan penjualan per periode.
- **Hak Akses:** Admin memiliki kontrol penuh atas menu, pengaturan, pengguna, dan persetujuan opname, sementara kasir memiliki akses terbatas.

Setiap kali terjadi penjualan, stok akan berkurang secara otomatis berdasarkan resep yang telah diatur.

## Cara Kerja Sistem

Data disimpan dalam format dokumen per kunci (seperti `ing`, `bat`, `menu`, `ord:2026-11`, dan seterusnya), di mana setiap dokumen memiliki nomor revisi. Jika ada dua perangkat yang mencoba mengubah dokumen yang sama secara bersamaan, perubahan kedua akan ditolak dengan status 409, lalu data akan dimuat ulang. Dalam demo ini, aturan tersebut dijalankan melalui `demo-api.js`.

## Batasan

- Perhitungan stok dan harga masih dilakukan di sisi browser dikarenakan ini versi demo. Pada versi server, hal ini bertujuan mencegah manipulasi angka oleh pengguna. Untuk skala satu coffee shop dengan staf terpercaya, metode ini sudah cukup, namun untuk skala yang lebih besar, logika ini harus dipindahkan ke server.
- Aplikasi ini cocok untuk satu outlet dengan beberapa perangkat. Saat ini belum tersedia mode offline, fitur cetak struk thermal, fungsi
