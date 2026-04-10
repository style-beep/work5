const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

let circles = [];
const audio = new (window.AudioContext || window.webkitAudioContext)();

const notes = [
  { name: "До", freq: 261, color: "#FF6B6B", x: 0 },
  { name: "Ре", freq: 293, color: "#FF8E53", x: 1 },
  { name: "Ми", freq: 329, color: "#FFD93D", x: 2 },
  { name: "Фа", freq: 349, color: "#6BCB77", x: 3 },
  { name: "Соль", freq: 392, color: "#4D96FF", x: 4 },
  { name: "Ля", freq: 440, color: "#9B59B6", x: 5 },
  { name: "Си", freq: 493, color: "#FF6B9D", x: 6 },
  { name: "До2", freq: 523, color: "#FF4444", x: 7 },
];

function getNoteFromX(x) {
  const keyWidth = canvas.width / notes.length;
  const index = Math.floor(x / keyWidth);
  return notes[Math.min(index, notes.length - 1)];
}

function playSound(freq) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = 0.3;
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.5);
}

class Circle {
  constructor(x, y, note) {
    this.x = x;
    this.y = y;
    this.note = note;
    this.size = 10;
    this.opacity = 1;
    this.alive = true;
  }

  update() {
    this.size += 2;
    this.opacity -= 0.02;
    if (this.size >= 80 || this.opacity <= 0) {
      this.alive = false;
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.note.color;
    ctx.fill();
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.note.name, this.x, this.y);
    ctx.restore();
  }
}

canvas.addEventListener("click", function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const note = getNoteFromX(x);
  playSound(note.freq);
  circles.push(new Circle(x, y, note));
  if (circles.length > 20) {
    circles.shift();
  }
});

function drawBackground() {
  const keyWidth = canvas.width / notes.length;

  for (let i = 0; i < notes.length; i++) {
    const x = i * keyWidth;

    if (i % 2 === 0) {
      ctx.fillStyle = "#2c2c3e";
    } else {
      ctx.fillStyle = "#1a1a2e";
    }
    ctx.fillRect(x, 0, keyWidth, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, 0, keyWidth, canvas.height);

    ctx.fillStyle = notes[i].color;
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(notes[i].name, x + keyWidth / 2, 50);

    ctx.font = "12px Arial";
    ctx.fillStyle = "#aaa";
    ctx.fillText(notes[i].freq + "Hz", x + keyWidth / 2, 80);
  }

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("🎹 Нажми на любую клавишу", 20, canvas.height - 20);
}

function animate() {
  drawBackground();
  for (let i = 0; i < circles.length; i++) {
    circles[i].update();
    circles[i].draw();
    if (!circles[i].alive) {
      circles.splice(i, 1);
      i--;
    }
  }
  requestAnimationFrame(animate);
}

animate();

document.body.addEventListener(
  "click",
  function () {
    if (audio.state === "suspended") {
      audio.resume();
    }
  },
  { once: true },
);
