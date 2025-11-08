/***********************************
 * Trick-or-Click Script (with Firebase)
 ***********************************/

// ==== Firebase Setup ====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, increment 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWRMlmO6AAh5lS5eVeNK21Gzlh5T65mPU",
  authDomain: "trick-or-click.firebaseapp.com",
  projectId: "trick-or-click",
  storageBucket: "trick-or-click.firebasestorage.app",
  messagingSenderId: "635082924569",
  appId: "1:635082569:web:57717329d9dec077340088",
  measurementId: "G-7R9G95B9JN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


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
  fileUpload.addEventListener("change", async function(event) {
    const category = categorySelect.value;
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
      const imageData = e.target.result;
      const storageKey = category === "costume" ? "latestCostume" : "latestJacko";
      const uploadedFlag = category === "costume" ? "hasUploadedCostume" : "hasUploadedJacko";

      if (localStorage.getItem(uploadedFlag)) {
        alert("You have already uploaded one entry in this category.");
        event.target.value = "";
        return;
      }

      // Save locally
      localStorage.setItem(storageKey, imageData);
      localStorage.setItem(uploadedFlag, "true");

      // Determine gallery and next index
      const gallery = category === "costume" ? document.querySelector(".costume-gallery") : document.querySelector(".jacko-gallery");
      if (!gallery) return;

      const index = gallery.children.length;
      const docRef = doc(db, "entries", `${category}-entry-${index}`);

      // Create Firestore document with initial votes
      await setDoc(docRef, { upvotes: 0, downvotes: 0 });

      // Add entry to gallery and attach vote listeners
      await addEntry(gallery, imageData, "User Entry", category);

      alert("Your entry was uploaded! Check the gallery to vote.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  });
}


// ==== Gallery Handling ====
document.addEventListener("DOMContentLoaded", async function() {
  const costumeGallery = document.querySelector(".costume-gallery");
  const jackoGallery = document.querySelector(".jacko-gallery");
  const leaderboardList = document.getElementById("leaderboardList");

  async function addEntry(gallery, imgSrc, altText = "User Entry", galleryType = "general") {
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

    // Ensure Firestore document exists
    const docRef = doc(db, "entries", `${galleryType}-entry-${entryIndex}`);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, { upvotes: 0, downvotes: 0 });
    }

    attachVoteListeners(newEntry, entryIndex, galleryType);

    if (leaderboardList) {
      const newItem = document.createElement("li");
      newItem.textContent = `Nominee ${entryIndex + 1} – Upvotes : 0, Downvotes : 0`;
      leaderboardList.appendChild(newItem);
    }
  }

  // Load previous uploads
  const latestCostume = localStorage.getItem("latestCostume");
  if (latestCostume && costumeGallery) await addEntry(costumeGallery, latestCostume, "User Costume", "costume");

  const latestJacko = localStorage.getItem("latestJacko");
  if (latestJacko && jackoGallery) await addEntry(jackoGallery, latestJacko, "User Jack-O-Lantern", "jacko");

  // ==== Voting functionality ====
  async function attachVoteListeners(entryWrapper, index, galleryType = "general") {
    const upvoteBtn = entryWrapper.querySelector(".upvote");
    const downvoteBtn = entryWrapper.querySelector(".downvote");
    const docRef = doc(db, "entries", `${galleryType}-entry-${index}`);
    const voteKey = `${galleryType}-entry-${index}-voted`;
    let hasVoted = localStorage.getItem(voteKey) === "true";

    if (hasVoted) upvoteBtn.disabled = true;

    const snap = await getDoc(docRef);
    let upvotes = snap.exists() ? snap.data().upvotes || 0 : 0;
    let downvotes = snap.exists() ? snap.data().downvotes || 0 : 0;

    function updateLeaderboard() {
      if (leaderboardList && leaderboardList.children[index]) {
        leaderboardList.children[index].textContent =
          `Nominee ${index + 1} – Upvotes : ${upvotes}, Downvotes : ${downvotes}`;
      }
    }

    updateLeaderboard();

    // Upvote
    upvoteBtn.addEventListener("click", async () => {
      if (hasVoted) return;
      await updateDoc(docRef, { upvotes: increment(1) });
      upvotes++;
      localStorage.setItem(voteKey, "true");
      hasVoted = true;
      upvoteBtn.disabled = true;
      updateLeaderboard();
    });

    // Downvote
    downvoteBtn.addEventListener("click", async () => {
      await updateDoc(docRef, { downvotes: increment(1) });
      downvotes++;
      updateLeaderboard();
      window.location.href = "play.html";
    });
  }

  // Attach to existing entries in case DOM already has multiple
  document.querySelectorAll(".costume-entry-wrapper").forEach((entry, index) => {
    attachVoteListeners(entry, index, "costume");
  });
  document.querySelectorAll(".jacko-entry-wrapper").forEach((entry, index) => {
    attachVoteListeners(entry, index, "jacko");
  });

  // ==== Reset Votes Button ====
  const resetVotesButton = document.getElementById("resetVotesButton");
  if (resetVotesButton) {
    resetVotesButton.addEventListener("click", async () => {
      if (!confirm("Reset ALL votes (this will set all upvotes/downvotes to 0 in Firestore)?")) return;

      resetVotesButton.disabled = true;
      resetVotesButton.textContent = "Resetting...";

      try {
        // Clear localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('costume-entry-') || key.startsWith('jacko-entry-')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.removeItem('hasUploadedCostume');
        localStorage.removeItem('hasUploadedJacko');
        localStorage.removeItem('latestCostume');
        localStorage.removeItem('latestJacko');

        // Reset Firestore votes
        const resetDocs = [];
        const costumeCount = document.querySelectorAll(".costume-entry-wrapper").length;
        const jackoCount = document.querySelectorAll(".jacko-entry-wrapper").length;

        for (let i = 0; i < costumeCount; i++) resetDocs.push(doc(db, "entries", `costume-entry-${i}`));
        for (let i = 0; i < jackoCount; i++) resetDocs.push(doc(db, "entries", `jacko-entry-${i}`));

        await Promise.all(resetDocs.map(dref => setDoc(dref, { upvotes: 0, downvotes: 0 }, { merge: true })));

        alert("All votes and uploads reset (Firestore + local).");
        location.reload();
      } catch (err) {
        console.error("Reset error:", err);
        alert("Something went wrong while resetting votes. Check console.");
        resetVotesButton.disabled = false;
        resetVotesButton.textContent = "Reset Votes";
      }
    });
  }
});
