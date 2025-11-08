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
  const costumeGallery = document.querySelector(".costume-gallery");
  const jackoGallery = document.querySelector(".jacko-gallery");
  const leaderboardList = document.getElementById("leaderboardList");

  function addEntry(gallery, imgSrc, altText = "User Entry", galleryType = "general") {
    if (!gallery) return;
    const newEntry = document.createElement("div");
    newEntry.classList.add(
      gallery.classList.contains("costume-gallery") ? "costume-entry-wrapper" : "jacko-entry-wrapper"
    );
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

    const entryIndex = Array.from(gallery.children).indexOf(newEntry);
    attachVoteListeners(newEntry, entryIndex, galleryType);

    if (leaderboardList) {
      const newItem = document.createElement("li");
      newItem.textContent = `Nominee ${entryIndex + 1} – Upvotes : 0, Downvotes : 0`;
      leaderboardList.appendChild(newItem);
    }
  }

  // Load previously uploaded entries
  const latestCostume = localStorage.getItem("latestCostume");
  if (latestCostume && costumeGallery) addEntry(costumeGallery, latestCostume, "User Costume", "costume");

  const latestJacko = localStorage.getItem("latestJacko");
  if (latestJacko && jackoGallery) addEntry(jackoGallery, latestJacko, "User Jack-O-Lantern", "jacko");

  // ==== Voting functionality ====
  function attachVoteListeners(entryWrapper, index, galleryType = "general") {
    const upvoteBtn = entryWrapper.querySelector(".upvote");

    const voteKey = `${galleryType}-entry-${index}-voted`;
    let hasVoted = localStorage.getItem(voteKey) === "true";
    if (hasVoted) upvoteBtn.disabled = true;

    let upvotes = 0;
    let downvotes = 0;
    if (leaderboardList && leaderboardList.children[index]) {
      const text = leaderboardList.children[index].textContent;
      const match = text.match(/Upvotes\s*:\s*(\d+),\s*Downvotes\s*:\s*(\d+)/);
      if (match) {
        upvotes = parseInt(match[1], 10);
        downvotes = parseInt(match[2], 10);
      }
    }

    function updateLeaderboard() {
      if (leaderboardList && leaderboardList.children[index]) {
        leaderboardList.children[index].textContent =
          `Nominee ${index + 1} – Upvotes : ${upvotes}, Downvotes : ${downvotes}`;
      }
    }

    updateLeaderboard();

    upvoteBtn.addEventListener("click", () => {
      if (hasVoted) return;
      upvotes++;
      localStorage.setItem(`${galleryType}-entry-${index}-upvotes`, upvotes);
      localStorage.setItem(voteKey, "true");
      hasVoted = true;
      upvoteBtn.disabled = true;
      updateLeaderboard();
    });

   const downvoteBtn = entryWrapper.querySelector(".downvote");
if (downvoteBtn) {
  downvoteBtn.addEventListener("click", () => {
    // Redirect to jumpscare page with correct path
    window.location.href = "play.html";
  });
}

  }

  // Attach to existing entries
  document.querySelectorAll(".costume-entry-wrapper").forEach((entry, index) => {
    attachVoteListeners(entry, index, "costume");
  });
  document.querySelectorAll(".jacko-entry-wrapper").forEach((entry, index) => {
    attachVoteListeners(entry, index, "jacko");
  });

  // ==== Remove Uploaded Entry Button ====
  const removeEntryButton = document.getElementById("removeEntryButton");

  if (removeEntryButton) {
    removeEntryButton.addEventListener("click", () => {
      let index = -1;

      // Remove uploaded costume entry
      if (latestCostume && costumeGallery) {
        const entryToRemove = Array.from(costumeGallery.querySelectorAll(".costume-entry img"))
          .find(img => img.src === latestCostume);
        if (entryToRemove) {
          const wrapper = entryToRemove.closest(".costume-entry-wrapper");
          index = Array.from(costumeGallery.children).indexOf(wrapper);
          wrapper.remove();
          if (leaderboardList && leaderboardList.children[index]) {
            leaderboardList.children[index].remove();
          }
        }
        if (index >= 0) {
          localStorage.removeItem(`costume-entry-${index}-voted`);
          localStorage.removeItem(`costume-entry-${index}-upvotes`);
        }
        localStorage.removeItem("latestCostume");
        localStorage.removeItem("hasUploadedCostume");
      }

      // Remove uploaded jack-o-lantern entry
      if (latestJacko && jackoGallery) {
        const entryToRemove = Array.from(jackoGallery.querySelectorAll(".jacko-entry img"))
          .find(img => img.src === latestJacko);
        if (entryToRemove) {
          const wrapper = entryToRemove.closest(".jacko-entry-wrapper");
          index = Array.from(jackoGallery.children).indexOf(wrapper);
          wrapper.remove();
          if (leaderboardList && leaderboardList.children[index]) {
            leaderboardList.children[index].remove();
          }
        }
        if (index >= 0) {
          localStorage.removeItem(`jacko-entry-${index}-voted`);
          localStorage.removeItem(`jacko-entry-${index}-upvotes`);
        }
        localStorage.removeItem("latestJacko");
        localStorage.removeItem("hasUploadedJacko");
      }

      alert("Your uploaded entry has been removed. You can upload a new one now.");
    });
  }

  // ==== Reset Votes Button ====
  const resetVotesButton = document.getElementById("resetVotesButton");

  if (resetVotesButton) {
    resetVotesButton.addEventListener("click", () => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('costume-entry-') || key.startsWith('jacko-entry-')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.removeItem('hasUploadedCostume');
      localStorage.removeItem('hasUploadedJacko');
      localStorage.removeItem('latestCostume');
      localStorage.removeItem('latestJacko');

      alert("All votes and uploaded entries have been reset. You can start fresh!");
      location.reload();
    });
  }

});
