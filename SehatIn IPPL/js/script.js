document.querySelector(".logo-img").addEventListener("click", () => {
  window.location.href = "Welcome.html";
});

/*home*/
const scheduleGroup = document.getElementById("scheduleOptions");
const timeContainer = document.getElementById("timeContainer");

// Toggle active buttons & update time inputs
scheduleGroup.addEventListener("click", e => {
  if (e.target.classList.contains("option")) {
    e.target.classList.toggle("active");
    updateTimes();
  }
});

function updateTimes() {
  timeContainer.innerHTML = "";
  const activeSchedules = document.querySelectorAll("#scheduleOptions .active");
  activeSchedules.forEach(btn => {
    const div = document.createElement("div");
    div.classList.add("time-row");
    div.innerHTML = `
      <label>${btn.textContent}</label>
      <input type="time" value="08:00">
    `;
    timeContainer.appendChild(div);
  });
}

// Popup Add Medication
const addBtn = document.getElementById("addBtn");
const popup = document.getElementById("popup");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.getElementById("saveBtn");
const medList = document.getElementById("medList");

addBtn.onclick = () => popup.style.display = "flex";
closeBtn.onclick = () => popup.style.display = "none";

saveBtn.onclick = () => {
  const medicine = document.getElementById("medicineSelect").value;
  if (medicine) {
    const li = document.createElement("li");
    li.textContent = medicine;
    medList.appendChild(li);
    popup.style.display = "none";
  } else {
    alert("Pilih obat terlebih dahulu!");
  }
};

// Frequency toggle
document.getElementById("freqOptions").addEventListener("click", e => {
  if (e.target.classList.contains("option")) {
    document.querySelectorAll("#freqOptions .option").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
  }
});
