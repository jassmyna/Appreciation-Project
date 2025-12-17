// ----------------------- VARIABILE GENERALE -----------------------
let currentRoom = 0;
let gameStarted = false;
let rewardCollected = false;

const rooms = [
  "room1.png",
  "room2.png",
  "room3.png",
  "room4.png",
  "room5.png",
  "room6.png"
];

// ----------------------- SCRISORI INCHISE -----------------------
const letterButtons = [
  document.getElementById("ScrInch1"),
  document.getElementById("ScrInch2"),
  document.getElementById("ScrInch3"),
  document.getElementById("ScrInch4"),
  document.getElementById("ScrInch5")
];

// ascunde toate scrisorile
function hideAllLetters() {
  letterButtons.forEach(btn => {
    btn.style.display = "none";
    btn.style.pointerEvents = "none";
  });
}

// ----------------------- CHARACTERE + OCHELARI -----------------------
const character = document.getElementById("character");
const bg1 = document.getElementById("bg1");

const glasses = document.createElement("div");
glasses.id = "glasses";
glasses.style.position = "absolute";
glasses.style.zIndex = "1000";
glasses.style.width = "100px";
glasses.style.height = "40px";
glasses.style.backgroundImage = "url('ochelariMagici.png')";
glasses.style.backgroundSize = "cover";
glasses.style.backgroundPosition = "center";
glasses.style.pointerEvents = "none";
glasses.style.display = "none";
document.getElementById("game").appendChild(glasses);

// Offsets pentru ochelari
const glassesOffsetX = -12; // cât să se miște la stânga când character e întors la stânga
const glassesOffsetY = 50;  // cât să fie de sus față de caracter

// Direcția personajului
let facingRight = false; // false = left, true = right

// ----------------------- SUNETE -----------------------
const uiClick = document.getElementById("uiClick");
const uiHover = document.getElementById("uiHover");
const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.4;
bgMusic.loop = true;

// ----------------------- OVERLAY CAMERA -----------------------
const bg2 = document.createElement("div");
bg2.style.position = "absolute";
bg2.style.top = 0;
bg2.style.left = 0;
bg2.style.width = "100%";
bg2.style.height = "100%";
bg2.style.backgroundSize = "cover";
bg2.style.backgroundPosition = "center";
bg2.style.opacity = 0;
bg2.style.transition = "opacity 0.3s ease";
bg2.style.zIndex = "2";
document.getElementById("game").appendChild(bg2);

// ----------------------- SKINS -----------------------
const skins = [
  "mini-paul2.png",
  "mini-paul.png",
  "mini-paul3.png",
  "mini-paul4.png"
];

let savedSkin = localStorage.getItem("selectedSkin");
let currentSkin = savedSkin ? parseInt(savedSkin) : 0;

// preload images
rooms.forEach(r => { const i = new Image(); i.src = r; });
skins.forEach(s => { const i = new Image(); i.src = s; });

// set initial images
character.style.backgroundImage = `url(${skins[currentSkin]})`;
bg1.style.backgroundImage = `url(${rooms[0]})`;

// ----------------------- FIZICA -----------------------
let x = 0;
let groundOffset = window.innerHeight * 0.05;
let groundY = window.innerHeight - groundOffset;
let y = groundY;

let velocityX = 0;
let velocityY = 0;
const speed = 7;
const jumpPower = 18;
const gravity = 0.9;
let onGround = true;
let isTransitioning = false;
let isCustomizing = false;

// ----------------------- CAMERA CHANGE -----------------------
function changeRoom(direction) {
  if (isTransitioning) return;
  isTransitioning = true;

  let nextRoom = currentRoom;
  if (direction === "right" && currentRoom < rooms.length - 1) nextRoom++;
  if (direction === "left" && currentRoom > 0) nextRoom--;

  // Scrisorile intră în fade împreună cu bg2
  letterButtons.forEach(btn => {
    btn.style.transition = "opacity 0.3s ease, z-index 0s linear 0.3s";
    btn.style.opacity = 0;
    btn.style.zIndex = 2; // temporar sub bg2
  });

  // Setăm bg2
  bg2.style.backgroundImage = `url(${rooms[nextRoom]})`;
  bg2.style.opacity = 1;

  setTimeout(() => {
    // Schimbăm bg1
    bg1.style.backgroundImage = `url(${rooms[nextRoom]})`;
    bg2.style.opacity = 0;
    currentRoom = nextRoom;

    // Actualizăm scrisorile pentru camera curentă
    updateLettersForRoom(currentRoom);

    // Revenim scrisorile la z-index normal și fade-in
    letterButtons.forEach(btn => {
      btn.style.zIndex = 100;  // revenim la normal
      btn.style.opacity = 1;
    });

    if (direction === "right") x = 0;
    if (direction === "left") x = window.innerWidth - character.offsetWidth;

    isTransitioning = false;
  }, 300);
}

