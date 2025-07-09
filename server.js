import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(__dirname, "public")))

const typingUsers = new Set()

io.on('connection', (socket) => {

  if (socket.conn.remoteAdress === "::ffff:10.21.38.43") {socket.disconnect()}
  if (socket.conn.remoteAdress === "::ffff:10.21.38.44") {socket.disconnect()}
  console.log('a user connected');

  io.emit("system_message", {
    content: `${socket.id} connected`
  })

  socket.on("disconnect", () => {
    console.log("a user disconnnected")
    io.emit("system_message",{
      content: `${socket.id} disconnected`
    })
  })

  socket.on("user_message_send", (data) => {
    console.log("message_receved")
    if (data.content.trim() === "") return;
    if (data.content.startsWith("/name")) {
      const newName = data.content.slice(6).trim();
      if (!newName) return;

      socket.username = newName
      return
    }

     io.emit("user_message", {
      content: data.content,
      time: new Date().toLocaleTimeString(),
      author: socket.username ?? socket.id
    })
    
  })

  socket.on("typing_start", () => {
    typingUsers.add(socket.ursname ?? socket.id);
    io.emit("typing", Array.from(typingUsers.values()))
    setTimeout(() => {
      typingUsers.delete(socket.ursname ?? socket.id);
      io.emit("typing", Array.from(typingUsers.values()))
    }, 3000)
  })
});



server.listen({
  port: 3000,
}, () => { 
  console.log('server running at http://localhost:3246');
});

