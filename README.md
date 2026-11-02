# Kopi Kita

Aplikasi kasir dan stok bahan untuk kedai kopi kecil. Tiap penjualan memotong stok sesuai resep, bahan yang hampir kedaluwarsa dipakai duluan, dan aplikasi menyarankan apa yang perlu dipesan.

**Demo:** https://rakhanaufal736-cmd.github.io/kopikita-demo/

| Peran | Username | Password |
|---|---|---|
| Admin | `admin` | `admin1234` |
| Kasir | `kasir` | `kasir1234` |

Di halaman login ada tombol untuk masuk langsung.

## Soal demo ini

Ini versi frontend saja. Tidak ada server. Panggilan ke `/api/*` ditangani `demo-api.js`, dan datanya disimpan di `localStorage` browser kamu. Jadi data tidak ke mana-mana, tidak ikut ke perangkat lain, dan hilang kalau data browser dihapus. Pengaturan → "Reset data contoh" mengembalikan semuanya ke awal.

Versi aslinya jalan di Node.js dengan SQLite, tanpa dependensi npm, dengan login dan sinkron antar-perangkat. Kode server tidak ada di repo ini.

## Yang bisa dilakukan

- **Kasir:** pilih menu, ukuran, extra shot, catatan, diskon, bayar tunai atau QRIS, buka dan tutup shift
- **Stok:** tiap bahan dicatat per batch, yang lebih dulu kedaluwarsa dipakai lebih dulu (FEFO). Ada pencatatan waste dan stok opname
- **Pembelian:** saran pesan dihitung dari pemakaian (safety stock, titik pesan ulang, EOQ), lalu bisa dijadikan PO ke supplier
- **Laporan:** penjualan per periode dan analisis persediaan
- **Peran:** admin bisa ubah menu, pengaturan, pengguna, dan menyetujui opname. Kasir tidak

## Cara kerjanya

Semua data disimpan sebagai dokumen per kunci (`ing`, `bat`, `menu`, `ord:2026-11`, dan seterusnya), tiap dokumen punya nomor revisi. Kalau dua perangkat mengubah dokumen yang sama, yang kedua ditolak dengan status 409 lalu data dimuat ulang. Di demo, aturan ini dijalankan ulang oleh `demo-api.js`.

## Batasan

- Hitungan stok dan harga jalan di browser. Di versi dengan server, kasir yang sengaja curang masih bisa mengirim angka palsu. Untuk satu kedai dengan staf yang dipercaya ini cukup. Untuk lebih dari itu, logikanya harus pindah ke server.
- Cocok untuk satu outlet dengan beberapa perangkat. Belum ada mode offline, cetak struk thermal, void/refund, dan log audit.

## Jalankan sendiri

```bash
python3 -m http.server 8000
```

Buka http://localhost:8000.

## Lisensi

MIT. Lihat `LICENSE`.