// ----------------------- GAME LOOP -----------------------
const lDiv = document.getElementById("-l");

function update() {
  if (!gameStarted || isCustomizing) {
    requestAnimationFrame(update);
    return;
  }

  velocityY += gravity;
  y += velocityY;

  if (y > groundY) {
    y = groundY;
    velocityY = 0;
    onGround = true;
  }

  x += velocityX;

  if (!isTransitioning) {
    if (x > window.innerWidth - 5) changeRoom("right");
    if (x < 0) changeRoom("left");
  }

  character.style.left = x + "px";
  character.style.top = (y - character.offsetHeight) + "px";

  // poziționăm ochelarii pe fața caracterului doar dacă sunt vizibili
  if (rewardCollected) {
    glasses.style.display = "block";

    // offset-ul se inversează dacă personajul privește dreapta
    let offsetX = facingRight ? -glassesOffsetX : glassesOffsetX;

    glasses.style.left =
      (x + character.offsetWidth / 2 - glasses.offsetWidth / 2 + offsetX) + "px";
    glasses.style.top =
      (y - character.offsetHeight + glassesOffsetY) + "px";

    // oglindire pentru direcția corectă
    glasses.style.transform = facingRight ? "scaleX(-1)" : "scaleX(1)";
  }

  lDiv.textContent = `x: ${Math.round(x)}, y: ${Math.round(y)}`;
  requestAnimationFrame(update);
}

update();

// ----------------------- CONTROALE -----------------------
document.addEventListener("keydown", e => {
  if (!gameStarted || isCustomizing) return;

  if (e.key === "ArrowRight") {
    velocityX = speed;
    character.style.transform = "scaleX(-1)";
    facingRight = true;
  }
  if (e.key === "ArrowLeft") {
    velocityX = -speed;
    character.style.transform = "scaleX(1)";
    facingRight = false;
  }
  if ((e.key === " " || e.key === "ArrowUp") && onGround) {
    velocityY = -jumpPower;
    onGround = false;
  }
});

document.addEventListener("keyup", e => {
  if (!gameStarted || isCustomizing) return;

  if ((e.key === "ArrowRight" && velocityX > 0) ||
      (e.key === "ArrowLeft" && velocityX < 0)) {
    velocityX = 0;
  }
});

// ----------------------- RESIZE -----------------------
window.addEventListener("resize", () => {
  groundOffset = window.innerHeight * 0.05;
  groundY = window.innerHeight - groundOffset;
  if (y > groundY) y = groundY;
});

// ----------------------- CUSTOMIZER -----------------------
const customOpenBtn = document.getElementById("openCustomizer");
const closeBtn = document.getElementById("closeCustomizer");
const overlay = document.getElementById("customizerOverlay");
const panel = document.getElementById("customizerPanel");
const prevBtn = document.getElementById("prevSkin");
const nextBtn = document.getElementById("nextSkin");
const preview = document.getElementById("skinPreview");

function updateSkin() {
  character.style.backgroundImage = `url(${skins[currentSkin]})`;
  preview.style.backgroundImage = `url(${skins[currentSkin]})`;
  localStorage.setItem("selectedSkin", currentSkin);
}

customOpenBtn.addEventListener("click", () => {
  uiClick.currentTime = 0;
  uiClick.play();
  overlay.style.display = "block";
  panel.style.display = "block";
  requestAnimationFrame(() => {
    overlay.classList.add("show");
    panel.classList.add("show");
  });
  isCustomizing = true;
  velocityX = 0;
});

