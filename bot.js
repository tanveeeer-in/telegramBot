const TelegramBot = require("node-telegram-bot-api");
const db = require("./src/database.js");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Received your message");
});

bot.on("document", (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.document.file_id;
  const fileName = msg.document.file_name;
  const uniqueId = uuidv4();

  db.run(
    `INSERT INTO files (id, file_id, file_name) VALUES (?, ?, ?)`,
    [uniqueId, fileId, fileName],
    (err) => {
      if (err) {
        console.error("Error saving file to database:", err);
        bot.sendMessage(chatId, "Failed to upload the file. Please try again.");
      } else {
        bot.sendMessage(
          chatId,
          `File uploaded! Your link: /getfile_${uniqueId}`
        );
      }
    }
  );
});

bot.onText(/\/getfile_(.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const fileId = match[1];
  db.get(
    `SELECT file_id, file_name FROM files WHERE id = ?`,
    [fileId],
    (err, row) => {
      if (err || !row) {
        bot.sendMessage(chatId, "Invalid or expired link.");
      } else {
        bot.sendDocument(chatId, row.file_id, { caption: row.file_name });
      }
    }
  );
});
