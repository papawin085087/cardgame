import { createDeck, calculateRankValue } from "./deck.js";

let playerDeck = [];
let botDeck = [];
let playerScore = 0;
let botScore = 0;

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
  document.getElementById("player-cards").innerHTML = playerDeck
    .map(renderCard)
    .join("");
  document.getElementById("bot-cards").innerHTML = botDeck
    .map(() => `<div class="card hidden-card"></div>`)
    .join("");
  document.getElementById("player-score").textContent = playerScore;
  document.getElementById("bot-score").textContent = botScore;
}

// เล่นไพ่
// เล่นไพ่
function playTurn(playerCard, botCard) {
  const playerValue = calculateRankValue(playerCard.rank);
  const botValue = calculateRankValue(botCard.rank);

  // แสดงไพ่ในกองกลาง
  document.getElementById("bot-card-middle").innerHTML = `
    <div class="card" style="background-image: url('/cards/${botCard.rank}_${botCard.suit}.png');"></div>
  `;
  document.getElementById("player-card-middle").innerHTML = `
    <div class="card" style="background-image: url('/cards/${playerCard.rank}_${playerCard.suit}.png');"></div>
  `;

  // เปรียบเทียบแต้ม
  if (playerValue < botValue) {
    botScore++;
    logAction(`บอทชนะ (${playerCard.rank} vs ${botCard.rank})`);
  } else if (playerValue > botValue) {
    playerScore++;
    logAction(`คุณชนะ (${playerCard.rank} vs ${botCard.rank})`);
  } else {
    logAction(`เสมอ (${playerCard.rank} vs ${botCard.rank})`);
  }

  updateUI();

  // รอ 5000ms เพื่อให้แอนิเมชันแสดงผลไพ่ใบสุดท้ายก่อน
  setTimeout(() => {
    checkGameOver();
  }, 5000);
}

// ตรวจสอบเกมจบ
function checkGameOver() {
  if (playerDeck.length === 0 || botDeck.length === 0) {
    const winner = playerScore > botScore ? "คุณชนะ!" : "บอทชนะ!";
    const message = playerScore > botScore
      ? `คะแนนของคุณ: ${playerScore} คะแนน | คะแนนของบอท: ${botScore} คะแนน`
      : `คะแนนของบอท: ${botScore} คะแนน | คะแนนของคุณ: ${playerScore} คะแนน`;

    // แสดงผลใน Modal Popup
    const modal = document.getElementById("game-over-modal");
    const title = document.getElementById("game-over-title");
    const messageEl = document.getElementById("game-over-message");

    title.textContent = winner;
    messageEl.textContent = message;

    // แสดง Modal
    modal.classList.add("show");

    // ปิด Modal เมื่อกดปุ่ม
    document.getElementById("close-modal").addEventListener("click", () => {
      modal.classList.remove("show");
      restartGame();
    });
  }
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
    const cardElement = event.target.closest(".card");
    if (!cardElement) return;

    const rank = cardElement.dataset.rank;
    const suit = cardElement.dataset.suit;

    const playerCardIndex = playerDeck.findIndex(
      (card) => card.rank === rank && card.suit === suit
    );
    const playerCard = playerDeck.splice(playerCardIndex, 1)[0];
    const botCard = botDeck.shift();

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
