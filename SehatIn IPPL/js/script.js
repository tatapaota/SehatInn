document.addEventListener('DOMContentLoaded', function() {
  
  // bantuan fungsi dan penyimpanan
  const AppStorage = {
    data: {},
    
    set(key, value) {
      this.data[key] = value;
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('SessionStorage unavailable, using memory only');
      }
    },
    
    get(key) {
      if (this.data[key]) return this.data[key];
      try {
        const stored = sessionStorage.getItem(key);
        if (stored) {
          this.data[key] = JSON.parse(stored);
          return this.data[key];
        }
      } catch (e) {
        console.warn('SessionStorage unavailable');
      }
      return null;
    },
    
    clear() {
      this.data = {};
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn('SessionStorage unavailable');
      }
    }
  };

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  }

  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : '#f44336'};
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  // SPLASH SCREEN (index.html)
  const logoImg = document.querySelector(".logo-img");
  if (logoImg) {
    logoImg.style.cursor = 'pointer';
    logoImg.addEventListener("click", () => {
      window.location.href = "Welcome.html";
    });
    
    setTimeout(() => {
      window.location.href = "Welcome.html";
    }, 2500);
  }

  // REGISTER PAGE (register.html)
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = this.username.value.trim();
      const password = this.password.value;
      const email = this.email.value.trim();
      const notelp = this.notelp.value.trim();

      if (!username || !password || !email || !notelp) {
        showNotification('Semua field harus diisi!', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Format email tidak valid!', 'error');
        return;
      }

      const phoneClean = notelp.replace(/\D/g, '');
      if (phoneClean.length < 10 || phoneClean.length > 15) {
        showNotification('Nomor telepon harus 10-15 digit!', 'error');
        return;
      }

      if (password.length < 6) {
        showNotification('Password minimal 6 karakter!', 'error');
        return;
      }

      const userData = { 
        username, 
        password, 
        email, 
        notelp: phoneClean,
        registeredAt: new Date().toISOString()
      };
      
      AppStorage.set('registeredUser', userData);
      showNotification('Pendaftaran berhasil! Silakan login.', 'success');
      
      setTimeout(() => {
        window.location.href = "Login.html";
      }, 1500);
    });
  }

  // LOGIN PAGE (Login.html)
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const usernameInput = this.username.value.trim();
      const passwordInput = this.password.value;
      const registeredUser = AppStorage.get('registeredUser');

      if (!registeredUser) {
        showNotification('Belum ada akun terdaftar. Silakan daftar!', 'error');
        setTimeout(() => {
          window.location.href = "register.html";
        }, 2000);
        return;
      }

      const isUsernameMatch = registeredUser.username === usernameInput;
      const isEmailMatch = registeredUser.email === usernameInput;
      const isPasswordMatch = registeredUser.password === passwordInput;

      if ((isUsernameMatch || isEmailMatch) && isPasswordMatch) {
        AppStorage.set('currentUser', registeredUser);
        AppStorage.set('isLoggedIn', true);
        showNotification('Login berhasil! Selamat datang 👋', 'success');
        
        setTimeout(() => {
          window.location.href = "Home.html";
        }, 1000);
      } else {
        showNotification('Username/Email atau Password salah!', 'error');
      }
    });
  }

  // 4. HOME PAGE (Home.html) - DENGAN DOSIS OBAT
  if (document.body.classList.contains('home-page')) {
    
    const isLoggedIn = AppStorage.get('isLoggedIn');
    if (!isLoggedIn) {
      showNotification('Silakan login terlebih dahulu!', 'error');
      setTimeout(() => {
        window.location.href = 'Login.html';
      }, 2000);
      return;
    }

    // Set tanggal hari ini
    const dateInput = document.getElementById('date');
    if (dateInput) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      dateInput.value = `${year}-${month}-${day}`;
    }

    const scheduleContainer = document.getElementById('scheduleContainer');
    const timeContainer = document.getElementById('timeContainer');
    const addScheduleBtn = document.getElementById('addScheduleBtn');
    const addTimeBtn = document.getElementById('addTimeBtn');

    // FREQUENCY LOGIC
    const freqOptions = document.querySelectorAll('#freqOptions .option');
    
    freqOptions.forEach(btn => {
      btn.addEventListener('click', function() {
        freqOptions.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const selectedFreq = this.textContent.trim();
        updateScheduleBasedOnFrequency(selectedFreq);
      });
    });

    function updateScheduleBasedOnFrequency(frequency) {
      scheduleContainer.innerHTML = '';
      if (timeContainer) timeContainer.innerHTML = '';
      
      let scheduleCount = 0;
      let schedulePlaceholders = [];
      let defaultTimes = [];

      switch(frequency) {
        case 'Everyday':
          scheduleCount = 3;
          schedulePlaceholders = ['Setelah makan pagi', 'Setelah makan siang', 'Setelah makan malam'];
          defaultTimes = ['08:00', '13:00', '19:00'];
          break;
          
        case 'Once a week':
          scheduleCount = 1;
          schedulePlaceholders = ['Setiap minggu (pilih hari)'];
          defaultTimes = ['09:00'];
          break;
          
        case 'Twice a day':
          scheduleCount = 2;
          schedulePlaceholders = ['Pagi hari', 'Malam hari'];
          defaultTimes = ['08:00', '20:00'];
          break;
          
        case 'Custom':
          scheduleCount = 1;
          schedulePlaceholders = ['Atur jadwal sendiri'];
          defaultTimes = ['00:00'];
          break;
          
        default:
          scheduleCount = 1;
          schedulePlaceholders = ['Masukkan jadwal'];
          defaultTimes = ['00:00'];
      }

      for (let i = 0; i < scheduleCount; i++) {
        createScheduleItemWithMeds(schedulePlaceholders[i] || 'Masukkan jadwal', defaultTimes[i] || '00:00');
      }

      showNotification(`✓ Diatur untuk ${frequency}`, 'success');
    }

    function createScheduleItemWithMeds(placeholder = '', defaultTime = '00:00') {
      const newSchedule = document.createElement('div');
      newSchedule.className = 'schedule-item-group';
      newSchedule.style.cssText = 'background: #f5f5f5; padding: 12px; border-radius: 10px; margin-top: 12px; border: 2px solid #ddd;';
      
      newSchedule.innerHTML = `
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
          <input type="text" class="form-input schedule-input" placeholder="${placeholder}" style="flex: 1;">
          <input type="time" class="form-input time-input" value="${defaultTime}" style="width: 100px;">
          <button type="button" class="remove-schedule-btn" style="padding: 6px 10px; background: #e57373; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">❌</button>
        </div>
        <div class="med-selector-container" style="margin-top: 8px;">
          <label style="font-size: 13px; color: #666; display: block; margin-bottom: 4px;">💊 Obat yang diminum:</label>
          <div class="selected-meds" style="display: flex; flex-wrap: wrap; gap: 6px; min-height: 30px; padding: 6px; background: white; border-radius: 6px; border: 1px dashed #aaa;">
            <span style="color: #999; font-size: 12px; font-style: italic;">Belum ada obat dipilih</span>
          </div>
          <button type="button" class="add-med-to-schedule" style="margin-top: 6px; padding: 4px 10px; background: #7e57c2; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">+ Pilih Obat</button>
        </div>
      `;
      
      const removeBtn = newSchedule.querySelector('.remove-schedule-btn');
      removeBtn.addEventListener('click', function() {
        newSchedule.remove();
      });

      const addMedBtn = newSchedule.querySelector('.add-med-to-schedule');
      const selectedMedsContainer = newSchedule.querySelector('.selected-meds');
      
      addMedBtn.addEventListener('click', function() {
        showMedicationSelector(selectedMedsContainer);
      });
      
      scheduleContainer.appendChild(newSchedule);
    }

    function showMedicationSelector(targetContainer) {
      // Ambil semua obat dengan dosis
      const allMeds = [];
      const medItems = document.querySelectorAll('#medList li');
      medItems.forEach(li => {
        const medName = li.querySelector('.med-name')?.textContent || '';
        const medDose = li.querySelector('.med-dose')?.textContent || '';
        if (medName) {
          allMeds.push({ name: medName, dose: medDose });
        }
      });

      if (allMeds.length === 0) {
        showNotification('Tambahkan obat terlebih dahulu di bagian "Add Medication"!', 'error');
        return;
      }

      const overlay = document.createElement('div');
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

      const popup = document.createElement('div');
      popup.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 12px;
        max-width: 320px;
        width: 90%;
        max-height: 450px;
        overflow-y: auto;
      `;

      let popupHTML = `
        <h3 style="margin-bottom: 15px; color: #333;">💊 Pilih Obat & Dosis</h3>
        <div class="med-checkboxes">
      `;

      allMeds.forEach((med, idx) => {
        popupHTML += `
          <label style="display: block; padding: 10px; margin-bottom: 8px; background: #f5f5f5; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;">
            <input type="checkbox" value="${idx}" style="margin-right: 8px;">
            <strong>${med.name}</strong>
            <br>
            <small style="color: #666; margin-left: 24px;">Dosis: ${med.dose || 'Tidak disebutkan'}</small>
          </label>
        `;
      });

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

      // Highlight checkbox yang dipilih
      const checkboxLabels = popup.querySelectorAll('label');
      checkboxLabels.forEach(label => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
          if (this.checked) {
            label.style.borderColor = '#7e57c2';
            label.style.background = '#e8dff5';
          } else {
            label.style.borderColor = 'transparent';
            label.style.background = '#f5f5f5';
          }
        });
      });

      const cancelBtn = popup.querySelector('.cancel-select');
      const confirmBtn = popup.querySelector('.confirm-select');

      cancelBtn.addEventListener('click', () => overlay.remove());
      
      confirmBtn.addEventListener('click', () => {
        const checkboxes = popup.querySelectorAll('input[type="checkbox"]:checked');
        const selectedMeds = Array.from(checkboxes).map(cb => {
          const idx = parseInt(cb.value);
          return allMeds[idx];
        });

        if (selectedMeds.length === 0) {
          showNotification('Pilih minimal 1 obat!', 'error');
          return;
        }

        targetContainer.innerHTML = '';
        selectedMeds.forEach(med => {
          const badge = document.createElement('div');
          badge.style.cssText = 'background: #d1c4e9; color: #311b92; padding: 6px 10px; border-radius: 8px; font-size: 12px; display: inline-flex; align-items: center; gap: 4px; margin: 2px;';
          badge.innerHTML = `
            <div>
              <strong>${med.name}</strong>
              <br>
              <small style="color: #555;">${med.dose}</small>
            </div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #311b92; cursor: pointer; font-size: 16px; margin-left: 4px;">×</button>
          `;
          targetContainer.appendChild(badge);
        });

        overlay.remove();
        showNotification(`${selectedMeds.length} obat dipilih`, 'success');
      });
    }

    updateScheduleBasedOnFrequency('Everyday');

    if (addScheduleBtn) {
      addScheduleBtn.addEventListener('click', function() {
        createScheduleItemWithMeds('Tambahan jadwal', '00:00');
      });
    }

    if (addTimeBtn) {
      addTimeBtn.style.display = 'none';
    }
    
    if (timeContainer) {
      timeContainer.style.display = 'none';
    }

    // ADD MEDICATION DENGAN DOSIS
    const addMedBtn = document.getElementById('addMedBtn');
    const medNameInput = document.getElementById('medNameInput');
    const medList = document.getElementById('medList');
    
    if (addMedBtn && medNameInput && medList) {
      function addMedication() {
        const medName = medNameInput.value.trim();
        
        if (!medName) {
          showNotification('Masukkan nama obat terlebih dahulu!', 'error');
          return;
        }

        // Popup untuk input dosis
        const overlay = document.createElement('div');
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

        const popup = document.createElement('div');
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

        const doseInput = popup.querySelector('#doseInput');
        const cancelBtn = popup.querySelector('.cancel-dose');
        const confirmBtn = popup.querySelector('.confirm-dose');

        doseInput.focus();

        cancelBtn.addEventListener('click', () => {
          overlay.remove();
          medNameInput.value = '';
        });

        confirmBtn.addEventListener('click', () => {
          const dose = doseInput.value.trim() || 'Tidak disebutkan';

          const li = document.createElement('li');
          li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #d1c4e9; border-radius: 10px; margin-bottom: 8px;';
          li.innerHTML = `
            <div style="flex: 1;">
              <div class="med-name" style="color: #311b92; font-weight: 600; font-size: 14px;">${medName}</div>
              <div class="med-dose" style="color: #555; font-size: 12px; margin-top: 2px;">📋 ${dose}</div>
            </div>
            <button type="button" class="remove-med-btn" style="padding: 4px 8px; background: #e57373; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">🗑️</button>
          `;
          
          const removeBtn = li.querySelector('.remove-med-btn');
          removeBtn.addEventListener('click', function() {
            li.remove();
          });
          
          medList.appendChild(li);
          medNameInput.value = '';
          medNameInput.focus();
          overlay.remove();
          showNotification('Obat berhasil ditambahkan!', 'success');
        });

        doseInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            confirmBtn.click();
          }
        });
      }

      addMedBtn.addEventListener('click', addMedication);
      medNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          addMedication();
        }
      });
    }

    // TOMBOL SIMPAN JADWAL
    const addMedSection = document.querySelector('.add-med-section');
    
    if (addMedSection) {
      const saveScheduleBtn = document.createElement('button');
      saveScheduleBtn.id = 'saveScheduleBtn';
      saveScheduleBtn.className = 'save-schedule-btn';
      saveScheduleBtn.textContent = '💾 Simpan Jadwal';
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
      
      saveScheduleBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 16px rgba(126, 87, 194, 0.4)';
      });
      
      saveScheduleBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(126, 87, 194, 0.3)';
      });
      
      saveScheduleBtn.addEventListener('click', function() {
        if (saveScheduleData()) {
          this.textContent = '⏳ Menyimpan...';
          this.disabled = true;
          
          setTimeout(() => {
            const saved = AppStorage.get('userSchedule');
            if (saved) {
              window.location.href = 'jadwalTersimpan.html';
            } else {
              showNotification('Gagal menyimpan data!', 'error');
              this.textContent = '💾 Simpan Jadwal';
              this.disabled = false;
            }
          }, 1000);
        }
      });
      
      addMedSection.parentNode.insertBefore(saveScheduleBtn, medList);
    }

    function saveScheduleData() {
      const date = dateInput?.value || '';
      const frequency = document.querySelector('#freqOptions .option.active')?.textContent.trim() || 'Everyday';
      
      const schedules = [];
      const scheduleGroups = document.querySelectorAll('.schedule-item-group');
      
      scheduleGroups.forEach(group => {
        const scheduleText = group.querySelector('.schedule-input')?.value.trim();
        const time = group.querySelector('.time-input')?.value;
        
        const selectedMedBadges = group.querySelectorAll('.selected-meds > div');
        const medsForThisSchedule = [];
        selectedMedBadges.forEach(badge => {
          const medName = badge.querySelector('strong')?.textContent || '';
          const medDose = badge.querySelector('small')?.textContent || '';
          if (medName) {
            medsForThisSchedule.push({ name: medName, dose: medDose });
          }
        });
        
        if (scheduleText && time && medsForThisSchedule.length > 0) {
          schedules.push({
            description: scheduleText,
            time: time,
            medications: medsForThisSchedule
          });
        }
      });

      const allMedications = [];
      const medItems = document.querySelectorAll('#medList li');
      medItems.forEach(li => {
        const name = li.querySelector('.med-name')?.textContent || '';
        const dose = li.querySelector('.med-dose')?.textContent.replace('📋 ', '') || '';
        if (name) {
          allMedications.push({ name, dose });
        }
      });

      if (!date) {
        showNotification('Pilih tanggal terlebih dahulu!', 'error');
        return false;
      }

      if (schedules.length === 0) {
        showNotification('Isi minimal 1 jadwal lengkap dengan waktu dan obat!', 'error');
        return false;
      }

      if (allMedications.length === 0) {
        showNotification('Tambahkan minimal 1 obat!', 'error');
        return false;
      }

      const scheduleData = {
        date,
        frequency,
        schedules,
        allMedications,
        createdAt: new Date().toISOString()
      };

      AppStorage.set('userSchedule', scheduleData);
      showNotification('✅ Jadwal berhasil disimpan!', 'success');
      
      return true;
    }

    const scheduleNavLinks = document.querySelectorAll('a[href="jadwalTersimpan.html"]');
    scheduleNavLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const savedSchedule = AppStorage.get('userSchedule');
        if (!savedSchedule) {
          e.preventDefault();
          showNotification('Simpan jadwal terlebih dahulu dari Home!', 'error');
        }
      });
    });
  }

//JADWAL TERSIMPAN PAGE
if (document.body.classList.contains('schedule-page')) {
  
  const scheduleData = AppStorage.get('userSchedule');
  
  if (!scheduleData) {
    showNotification('Belum ada jadwal tersimpan!', 'error');
    setTimeout(() => {
      window.location.href = 'Home.html';
    }, 2000);
    return;
  }

  // Calendar functionality
  let currentDate = new Date();
  if (scheduleData.date) {
    currentDate = new Date(scheduleData.date);
  }
  
  const selectedDate = new Date(scheduleData.date);
  const selectedDay = selectedDate.getDate();
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  
  // Update month and year display
  const monthEl = document.querySelector('.month');
  const yearEl = document.querySelector('.year');
  const calendarGrid = document.querySelector('.calendar-grid');
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  function updateCalendar() {
    // Update month and year display
    if (monthEl) monthEl.textContent = monthNames[currentDate.getMonth()];
    if (yearEl) yearEl.textContent = currentDate.getFullYear();
    
    // Clear calendar grid
    if (calendarGrid) calendarGrid.innerHTML = '';
    
    // Get first day of month and number of days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Add days from previous month
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dateElement = document.createElement('div');
      dateElement.className = 'date other-month';
      dateElement.textContent = prevMonthLastDay - i;
      calendarGrid.appendChild(dateElement);
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateElement = document.createElement('div');
      dateElement.className = 'date';
      dateElement.textContent = i;
      
      // Check if this date has a schedule
      if (currentDate.getMonth() === selectedMonth && 
          currentDate.getFullYear() === selectedYear && 
          i === selectedDay) {
        dateElement.classList.add('has-schedule');
        dateElement.style.cssText = `
          background-color: #7e57c2 !important;
          color: white !important;
          font-weight: bold !important;
          box-shadow: 0 0 0 3px rgba(126, 87, 194, 0.3);
          transform: scale(1.1);
        `;
      }
      
      // Check tanggal hari ini
      const today = new Date();
      if (currentDate.getMonth() === today.getMonth() && 
          currentDate.getFullYear() === today.getFullYear() && 
          i === today.getDate()) {
        dateElement.classList.add('today');
      }
      
      calendarGrid.appendChild(dateElement);
    }
    
    const totalCells = 42; 
    const remainingCells = totalCells - (startingDayOfWeek + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
      const dateElement = document.createElement('div');
      dateElement.className = 'date other-month';
      dateElement.textContent = i;
      calendarGrid.appendChild(dateElement);
    }
  }
  
  // Initialize calendar
  updateCalendar();
  
  // Add event listeners for navigation buttons
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      currentDate.setMonth(currentDate.getMonth() - 1);
      updateCalendar();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      currentDate.setMonth(currentDate.getMonth() + 1);
      updateCalendar();
    });
  }

  // DETAIL JADWAL DAN TOMBOL KONFIRMASI
  const calendarCard = document.querySelector('.calendar-card');
  
  // Hapus tombol konfirmasi lama jika ada
  const oldConfirmBtns = document.querySelector('.confirm-buttons');
  if (oldConfirmBtns) {
    oldConfirmBtns.remove();
  }
  
  // Buat div untuk detail jadwal
  const detailDiv = document.createElement('div');
  detailDiv.className = 'schedule-detail';
  detailDiv.style.cssText = `
    margin-top: 20px; 
    padding: 15px; 
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    border-radius: 12px;
    border-left: 4px solid #7e57c2;
  `;
  
  detailDiv.innerHTML = `
    <h3 style="margin-bottom: 15px; color: #333; display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 24px;">📋</span> Detail Jadwal Obat
    </h3>
    <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
      <p style="margin: 8px 0;"><strong>📅 Tanggal:</strong> ${formatDate(scheduleData.date)}</p>
      <p style="margin: 8px 0;"><strong>🔄 Frekuensi:</strong> ${scheduleData.frequency}</p>
    </div>
    
    ${scheduleData.allMedications ? `
    <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
      <p style="margin: 8px 0; font-weight: 600;">💊 Daftar Semua Obat:</p>
      <ul style="margin: 8px 0 8px 20px; list-style: none;">
        ${scheduleData.allMedications.map(m => `<li style="padding: 4px 0;"><strong>✓ ${m.name}</strong> <small style="color: #666;">(${m.dose})</small></li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    <div style="background: white; padding: 12px; border-radius: 8px;">
      <p style="margin: 8px 0; font-weight: 600;">🕐 Jadwal Minum Obat (Detail):</p>
      ${scheduleData.schedules.map((s, idx) => `
        <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #7e57c2;">
          <p style="margin: 4px 0; font-weight: 600; color: #7e57c2;">⏰ ${s.time} - ${s.description || 'Jadwal ' + (idx + 1)}</p>
          <p style="margin: 8px 0 4px 0; font-size: 13px; color: #666;">Obat yang diminum:</p>
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
            ${s.medications ? s.medications.map(med => `
              <div style="background: #d1c4e9; color: #311b92; padding: 8px 12px; border-radius: 8px; font-size: 13px;">
                <strong>💊 ${med.name}</strong><br>
                <small style="color: #555;">Dosis: ${med.dose}</small>
              </div>
            `).join('') : '<span style="color: #999;">Tidak ada obat</span>'}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  calendarCard.appendChild(detailDiv);

  // TOMBOL CANCEL DAN OK
  const btnContainer = document.createElement('div');
  btnContainer.className = 'confirm-buttons';
  btnContainer.style.cssText = 'display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;';
  btnContainer.innerHTML = `
    <button class="cancel-btn" style="padding: 10px 20px; background: #e0e0e0; color: #333; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s;">Batal</button>
    <button class="ok-btn" style="padding: 10px 20px; background: #7e57c2; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s;">Konfirmasi</button>
  `;
  
  calendarCard.appendChild(btnContainer);

  // Event listeners untuk tombol
  const okBtn = btnContainer.querySelector('.ok-btn');
  const cancelBtn = btnContainer.querySelector('.cancel-btn');

  if (okBtn) {
    okBtn.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05)';
      this.style.boxShadow = '0 4px 12px rgba(126, 87, 194, 0.4)';
    });
    
    okBtn.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
      this.style.boxShadow = 'none';
    });
    
    okBtn.addEventListener('click', function() {
      // Konfirmasi jadwal
      const confirmed = {
        ...scheduleData,
        confirmed: true,
        confirmedAt: new Date().toISOString()
      };
      
      AppStorage.set('confirmedSchedule', confirmed);
      showNotification('✅ Jadwal dikonfirmasi! Notifikasi akan aktif.', 'success');
      
      // Simulasikan pengiriman notifikasi
      simulateNotification(confirmed);
      
      setTimeout(() => {
        window.location.href = 'Home.html';
      }, 2000);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('mouseenter', function() {
      this.style.background = '#d32f2f';
      this.style.color = 'white';
    });
    
    cancelBtn.addEventListener('mouseleave', function() {
      this.style.background = '#e0e0e0';
      this.style.color = '#333';
    });
    
    cancelBtn.addEventListener('click', function() {
      if (confirm('Batalkan dan kembali ke Home untuk edit?')) {
        window.location.href = 'Home.html';
      }
    });
  }

  // FUNGSI SIMULASI NOTIFIKASI
  function simulateNotification(schedule) {
    console.log('🔔 NOTIFIKASI AKTIF:');
    console.log('Jadwal obat telah dikonfirmasi:');
    
    schedule.schedules.forEach((sched, index) => {
      console.log(`⏰ ${sched.time} - ${sched.description}`);
      if (sched.medications && sched.medications.length > 0) {
        sched.medications.forEach(med => {
          console.log(`   💊 ${med.name} (${med.dose})`);
        });
      }
    });
    
    // Simulasi notifikasi browser (jika diizinkan)
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Sehat In - Jadwal Obat Dikonfirmasi", {
          body: `Jadwal untuk ${formatDate(schedule.date)} telah aktif`,
          icon: "aset/logo.png"
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("Sehat In - Jadwal Obat Dikonfirmasi", {
              body: `Jadwal untuk ${formatDate(schedule.date)} telah aktif`,
              icon: "aset/logo.png"
            });
          }
        });
      }
    }
    
    // Simpan data notifikasi untuk reminder
    const reminderData = {
      schedule: schedule,
      nextReminder: new Date().toISOString(),
      active: true
    };
    
    AppStorage.set('activeReminders', reminderData);
    showNotification('🔔 Notifikasi reminder telah diaktifkan!', 'success');
  }
}

  // PROFILE PAGE
  if (document.body.classList.contains('profile-page')) {
    
    const currentUser = AppStorage.get('currentUser');
    const isLoggedIn = AppStorage.get('isLoggedIn');
    
    if (!currentUser || !isLoggedIn) {
      showNotification('Silakan login terlebih dahulu!', 'error');
      setTimeout(() => {
        window.location.href = 'Login.html';
      }, 2000);
      return;
    }

    const nameEl = document.querySelector('.name');
    const emailEl = document.querySelector('.email');
    const phoneEl = document.querySelector('.phone');

    if (nameEl) nameEl.textContent = currentUser.username;
    if (emailEl) emailEl.textContent = currentUser.email;
    if (phoneEl) phoneEl.textContent = currentUser.notelp;

    const editBtn = document.querySelector('.edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', function() {
        window.location.href = 'editProfile.html';
      });
    }

    const menuItems = document.querySelectorAll('.menu-item:not(.logout)');
    menuItems.forEach(item => {
      item.addEventListener('click', function() {
        showNotification('Fitur ini akan segera hadir!', 'success');
      });
    });

    const logoutItem = document.querySelector('.menu-item.logout');
    if (logoutItem) {
      logoutItem.addEventListener('click', function() {
        if (confirm('Yakin ingin logout?')) {
          const savedSchedule = AppStorage.get('userSchedule');
          const confirmedSchedule = AppStorage.get('confirmedSchedule');
          const registeredUser = AppStorage.get('registeredUser');
          
          AppStorage.set('isLoggedIn', false);
          
          if (savedSchedule) {
            AppStorage.set('userSchedule', savedSchedule);
          }
          if (confirmedSchedule) {
            AppStorage.set('confirmedSchedule', confirmedSchedule);
          }
          if (registeredUser) {
            AppStorage.set('registeredUser', registeredUser);
          }
          
          showNotification('Logout berhasil! Sampai jumpa 👋', 'success');
          
          setTimeout(() => {
            window.location.href = 'Login.html';
          }, 1500);
        }
      });
    }
  }

// EDIT PROFILE PAGE
if (document.body.classList.contains('edit-profile-page')) {
    
    const currentUser = AppStorage.get('currentUser');
    const isLoggedIn = AppStorage.get('isLoggedIn');
    
    if (!currentUser || !isLoggedIn) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        setTimeout(() => {
        window.location.href = 'Login.html';
        }, 2000);
        return;
    }

    const editName = document.getElementById('editName');
    const editEmail = document.getElementById('editEmail');
    const editPhone = document.getElementById('editPhone');

    if (editName) editName.value = currentUser.username;
    if (editEmail) editEmail.value = currentUser.email;
    if (editPhone) editPhone.value = currentUser.notelp;

    const editForm = document.querySelector('.edit-form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const newUsername = editName.value.trim();
        const newEmail = editEmail.value.trim();
        const newPhone = editPhone.value.trim();

        if (!newUsername || !newEmail || !newPhone) {
            showNotification('Semua field harus diisi!', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            showNotification('Format email tidak valid!', 'error');
            return;
        }

        const phoneClean = newPhone.replace(/\D/g, '');
        if (phoneClean.length < 10 || phoneClean.length > 15) {
            showNotification('Nomor telepon harus 10-15 digit!', 'error');
            return;
        }

        const updatedUser = {
            ...currentUser,
            username: newUsername,
            email: newEmail,
            notelp: phoneClean
        };

        AppStorage.set('currentUser', updatedUser);
        AppStorage.set('registeredUser', updatedUser);

        showNotification('✅ Profil berhasil diperbarui!', 'success');
        
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
        });
    }


    // TOMBOL BATAL - KEMBALI KE PROFILE
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
        e.preventDefault(); 
        
        if (confirm('Batalkan perubahan dan kembali ke profil?')) {
            window.location.href = 'profile.html';
        }
        });

        cancelBtn.addEventListener('mouseenter', function() {
        this.style.background = '#d32f2f';
        this.style.color = 'white';
        this.style.transform = 'scale(1.02)';
        });
        
        cancelBtn.addEventListener('mouseleave', function() {
        this.style.background = '#d1c4e9';
        this.style.color = '#333';
        this.style.transform = 'scale(1)';
        });
    }

    // TOMBOL SIMPAN - EFFECT
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
        this.style.boxShadow = '0 4px 12px rgba(123, 90, 198, 0.4)';
        });
        
        saveBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = 'none';
        });
    }
}

// ========================================
// BOTTOM NAV ACTIVE STATE
// ========================================
const currentPage = window.location.pathname.split('/').pop();
const navItems = document.querySelectorAll('.bottom-nav .nav-item');

navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && currentPage.includes(href.replace('.html', ''))) {
    item.classList.add('active');
    item.style.transform = 'scale(1.1)';
    }
});

});

// ========================================
// ANIMATION CSS (inject ke head)
// ========================================
const style = document.createElement('style');
style.textContent = `
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

.remove-btn:hover,
.remove-med-btn:hover,
.remove-schedule-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.bottom-nav .nav-item.active {
    background: rgba(126, 87, 194, 0.1);
    border-radius: 12px;
}

.save-schedule-btn:active {
    transform: scale(0.98) !important;
}

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

.save-btn:active, .cancel-btn:active {
    transform: scale(0.98) !important;
}
`;
document.head.appendChild(style);