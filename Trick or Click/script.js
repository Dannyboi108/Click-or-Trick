/***********************************
 * Trick-or-Click Script
 ***********************************/

// ==== Fireworks Hover Effect ====
document.querySelectorAll('.image-container').forEach(container => {
  let fireworkInterval;

  container.addEventListener('mouseenter', () => {
    fireworkInterval = setInterval(() => createFirework(container), 150);
  });

  container.addEventListener('mouseleave', () => {
    clearInterval(fireworkInterval);
  });
});

function createFirework(container) {
  const firework = document.createElement('div');
  firework.classList.add('firework');

  const angle = Math.random() * 2 * Math.PI;
  const distance = 80 + Math.random() * 40;
  const x = Math.cos(angle) * distance + 'px';
  const y = Math.sin(angle) * distance + 'px';
  firework.style.setProperty('--x', x);
  firework.style.setProperty('--y', y);

  firework.style.left = `${Math.random() * container.clientWidth}px`;
  firework.style.top = `${Math.random() * container.clientHeight}px`;

  const hue = Math.floor(Math.random() * 360);
  firework.style.background = `radial-gradient(circle, hsl(${hue},100%,80%), hsl(${hue},100%,50%), transparent)`;

  container.appendChild(firework);
  setTimeout(() => firework.remove(), 1000);
}

// ==== Upload Handling (Main Page) ====
const fileUpload = document.getElementById("fileUpload");
const categorySelect = document.getElementById("categorySelect");

if (fileUpload && categorySelect) {
  fileUpload.addEventListener("change", function(event) {
    const category = categorySelect.value;
    const file = event.target.files[0];

    if (!file) return;

    if (category === "costume") {
      if (localStorage.getItem("hasUploadedCostume")) {
        alert("You have already uploaded a costume entry. Only one entry is allowed per user.");
        event.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        localStorage.setItem("latestCostume", e.target.result);
        localStorage.setItem("hasUploadedCostume", "true");
        alert("Your costume was uploaded! Go to the Costume Gallery to see it.");
      }
      reader.readAsDataURL(file);
    }

    if (category === "jacko") {
      if (localStorage.getItem("hasUploadedJacko")) {
        alert("You have already uploaded a Jack-O-Lantern entry. Only one entry is allowed per user.");
        event.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        localStorage.setItem("latestJacko", e.target.result);
        localStorage.setItem("hasUploadedJacko", "true");
        alert("Your Jack-O-Lantern was uploaded! Go to the Jack-O-Lantern Gallery to see it.");
      }
      reader.readAsDataURL(file);
    }

    event.target.value = "";
  });
}

// ==== Gallery Handling (costume.html or jacko.html) ====
document.addEventListener("DOMContentLoaded", function() {

  // Decide which gallery we are on
  const costumeGallery = document.querySelector(".costume-gallery");
  const jackoGallery = document.querySelector(".jacko-gallery");
  const leaderboardList = document.getElementById("leaderboardList");

  function addEntry(gallery, imgSrc, altText = "User Entry") {
    if (!gallery) return;
    const newEntry = document.createElement("div");
    newEntry.classList.add(gallery.classList.contains("costume-gallery") ? "costume-entry-wrapper" : "jacko-entry-wrapper");
    newEntry.innerHTML = `
      <div class="${gallery.classList.contains("costume-gallery") ? "costume-entry" : "jacko-entry"}">
        <img src="${imgSrc}" alt="${altText}">
      </div>
      <div class="vote-buttons">
        <button class="upvote">⬆</button>
        <button class="downvote">⬇</button>
      </div>
    `;
    gallery.appendChild(newEntry);
    attachVoteListeners(newEntry);

    // Update Leaderboard
    if (leaderboardList) {
      const newIndex = leaderboardList.children.length + 1;
      const newItem = document.createElement("li");
      newItem.textContent = `Nominee ${newIndex}`;
      leaderboardList.appendChild(newItem);
    }
  }

  // Load previously uploaded entries
  const latestCostume = localStorage.getItem("latestCostume");
  if (latestCostume && costumeGallery) addEntry(costumeGallery, latestCostume, "User Costume");

  const latestJacko = localStorage.getItem("latestJacko");
  if (latestJacko && jackoGallery) addEntry(jackoGallery, latestJacko, "User Jack-O-Lantern");

  // Voting functionality
  function attachVoteListeners(entryWrapper) {
    const upvoteBtn = entryWrapper.querySelector(".upvote");
    const downvoteBtn = entryWrapper.querySelector(".downvote");
    if (!upvoteBtn || !downvoteBtn) return;

    upvoteBtn.addEventListener("click", () => {
      alert("You upvoted this entry!"); // Placeholder
    });
    downvoteBtn.addEventListener("click", () => {
      alert("You downvoted this entry!"); // Placeholder
    });
  }

  // Attach to existing entries
  document.querySelectorAll(".costume-entry-wrapper, .jacko-entry-wrapper").forEach(entry => attachVoteListeners(entry));
});
