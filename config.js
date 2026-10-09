/*
  ============================================================
  PENGATURAN UNDANGAN
  Cukup ubah isi file ini. Tidak perlu menyentuh file lain.
  ============================================================
*/
window.UNDANGAN = {
  // Link Web App dari Google Apps Script (lihat PANDUAN.md langkah 2).
  // Selama masih kosong, undangan berjalan dalam "mode coba":
  // data RSVP hanya tersimpan di browser yang sedang dipakai.
  scriptUrl: "",

  mempelaiWanita: {
    panggilan: "Husna",
    namaLengkap: "Badi'athul Husna",
    urutan: "Putri kedua dari",
    ayah: "Bapak Muh. Baha'udin (Joni)",
    ibu: "Ibu Sri Heriana (Ana)",
    instagram: "" // contoh: "badiathulhusna" (tanpa @), kosongkan jika tidak perlu
  },

  mempelaiPria: {
    panggilan: "Bima",
    namaLengkap: "Wahyu Dwi Bimantoro",
    urutan: "Putra kedua dari",
    ayah: "Bapak Popo Dwi Waluyo",
    ibu: "Ibu Eka Wijayanti (Yayuk)",
    instagram: ""
  },

  // Tanggal & jam untuk hitung mundur (format: TAHUN-BULAN-TANGGALTjam:menit+07:00)
  tanggalUtama: "2026-10-23T13:00:00+07:00",

  // Daftar acara. Kosongkan "jam" atau "tempat" jika belum pasti, barisnya akan disembunyikan.
  // Untuk memisah akad & resepsi, salin satu blok { ... } lalu ubah isinya.
  acara: [
    {
      nama: "Akad Nikah",
      hari: "Jum'at, 23 Oktober 2026",
      jam: "13.00 WIB (Ba'da Dhuhur)",
      mulai: "",               // contoh: "2026-10-23T08:00:00+07:00" (untuk tombol simpan ke kalender)
      selesai: "",             // contoh: "2026-10-23T13:00:00+07:00"
      tanggalKalender: "2026-10-23",
      tempat: "Dsn. Maron RT. 05 RW. 02, Ds. Mulyorejo",
      alamat: "Kec. Ngantang, Kab. Malang",
      peta: "https://share.google/oB1gUZ0vL6hSUB4IG"
    }
  ],

  // Musik latar (opsional). Taruh file mp3 di folder yang sama, lalu tulis namanya, mis. "musik.mp3"
  musik: "musik.mp3",
  // Musik mulai dari detik ke berapa (juga saat diulang)
  musikMulai: 20,

  // Batas jumlah tamu yang boleh dibawa per undangan
  maksTamu: 4
};
