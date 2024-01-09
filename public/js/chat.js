"use strict";
const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("chatbox");
let roomName = document.querySelector(".room-name");
let roomNameDiv = document.querySelector(".room-name-div");
const roomUsers = document.querySelector(".room-users");
const urlParams = new URLSearchParams(window.location.search);
const pseudoUsername = urlParams.get("username");
const joinType = urlParams.get("type");
const room = Number(urlParams.get("roomId"));
const currentURL = window.location.href;
const shareLink = document.querySelector(".bx-share-alt");
const windowWidth = window.innerWidth;
const logOut = document.querySelector(".log-out");
input.focus();
if (windowWidth < 1244) {
  const modal = document.querySelector(".room-users-modal");
  modal.classList.add("hidden");
}

console.log(urlParams);
if (joinType == "create" && pseudoUsername) {
  createChat();
} else if (100000 <= room <= 999999 && pseudoUsername) {
  joinChat();
} else {
  const errorGif = document.querySelector(".error-wrong-link");
  errorGif.classList.remove("hidden");
  console.log("select a valid link");
  closeUserModal();
  document.querySelector("footer").style.display = "none";
  roomNameDiv.style.display = "none";
  shareLink.style.display = "none";
  document.getElementById("go-home-link").href = `${
    currentURL.split("/chat")[0]
  }`;
}
function getTime() {
  const date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12;
  hours = hours ? hours : 12; // Convert midnight (0 hours) to 12

  minutes = minutes < 10 ? "0" + minutes : minutes;

  const timeString = "    " + hours + ":" + minutes + " " + ampm;
  return timeString;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

let i = 1;
socket.on("chat message", (object) => {
  const html = `
<div class="card">
<div class="cardHeader">
<div>${object.nameOfUser}#${
    object.userId
  }<span class="message-time">${getTime()}</span></div>
<p id="copyButton${i}" onclick="copyToClipboard(${i})"><i class='bx bx-copy'></i> copy chat</p>
</div>
<div class="cardContent">
<textarea id="message" class="textarea${i}" readonly>${object.msg}</textarea
>
</div>
</div>`;
  messages.insertAdjacentHTML("beforeend", html);
  const textarea = document.querySelector(`.textarea${i}`);
  adjustTextareaHeight(textarea);
  scrollToBottom();
  i++;
});

socket.on("my chat message", (object) => {
  const html = `
<div  id= "my-card" class="card">

<div class="cardHeader">
<div>${object.nameOfUser}#${
    object.userId
  }<span class="message-time">${getTime()}</span></div>
<p id="copyButton${i}" onclick="copyToClipboard(${i})"><i class='bx bx-copy'></i> copy chat</p>
</div>
<div class="cardContent">
<textarea id="message" class="textarea${i}" readonly>${object.msg}</textarea
>
</div>
</div>`;
  messages.insertAdjacentHTML("beforeend", html);
  const textarea = document.querySelector(`.textarea${i}`);

  adjustTextareaHeight(textarea);
  scrollToBottom();
  i++;
});

function adjustTextareaHeight(textarea) {
  textarea.style.height = ""; // Reset height
  if (textarea.scrollHeight < 290) {
    textarea.style.height = textarea.scrollHeight + 1 + "px";
  } else {
    textarea.style.height = "290px";
  }
}

function scrollToBottom() {
  const container = document.querySelector(".container");
  container.scrollTo({
    top: container.scrollHeight,
    behavior: "smooth", // This will make the scrolling smooth
  });
}

function copyToClipboard(chatNumberi) {
  const textarea = document.querySelector(`.textarea${chatNumberi}`);
  const copied = document.getElementById(`copyButton${chatNumberi}`);
  // Select the text inside the textarea
  textarea.select();

  navigator.clipboard.writeText(textarea.value);
  copied.innerHTML = "✓ copied";
  setTimeout(function () {
    copied.innerHTML = "<i class='bx bx-copy'></i> copy chat";
  }, 1500);
}

function createChat() {
  if (pseudoUsername) {
    socket.emit("create room", { pseudoUsername });
  }
}

function joinChat() {
  if (pseudoUsername && room) {
    socket.emit("join room", { pseudoUsername, room });
    socket.on("welcome msg", (msg) => {
      const chatMessages = document.getElementById("chatbox");
      chatMessages.innerHTML += `<p class="comeIn">${msg}</p>`;
    });
  }
}

socket.on("user joined", (msg) => {
  if (msg) {
    const chatMessages = document.getElementById("chatbox");
    chatMessages.innerHTML += `<p class="comeIn">${msg}</p>`;
    scrollToBottom();
  }
});

socket.on("user left", (msg) => {
  if (msg) {
    const chatMessages = document.getElementById("chatbox");
    chatMessages.innerHTML += `<p class="comeOut">${msg}</p>`;
  }
  scrollToBottom();
});

function closeModalFunction(modalclass) {
  const modal = document.querySelector(`.${modalclass}`);
  if (!modal.classList.contains("hidden")) {
    modal.classList.add("hidden");
  }
  if (!overlay.classList.contains("hidden")) {
    overlay.classList.add("hidden");
  }
}

function openModal(modalclass) {
  const modal = document.querySelector(`.${modalclass}`);
  console.log(modal);
  if (modal.classList.contains("hidden")) {
    modal.classList.remove("hidden");
  }
  if (overlay.classList.contains("hidden")) {
    overlay.classList.remove("hidden");
  }
}
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});
socket.on("num user", (msg) => {
  const usersNumber = document.querySelector(".NumberOfUsers");
  usersNumber.innerHTML = msg;
});
// Add room name to DOM
function outputRoomName(roomId) {
  roomName.innerText = roomId;
}

// Add users to DOM
function outputUsers(users) {
  roomUsers.innerHTML = "";
  users.forEach((user) => {
    if (user.id === socket.id) {
      const html = `<li class="nameplate" 
      id="ownNameplate"
      ><p>${user.username}</p><p class="uniqueId">#${user.uniqueUserId}</p></li>`;
      roomUsers.innerHTML = html + roomUsers.innerHTML;
    } else {
      const html = `<li class="nameplate"
      ><p>${user.username}</p><p class="uniqueId">#${user.uniqueUserId}</p></li>`;
      roomUsers.innerHTML += html;
    }
  });
}

const closeModalBtn = document.querySelector(".close_btn");
const usersImage = document.querySelector(".users-group");
usersImage.addEventListener("click", closeUserModal);
closeModalBtn.addEventListener("click", closeUserModal);
function closeUserModal() {
  const modal = document.querySelector(".room-users-modal");
  modal.classList.toggle("hidden");
}
shareLink.addEventListener("click", function () {
  roomName = document.querySelector(".room-name");
  const text = `${currentURL.split("?")[0]}?username=Guest&roomId=${
    roomName.innerHTML
  }&type=join`;
  copyText(text);
  this.classList.add("flipped");
  setTimeout(function () {
    shareLink.classList.remove("flipped");
  }, 1500);
});
function copyText(text) {
  navigator.clipboard.writeText(text);
}
roomNameDiv.addEventListener("click", function () {
  roomName = document.querySelector(".room-name");
  copyText(roomName.innerHTML);
  document.querySelector(".copy-room-id").innerHTML = "✓";
  setTimeout(function () {
    document.querySelector(".copy-room-id").innerHTML =
      "<i class='bx bxs-copy'></i>";
  }, 1500);
});
logOut.addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../index.html";
  }
});
