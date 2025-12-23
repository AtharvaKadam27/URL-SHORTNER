// Get URL ID from query parameter
const urlParams = new URLSearchParams(window.location.search);
const urlId = urlParams.get("id");
let urlData = null;
let countdownInterval = null;

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  if (urlId) {
    loadUrlDetails();
  } else {
    // Try to get data from sessionStorage (passed from index page)
    const storedData = sessionStorage.getItem("urlData");
    if (storedData) {
      urlData = JSON.parse(storedData);
      displayUrlDetails(urlData);
    } else {
      window.location.href = "/";
    }
  }
});

async function loadUrlDetails() {
  try {
    const response = await fetch(`/api/url/${urlId}`);
    if (response.ok) {
      urlData = await response.json();
      displayUrlDetails(urlData);
    } else {
      showError("URL not found");
    }
  } catch (error) {
    console.error("Error loading URL details:", error);
    showError("Failed to load URL details");
  }
}

function displayUrlDetails(data) {
  const baseUrl = window.location.origin;
  const shortUrl = `${baseUrl}/r/${data.id}`;

  // Display short URL
  document.getElementById("shortUrl").textContent = shortUrl;

  // Display original URL
  const originalUrlElement = document.getElementById("originalUrl");
  originalUrlElement.href = data.originalUrl;
  originalUrlElement.textContent = truncateUrl(data.originalUrl, 50);
  originalUrlElement.title = data.originalUrl;

  // Display dates
  document.getElementById("createdDate").textContent = formatDateTime(
    data.createdDate
  );
  document.getElementById("expiryDate").textContent = formatDateTime(
    data.expiryDate
  );

  // Display algorithm
  document.getElementById("algorithm").textContent = data.algorithm;

  // Display click count
  document.getElementById("clickCount").textContent = data.clickCount || 0;

  // Start countdown
  startCountdown(data.expiryDate);

  // Generate QR Code
  generateQRCode(shortUrl);
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return "N/A";

  const date = new Date(dateTimeStr);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("en-US", options);
}

function truncateUrl(url, maxLength) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + "...";
}

function startCountdown(expiryDateStr) {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  const updateCountdown = () => {
    const now = new Date();
    const expiry = new Date(expiryDateStr);
    const diff = expiry - now;

    if (diff <= 0) {
      document.getElementById("countdown").innerHTML =
        '<span class="expired">Expired</span>';
      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerHTML = `
            <div class="countdown-item">
                <span class="countdown-value">${days}</span>
                <span class="countdown-unit">days</span>
            </div>
            <div class="countdown-separator">:</div>
            <div class="countdown-item">
                <span class="countdown-value">${String(hours).padStart(
                  2,
                  "0"
                )}</span>
                <span class="countdown-unit">hours</span>
            </div>
            <div class="countdown-separator">:</div>
            <div class="countdown-item">
                <span class="countdown-value">${String(minutes).padStart(
                  2,
                  "0"
                )}</span>
                <span class="countdown-unit">mins</span>
            </div>
            <div class="countdown-separator">:</div>
            <div class="countdown-item">
                <span class="countdown-value">${String(seconds).padStart(
                  2,
                  "0"
                )}</span>
                <span class="countdown-unit">secs</span>
            </div>
        `;
  };

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function generateQRCode(url) {
  const qrContainer = document.getElementById("qrCode");
  // Using a simple QR code API
  const qrSize = 150;
  const qrImg = document.createElement("img");
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(
    url
  )}&bgcolor=ffffff&color=6a11cb`;
  qrImg.alt = "QR Code";
  qrImg.className = "qr-image";
  qrContainer.innerHTML = "";
  qrContainer.appendChild(qrImg);
}

function copyShortUrl() {
  const shortUrl = document.getElementById("shortUrl").textContent;
  navigator.clipboard
    .writeText(shortUrl)
    .then(() => {
      // Show feedback
      const feedback = document.getElementById("copyFeedback");
      feedback.classList.remove("hidden");

      // Update button icon temporarily
      const copyBtns = document.querySelectorAll(
        ".copy-btn i, .action-btn.primary i"
      );
      copyBtns.forEach((icon) => {
        const originalClass = icon.className;
        icon.className = "fas fa-check";
        setTimeout(() => {
          icon.className = originalClass;
        }, 2000);
      });

      setTimeout(() => {
        feedback.classList.add("hidden");
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      alert("Failed to copy URL");
    });
}

async function refreshAnalytics() {
  if (!urlData || !urlData.id) return;

  const btn = document.querySelector(".action-btn.secondary");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

  try {
    const response = await fetch(`/api/url/${urlData.id}`);
    if (response.ok) {
      urlData = await response.json();
      document.getElementById("clickCount").textContent =
        urlData.clickCount || 0;

      // Animate the click count
      const clickElement = document.getElementById("clickCount");
      clickElement.style.transform = "scale(1.2)";
      clickElement.style.color = "#00ff88";
      setTimeout(() => {
        clickElement.style.transform = "scale(1)";
        clickElement.style.color = "";
      }, 300);
    }
  } catch (error) {
    console.error("Error refreshing analytics:", error);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-chart-bar"></i> Refresh Analytics';
  }
}

function createAnother() {
  sessionStorage.removeItem("urlData");
  window.location.href = "/";
}

function showError(message) {
  document.querySelector(".glass-card").innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            <h2>${message}</h2>
            <p>The URL you're looking for doesn't exist or has expired.</p>
            <button class="action-btn accent" onclick="createAnother()">
                <i class="fas fa-plus"></i>
                Create New URL
            </button>
        </div>
    `;
}

// QR Code Popup Functions
function openQrPopup() {
  const popup = document.getElementById("qrPopup");
  const qrLargeContainer = document.getElementById("qrCodeLarge");

  // Generate larger QR code for popup
  const baseUrl = window.location.origin;
  const shortUrl = `${baseUrl}/r/${urlData.id}`;
  const qrSize = 280;

  qrLargeContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(
    shortUrl
  )}&bgcolor=ffffff&color=6a11cb" alt="QR Code" />`;

  popup.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeQrPopup(event) {
  // Close only if clicking overlay or close button, not the content
  if (
    event.target.id === "qrPopup" ||
    event.target.classList.contains("qr-popup-close")
  ) {
    const popup = document.getElementById("qrPopup");
    popup.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Close popup on Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const popup = document.getElementById("qrPopup");
    if (popup.classList.contains("active")) {
      popup.classList.remove("active");
      document.body.style.overflow = "";
    }
  }
});
