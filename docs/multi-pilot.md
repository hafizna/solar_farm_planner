# Empat pilot pra-pendaftaran

Pemilih wilayah di Penjajakan & Alokasi mengganti peta, GHI, kandidat, GI, alternatif koridor, sumber, dan ekspor. Filter, biaya, pendaftaran impor, batas kuota/GI, dan hasil simulasi disimpan terpisah per pilot selama sesi halaman terbuka. Muat ulang halaman mengembalikan default; ekspor JSON untuk menyimpan bukti skenario.

| Pilot | Patch terbentuk | GI OSM 70/150 kV | Alternatif |
| --- | ---: | ---: | ---: |
| Bolok/Kupang | 8 | 1 | 16 |
| Jeneponto (GI Tolo) | 1 | 1 | 2 |
| Pringgabaya/Lombok Timur | 2 | 1 | 4 |
| Situbondo | 0 | 0 | 0 |

Pringgabaya memiliki patch 22,36 dan 15,97 ha; filter default 20 ha menampilkan satu. Situbondo sengaja menampilkan hasil kosong: snapshot kecil belum memiliki patch minimum atau GI dengan tag tegangan yang dipakai model. Ini bukan kesimpulan kelayakan seluruh kabupaten. Studi Situbondo perlu perluasan cakupan dan konfirmasi GI.

Semua data geografis merupakan snapshot publik, bukan data live. Tidak ada pendaftar, kuota resmi, biaya terverifikasi, atau kapasitas menerima GI yang dibuat-buat. Tombol contoh biaya/batas tetap berlabel sintetis. Data lahan tidak membuktikan kepemilikan atau ketersediaan.

Konfigurasi batas pilot: `web/scripts/pilot-config.json`. Proses ulang snapshot lokal dengan PowerShell: `$env:PILOT_ID='jeneponto'` lalu `npm.cmd --prefix web run build:pilot`. Tanpa grid cache, proses memerlukan akses raster publik. Build web biasa memakai hasil tersimpan dan tidak mengunduh data.

HTML aplikasi mandiri: `web/portable/georensis-solar.html`. Data/peta vektor dan perhitungan tersedia offline; citra basemap memerlukan internet. Ekspor laporan HTML mandiri tersedia untuk setiap pilot, termasuk hasil kosong yang jujur.
