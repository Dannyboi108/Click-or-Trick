document.querySelectorAll('.image-container').forEach(container => {
  let fireworkInterval;

  container.addEventListener('mouseenter', () => {
    fireworkInterval = setInterval(() => createFirework(container), 150); // continuous bursts
  });

  container.addEventListener('mouseleave', () => {
    clearInterval(fireworkInterval);
  });
});

function createFirework(container) {
  const firework = document.createElement('div');
  firework.classList.add('firework');

  // Random direction & distance
  const angle = Math.random() * 2 * Math.PI;
  const distance = 80 + Math.random() * 40;
  const x = Math.cos(angle) * distance + 'px';
  const y = Math.sin(angle) * distance + 'px';
  firework.style.setProperty('--x', x);
  firework.style.setProperty('--y', y);

  // Random starting position inside the container
  firework.style.left = `${Math.random() * container.clientWidth}px`;
  firework.style.top = `${Math.random() * container.clientHeight}px`;

  // Random color hue
  const hue = Math.floor(Math.random() * 360);
  firework.style.background = `radial-gradient(circle, hsl(${hue}, 100%, 80%), hsl(${hue}, 100%, 50%), transparent)`;

  container.appendChild(firework);

  // Remove after animation completes
  setTimeout(() => firework.remove(), 1000);
}
