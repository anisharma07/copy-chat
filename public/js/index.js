"use strict";
const input = document.getElementById("input");
const messages = document.getElementById("chatbox");
const overlay = document.querySelector(".overlay");
const myBtn = document.querySelector(".buttons");

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

  if (modalclass == "create-modal") {
    const createInputUsername = document.getElementById("usernameInput");
    createInputUsername.setSelectionRange(
      createInputUsername.value.length,
      createInputUsername.value.length
    );
    createInputUsername.focus();
  }
  if (modalclass == "join-modal") {
    const joinInputUsername = document.getElementById("joinUserNameInput");
    joinInputUsername.setSelectionRange(
      joinInputUsername.value.length,
      joinInputUsername.value.length
    );
    joinInputUsername.focus();
  }
}
