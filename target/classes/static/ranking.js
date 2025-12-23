// Ranking page JavaScript

document.addEventListener("DOMContentLoaded", () => {
  loadRankings();
});

async function loadRankings() {
  const loadingEl = document.getElementById("loading");
  const emptyState = document.getElementById("emptyState");
  const rankingBody = document.getElementById("rankingBody");
  const tableContainer = document.querySelector(".ranking-table-container");

  loadingEl.classList.remove("hidden");
  emptyState.classList.add("hidden");
  rankingBody.innerHTML = "";
  tableContainer.classList.add("no-scroll");

  try {
    // Fetch rankings and stats in parallel
    const [rankingsRes, statsRes] = await Promise.all([
      fetch("/api/rankings?limit=10"),
      fetch("/api/rankings/stats"),
    ]);

    if (rankingsRes.ok && statsRes.ok) {
      const rankings = await rankingsRes.json();
      const stats = await statsRes.json();

      // Update stats
      displayStats(stats);

      // Display rankings
      if (rankings.length === 0) {
        emptyState.classList.remove("hidden");
        tableContainer.classList.add("no-scroll");
      } else {
        displayRankings(rankings);
        tableContainer.classList.remove("no-scroll");
      }
    } else {
      showError("Failed to load rankings");
    }
  } catch (error) {
    console.error("Error loading rankings:", error);
    showError("An error occurred while loading rankings");
  } finally {
    loadingEl.classList.add("hidden");
  }
}

function displayStats(stats) {
  document.getElementById("totalUrls").textContent = stats.totalUrls || 0;
  document.getElementById("totalClicks").textContent = formatNumber(
    stats.totalClicks || 0
  );
  document.getElementById("avgClicks").textContent = (
    stats.averageClicks || 0
  ).toFixed(1);
}

function displayRankings(rankings) {
  const rankingBody = document.getElementById("rankingBody");
  const baseUrl = window.location.origin;

  rankings.forEach((url, index) => {
    const rank = index + 1;
    const shortUrl = `${baseUrl}/r/${url.id}`;
    const row = document.createElement("tr");
    row.className = "ranking-row";
    row.style.animationDelay = `${index * 0.1}s`;

    row.innerHTML = `
      <td class="rank-col">
        <div class="rank-badge ${getRankClass(rank)}">
          ${getRankIcon(rank)}
          <span>${rank}</span>
        </div>
      </td>
      <td class="url-col">
        <div class="short-url-cell">
          <a href="${shortUrl}" target="_blank" class="short-url-link">${
      url.id
    }</a>
          <button class="copy-mini-btn" onclick="copyUrl('${shortUrl}')" title="Copy URL">
            <i class="far fa-copy"></i>
          </button>
        </div>
      </td>
      <td class="original-col">
        <a href="${
          url.originalUrl
        }" target="_blank" class="original-url-link" title="${url.originalUrl}">
          ${truncateUrl(url.originalUrl, 40)}
        </a>
      </td>
      <td class="clicks-col">
        <div class="clicks-badge">
          <i class="fas fa-mouse-pointer"></i>
          <span>${formatNumber(url.clickCount)}</span>
        </div>
      </td>
    `;

    rankingBody.appendChild(row);
  });
}

function getRankClass(rank) {
  switch (rank) {
    case 1:
      return "gold";
    case 2:
      return "silver";
    case 3:
      return "bronze";
    default:
      return "";
  }
}

function getRankIcon(rank) {
  switch (rank) {
    case 1:
      return '<i class="fas fa-crown"></i>';
    case 2:
      return '<i class="fas fa-medal"></i>';
    case 3:
      return '<i class="fas fa-award"></i>';
    default:
      return "";
  }
}

function truncateUrl(url, maxLength) {
  if (!url) return "";
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + "...";
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

async function copyUrl(url) {
  try {
    await navigator.clipboard.writeText(url);

    // Show brief feedback
    const btns = document.querySelectorAll(".copy-mini-btn");
    btns.forEach((btn) => {
      if (btn.onclick.toString().includes(url)) {
        const icon = btn.querySelector("i");
        icon.className = "fas fa-check";
        setTimeout(() => {
          icon.className = "far fa-copy";
        }, 1500);
      }
    });
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

function refreshRankings() {
  const btn = document.querySelector(".action-btn.secondary");
  const icon = btn.querySelector("i");
  icon.classList.add("fa-spin");

  loadRankings().finally(() => {
    setTimeout(() => {
      icon.classList.remove("fa-spin");
    }, 500);
  });
}

function showError(message) {
  const emptyState = document.getElementById("emptyState");
  emptyState.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <p>${message}</p>
    <button class="action-btn accent" onclick="loadRankings()">Try Again</button>
  `;
  emptyState.classList.remove("hidden");
}
