(function () {
  "use strict";

  var C = window.UNDANGAN || {};
  var W = C.mempelaiWanita || {};
  var P = C.mempelaiPria || {};
  var modeCoba = !C.scriptUrl;
  var KUNCI_COBA = "undangan-husna-rsvp-coba";
  var geraknyaDikurangi = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ---------- Isi teks dari config ---------- */
  var tglUtama = new Date(C.tanggalUtama);
  var acaraPertama = (C.acara || [])[0] || {};
  var nilai = {
    "wanita.panggilan": W.panggilan,
    "wanita.namaLengkap": W.namaLengkap,
    "wanita.urutan": W.urutan,
    "wanita.ayah": W.ayah,
    "wanita.ibu": W.ibu,
    "wanita.inisial": (W.panggilan || "").charAt(0),
    "pria.panggilan": P.panggilan,
    "pria.namaLengkap": P.namaLengkap,
    "pria.urutan": P.urutan,
    "pria.ayah": P.ayah,
    "pria.ibu": P.ibu,
    "pria.inisial": (P.panggilan || "").charAt(0),
    "hariUtama": acaraPertama.hari,
    "tanggalPendek": isNaN(tglUtama) ? "" :
      [tglUtama.getDate(), tglUtama.getMonth() + 1, tglUtama.getFullYear()]
        .map(function (n) { return String(n).padStart(2, "0"); }).join(" · ")
  };
  $$("[data-isi]").forEach(function (el) {
    var v = nilai[el.getAttribute("data-isi")];
    if (v) el.textContent = v;
  });
  document.title = (W.panggilan || "") + " & " + (P.panggilan || "") + " · Undangan Pernikahan";

  $$("[data-ig]").forEach(function (a) {
    var o = a.getAttribute("data-ig") === "wanita" ? W : P;
    if (!o.instagram) return;
    a.href = "https://instagram.com/" + encodeURIComponent(o.instagram);
    a.textContent = "@" + o.instagram;
    a.hidden = false;
  });

  /* ---------- Nama tamu dari link (?to=Nama) ---------- */
  var params = new URLSearchParams(location.search);
  var tamu = (params.get("to") || params.get("kepada") || "").trim().slice(0, 60);
  if (tamu) {
    $("#namaTamu").textContent = tamu;
    $("#rsvpNama").value = tamu;
  }

  /* ---------- Bintang berkelip ---------- */
  $$(".bintang").forEach(function (wadah) {
    var n = wadah.id ? 46 : 26;
    for (var i = 0; i < n; i++) {
      var b = document.createElement("i");
      b.style.left = (Math.random() * 100).toFixed(1) + "%";
      b.style.top = (Math.random() * (wadah.id ? 60 : 100)).toFixed(1) + "%";
      b.style.setProperty("--u", (1 + Math.random() * 2.2).toFixed(1) + "px");
      b.style.setProperty("--d", (2 + Math.random() * 3).toFixed(1) + "s");
      b.style.setProperty("--t", (-Math.random() * 5).toFixed(1) + "s");
      wadah.appendChild(b);
    }
  });

  /* ---------- Musik ---------- */
  var audio = null;
  var tombolMusik = $("#tombolMusik");
  var mulaiMusik = Number(C.musikMulai) || 0;
  if (C.musik) {
    audio = new Audio(C.musik);
    audio.preload = "auto";
    // Lompat ke detik awal begitu durasi lagu diketahui
    var keAwal = function () { try { audio.currentTime = mulaiMusik; } catch (e) {} };
    if (audio.readyState >= 1) keAwal(); else audio.addEventListener("loadedmetadata", keAwal, { once: true });
    // Saat lagu habis, ulangi dari detik awal (bukan dari 0)
    audio.addEventListener("ended", function () { keAwal(); audio.play().catch(function () {}); });
    tombolMusik.hidden = false;
    tombolMusik.addEventListener("click", function () {
      if (audio.paused) audio.play().catch(function () {}); else audio.pause();
    });
    audio.addEventListener("play", function () { tombolMusik.classList.add("berputar"); });
    audio.addEventListener("pause", function () { tombolMusik.classList.remove("berputar"); });
  }

  /* ---------- Buka undangan: sampul memudar, tirai terbuka ---------- */
  var pembuka = $("#pembuka");
  var jeda = geraknyaDikurangi ? [0, 0, 0, 50] : [0, 900, 2700, 3700];
  $("#bukaUndangan").addEventListener("click", function () {
    if (audio) audio.play().catch(function () {});
    window.scrollTo(0, 0);
    pembuka.classList.add("tahap-1");
    setTimeout(function () { pembuka.classList.add("tahap-2"); }, jeda[1]);
    setTimeout(function () {
      pembuka.classList.add("tahap-3");
      document.body.classList.remove("terkunci");
      mulaiKelopak();
      mulaiMuncul();
    }, jeda[2]);
    setTimeout(function () { pembuka.hidden = true; }, jeda[3]);
  });

  /* ---------- Acara ---------- */
  var ikon = {
    kalender: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M4 6.5h16v13H4zM4 10h16M8 3.5v4M16 3.5v4"/></svg>',
    jam: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M12 7.5V12l3 2"/></svg>',
    lokasi: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
  };

  function formatGcal(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  function tautan(href, teks, kelas) {
    var a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = kelas;
    a.textContent = teks;
    return a;
  }

  var wadahAcara = $("#daftarAcara");
  (C.acara || []).forEach(function (a, i) {
    var el = document.createElement("article");
    el.className = "acara__item";
    el.setAttribute("data-anim", "naik");
    el.style.setProperty("--tunda", (i * 0.15) + "s");
    el.innerHTML = '<svg class="acara__bunga" aria-hidden="true"><use href="#bunga"/></svg>';

    var h = document.createElement("h3");
    h.className = "acara__nama";
    h.textContent = a.nama;
    el.appendChild(h);

    [["kalender", a.hari], ["jam", a.jam], ["lokasi", a.tempat]].forEach(function (b) {
      if (!b[1]) return;
      var p = document.createElement("p");
      p.className = "acara__baris";
      p.innerHTML = ikon[b[0]];
      var s = document.createElement("span");
      s.textContent = b[1];
      p.appendChild(s);
      if (b[0] === "lokasi" && a.alamat) {
        var al = document.createElement("span");
        al.className = "acara__alamat";
        al.textContent = a.alamat;
        p.appendChild(al);
      }
      el.appendChild(p);
    });
    if (!a.tempat && a.peta) {
      var cat = document.createElement("p");
      cat.className = "acara__catatan";
      cat.textContent = "Lokasi acara bisa dibuka lewat tombol di bawah.";
      el.appendChild(cat);
    }

    var aksi = document.createElement("div");
    aksi.className = "acara__aksi";
    if (a.peta) aksi.appendChild(tautan(a.peta, "Lihat lokasi", "tombol tombol--emas tombol--kecil"));
    var judulKal = a.nama + " · " + (W.panggilan || "") + " & " + (P.panggilan || "");
    var tanggalKal = "";
    if (a.mulai && a.selesai) {
      tanggalKal = formatGcal(a.mulai) + "/" + formatGcal(a.selesai);
    } else if (a.tanggalKalender) {
      // acara sehari penuh bila jam belum ditentukan
      var awal = new Date(a.tanggalKalender + "T00:00:00Z");
      var akhir = new Date(awal.getTime() + 86400000);
      tanggalKal = awal.toISOString().slice(0, 10).replace(/-/g, "") + "/" + akhir.toISOString().slice(0, 10).replace(/-/g, "");
    }
    if (tanggalKal) {
      var url = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent(judulKal) +
        "&dates=" + tanggalKal +
        "&location=" + encodeURIComponent([a.tempat, a.alamat].filter(Boolean).join(", ") || a.peta || "");
      aksi.appendChild(tautan(url, "Simpan ke kalender", "tombol tombol--garis tombol--kecil"));
    }
    el.appendChild(aksi);
    wadahAcara.appendChild(el);
  });

  /* ---------- Hitung mundur ---------- */
  var wadahHitung = $("#hitungMundur");
  function detak() {
    var sisa = tglUtama - new Date();
    if (isNaN(sisa)) { wadahHitung.hidden = true; return true; }
    if (sisa <= 0) {
      wadahHitung.classList.add("hitung--selesai");
      wadahHitung.textContent = "Alhamdulillah, hari bahagia telah tiba.";
      return true;
    }
    var d = Math.floor(sisa / 1000);
    var set = { hari: Math.floor(d / 86400), jam: Math.floor(d % 86400 / 3600), menit: Math.floor(d % 3600 / 60), detik: d % 60 };
    Object.keys(set).forEach(function (k) { $('[data-h="' + k + '"]', wadahHitung).textContent = set[k]; });
  }
  if (!detak()) {
    var idDetak = setInterval(function () { if (detak()) clearInterval(idDetak); }, 1000);
  }

  var idToast;
  function toast(teks) {
    var t = $("#toast");
    t.textContent = teks;
    t.classList.add("tampil");
    clearTimeout(idToast);
    idToast = setTimeout(function () { t.classList.remove("tampil"); }, 2400);
  }

  /* ---------- Data RSVP ----------
     Kehadiran hanya tersimpan di Google Sheet Husna.
     Yang tampil untuk publik hanya nama + ucapan. */
  function bacaCoba() {
    try { return JSON.parse(localStorage.getItem(KUNCI_COBA)) || []; } catch (e) { return []; }
  }

  function ambilUcapan() {
    if (modeCoba) {
      return Promise.resolve(bacaCoba()
        .filter(function (u) { return u.ucapan; })
        .map(function (u) { return { nama: u.nama, ucapan: u.ucapan, waktu: u.waktu }; }));
    }
    return fetch(C.scriptUrl + "?t=" + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) throw new Error(j.pesan || "Gagal memuat");
        return j.data || [];
      });
  }

  function kirimRsvp(data) {
    if (modeCoba) {
      var semua = bacaCoba();
      data.waktu = new Date().toISOString();
      semua.unshift(data);
      try { localStorage.setItem(KUNCI_COBA, JSON.stringify(semua)); } catch (e) {}
      return Promise.resolve();
    }
    // Content-Type text/plain agar tidak terkena pemeriksaan CORS tambahan
    return fetch(C.scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error(j.pesan || "Gagal mengirim"); });
  }

  /* ---------- Daftar ucapan ---------- */
  var semuaUcapan = [];
  var tampilSampai = 10;
  var wadahUcapan = $("#daftarUcapan");
  var tombolLagi = $("#muatLagi");

  function waktuRelatif(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    var s = (Date.now() - d) / 1000;
    if (s < 60) return "baru saja";
    if (s < 3600) return Math.floor(s / 60) + " menit lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
    if (s < 86400 * 7) return Math.floor(s / 86400) + " hari lalu";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  function gambarUcapan() {
    $("#ringkasan").textContent = semuaUcapan.length ? semuaUcapan.length + " doa telah terkirim" : "";
    wadahUcapan.innerHTML = "";
    if (!semuaUcapan.length) {
      var kosong = document.createElement("li");
      kosong.className = "ucapan__kosong";
      kosong.textContent = "Belum ada ucapan. Jadilah yang pertama mendoakan.";
      wadahUcapan.appendChild(kosong);
    }
    semuaUcapan.slice(0, tampilSampai).forEach(function (u) {
      var li = document.createElement("li");
      var av = document.createElement("span");
      av.className = "ucapan__avatar";
      av.setAttribute("aria-hidden", "true");
      av.textContent = (u.nama || "?").trim().charAt(0).toUpperCase();
      var isiWadah = document.createElement("div");
      var siapa = document.createElement("p");
      siapa.className = "ucapan__siapa";
      siapa.textContent = u.nama;
      var isi = document.createElement("p");
      isi.className = "ucapan__isi";
      isi.textContent = u.ucapan;
      var wkt = document.createElement("p");
      wkt.className = "ucapan__waktu";
      wkt.textContent = waktuRelatif(u.waktu);
      isiWadah.appendChild(siapa);
      isiWadah.appendChild(isi);
      isiWadah.appendChild(wkt);
      li.appendChild(av);
      li.appendChild(isiWadah);
      wadahUcapan.appendChild(li);
    });
    tombolLagi.hidden = semuaUcapan.length <= tampilSampai;
  }

  tombolLagi.addEventListener("click", function () { tampilSampai += 10; gambarUcapan(); });

  function muatUcapan() {
    return ambilUcapan().then(function (d) {
      semuaUcapan = d;
      gambarUcapan();
    }).catch(function () {
      wadahUcapan.innerHTML = '<li class="ucapan__kosong">Ucapan belum bisa dimuat. Coba muat ulang halaman sebentar lagi.</li>';
    });
  }
  muatUcapan();

  /* ---------- Form ---------- */
  var form = $("#formRsvp");
  var pilihJumlah = $("#rsvpJumlah");
  for (var i = 1; i <= (C.maksTamu || 4); i++) {
    var o = document.createElement("option");
    o.value = i;
    o.textContent = i + " orang";
    pilihJumlah.appendChild(o);
  }
  $$('input[name="kehadiran"]', form).forEach(function (r) {
    r.addEventListener("change", function () { $("#isianJumlah").hidden = form.kehadiran.value === "Tidak hadir"; });
  });

  var pesan = $("#pesanForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    pesan.className = "form__pesan";
    var nama = form.nama.value.trim();
    var kehadiran = form.kehadiran.value;
    if (!nama) { pesan.textContent = "Tulis nama Anda dulu, ya."; pesan.classList.add("salah"); form.nama.focus(); return; }
    if (!kehadiran) { pesan.textContent = "Pilih salah satu: hadir, belum bisa, atau masih ragu."; pesan.classList.add("salah"); return; }

    var data = {
      nama: nama.slice(0, 60),
      kehadiran: kehadiran,
      jumlah: kehadiran === "Tidak hadir" ? 0 : Number(pilihJumlah.value) || 1,
      ucapan: form.ucapan.value.trim().slice(0, 500),
      tamuLink: tamu
    };

    var tombol = $("#kirimRsvp");
    tombol.disabled = true;
    tombol.textContent = "Mengirim…";
    kirimRsvp(data).then(function () {
      pesan.textContent = kehadiran === "Hadir"
        ? "Terima kasih, " + nama + ". Sampai jumpa di hari bahagia kami."
        : "Terima kasih atas doa dan perhatiannya, " + nama + ".";
      pesan.classList.add("berhasil");
      toast("Konfirmasi terkirim");
      var adaUcapan = !!data.ucapan;
      form.ucapan.value = "";
      return muatUcapan().then(function () {
        if (adaUcapan) $("#ucapan").scrollIntoView({ behavior: geraknyaDikurangi ? "auto" : "smooth" });
      });
    }).catch(function () {
      pesan.textContent = "Belum terkirim karena koneksi bermasalah. Silakan coba lagi.";
      pesan.classList.add("salah");
    }).then(function () {
      tombol.disabled = false;
      tombol.textContent = "Kirim konfirmasi";
    });
  });

  /* ---------- Navigasi bawah: tandai bagian yang sedang dibaca ---------- */
  var tautanNav = $$("[data-nav]");
  if ("IntersectionObserver" in window) {
    var ioNav = new IntersectionObserver(function (entri) {
      entri.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        var cocok = { salam: "beranda", penutup: "ucapan" }[id] || id;
        tautanNav.forEach(function (a) { a.classList.toggle("aktif", a.getAttribute("data-nav") === cocok); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$(".halaman > section").forEach(function (s) { ioNav.observe(s); });
  }

  /* ---------- Muncul saat digulir ---------- */
  var elAnim = $$("[data-anim]");
  // beri jeda bertingkat untuk elemen yang bersebelahan dalam satu bagian
  $$(".bagian").forEach(function (b) {
    $$("[data-anim]", b).forEach(function (el, i) {
      if (!el.style.getPropertyValue("--tunda")) el.style.setProperty("--tunda", Math.min(i, 4) * 0.08 + "s");
    });
  });
  if ("IntersectionObserver" in window && !geraknyaDikurangi) document.documentElement.classList.add("js-siap");

  function mulaiMuncul() {
    if (!document.documentElement.classList.contains("js-siap")) return;
    var io = new IntersectionObserver(function (entri) {
      entri.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("terlihat"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    $$("[data-anim]").forEach(function (el) { io.observe(el); });
  }
  // Tamu yang membuka link tanpa sampul (mis. pratinjau) tetap melihat isinya
  if (elAnim.length && pembuka.hidden) mulaiMuncul();

  /* ---------- Kelopak bunga berjatuhan ---------- */
  function mulaiKelopak() {
    if (geraknyaDikurangi) return;
    var kanvas = $("#kelopak");
    var ctx = kanvas.getContext && kanvas.getContext("2d");
    if (!ctx) return;
    var rasio = Math.min(window.devicePixelRatio || 1, 2);
    var lebar, tinggi;
    var warna = ["#F2D3CE", "#E8B7B0", "#F7E6E2", "#FFFFFF", "#EACB8E"];
    var kelopak = [];

    function ukur() {
      lebar = kanvas.clientWidth;
      tinggi = kanvas.clientHeight;
      kanvas.width = lebar * rasio;
      kanvas.height = tinggi * rasio;
      ctx.setTransform(rasio, 0, 0, rasio, 0, 0);
    }
    function buat(awal) {
      return {
        x: Math.random() * lebar,
        y: awal ? Math.random() * tinggi : -20,
        r: 5 + Math.random() * 6,
        vy: .35 + Math.random() * .7,
        ayun: Math.random() * Math.PI * 2,
        vAyun: .01 + Math.random() * .02,
        sudut: Math.random() * Math.PI,
        vSudut: (Math.random() - .5) * .03,
        warna: warna[Math.floor(Math.random() * warna.length)],
        alpha: .55 + Math.random() * .4
      };
    }
    ukur();
    window.addEventListener("resize", ukur);
    for (var i = 0; i < 24; i++) kelopak.push(buat(true));

    function gambar() {
      ctx.clearRect(0, 0, lebar, tinggi);
      kelopak.forEach(function (k, idx) {
        k.ayun += k.vAyun;
        k.y += k.vy;
        k.x += Math.sin(k.ayun) * .6;
        k.sudut += k.vSudut;
        if (k.y > tinggi + 20) kelopak[idx] = buat(false);
        ctx.save();
        ctx.translate(k.x, k.y);
        ctx.rotate(k.sudut);
        ctx.scale(1, Math.abs(Math.cos(k.ayun)) * .6 + .4);
        ctx.globalAlpha = k.alpha;
        ctx.fillStyle = k.warna;
        ctx.beginPath();
        ctx.moveTo(0, -k.r);
        ctx.bezierCurveTo(k.r * .9, -k.r * .6, k.r * .7, k.r * .6, 0, k.r);
        ctx.bezierCurveTo(-k.r * .7, k.r * .6, -k.r * .9, -k.r * .6, 0, -k.r);
        ctx.fill();
        ctx.restore();
      });
      if (document.hidden) { berjalan = false; return; }
      requestAnimationFrame(gambar);
    }
    var berjalan = true;
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && !berjalan) { berjalan = true; requestAnimationFrame(gambar); }
    });
    requestAnimationFrame(gambar);
  }

  if (modeCoba && window.console) {
    console.info("Undangan berjalan dalam mode coba: isi scriptUrl di config.js agar RSVP tersimpan ke Google Sheet.");
  }
})();
