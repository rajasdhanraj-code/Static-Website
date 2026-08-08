/**
 * ==========================================================================
 * AI-Based Face Recognition Attendance System
 * SPPU SYBCA Field Work Project - Vanilla JavaScript (script.js)
 * ==========================================================================
 */

// Sample / Dummy Attendance Dataset for SPPU SYBCA Field Work Prototype
let students = [
  { roll: 101, name: "Aarav Sharma", status: "Present", time: "09:02 AM" },
  { roll: 102, name: "Ananya Patel", status: "Present", time: "09:04 AM" },
  { roll: 103, name: "Rohan Verma", status: "Absent", time: "—" },
  { roll: 104, name: "Priya Kulkarni", status: "Present", time: "09:06 AM" },
  { roll: 105, name: "Aditya Joshi", status: "Absent", time: "—" },
  { roll: 106, name: "Sneha Deshmukh", status: "Present", time: "09:08 AM" },
  { roll: 107, name: "Rahul Shinde", status: "Absent", time: "—" },
  { roll: 108, name: "Tanvi Mehta", status: "Present", time: "09:10 AM" },
  { roll: 109, name: "Vikram Patil", status: "Present", time: "09:12 AM" },
  { roll: 110, name: "Neha Gawande", status: "Absent", time: "—" }
];

// Initialize application when DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  setupMobileNavigation();
  
  // Initialize Attendance Dashboard if present on current page
  if (document.getElementById("attendance-table-body")) {
    initDashboard();
  }
});

/**
 * --------------------------------------------------------------------------
 * 1. Mobile Navigation Toggle Logic
 * --------------------------------------------------------------------------
 */
function setupMobileNavigation() {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navMenu = document.getElementById("nav-menu");

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", function () {
      navMenu.classList.toggle("active");
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
      if (!hamburgerBtn.contains(event.target) && !navMenu.contains(event.target)) {
        navMenu.classList.remove("active");
      }
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * 2. Attendance Dashboard Logic
 * --------------------------------------------------------------------------
 */
function initDashboard() {
  updateClock();
  setInterval(updateClock, 1000); // Ticking clock every second

  renderAttendanceTable(students);
  calculateAndUpdateStats();

  // Attach search event listener
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", filterAndSearchStudents);
  }

  // Attach status filter event listener
  const filterSelect = document.getElementById("filter-select");
  if (filterSelect) {
    filterSelect.addEventListener("change", filterAndSearchStudents);
  }
}

/**
 * Updates the live clock and date display in the dashboard
 */
function updateClock() {
  const clockElement = document.getElementById("current-datetime");
  if (!clockElement) return;

  const now = new Date();
  const options = { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  };
  clockElement.textContent = "📅 " + now.toLocaleString('en-US', options);
}

/**
 * Dynamically calculates statistics: Total, Present, Absent, and Percentage
 */
function calculateAndUpdateStats() {
  const totalCount = students.length;
  const presentCount = students.filter(s => s.status === "Present").length;
  const absentCount = students.filter(s => s.status === "Absent").length;
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Update DOM elements if present
  const totalElem = document.getElementById("stat-total");
  const presentElem = document.getElementById("stat-present");
  const absentElem = document.getElementById("stat-absent");
  const rateElem = document.getElementById("stat-rate");

  if (totalElem) totalElem.textContent = totalCount;
  if (presentElem) presentElem.textContent = presentCount;
  if (absentElem) absentElem.textContent = absentCount;
  if (rateElem) rateElem.textContent = percentage + "%";
}

/**
 * Renders the student table rows into #attendance-table-body
 */
function renderAttendanceTable(dataToRender) {
  const tableBody = document.getElementById("attendance-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (dataToRender.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">
          No student records found matching your query.
        </td>
      </tr>
    `;
    return;
  }

  dataToRender.forEach(function (student) {
    const row = document.createElement("tr");

    // Status Badge HTML
    const isPresent = student.status === "Present";
    const statusBadge = isPresent
      ? `<span class="badge badge-present">✓ Present</span>`
      : `<span class="badge badge-absent">✕ Absent</span>`;

    // Action Button HTML
    const actionButton = isPresent
      ? `<span style="color: var(--text-muted); font-size: 0.85rem;">Already Recorded</span>`
      : `<button class="btn btn-sm btn-success" onclick="markStudentPresent(${student.roll})">Mark Present</button>`;

    row.innerHTML = `
      <td><strong>${student.roll}</strong></td>
      <td>${escapeHTML(student.name)}</td>
      <td>${statusBadge}</td>
      <td>${student.time}</td>
      <td>${actionButton}</td>
    `;

    tableBody.appendChild(row);
  });
}

/**
 * Filters the dataset by search term and dropdown status selection
 */
function filterAndSearchStudents() {
  const searchInput = document.getElementById("search-input");
  const filterSelect = document.getElementById("filter-select");

  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const filterValue = filterSelect ? filterSelect.value : "all";

  const filtered = students.filter(function (student) {
    // Check search term match (Roll number or Student Name)
    const matchesSearch = student.name.toLowerCase().includes(searchTerm) || 
                          student.roll.toString().includes(searchTerm);

    // Check status dropdown match
    let matchesFilter = true;
    if (filterValue === "present") {
      matchesFilter = student.status === "Present";
    } else if (filterValue === "absent") {
      matchesFilter = student.status === "Absent";
    }

    return matchesSearch && matchesFilter;
  });

  renderAttendanceTable(filtered);
}

/**
 * Action function: Marks an absent student as Present
 * Updates student record, re-renders view, updates stats, and shows notification toast.
 */
function markStudentPresent(rollNo) {
  const student = students.find(s => s.roll === rollNo);
  if (!student) return;

  // Set current formatted time (e.g. 09:15 AM)
  const now = new Date();
  const formattedTime = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  // Update object properties
  student.status = "Present";
  student.time = formattedTime;

  // Re-run filtering and update UI stats
  filterAndSearchStudents();
  calculateAndUpdateStats();

  // Show user notification toast
  showToastNotification(`✅ Student Roll ${student.roll} (${student.name}) marked Present at ${formattedTime}`);
}

/**
 * Displays floating notification toast message
 */
function showToastNotification(message) {
  let toast = document.getElementById("toast-notification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = "toast-notification";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  // Automatically hide after 3.5 seconds
  setTimeout(function () {
    toast.classList.remove("show");
  }, 3500);
}

/**
 * Utility function to prevent XSS in dynamic outputs
 */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