closeBtn.addEventListener("click", () => {
  uiClick.currentTime = 0;
  uiClick.play();
  overlay.classList.remove("show");
  panel.classList.remove("show");
  setTimeout(() => {
    overlay.style.display = "none";
    panel.style.display = "none";
  }, 350);
  isCustomizing = false;
});

prevBtn.addEventListener("click", () => {
  uiClick.currentTime = 0;
  uiClick.play();
  currentSkin = (currentSkin - 1 + skins.length) % skins.length;
  updateSkin();
});

nextBtn.addEventListener("click", () => {
  uiClick.currentTime = 0;
  uiClick.play();
  currentSkin = (currentSkin + 1) % skins.length;
  updateSkin();
});

[customOpenBtn, prevBtn, nextBtn, closeBtn].forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    uiHover.currentTime = 0;
    uiHover.play();
  });
});

updateSkin();

// ----------------------- WELCOME SCREEN -----------------------
const startGameBtn = document.getElementById("startGameBtn");
const welcomeOverlay = document.getElementById("welcomeOverlay");

startGameBtn.addEventListener("click", () => {  
  uiClick.currentTime = 0;
  uiClick.play();

  welcomeOverlay.style.display = "none";
  customOpenBtn.style.display = "block";

  bgMusic.play().catch(() => console.log("Muzica va porni la prima interacțiune"));
  gameStarted = true;

  updateLettersForRoom(currentRoom);
});

// ================= REWARD SYSTEM =================
const rewardOverlay = document.getElementById("rewardOverlay");
const closeReward = document.getElementById("closeReward");

let rewardShown = false;

function openReward() {
  isCustomizing = true;
  velocityX = 0;

  rewardOverlay.classList.remove("show");
  rewardOverlay.offsetHeight;
  rewardOverlay.classList.add("show");
}

function closeRewardBox() {
  rewardOverlay.classList.remove("show");

  setTimeout(() => {
    isCustomizing = false;
    rewardCollected = true; // reward luat
    updateLettersForRoom(currentRoom);
  }, 450);
}

// Tasta O → doar în camera 6
document.addEventListener("keydown", (e) => {
  if (!gameStarted) return;

  if (e.key.toLowerCase() === "o" && currentRoom === 5 && !rewardShown) {
    rewardShown = true;
    openReward();
  }

  if (e.key === "Escape" && rewardOverlay.classList.contains("show")) {
    closeRewardBox();
  }
});

// CLOSE cu X
closeReward.addEventListener("click", closeRewardBox);

// CLOSE click pe fundal
rewardOverlay.addEventListener("click", (e) => {
  if (e.target === rewardOverlay) {
    closeRewardBox();
  }
});

// ----------------------- SCRISORI -----------------------
const butoane = document.querySelectorAll(".butonScrisori");
const modal = document.getElementById("scrisoareModal");
const imagine = document.getElementById("scrisoareImagine");
const inchide = document.getElementById("inchideScrisoare");

const scrisori = {
  ScrInch1: "ScrisoareDechisa1.png",
  ScrInch2: "ScrisoareDechisa2.png",
  ScrInch3: "ScrisoareDechisa3.png",
  ScrInch4: "ScrisoareDechisa4.png",
  ScrInch5: "ScrisoareDechisa5.png"
};

butoane.forEach(buton => {
  buton.addEventListener("click", () => {
    imagine.src = scrisori[buton.id];
    modal.style.display = "flex";
  });
});

inchide.addEventListener("click", () => {
  modal.style.display = "none";
  imagine.src = "";
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    imagine.src = "";
  }
});

// ----------------------- UPDATE LETTERS -----------------------
function updateLettersForRoom(roomIndex) {
  hideAllLetters();
  if (!rewardCollected) return; // nu afișăm scrisorile până nu e reward-ul luat

  if (roomIndex >= 1 && roomIndex <= 5) {
    const btn = letterButtons[roomIndex - 1];
    btn.style.display = "block";
    btn.style.pointerEvents = "auto";
    btn.style.transform = "translate(-50%, -110%)";
    if (roomIndex === 4) btn.style.transform = "translate(180%, -130%)";
    if (roomIndex === 5) btn.style.transform = "translate(-200%, -110%)";
  }
}
