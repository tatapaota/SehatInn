// ========================================
// EVENT LISTENER UTAMA - MENJALANKAN SCRIPT SETELAH HTML SELESAI DIMUAT
// ========================================
// DOMContentLoaded = event yang dijalankan setelah seluruh HTML selesai di-load
// Semua kode JavaScript di dalam event ini akan dijalankan setelah halaman siap
document.addEventListener("DOMContentLoaded", function () {
  // ========================================
  // OBJECT APPSTORAGE - UNTUK MENYIMPAN DATA KE LOCALSTORAGE
  // ========================================
  // Fungsi: Menyimpan data seperti user login, jadwal obat, dll ke browser
  // LocalStorage = penyimpanan di browser yang tidak hilang meski halaman ditutup
  const AppStorage = {
    // Method untuk MENYIMPAN data ke localStorage
    // Parameter: key (nama data), value (isi data)
    set(key, value) {
      try {
        // Simpan data ke localStorage dengan format JSON (string)
        // JSON.stringify = mengubah object JavaScript menjadi string JSON
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Jika gagal (misalnya browser private mode), tampilkan warning di console
        console.warn("localStorage unavailable");
      }
    },

    // Method untuk MENGAMBIL data dari localStorage
    // Parameter: key (nama data yang ingin diambil)
    // Return: data yang sudah di-parse kembali ke object JavaScript, atau null jika tidak ada
    get(key) {
      try {
        // Ambil data dari localStorage berdasarkan key
        const stored = localStorage.getItem(key);
        // Jika data ada, parse dari string JSON ke object JavaScript
        if (stored) return JSON.parse(stored);
      } catch {
        console.warn("localStorage unavailable");
      }
      // Return null jika data tidak ada atau gagal
      return null;
    },

    // Method untuk MENGHAPUS SEMUA data di localStorage
    // Biasanya dipanggil saat user logout
    clear() {
      try {
        localStorage.clear();
      } catch {
        console.warn("localStorage unavailable");
      }
    },
  };

  // ========================================
  // AUTO HANDLER TOMBOL LOGOUT
  // ========================================
  // Event listener untuk mendeteksi klik pada tombol logout di seluruh halaman
  // Event delegation: menangkap event di document level, efisien untuk banyak elemen
  document.addEventListener("click", (e) => {
    // Cek apakah elemen yang diklik punya class "logout-btn"
    if (e.target.classList.contains("logout-btn")) {
      // Hapus semua data di localStorage (logout)
      AppStorage.clear();
      // Redirect ke halaman Login
      window.location.href = "Login.html";
    }
  });

  // ========================================
  // FUNGSI HELPER - FORMAT TANGGAL
  // ========================================
  // Fungsi: Mengubah format tanggal dari "2025-01-15" menjadi "Rabu, 15 Januari 2025"
  // Parameter: dateStr (string tanggal format ISO atau lainnya)
  // Return: string tanggal dalam format Indonesia yang mudah dibaca
  function formatDate(dateStr) {
    // Jika tidak ada input, return "-"
    if (!dateStr) return "-";

    // Buat object Date dari string tanggal
    const date = new Date(dateStr);

    // Opsi format tanggal dalam bahasa Indonesia
    const options = {
      weekday: "long", // Nama hari lengkap (Senin, Selasa, dll)
      year: "numeric", // Tahun 4 digit (2025)
      month: "long", // Nama bulan lengkap (Januari, Februari, dll)
      day: "numeric", // Tanggal (1, 2, 3, ... 31)
    };

    // Convert dan return dalam format Indonesia
    return date.toLocaleDateString("id-ID", options);
  }

  // ========================================
  // FUNGSI HELPER - NOTIFIKASI POPUP
  // ========================================
  // Fungsi: Menampilkan notifikasi popup di pojok kanan atas layar
  // Parameter:
  //   - message (string): pesan yang ditampilkan
  //   - type (string): "success" (hijau) atau "error" (merah), default "success"
  function showNotification(message, type = "success") {
    // Buat elemen div baru untuk notifikasi
    const notification = document.createElement("div");

    // Tambahkan class untuk styling
    notification.className = `notification ${type}`;

    // Set text notifikasi
    notification.textContent = message;

    // Inline CSS styling untuk notifikasi
    notification.style.cssText = `
      position: fixed;                    /* Posisi tetap di layar */
      top: 20px;                          /* 20px dari atas */
      right: 20px;                        /* 20px dari kanan */
      background: ${
        type === "success" ? "#4CAF50" : "#f44336"
      };  /* Hijau untuk success, merah untuk error */
      color: white;                       /* Text warna putih */
      padding: 15px 25px;                 /* Padding dalam notifikasi */
      border-radius: 8px;                 /* Sudut melengkung */
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);  /* Bayangan */
      z-index: 10000;                     /* Layer paling atas */
      animation: slideIn 0.3s ease;       /* Animasi masuk dari kanan */
    `;

    // Tambahkan notifikasi ke body
    document.body.appendChild(notification);

    // Hapus notifikasi setelah 3 detik
    setTimeout(() => notification.remove(), 3000);
  }

  // ========================================
  // HALAMAN SPLASH SCREEN (index.html)
  // ========================================
  // Fungsi: Auto redirect ke Welcome.html setelah 7 detik, atau ketika logo diklik
  const logoImg = document.querySelector(".logo-img");

  // Cek apakah elemen logo ada di halaman ini
  if (logoImg) {
    // Ubah cursor jadi pointer saat hover logo
    logoImg.style.cursor = "pointer";

    // Event listener: pindah ke Welcome.html ketika logo diklik
    logoImg.addEventListener("click", () => {
      window.location.href = "Welcome.html";
    });

    // Auto redirect setelah 7 detik (7000 milliseconds)
    setTimeout(() => {
      window.location.href = "Welcome.html";
    }, 7000);
  }

  // ========================================
  // HALAMAN REGISTER (register.html)
  // ========================================
  // Fungsi: Validasi form dan kirim data registrasi ke server
  const registerForm = document.getElementById("registerForm");

  // Cek apakah form register ada di halaman ini
  if (registerForm) {
    // Event listener untuk submit form
    registerForm.addEventListener("submit", function (e) {
      // Prevent default = mencegah form submit secara default (reload halaman)
      e.preventDefault();

      // Ambil value dari input form dan trim (hapus spasi di awal/akhir)
      const username = this.username.value.trim();
      const password = this.password.value;
      const email = this.email.value.trim();
      const notelp = this.notelp.value.trim();

      // VALIDASI 1: Cek apakah semua field sudah diisi
      if (!username || !password || !email || !notelp) {
        showNotification("Semua field harus diisi!", "error");
        return; // Stop eksekusi jika ada field kosong
      }

      // VALIDASI 2: Cek format email dengan regex
      // Regex ini memeriksa apakah email valid (ada @ dan domain)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification("Format email tidak valid!", "error");
        return;
      }

      // VALIDASI 3: Bersihkan nomor telepon dari karakter non-digit
      // replace(/\D/g, "") = hapus semua karakter kecuali angka
      const phoneClean = notelp.replace(/\D/g, "");
      // Cek panjang nomor telepon (10-15 digit)
      if (phoneClean.length < 10 || phoneClean.length > 15) {
        showNotification("Nomor telepon harus 10-15 digit!", "error");
        return;
      }

      // VALIDASI 4: Password minimal 6 karakter
      if (password.length < 6) {
        showNotification("Password minimal 6 karakter!", "error");
        return;
      }

      // Buat object userData untuk disimpan
      const userData = {
        username,
        password,
        email,
        notelp: phoneClean,
        registeredAt: new Date().toISOString(), // Timestamp registrasi
      };

      // ========================================
      // KIRIM DATA KE SERVER (PHP API)
      // ========================================
      // fetch() = fungsi JavaScript untuk HTTP request
      fetch("api/auth_register.php", {
        method: "POST", // Method HTTP POST
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Format data yang dikirim
        },
        body: new URLSearchParams({
          // Convert object ke format URL-encoded
          username: username,
          password: password,
          email: email,
          notelp: phoneClean,
        }),
      })
        // Promise 1: Parse response dari server menjadi JSON
        .then((response) => response.json())
        // Promise 2: Handle response data
        .then((data) => {
          // Jika registrasi berhasil (status === "success")
          if (data.status === "success") {
            showNotification("Pendaftaran berhasil! Silakan login.", "success");
            // Redirect ke halaman Login setelah 1.5 detik
            setTimeout(() => {
              window.location.href = "Login.html";
            }, 1500);
          } else {
            // Jika gagal, tampilkan error message dari server
            showNotification(data.message, "error");
          }
        })
        // Catch error jika ada masalah dengan koneksi/server
        .catch((error) => {
          console.error(error);
          showNotification("Terjadi kesalahan server.", "error");
        });
    });
  }

  // ========================================
  // HALAMAN LOGIN (Login.html)
  // ========================================
  // Fungsi: Validasi login dan simpan data user ke localStorage
  const loginForm = document.getElementById("loginForm");

  // Cek apakah form login ada di halaman ini
  if (loginForm) {
    // Event listener untuk submit form (async function untuk await)
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent reload halaman

      // Ambil value username dan password
      const username = this.username.value.trim();
      const password = this.password.value.trim();

      // ========================================
      // KIRIM REQUEST LOGIN KE API
      // ========================================
      // await = menunggu response sebelum lanjut ke baris berikutnya
      const res = await fetch("api/auth_login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Format JSON
        body: JSON.stringify({
          // Convert object ke JSON string
          email: username,
          password: password,
        }),
      });

      // Parse response menjadi JSON
      const data = await res.json();
      console.log(data); // Log untuk debugging

      // Jika login berhasil
      if (data.status === "success") {
        // Simpan data user ke localStorage
        AppStorage.set("currentUser", data.user);
        AppStorage.set("isLoggedIn", true);

        // ========================================
        // SIMPAN LOGIN HISTORY KE DATABASE
        // ========================================
        // Kirim request terpisah untuk mencatat waktu login
        fetch("api/login_history_add.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: data.user.id }),
        });

        // Tampilkan notifikasi sukses
        showNotification("Login berhasil!", "success");
        // Redirect ke Home.html setelah 1 detik
        setTimeout(() => (window.location.href = "Home.html"), 1000);
      } else {
        // Jika gagal, tampilkan error dari server
        showNotification(data.message, "error");
      }
    });
  }

  // ========================================
  // HALAMAN HOME (Home.html) - FITUR UTAMA APLIKASI
  // ========================================
  // Fungsi: Membuat jadwal minum obat dengan dosis, waktu, dan frequency
  if (document.body.classList.contains("home-page")) {
    // ========================================
    // CEK LOGIN STATUS
    // ========================================
    // Ambil status login dari localStorage
    const isLoggedIn = AppStorage.get("isLoggedIn");

    // Jika belum login, redirect ke Login.html
    if (!isLoggedIn) {
      showNotification("Silakan login terlebih dahulu!", "error");
      setTimeout(() => {
        window.location.href = "Login.html";
      }, 2000);
      return; // Stop eksekusi kode selanjutnya
    }

    // ========================================
    // SET TANGGAL HARI INI DI INPUT DATE
    // ========================================
    const dateInput = document.getElementById("date");
    if (dateInput) {
      const today = new Date(); // Object tanggal hari ini
      const year = today.getFullYear(); // Tahun (2025)
      const month = String(today.getMonth() + 1).padStart(2, "0"); // Bulan (01-12) dengan padding 0
      const day = String(today.getDate()).padStart(2, "0"); // Tanggal (01-31) dengan padding 0
      // Set value input date dengan format YYYY-MM-DD
      dateInput.value = `${year}-${month}-${day}`;
    }

    // ========================================
    // AMBIL ELEMEN DOM UNTUK SCHEDULE
    // ========================================
    const scheduleContainer = document.getElementById("scheduleContainer"); // Container untuk list jadwal
    const timeContainer = document.getElementById("timeContainer"); // Container untuk waktu (opsional)
    const addScheduleBtn = document.getElementById("addScheduleBtn"); // Tombol tambah jadwal
    const addTimeBtn = document.getElementById("addTimeBtn"); // Tombol tambah waktu

    // ========================================
    // FREQUENCY LOGIC - PILIH FREKUENSI MINUM OBAT
    // ========================================
    // Ambil semua tombol opsi frequency (Everyday, Once a week, dll)
    const freqOptions = document.querySelectorAll("#freqOptions .option");

    // Loop setiap tombol frequency dan tambahkan event listener
    freqOptions.forEach((btn) => {
      btn.addEventListener("click", function () {
        // Hapus class "active" dari semua tombol
        freqOptions.forEach((b) => b.classList.remove("active"));
        // Tambahkan class "active" ke tombol yang diklik
        this.classList.add("active");

        // Ambil text dari tombol yang diklik (Everyday, Once a week, dll)
        const selectedFreq = this.textContent.trim();
        // Update jadwal berdasarkan frequency yang dipilih
        updateScheduleBasedOnFrequency(selectedFreq);
      });
    });

    // ========================================
    // FUNGSI UPDATE SCHEDULE BERDASARKAN FREQUENCY
    // ========================================
    // Parameter: frequency (string) - "Everyday", "Once a week", "Twice a day", atau "Custom"
    function updateScheduleBasedOnFrequency(frequency) {
      // Hapus semua jadwal yang ada sebelumnya
      scheduleContainer.innerHTML = "";
      if (timeContainer) timeContainer.innerHTML = "";

      // Variable untuk konfigurasi schedule
      let scheduleCount = 0; // Jumlah jadwal yang akan dibuat
      let schedulePlaceholders = []; // Array placeholder text untuk setiap schedule
      let defaultTimes = []; // Array waktu default untuk setiap schedule

      // ========================================
      // SWITCH CASE UNTUK SETIAP FREQUENCY
      // ========================================
      switch (frequency) {
        case "Everyday":
          // Everyday = 3x sehari (pagi, siang, malam)
          scheduleCount = 3;
          schedulePlaceholders = [
            "Setelah makan pagi",
            "Setelah makan siang",
            "Setelah makan malam",
          ];
          defaultTimes = ["08:00", "13:00", "19:00"];
          break;

        case "Once a week":
          // Once a week = 1x seminggu
          scheduleCount = 1;
          schedulePlaceholders = ["Setiap minggu (pilih hari)"];
          defaultTimes = ["09:00"];
          break;

        case "Twice a day":
          // Twice a day = 2x sehari (pagi & malam)
          scheduleCount = 2;
          schedulePlaceholders = ["Pagi hari", "Malam hari"];
          defaultTimes = ["08:00", "20:00"];
          break;

        case "Custom":
          // Custom = user bisa atur sendiri
          scheduleCount = 1;
          schedulePlaceholders = ["Atur jadwal sendiri"];
          defaultTimes = ["00:00"];
          break;

        default:
          // Default jika tidak ada yang match
          scheduleCount = 1;
          schedulePlaceholders = ["Masukkan jadwal"];
          defaultTimes = ["00:00"];
      }

      // ========================================
      // BUAT SCHEDULE ITEMS SESUAI JUMLAH
      // ========================================
      // Loop sebanyak scheduleCount untuk membuat form input schedule
      for (let i = 0; i < scheduleCount; i++) {
        createScheduleItemWithMeds(
          schedulePlaceholders[i] || "Masukkan jadwal",
          defaultTimes[i] || "00:00"
        );
      }

      // Tampilkan notifikasi bahwa frequency telah diatur
      showNotification(`✓ Diatur untuk ${frequency}`, "success");
    }

    // ========================================
    // FUNGSI MEMBUAT SCHEDULE ITEM (DENGAN SELECTOR OBAT)
    // ========================================
    // Parameter:
    //   - placeholder: text placeholder untuk dropdown waktu minum
    //   - defaultTime: waktu default (format HH:MM)
    function createScheduleItemWithMeds(
      placeholder = "",
      defaultTime = "00:00"
    ) {
      // Buat elemen div baru untuk schedule item
      const newSchedule = document.createElement("div");
      newSchedule.className = "schedule-item-group";

      // Styling inline untuk schedule item
      newSchedule.style.cssText =
        "background: #f5f5f5; padding: 12px; border-radius: 10px; margin-top: 12px; border: 2px solid #ddd;";

      // ========================================
      // STRUKTUR HTML SCHEDULE ITEM
      // ========================================
      newSchedule.innerHTML = `
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
        
        <!-- DROPDOWN UNTUK PILIH WAKTU MINUM (Sebelum/Setelah makan) -->
        <select class="form-input schedule-input" style="flex: 1; padding: 8px; border: 1px solid #ddd; 
        border-radius: 8px; font-size: 14px;">
        <option value="" disabled selected hidden>Pilih waktu minum obat</option>
        <option value="Sebelum makan">Sebelum makan</option>
        <option value="Setelah makan">Setelah makan</option>
        <option value="Waktu lain">Waktu lain</option>
        </select>
        
          <!-- INPUT TIME UNTUK JAM MINUM -->
          <input type="time" class="form-input time-input" value="${defaultTime}" style="width: 100px;">
          
          <!-- TOMBOL HAPUS SCHEDULE -->
          <button type="button" class="remove-schedule-btn" style="padding: 6px 10px; background: #e57373; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">✖</button>
        </div>
        
        <!-- CONTAINER UNTUK PILIH OBAT -->
        <div class="med-selector-container" style="margin-top: 8px;">
          <label style="font-size: 13px; color: #666; display: block; margin-bottom: 4px;">💊 Obat yang diminum:</label>
          
          <!-- AREA MENAMPILKAN OBAT YANG DIPILIH -->
          <div class="selected-meds" style="display: flex; flex-wrap: wrap; gap: 6px; min-height: 30px; padding: 6px; background: white; border-radius: 6px; border: 1px dashed #aaa;">
            <span style="color: #999; font-size: 12px; font-style: italic;">Belum ada obat dipilih</span>
          </div>
          
          <!-- TOMBOL UNTUK MEMBUKA POPUP PILIH OBAT -->
          <button type="button" class="add-med-to-schedule" style="margin-top: 6px; padding: 4px 10px; background: #7e57c2; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">+ Pilih Obat</button>
        </div>
      `;

      // ========================================
      // EVENT LISTENER TOMBOL HAPUS SCHEDULE
      // ========================================
      const removeBtn = newSchedule.querySelector(".remove-schedule-btn");
      removeBtn.addEventListener("click", function () {
        // Hapus schedule item ini dari DOM
        newSchedule.remove();
      });

      // ========================================
      // EVENT LISTENER TOMBOL PILIH OBAT
      // ========================================
      const addMedBtn = newSchedule.querySelector(".add-med-to-schedule");
      const selectedMedsContainer = newSchedule.querySelector(".selected-meds");

      addMedBtn.addEventListener("click", function () {
        // Panggil fungsi untuk menampilkan popup selector obat
        showMedicationSelector(selectedMedsContainer);
      });

      // Tambahkan schedule item ke container
      scheduleContainer.appendChild(newSchedule);
    }

    // ========================================
    // FUNGSI POPUP SELECTOR OBAT (DENGAN CHECKBOX)
    // ========================================
    // Parameter: targetContainer (element) - container untuk menampilkan obat yang dipilih
    function showMedicationSelector(targetContainer) {
      // ========================================
      // AMBIL SEMUA OBAT DARI LIST
      // ========================================
      const allMeds = [];
      const medItems = document.querySelectorAll("#medList li");

      // Loop setiap item obat dan ambil nama + dosis
      medItems.forEach((li) => {
        const medName = li.querySelector(".med-name")?.textContent || "";
        const medDose = li.querySelector(".med-dose")?.textContent || "";
        if (medName) {
          allMeds.push({ name: medName, dose: medDose });
        }
      });

      // Jika belum ada obat, tampilkan error
      if (allMeds.length === 0) {
        showNotification(
          'Tambahkan obat terlebih dahulu di bagian "Add Medication"!',
          "error"
        );
        return;
      }

      // ========================================
      // BUAT OVERLAY GELAP UNTUK POPUP
      // ========================================
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed;              /* Posisi fixed full screen */
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);  /* Background hitam semi-transparent */
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;                /* Layer paling atas */
      `;

      // ========================================
      // BUAT POPUP BOX
      // ========================================
      const popup = document.createElement("div");
      popup.style.cssText = `
        background: white;            /* Background putih */
        padding: 20px;
        border-radius: 12px;
        max-width: 320px;
        width: 90%;
        max-height: 450px;
        overflow-y: auto;             /* Scroll jika konten panjang */
      `;

      // ========================================
      // STRUKTUR HTML POPUP
      // ========================================
      let popupHTML = `
        <h3 style="margin-bottom: 15px; color: #333;">💊 Pilih Obat & Dosis</h3>
        <div class="med-checkboxes">
      `;

      // Loop setiap obat dan buat checkbox
      allMeds.forEach((med, idx) => {
        popupHTML += `
          <label style="display: block; padding: 10px; margin-bottom: 8px; background: #f5f5f5; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;">
            <!-- CHECKBOX UNTUK PILIH OBAT -->
            <input type="checkbox" value="${idx}" style="margin-right: 8px;">
            <strong>${med.name}</strong>
            <br>
            <small style="color: #666; margin-left: 24px;">Dosis: ${
              med.dose || "Tidak disebutkan"
            }</small>
          </label>
        `;
      });

      // Tambahkan tombol Batal dan OK
      popupHTML += `
        </div>
        <div style="display: flex; gap: 10px; margin-top: 15px;">
          <button class="cancel-select" style="flex: 1; padding: 8px; background: #ddd; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Batal</button>
          <button class="confirm-select" style="flex: 1; padding: 8px; background: #7e57c2; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">OK</button>
        </div>
      `;

      popup.innerHTML = popupHTML;
      overlay.appendChild(popup);
      document.body.appendChild(overlay);

      // ========================================
      // HIGHLIGHT CHECKBOX YANG DIPILIH
      // ========================================
      const checkboxLabels = popup.querySelectorAll("label");
      checkboxLabels.forEach((label) => {
        const checkbox = label.querySelector('input[type="checkbox"]');

        // Event listener untuk perubahan checkbox
        checkbox.addEventListener("change", function () {
          if (this.checked) {
            // Jika checked, ubah border dan background
            label.style.borderColor = "#7e57c2";
            label.style.background = "#e8dff5";
          } else {
            // Jika unchecked, kembalikan ke normal
            label.style.borderColor = "transparent";
            label.style.background = "#f5f5f5";
          }
        });
      });

      // ========================================
      // EVENT LISTENER TOMBOL BATAL DAN OK
      // ========================================
      const cancelBtn = popup.querySelector(".cancel-select");
      const confirmBtn = popup.querySelector(".confirm-select");

      // Tombol Batal: tutup popup
      cancelBtn.addEventListener("click", () => overlay.remove());

      // Tombol OK: simpan pilihan obat
      confirmBtn.addEventListener("click", () => {
        // Ambil semua checkbox yang checked
        const checkboxes = popup.querySelectorAll(
          'input[type="checkbox"]:checked'
        );

        // Buat array berisi obat yang dipilih
        const selectedMeds = Array.from(checkboxes).map((cb) => {
          const idx = parseInt(cb.value);
          return allMeds[idx];
        });

        // Validasi: minimal 1 obat harus dipilih
        if (selectedMeds.length === 0) {
          showNotification("Pilih minimal 1 obat!", "error");
          return;
        }

        // ========================================
        // TAMPILKAN OBAT YANG DIPILIH DI BADGE
        // ========================================
        targetContainer.innerHTML = ""; // Hapus konten lama

        // Loop setiap obat dan buat badge
        selectedMeds.forEach((med) => {
          const badge = document.createElement("div");
          badge.style.cssText =
            "background: #d1c4e9; color: #311b92; padding: 6px 10px; border-radius: 8px; font-size: 12px; display: inline-flex; align-items: center; gap: 4px; margin: 2px;";

          badge.innerHTML = `
            <div>
              <strong>${med.name}</strong>
              <br>
              <small style="color: #555;">${med.dose}</small>
            </div>
            <!-- TOMBOL HAPUS BADGE -->
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #311b92; cursor: pointer; font-size: 16px; margin-left: 4px;">×</button>
          `;

          targetContainer.appendChild(badge);
        });

        // Tutup popup dan tampilkan notifikasi
        overlay.remove();
        showNotification(`${selectedMeds.length} obat dipilih`, "success");
      });
    }

    // ========================================
    // INISIALISASI: SET FREQUENCY DEFAULT "EVERYDAY"
    // ========================================
    updateScheduleBasedOnFrequency("Everyday");

    // Tombol tambah jadwal manual
    if (addScheduleBtn) {
      addScheduleBtn.addEventListener("click", function () {
        createScheduleItemWithMeds("Tambahan jadwal", "00:00");
      });
    }

    // Sembunyikan tombol dan container yang tidak dipakai
    if (addTimeBtn) {
      addTimeBtn.style.display = "none";
    }

    if (timeContainer) {
      timeContainer.style.display = "none";
    }

    // =======================================================================
    // FITUR 2: TAMBAH OBAT (ADD MEDICATION)
    // =======================================================================
    const addMedBtn = document.getElementById("addMedBtn");
    const medNameInput = document.getElementById("medNameInput");
    const medList = document.getElementById("medList");

    if (addMedBtn && medNameInput && medList) {
      function addMedication() {
        const medName = medNameInput.value.trim();

        // Validasi: nama obat harus diisi
        if (!medName) {
          showNotification("Masukkan nama obat terlebih dahulu!", "error");
          return;
        }

        // Popup untuk input dosis obat
        const overlay = document.createElement("div");
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        `;

        const popup = document.createElement("div");
        popup.style.cssText = `
          background: white;
          padding: 20px;
          border-radius: 12px;
          max-width: 300px;
          width: 90%;
        `;

        popup.innerHTML = `
          <h3 style="margin-bottom: 15px; color: #333;">💊 Tambah Dosis</h3>
          <p style="margin-bottom: 10px; color: #666;">Obat: <strong>${medName}</strong></p>
          <input type="text" id="doseInput" placeholder="Contoh: 500mg / 2 tablet" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 15px;">
          <div style="display: flex; gap: 10px;">
            <button class="cancel-dose" style="flex: 1; padding: 8px; background: #ddd; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Batal</button>
            <button class="confirm-dose" style="flex: 1; padding: 8px; background: #7e57c2; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Simpan</button>
          </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        const doseInput = popup.querySelector("#doseInput");
        const cancelBtn = popup.querySelector(".cancel-dose");
        const confirmBtn = popup.querySelector(".confirm-dose");

        doseInput.focus(); // Auto-focus ke input dosis

        // Tombol Batal
        cancelBtn.addEventListener("click", () => {
          overlay.remove();
          medNameInput.value = ""; // Reset input nama obat
        });

        // Tombol Simpan
        confirmBtn.addEventListener("click", () => {
          const dose = doseInput.value.trim() || "Tidak disebutkan";

          // Buat list item untuk obat
          const li = document.createElement("li");
          li.style.cssText =
            "display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #d1c4e9; border-radius: 10px; margin-bottom: 8px;";
          li.innerHTML = `
            <div style="flex: 1;">
              <div class="med-name" style="color: #311b92; font-weight: 600; font-size: 14px;">${medName}</div>
              <div class="med-dose" style="color: #555; font-size: 12px; margin-top: 2px;">${dose}</div>
            </div>
            <button type="button" class="remove-med-btn" style="padding: 4px 8px; background: #e57373; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">🗑️</button>
          `;

          // Tombol hapus obat
          const removeBtn = li.querySelector(".remove-med-btn");
          removeBtn.addEventListener("click", function () {
            li.remove();
          });

          medList.appendChild(li); // Tambahkan ke daftar obat
          medNameInput.value = ""; // Reset input
          medNameInput.focus(); // Focus kembali ke input
          overlay.remove();
          showNotification("Obat berhasil ditambahkan!", "success");
        });

        // Enter key untuk submit
        doseInput.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
            confirmBtn.click();
          }
        });
      }

      // Event listener tombol tambah obat
      addMedBtn.addEventListener("click", addMedication);

      // Enter key di input nama obat
      medNameInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          addMedication();
        }
      });
    }

    // =======================================================================
    // FITUR 3: TOMBOL SIMPAN JADWAL
    // =======================================================================
    const addMedSection = document.querySelector(".add-med-section");

    if (addMedSection) {
      // Buat tombol simpan jadwal
      const saveScheduleBtn = document.createElement("button");
      saveScheduleBtn.id = "saveScheduleBtn";
      saveScheduleBtn.className = "save-schedule-btn";
      saveScheduleBtn.textContent = "💾 Simpan Jadwal";
      saveScheduleBtn.style.cssText = `
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #7e57c2 0%, #5e35b1 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 20px;
        box-shadow: 0 4px 12px rgba(126, 87, 194, 0.3);
        transition: all 0.3s ease;
      `;

      // Hover effect
      saveScheduleBtn.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-2px)";
        this.style.boxShadow = "0 6px 16px rgba(126, 87, 194, 0.4)";
      });

      saveScheduleBtn.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)";
        this.style.boxShadow = "0 4px 12px rgba(126, 87, 194, 0.3)";
      });

      // Event listener klik tombol simpan
      saveScheduleBtn.addEventListener("click", function () {
        // Panggil fungsi simpan data
        if (saveScheduleData()) {
          this.textContent = "⏳ Menyimpan...";
          this.disabled = true;

          setTimeout(() => {
            const saved = AppStorage.get("userSchedule");
            if (saved) {
              // Jadwal berhasil disimpan (bisa redirect ke halaman lain jika perlu)
            } else {
              showNotification("Gagal menyimpan data!", "error");
              this.textContent = "💾 Simpan Jadwal";
              this.disabled = false;
            }
          }, 1000);
        }
      });

      // Masukkan tombol sebelum daftar obat
      addMedSection.parentNode.insertBefore(saveScheduleBtn, medList);
    }

    // -----------------------------------------------------------------------
    // FUNGSI: Simpan Semua Data Jadwal
    // -----------------------------------------------------------------------
    function saveScheduleData() {
      // Ambil tanggal dari input
      const date = dateInput?.value || "";

      // Ambil frekuensi yang aktif
      const frequency =
        document
          .querySelector("#freqOptions .option.active")
          ?.textContent.trim() || "Everyday";

      // Kumpulkan semua jadwal yang sudah diisi
      const schedules = [];
      const scheduleGroups = document.querySelectorAll(".schedule-item-group");

      scheduleGroups.forEach((group) => {
        // Ambil deskripsi jadwal (Sebelum makan / Setelah makan)
        const scheduleText = group
          .querySelector(".schedule-input")
          ?.value.trim();
        // Ambil waktu (format HH:MM)
        const time = group.querySelector(".time-input")?.value;

        // Ambil semua obat yang dipilih untuk jadwal ini
        const selectedMedBadges = group.querySelectorAll(
          ".selected-meds > div"
        );
        const medsForThisSchedule = [];
        selectedMedBadges.forEach((badge) => {
          const medName = badge.querySelector("strong")?.textContent || "";
          const medDose = badge.querySelector("small")?.textContent || "";
          if (medName) {
            medsForThisSchedule.push({ name: medName, dose: medDose });
          }
        });

        // Hanya simpan jadwal yang lengkap (ada deskripsi, waktu, dan obat)
        if (scheduleText && time && medsForThisSchedule.length > 0) {
          schedules.push({
            description: scheduleText,
            time: time,
            medications: medsForThisSchedule,
          });
        }
      });

      // Kumpulkan SEMUA obat yang sudah ditambahkan user
      const allMedications = [];
      const medItems = document.querySelectorAll("#medList li");
      medItems.forEach((li) => {
        const name = li.querySelector(".med-name")?.textContent || "";
        const dose =
          li.querySelector(".med-dose")?.textContent.replace("", "") || "";
        if (name) {
          allMedications.push({ name, dose });
        }
      });

      // === VALIDASI DATA ===

      if (!date) {
        showNotification("Pilih tanggal terlebih dahulu!", "error");
        return false;
      }

      if (schedules.length === 0) {
        showNotification(
          "Isi minimal 1 jadwal lengkap dengan waktu dan obat!",
          "error"
        );
        return false;
      }

      if (allMedications.length === 0) {
        showNotification("Tambahkan minimal 1 obat!", "error");
        return false;
      }

      // Buat object data jadwal lengkap
      const scheduleData = {
        date,
        frequency,
        schedules,
        allMedications,
        createdAt: new Date().toISOString(),
      };

      // Simpan ke localStorage
      AppStorage.set("userSchedule", scheduleData);
      showNotification("✅ Jadwal berhasil disimpan!", "success");

      // === SIMPAN KE DATABASE ===
      const currentUser = AppStorage.get("currentUser");

      if (currentUser) {
        // Loop setiap jadwal dan setiap obat untuk disimpan ke database
        schedules.forEach((s) => {
          if (s.medications) {
            s.medications.forEach((med) => {
              // Panggil fungsi saveReminder untuk simpan ke database
              saveReminder(currentUser.id, med.name, med.dose, s.time, date);
            });
          }
        });
      }
      return true;
    }

    // Link navigasi ke jadwal tersimpan
    const scheduleNavLinks = document.querySelectorAll(
      'a[href="jadwalTersimpan.html"]'
    );
    scheduleNavLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        const savedSchedule = AppStorage.get("userSchedule");
        // Jika belum ada jadwal tersimpan, cegah navigasi
        if (!savedSchedule) {
          e.preventDefault();
          showNotification("Simpan jadwal terlebih dahulu dari Home!", "error");
        }
      });
    });
  }

  // ==========================================================================
  // BAGIAN 9: HALAMAN JADWAL TERSIMPAN (jadwalTersimpan.html)
  // ==========================================================================
  if (document.body.classList.contains("schedule-page")) {
    // Ambil data jadwal dari localStorage
    const scheduleData = AppStorage.get("userSchedule");

    // Jika tidak ada jadwal, redirect ke Home
    if (!scheduleData) {
      showNotification("Belum ada jadwal tersimpan!", "error");
      setTimeout(() => {
        window.location.href = "Home.html";
      }, 2000);
      return;
    }

    // === FUNGSI KALENDER ===
    let currentDate = new Date();
    if (scheduleData.date) {
      currentDate = new Date(scheduleData.date);
    }

    // Parse tanggal yang dipilih user
    const selectedDate = new Date(scheduleData.date);
    const selectedDay = selectedDate.getDate();
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    // Referensi elemen kalender
    const monthEl = document.querySelector(".month");
    const yearEl = document.querySelector(".year");
    const calendarGrid = document.querySelector(".calendar-grid");

    // Nama bulan dalam Bahasa Indonesia
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    // -----------------------------------------------------------------------
    // FUNGSI: Update Tampilan Kalender
    // -----------------------------------------------------------------------
    function updateCalendar() {
      // Update label bulan dan tahun
      if (monthEl) monthEl.textContent = monthNames[currentDate.getMonth()];
      if (yearEl) yearEl.textContent = currentDate.getFullYear();

      // Hapus isi kalender sebelumnya
      if (calendarGrid) calendarGrid.innerHTML = "";

      // Hitung hari pertama dan terakhir bulan ini
      const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay(); // 0=Minggu, 1=Senin, dst

      // Tambahkan tanggal dari bulan sebelumnya (untuk mengisi grid)
      const prevMonthLastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      ).getDate();

      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const dateElement = document.createElement("div");
        dateElement.className = "date other-month";
        dateElement.textContent = prevMonthLastDay - i;
        calendarGrid.appendChild(dateElement);
      }

      // Tambahkan tanggal bulan ini
      for (let i = 1; i <= daysInMonth; i++) {
        const dateElement = document.createElement("div");
        dateElement.className = "date";
        dateElement.textContent = i;

        // Highlight tanggal yang ada jadwal
        if (
          currentDate.getMonth() === selectedMonth &&
          currentDate.getFullYear() === selectedYear &&
          i === selectedDay
        ) {
          dateElement.classList.add("has-schedule");
          dateElement.style.cssText = `
            background-color: #7e57c2 !important;
            color: white !important;
            font-weight: bold !important;
            box-shadow: 0 0 0 3px rgba(126, 87, 194, 0.3);
            transform: scale(1.1);
          `;
        }

        // Highlight tanggal hari ini
        const today = new Date();
        if (
          currentDate.getMonth() === today.getMonth() &&
          currentDate.getFullYear() === today.getFullYear() &&
          i === today.getDate()
        ) {
          dateElement.classList.add("today");
        }

        calendarGrid.appendChild(dateElement);
      }

      // Tambahkan tanggal bulan berikutnya (untuk melengkapi 42 cell grid)
      const totalCells = 42; // 6 baris x 7 kolom
      const remainingCells = totalCells - (startingDayOfWeek + daysInMonth);
      for (let i = 1; i <= remainingCells; i++) {
        const dateElement = document.createElement("div");
        dateElement.className = "date other-month";
        dateElement.textContent = i;
        calendarGrid.appendChild(dateElement);
      }
    }

    // Render kalender pertama kali
    updateCalendar();

    // === NAVIGASI KALENDER (Prev/Next) ===
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1); // Mundur 1 bulan
        updateCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1); // Maju 1 bulan
        updateCalendar();
      });
    }

    // === DETAIL JADWAL ===
    const calendarCard = document.querySelector(".calendar-card");

    // Hapus tombol konfirmasi lama jika ada (untuk refresh)
    const oldConfirmBtns = document.querySelector(".confirm-buttons");
    if (oldConfirmBtns) {
      oldConfirmBtns.remove();
    }

    // Buat div untuk menampilkan detail jadwal
    const detailDiv = document.createElement("div");
    detailDiv.className = "schedule-detail";
    detailDiv.style.cssText = `
      margin-top: 20px; 
      padding: 15px; 
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      border-radius: 12px;
      border-left: 4px solid #7e57c2;
    `;

    // HTML detail jadwal: tanggal, frekuensi, daftar obat, dan jadwal detail
    detailDiv.innerHTML = `
      <h3 style="margin-bottom: 15px; color: #333; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 24px;">📋</span> Detail Jadwal Obat
      </h3>
      <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
        <p style="margin: 8px 0;"><strong>📅 Tanggal:</strong> ${formatDate(
          scheduleData.date
        )}</p>
        <p style="margin: 8px 0;"><strong>🔄 Frekuensi:</strong> ${
          scheduleData.frequency
        }</p>
      </div>
      
      ${
        scheduleData.allMedications
          ? `
      <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
        <p style="margin: 8px 0; font-weight: 600;">💊 Daftar Semua Obat:</p>
        <ul style="margin: 8px 0 8px 20px; list-style: none;">
          ${scheduleData.allMedications
            .map(
              (m) =>
                `<li style="padding: 4px 0;"><strong>✓ ${m.name}</strong> <small style="color: #666;">(${m.dose})</small></li>`
            )
            .join("")}
        </ul>
      </div>
      `
          : ""
      }
      
      <div style="background: white; padding: 12px; border-radius: 8px;">
        <p style="margin: 8px 0; font-weight: 600;">🕐 Jadwal Minum Obat (Detail):</p>
        ${scheduleData.schedules
          .map(
            (s, idx) => `
          <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #7e57c2;">
            <p style="margin: 4px 0; font-weight: 600; color: #7e57c2;">⏰ ${
              s.time
            } - ${s.description || "Jadwal " + (idx + 1)}</p>
            <p style="margin: 8px 0 4px 0; font-size: 13px; color: #666;">Obat yang diminum:</p>
            <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
              ${
                s.medications
                  ? s.medications
                      .map(
                        (med) => `
                <div style="background: #d1c4e9; color: #311b92; padding: 8px 12px; border-radius: 8px; font-size: 13px;">
                  <strong>💊 ${med.name}</strong><br>
                  <small style="color: #555;">Dosis: ${med.dose}</small>
                </div>
              `
                      )
                      .join("")
                  : '<span style="color: #999;">Tidak ada obat</span>'
              }
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    calendarCard.appendChild(detailDiv);

    // === TOMBOL BATAL DAN KONFIRMASI ===
    const btnContainer = document.createElement("div");
    btnContainer.className = "confirm-buttons";
    btnContainer.style.cssText =
      "display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;";
    btnContainer.innerHTML = `
      <button class="cancel-btn" style="padding: 10px 20px; background: #e0e0e0; color: #333; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s;">Batal</button>
      <button class="ok-btn" style="padding: 10px 20px; background: #7e57c2; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s;">Konfirmasi</button>
    `;

    calendarCard.appendChild(btnContainer);

    // Event listeners untuk tombol
    const okBtn = btnContainer.querySelector(".ok-btn");
    const cancelBtn = btnContainer.querySelector(".cancel-btn");

    if (okBtn) {
      // Hover effect tombol OK
      okBtn.addEventListener("mouseenter", function () {
        this.style.transform = "scale(1.05)";
        this.style.boxShadow = "0 4px 12px rgba(126, 87, 194, 0.4)";
      });

      okBtn.addEventListener("mouseleave", function () {
        this.style.transform = "scale(1)";
        this.style.boxShadow = "none";
      });

      // Klik tombol OK: konfirmasi jadwal
      okBtn.addEventListener("click", function () {
        // Tambah flag konfirmasi
        const confirmed = {
          ...scheduleData,
          confirmed: true,
          confirmedAt: new Date().toISOString(),
        };

        AppStorage.set("confirmedSchedule", confirmed);
        showNotification(
          "✅ Jadwal dikonfirmasi! Notifikasi akan aktif.",
          "success"
        );

        // Aktifkan notifikasi
        simulateNotification(confirmed);

        setTimeout(() => {
          window.location.href = "Home.html";
        }, 2000);
      });
    }

    if (cancelBtn) {
      // Hover effect tombol Batal
      cancelBtn.addEventListener("mouseenter", function () {
        this.style.background = "#d32f2f";
        this.style.color = "white";
      });

      cancelBtn.addEventListener("mouseleave", function () {
        this.style.background = "#e0e0e0";
        this.style.color = "#333";
      });

      // Klik tombol Batal: kembali ke Home untuk edit
      cancelBtn.addEventListener("click", function () {
        if (confirm("Batalkan dan kembali ke Home untuk edit?")) {
          window.location.href = "Home.html";
        }
      });
    }

    // -----------------------------------------------------------------------
    // FUNGSI: Simulasi Notifikasi Reminder
    // -----------------------------------------------------------------------
    function simulateNotification(schedule) {
      // Log ke console untuk debugging
      console.log("🔔 NOTIFIKASI AKTIF:");
      console.log("Jadwal obat telah dikonfirmasi:");

      schedule.schedules.forEach((sched, index) => {
        console.log(`⏰ ${sched.time} - ${sched.description}`);
        if (sched.medications && sched.medications.length > 0) {
          sched.medications.forEach((med) => {
            console.log(`   💊 ${med.name} (${med.dose})`);
          });
        }
      });

      // === NOTIFIKASI BROWSER (Web Notification API) ===
      if ("Notification" in window) {
        // Jika sudah diizinkan, langsung tampilkan notifikasi
        if (Notification.permission === "granted") {
          new Notification("Sehat In - Jadwal Obat Dikonfirmasi", {
            body: `Jadwal untuk ${formatDate(schedule.date)} telah aktif`,
            icon: "aset/logo.png",
          });
        }
        // Jika belum diizinkan, minta izin dulu
        else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("Sehat In - Jadwal Obat Dikonfirmasi", {
                body: `Jadwal untuk ${formatDate(schedule.date)} telah aktif`,
                icon: "aset/logo.png",
              });
            }
          });
        }
      }

      // Simpan data untuk reminder aktif
      const reminderData = {
        schedule: schedule,
        nextReminder: new Date().toISOString(),
        active: true,
      };

      AppStorage.set("activeReminders", reminderData);
      showNotification("🔔 Notifikasi reminder telah diaktifkan!", "success");
    }
  }

  // ==========================================================================
  // BAGIAN 10: HALAMAN PROFIL (profile.html)
  // ==========================================================================
  if (document.body.classList.contains("profile-page")) {
    // Cek apakah user sudah login
    const currentUser = AppStorage.get("currentUser");
    const isLoggedIn = AppStorage.get("isLoggedIn");

    if (!currentUser || !isLoggedIn) {
      showNotification("Silakan login terlebih dahulu!", "error");
      setTimeout(() => {
        window.location.href = "Login.html";
      }, 2000);
      return;
    }

    // Tampilkan data user di profil
    const nameEl = document.querySelector(".name");
    const emailEl = document.querySelector(".email");
    const phoneEl = document.querySelector(".phone");

    if (nameEl) nameEl.textContent = currentUser.name;
    if (emailEl) emailEl.textContent = currentUser.email;
    if (phoneEl)
      phoneEl.textContent = currentUser.phone_number || currentUser.notelp;

    // Tombol Edit Profil
    const editBtn = document.querySelector(".edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", function () {
        window.location.href = "editProfile.html";
      });
    }

    // Menu items (Coming Soon)
    const menuItems = document.querySelectorAll(".menu-item:not(.logout)");
    menuItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        const itemText = this.querySelector("span")?.textContent.trim();

        // Hanya Terms & Conditions yang bisa diklik
        if (itemText !== "Terms and conditions") {
          e.preventDefault();
          showNotification("Fitur ini akan segera hadir!", "success");
        }
      });
    });

    // Tombol Logout
    const logoutItem = document.querySelector(".menu-item.logout");
    if (logoutItem) {
      logoutItem.addEventListener("click", function () {
        if (confirm("Yakin ingin logout?")) {
          // Backup data penting sebelum logout
          const savedSchedule = AppStorage.get("userSchedule");
          const confirmedSchedule = AppStorage.get("confirmedSchedule");
          const registeredUser = AppStorage.get("registeredUser");

          // Set status login jadi false
          AppStorage.set("isLoggedIn", false);

          // Restore data yang di-backup
          if (savedSchedule) {
            AppStorage.set("userSchedule", savedSchedule);
          }
          if (confirmedSchedule) {
            AppStorage.set("confirmedSchedule", confirmedSchedule);
          }
          if (registeredUser) {
            AppStorage.set("registeredUser", registeredUser);
          }

          showNotification("Logout berhasil! Sampai jumpa 👋", "success");

          setTimeout(() => {
            window.location.href = "Login.html";
          }, 1500);
        }
      });
    }
  }

  // ==========================================================================
  // BAGIAN 11: HALAMAN EDIT PROFIL (editProfile.html)
  // ==========================================================================
  if (document.body.classList.contains("edit-profile-page")) {
    // Cek apakah user sudah login
    const currentUser = AppStorage.get("currentUser");
    const isLoggedIn = AppStorage.get("isLoggedIn");

    if (!currentUser || !isLoggedIn) {
      showNotification("Silakan login terlebih dahulu!", "error");
      setTimeout(() => {
        window.location.href = "Login.html";
      }, 2000);
      return;
    }

    // Isi form dengan data user saat ini
    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editPhone = document.getElementById("editPhone");

    if (editName) editName.value = currentUser.name;
    if (editEmail) editEmail.value = currentUser.email;
    if (editPhone)
      editPhone.value = currentUser.phone_number || currentUser.notelp;

    // Form submit: simpan perubahan
    const editForm = document.querySelector(".edit-form");
    if (editForm) {
      editForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const newUsername = editName.value.trim();
        const newEmail = editEmail.value.trim();
        const newPhone = editPhone.value.trim();

        // === VALIDASI INPUT ===

        if (!newUsername || !newEmail || !newPhone) {
          showNotification("Semua field harus diisi!", "error");
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
          showNotification("Format email tidak valid!", "error");
          return;
        }

        const phoneClean = newPhone.replace(/\D/g, "");
        if (phoneClean.length < 10 || phoneClean.length > 15) {
          showNotification("Nomor telepon harus 10-15 digit!", "error");
          return;
        }

        // Update data user
        const updatedUser = {
          ...currentUser,
          name: newUsername,
          username: newUsername,
          email: newEmail,
          phone_number: phoneClean,
          notelp: phoneClean,
        };

        // Simpan ke localStorage
        AppStorage.set("currentUser", updatedUser);
        AppStorage.set("registeredUser", updatedUser);

        showNotification("✅ Profil berhasil diperbarui!", "success");

        setTimeout(() => {
          window.location.href = "profile.html";
        }, 1500);
      });
    }

    // Tombol Batal
    const cancelBtn = document.querySelector(".cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function (e) {
        e.preventDefault();

        if (confirm("Batalkan perubahan dan kembali ke profil?")) {
          window.location.href = "profile.html";
        }
      });

      // Hover effects
      cancelBtn.addEventListener("mouseenter", function () {
        this.style.background = "#d32f2f";
        this.style.color = "white";
        this.style.transform = "scale(1.02)";
      });

      cancelBtn.addEventListener("mouseleave", function () {
        this.style.background = "#d1c4e9";
        this.style.color = "#333";
        this.style.transform = "scale(1)";
      });
    }

    // Hover effect tombol Simpan
    const saveBtn = document.querySelector(".save-btn");
    if (saveBtn) {
      saveBtn.addEventListener("mouseenter", function () {
        this.style.transform = "scale(1.02)";
        this.style.boxShadow = "0 4px 12px rgba(123, 90, 198, 0.4)";
      });

      saveBtn.addEventListener("mouseleave", function () {
        this.style.transform = "scale(1)";
        this.style.boxShadow = "none";
      });
    }
  }

  // ==========================================================================
  // BAGIAN 12: BOTTOM NAVIGATION - HIGHLIGHT HALAMAN AKTIF
  // ==========================================================================
  // Ambil nama file halaman saat ini
  const currentPage = window.location.pathname.split("/").pop();
  const navItems = document.querySelectorAll(".bottom-nav .nav-item");

  // Loop semua nav item dan highlight yang aktif
  navItems.forEach((item) => {
    const href = item.getAttribute("href");
    if (href && currentPage.includes(href.replace(".html", ""))) {
      item.classList.add("active");
      item.style.transform = "scale(1.1)"; // Perbesar sedikit
    }
  });
}); // ===== AKHIR EVENT LISTENER UTAMA =====

// ============================================================================
// FUNGSI DI LUAR DOMContentLoaded
// ============================================================================

// ==========================================================================
// FUNGSI: Simpan Reminder ke Database
// ==========================================================================
// Fungsi ini dipanggil saat user menyimpan jadwal untuk menyimpan ke PHP API
async function saveReminder(user_id, med_name, dosage, time, date) {
  try {
    const res = await fetch("api/reminder_save.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, med_name, dosage, time, date }),
    });

    const data = await res.json();
    console.log("Status Simpan DB:", data); // Debug log
  } catch (error) {
    console.log("Error:", error);
    console.log(data);
    console.error("Gagal koneksi ke API:", error);
  }
}

// ==========================================================================
// FUNGSI: Accept Terms & Conditions
// ==========================================================================
// Dipanggil saat user menyetujui syarat dan ketentuan di halaman Terms
function acceptTerms() {
  try {
    // Simpan status persetujuan ke sessionStorage
    sessionStorage.setItem("termsAccepted", "true");
  } catch {
    console.warn("SessionStorage unavailable");
  }

  // Tampilkan notifikasi sukses
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent =
    "✅ Terima kasih telah menyetujui syarat dan ketentuan!";
  document.body.appendChild(notification);

  // Redirect ke profile setelah 2 detik
  setTimeout(() => {
    notification.remove();
    window.location.href = "profile.html";
  }, 2000);
}

// ==========================================================================
// FUNGSI: Toggle Password Visibility
// ==========================================================================
// Fungsi untuk menampilkan/menyembunyikan password di form login/register
function togglePasswordVisibility() {
  const passwordInput = document.getElementById("passwordInput");
  const toggleIcon = document.getElementById("togglePasswordIcon");

  if (passwordInput.type === "password") {
    // Ubah jadi text agar password terlihat
    passwordInput.type = "text";
    toggleIcon.src = "aset/eye-open.png"; // Icon mata terbuka
    toggleIcon.alt = "hide password";
  } else {
    // Ubah kembali jadi password (tersembunyi)
    passwordInput.type = "password";
    toggleIcon.src = "aset/eye-closed.png"; // Icon mata tertutup
    toggleIcon.alt = "show password";
  }
}

// ==========================================================================
// BAGIAN 13: CSS ANIMATIONS & STYLES
// ==========================================================================
// Inject CSS animations dan styles tambahan ke dalam <head>
const style = document.createElement("style");
style.textContent = `
/* Animasi slide in dari kanan (untuk notifikasi) */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Hover effect untuk semua tombol hapus */
.remove-btn:hover,
.remove-med-btn:hover,
.remove-schedule-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* Styling untuk nav item yang aktif di bottom navigation */
.bottom-nav .nav-item.active {
  background: rgba(126, 87, 194, 0.1);
  border-radius: 12px;
}

/* Active state (saat tombol diklik) untuk tombol simpan */
.save-schedule-btn:active {
  transform: scale(0.98) !important;
}

/* Hover effect untuk tombol pilih obat */
.add-med-to-schedule:hover {
  background: #6842a5;
}

/* Edit Profile Button Effects */
.cancel-btn:hover {
  background: #d32f2f !important;
  color: white !important;
  transform: scale(1.02);
}

.save-btn:hover {
  background: #6042a5 !important;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(123, 90, 198, 0.4);
}

/* Active state untuk tombol simpan dan batal */
.save-btn:active, .cancel-btn:active {
  transform: scale(0.98) !important;
}
`;
// Tambahkan style ke head document
document.head.appendChild(style);

// ============================================================================
// RINGKASAN FITUR APLIKASI:
// ============================================================================
// 1. SPLASH SCREEN - Halaman pembuka dengan auto-redirect
// 2. REGISTER - Pendaftaran user baru dengan validasi lengkap
// 3. LOGIN - Autentikasi user dengan session management
// 4. HOME PAGE - Fitur utama:
//    - Pilih tanggal jadwal
//    - Pilih frekuensi minum obat (Everyday, Once a week, Twice a day, Custom)
//    - Tambah obat dengan nama dan dosis
//    - Atur jadwal minum obat dengan pemilihan obat per jadwal
//    - Simpan jadwal ke localStorage dan database
// 5. JADWAL TERSIMPAN - Menampilkan kalender dan detail jadwal
//    - Kalender interaktif dengan highlight tanggal jadwal
//    - Detail lengkap jadwal dan obat
//    - Konfirmasi untuk mengaktifkan notifikasi
// 6. PROFIL - Menampilkan data user dan menu pengaturan
// 7. EDIT PROFIL - Ubah data user (nama, email, nomor telepon)
// 8. LOGOUT - Keluar dengan menjaga data jadwal tetap tersimpan
// 9. TERMS & CONDITIONS - Halaman syarat dan ketentuan
//
// TEKNOLOGI:
// - localStorage untuk penyimpanan data di browser
// - Fetch API untuk komunikasi dengan backend PHP
// - Web Notification API untuk reminder
// - CSS untuk styling
// ============================================================================
