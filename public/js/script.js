import { createDeck, calculateRankValue } from "./deck.js";

let playerDeck = [];
let botDeck = [];
let playerScore = 0;
let botScore = 0;
let isMiddlePileCleared = true;

// แจกไพ่
function dealCards() {
  const deck = createDeck();
  playerDeck = deck.slice(0, 7);
  botDeck = deck.slice(7, 14);
  updateUI();
}

// แสดงไพ่
function renderCard(card) {
  return `<div
            class="card"
            style="background-image: url('/cards/${card.rank}_${card.suit}.png');"
            data-rank="${card.rank}"
            data-suit="${card.suit}">
          </div>`;
}

// อัปเดต UI
function updateUI() {
  // แสดงไพ่ของผู้เล่น
  document.getElementById("player-cards").innerHTML = playerDeck
    .map(renderCard)
    .join("");

  // แสดงไพ่ของบอทแบบคว่ำ
  document.getElementById("bot-cards").innerHTML = botDeck
    .map(() => `<div class="card hidden-card"></div>`)
    .join("");

  // อัปเดตคะแนน
  document.getElementById("player-score").textContent = playerScore;
  document.getElementById("bot-score").textContent = botScore;
}


// เล่นไพ่
function playTurn(playerCard, botCard) {
  isMiddlePileCleared = false; // ปิดการอนุญาตให้ลงไพ่ใหม่ระหว่างการแสดงผล

  // ลบไพ่ของบอทจาก UI ทันที
  updateUI();

  // แสดงไพ่ของผู้เล่นในกองกลาง (แบบคว่ำหน้า)
  document.getElementById("player-card-middle").innerHTML = `
    <div class="card hidden-card"></div>
  `;

  // หน่วงเวลาให้ดูเหมือนบอทกำลังคิด
  setTimeout(() => {
    // แสดงไพ่ของบอทในกองกลาง (แบบคว่ำหน้า)
    document.getElementById("bot-card-middle").innerHTML = `
      <div class="card hidden-card"></div>
    `;

    setTimeout(() => {
      // หงายไพ่ของผู้เล่น
      document.getElementById("player-card-middle").innerHTML = `
        <div class="card" style="background-image: url('/cards/${playerCard.rank}_${playerCard.suit}.png');"></div>
      `;

      // หงายไพ่ของบอท
      document.getElementById("bot-card-middle").innerHTML = `
        <div class="card" style="background-image: url('/cards/${botCard.rank}_${botCard.suit}.png');"></div>
      `;

      // หน่วงเวลาเพื่อแสดงผลเปรียบเทียบแต้ม
      setTimeout(() => {
        const playerValue = calculateRankValue(playerCard.rank);
        const botValue = calculateRankValue(botCard.rank);

        // เปรียบเทียบแต้ม
        if (playerValue > botValue) {
          playerScore++;
          logAction(`คุณชนะ (${playerCard.rank} vs ${botCard.rank})`, playerCard, botCard);
        } else if (playerValue < botValue) {
          botScore++;
          logAction(`บอทชนะ (${playerCard.rank} vs ${botCard.rank})`, playerCard, botCard);
        } else {
          logAction(`เสมอ (${playerCard.rank} vs ${botCard.rank})`, playerCard, botCard);
        }

        // อัปเดต UI และเคลียร์ไพ่ในกองกลาง
        updateUI();
        setTimeout(() => {
          document.getElementById("player-card-middle").innerHTML = "";
          document.getElementById("bot-card-middle").innerHTML = "";
          isMiddlePileCleared = true; // อนุญาตให้ลงไพ่ใหม่
          checkGameOver();
        }, 1000); // หน่วงเวลา 1 วินาทีก่อนเคลียร์กองกลาง
      }, 1000); // หน่วงเวลา 1 วินาทีก่อนเปรียบเทียบแต้ม
    }, 1000); // หน่วงเวลา 1 วินาทีก่อนหงายไพ่
  }, 1000); // หน่วงเวลา 1 วินาทีก่อนที่บอทจะลงไพ่
}

// ตรวจสอบเกมจบ
function checkGameOver() {
  if (playerDeck.length === 0 || botDeck.length === 0) {
    let winner;
    if (playerScore > botScore) {
      winner = "คุณชนะ!";
    } else if (playerScore < botScore) {
      winner = "บอทชนะ!";
    } else {
      winner = "เกมเสมอ!";
    }

    // แสดงผลใน Modal Popup
    const modal = document.getElementById("game-over-modal");
    const title = document.getElementById("game-over-title");
    const message = document.getElementById("game-over-message");

    title.textContent = winner;
    message.textContent = `คะแนนของคุณ: ${playerScore} | คะแนนของบอท: ${botScore}`;

    // แสดง Modal
    modal.classList.add("show");

    // ปิด Modal เมื่อกดปุ่ม
    document.getElementById("close-modal").addEventListener("click", () => {
      modal.classList.remove("show");
      restartGame();
    });
  }
}

function showNotification(message, duration = 3000) {
  const notification = document.getElementById("notification");

  // ตั้งข้อความ
  notification.textContent = message;

  // แสดงการแจ้งเตือน
  notification.classList.remove("hidden");
  notification.classList.add("show");

  // ซ่อนการแจ้งเตือนหลังจากเวลาที่กำหนด
  setTimeout(() => {
    notification.classList.remove("show");
    notification.classList.add("hidden");
  }, duration);
}

// Log การเล่น
function logAction(message) {
  const log = document.getElementById("log");
  log.innerHTML += `<p>${message}</p>`;
  log.scrollTop = log.scrollHeight;
}

// ผู้เล่นเลือกไพ่
function setupPlayerCardSelection() {
  document.getElementById("player-cards").addEventListener("click", (event) => {
    if (!isMiddlePileCleared) {
      showNotification("กรุณารอจนกว่ากองกลางจะเคลียร์ก่อนลงไพ่ใหม่!", 3000);
      return; // หยุดการทำงานถ้ากองกลางยังไม่ถูกเคลียร์
    }

    const cardElement = event.target.closest(".card");
    if (!cardElement) return;

    const rank = cardElement.dataset.rank;
    const suit = cardElement.dataset.suit;

    const playerCardIndex = playerDeck.findIndex(
      (card) => card.rank === rank && card.suit === suit
    );

    // ลบไพ่จาก playerDeck และอัปเดต UI ทันที
    const playerCard = playerDeck.splice(playerCardIndex, 1)[0];
    updateUI(); // อัปเดต UI เพื่อให้ไพ่หายไปทันที

    // ดึงไพ่ใบแรกของบอท
    const botCard = botDeck.shift();

    // เรียก playTurn เพื่อดำเนินการเปรียบเทียบแต้ม
    playTurn(playerCard, botCard);
  });
}

// เริ่มเกมใหม่
function restartGame() {
  playerScore = 0;
  botScore = 0;
  dealCards();
  setupPlayerCardSelection();
  document.getElementById("bot-card-middle").innerHTML = "";
  document.getElementById("player-card-middle").innerHTML = "";
  document.getElementById("log").textContent = "";
}

// เริ่มเกม
restartGame();
document.getElementById("restart-game").addEventListener("click", restartGame);
