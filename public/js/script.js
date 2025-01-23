import { createDeck, calculateRankValue } from "./deck.js";
import { drawCard } from "./deck.js";

let playerDeck = [];
let botDeck = [];
let playerScore = 0;
let botScore = 0;
let isMiddlePileCleared = true;
let lastNotification = ""; // ข้อความแจ้งเตือนล่าสุด
let deck = []; // สำรับกลางสำหรับจั่วไพ่


// แจกไพ่
function dealCards() {
  deck = createDeck();
  playerDeck = deck.splice(0, 7);
  botDeck = deck.splice(0, 7);
  updateUI();
}

function dealCardsWithAnimation() {
  const deckElement = document.getElementById("deck");
  const playerCardsElement = document.getElementById("player-cards");
  const botCardsElement = document.getElementById("bot-cards");

  for (let i = 0; i < 14; i++) {
    setTimeout(() => {
      const fakeCard = document.createElement("div");
      fakeCard.className = "card dealing hidden-card"; // ใช้คลาสสำหรับไพ่แจก

      // กำหนดตำแหน่งเป้าหมาย
      const targetElement =
        i % 2 === 0 ? playerCardsElement : botCardsElement;
      const targetRect = targetElement.getBoundingClientRect();
      const deckRect = deckElement.getBoundingClientRect();

      // คำนวณการเคลื่อนที่
      fakeCard.style.setProperty(
        "--move-x",
        `${targetRect.left - deckRect.left}px`
      );
      fakeCard.style.setProperty(
        "--move-y",
        `${targetRect.top - deckRect.top}px`
      );

      // เพิ่มไพ่ลงในสำรับ
      deckElement.appendChild(fakeCard);

      // ลบไพ่แจกหลังจากแอนิเมชันเสร็จ
      setTimeout(() => {
        fakeCard.remove();
      }, 500);
    }, i * 200); // หน่วงเวลาแจกไพ่แต่ละใบ
  }
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
  logAction("ฝ่ายตรงข้ามกำลังเลือกไพ่...", "info");

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
          logAction(`คุณชนะ (${playerCard.rank} vs ${botCard.rank})`, "success");
        } else if (playerValue < botValue) {
          botScore++;
          logAction(`บอทชนะ (${playerCard.rank} vs ${botCard.rank})`, "error");
        } else {
          // กรณีแต้มเท่ากัน
          logAction(`เสมอ (${playerCard.rank} vs ${botCard.rank}) จั่วไพ่เพิ่ม`, "info");

          // จั่วไพ่เพิ่มให้ทั้งสองฝ่าย
          const newPlayerCard = drawCard(deck);
          const newBotCard = drawCard(deck);

          if (newPlayerCard) {
            playerDeck.push(newPlayerCard);
            logAction(`คุณจั่วไพ่เพิ่ม: ${newPlayerCard.rank} of ${newPlayerCard.suit}`, "info");
          } else {
            logAction("สำรับหมด ไม่มีไพ่ให้จั่ว!", "error");
          }

          if (newBotCard) {
            botDeck.push(newBotCard);
          }
        }

        // อัปเดต UI และเคลียร์ไพ่ในกองกลาง
        updateUI();
        logAction("คุณสามารถลงไพ่ได้แล้ว!", "success");
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

function showNotification(message, type = "info", duration = 3000) {
  const container = document.getElementById("notifications-container");
  if (message === lastNotification) return;
  lastNotification = message;

  // สร้างองค์ประกอบการแจ้งเตือน
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // เพิ่มการแจ้งเตือนใน container
  container.appendChild(notification);

  // ลบการแจ้งเตือนหลังจากเวลาที่กำหนด
  setTimeout(() => {
    notification.remove();
  }, duration);
}


// Log การเล่น
function logAction(message, type = "info") {
  // เรียก showNotification เพื่อแสดงข้อความ
  showNotification(message, type);
}



// ผู้เล่นเลือกไพ่
function setupPlayerCardSelection() {
  const playerCardsElement = document.getElementById("player-cards");

  // ลบ Event Listener เก่าถ้ามี
  const newElement = playerCardsElement.cloneNode(true); // Clone เพื่อเริ่มใหม่
  playerCardsElement.parentNode.replaceChild(newElement, playerCardsElement);

  // เพิ่ม Event Listener ใหม่
  newElement.addEventListener("click", (event) => {
    if (!isMiddlePileCleared) {
      showNotification("กรุณารอจนกว่ากองกลางจะเคลียร์ก่อนลงไพ่ใหม่!", "error");
      return;
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
  logAction("คุณสามารถเลือกไพ่จากมือของคุณได้!", "info");
}

// เริ่มเกมใหม่
function restartGame() {
  playerScore = 0;
  botScore = 0;
  playerDeck = [];
  botDeck = [];
  deck = createDeck(); // สร้างสำรับใหม่

  document.getElementById("player-cards").innerHTML = "";
  document.getElementById("bot-cards").innerHTML = "";
  document.getElementById("player-card-middle").innerHTML = "";
  document.getElementById("bot-card-middle").innerHTML = "";

  // อนิเมชันแจกไพ่
  dealCardsWithAnimation();

  // แจกไพ่จริงหลังจากอนิเมชันเสร็จ
  setTimeout(() => {
    dealCards();
    setupPlayerCardSelection();
  }, 3000); // รอ 3 วินาทีให้อนิเมชันเสร็จ
}


// เริ่มเกม
restartGame();
