const express = require("express");
const path = require("path");
const { createServer } = require("node:http");
const { join } = require("node:path");
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

// Function to generate a room ID
let arr = [];
function getUniqueRoomId() {
  const randomId = Math.floor(100000 + Math.random() * 900000);
  if (arr.every((id) => id !== randomId)) {
    arr.push(randomId);
    return randomId;
  } else {
    return getUniqueRoomId();
  }
}
let usernameIDs = [];
function getUniqueUsername(roomId) {
  const randomId = Math.floor(100 + Math.random() * 900);
  const uniqueRoomIds = usernameIDs.filter((id) => id.rooms === roomId);
  if (uniqueRoomIds.every((id) => id.uniqueHash !== randomId)) {
    usernameIDs.push({ rooms: roomId, uniqueHash: randomId });
    return randomId;
  } else {
    return getUniqueUsername(roomId);
  }
}

const users = [];
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

// Join user to chat
function userJoin(id, username, room, uniqueUserId) {
  const user = { id, username, room, uniqueUserId };
  users.push(user);
  return user;
}
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);
  const curUser = getCurrentUser(id);
  const i = usernameIDs.findIndex(
    (uId) =>
      uId.rooms === curUser.room && uId.uniqueHash === curUser.uniqueUserId
  );
  if (index !== -1) {
    usernameIDs.splice(i, 1);
    return users.splice(index, 1)[0];
  }
}

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    const user = getCurrentUser(socket.id);
    const nameOfUser = user.username;
    const userId = user.uniqueUserId;
    socket.emit("my chat message", { msg, nameOfUser, userId });
    socket.broadcast
      .to(user.room)
      .emit("chat message", { msg, nameOfUser, userId });
  });

  socket.on("create room", ({ pseudoUsername }) => {
    const roomId = getUniqueRoomId();
    const playerId = getUniqueUsername(roomId);
    const user = userJoin(socket.id, pseudoUsername, roomId, playerId);
    socket.join(roomId);

    io.to(roomId).emit("user joined", `~ room created with Id: ${roomId}`);

    console.log(users, arr, usernameIDs);
    // Send users and room info
    io.to(roomId).emit("roomUsers", {
      room: roomId,
      users: getRoomUsers(roomId),
    });
  });

  socket.on("join room", ({ pseudoUsername, room }) => {
    const playerId = getUniqueUsername(room);
    const user = userJoin(socket.id, pseudoUsername, room, playerId);
    const roomId = user.room;
    const noOfUser = users.reduce(
      (acc, arrUser) => (arrUser.room == user.room ? acc + 1 : acc),
      0
    );
    socket.join(roomId);

    // Broadcast when a user connects
    console.log(users, arr, usernameIDs);
    socket.broadcast
      .to(roomId)
      .emit("user joined", `~ ${pseudoUsername}#${playerId} joined the chat`);

    io.to(roomId).emit("num user", noOfUser);

    socket.emit("welcome msg", "Welcome to the chat");
    // Send users and room info
    io.to(roomId).emit("roomUsers", {
      room: roomId,
      users: getRoomUsers(roomId),
    });
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      console.log("user-left");
      const noOfUser = users.reduce(
        (acc, arrUser) => (arrUser.room == user.room ? acc + 1 : acc),
        0
      );
      io.to(user.room).emit(
        "user left",
        `${user.username}#${user.uniqueUserId} has left the chat`
      );
      io.to(user.room).emit("num user", noOfUser);
      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
    if (users.every((person) => person.room !== user.room)) {
      arr.splice(
        arr.findIndex((arr) => arr === user.room),
        1
      );
    }
  });
});

server.listen(PORT, () => {
  console.log("server running at PORT: " + PORT);
});
