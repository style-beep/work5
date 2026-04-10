// Получаем canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

// Массив для кругов
let circles = [];

// Создаем аудио контекст
const audio = new (window.AudioContext || window.webkitAudioContext)();

const notes = [
  { name: "До", freq: 261 },
  { name: "Ре", freq: 293 },
  { name: "Ми", freq: 329 },
  { name: "Фа", freq: 349 },
  { name: "Соль", freq: 392 },
  { name: "Ля", freq: 440 },
  { name: "Си", freq: 493 },
];

// Функция для случайной ноты
function getRandomNote() {
  return notes[Math.floor(Math.random() * notes.length)];
}

// Функция для проигрывания звука
function playSound(frequency) {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gain.gain.value = 0.3;

  oscillator.connect(gain);
  gain.connect(audio.destination);

  oscillator.start();
  oscillator.stop(audio.currentTime + 0.3);
}

class Circle {
  constructor(x, y, note) {
    this.x = x;
    this.y = y;
    this.note = note;
    this.size = 10;
    this.maxSize = 100;
    this.opacity = 1;
    this.alive = true;
  }

  update() {
    this.size += 3;
    this.opacity -= 0.02;

    if (this.size >= this.maxSize || this.opacity <= 0) {
      this.alive = false;
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Цвет зависит от ноты
    const colors = [
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "indigo",
      "violet",
    ];
    const colorIndex = notes.findIndex((n) => n.name === this.note.name);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = colors[colorIndex];
    ctx.fill();

    // Рисуем название ноты
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.note.name, this.x, this.y);

    ctx.restore();
  }
}

// Обработчик клика
canvas.addEventListener("click", function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const note = getRandomNote();

  playSound(note.freq);

  circles.push(new Circle(x, y, note));

  if (circles.length > 15) {
    circles.shift();
  }
});

function drawBackground() {
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;

  for (let i = 0; i < canvas.width; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }

  for (let i = 0; i < canvas.height; i += 50) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
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
