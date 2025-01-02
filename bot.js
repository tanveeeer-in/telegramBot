const TelegramBot = require("node-telegram-bot-api");
const db = require("./src/database.js");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const adminChatId = process.env.ADMIN_CHAT_ID;
console.log("Admin chat ID:", adminChatId);

const authorizedUser = (msg) => {
  const userId = msg.from.id;
  if (!adminChatId.includes(userId)) {
    bot.sendMessage(chatId, "You are not authorized to upload files.");
    return;
  }
};

const handleFileUpload = (msg, fileId, fileName = "File") => {
  const chatId = msg.chat.id;
  authorizedUser(msg);
  console.log(msg);

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
};

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  authorizedUser(msg);
  bot.sendMessage(chatId, "Received your message");
});

// Handle documents
bot.on("document", (msg) => {
  console.log(msg);
  handleFileUpload(msg, msg.document.file_id, msg.document.file_name);
});

// Handle videos
bot.on("video", (msg) => {
  handleFileUpload(msg, msg.video.file_id, msg.video.file_name || "Video");
});

// Handle photos
bot.on("photo", (msg) => {
  const fileId = msg.photo[msg.photo.length - 1].file_id; // Largest resolution
  handleFileUpload(msg, fileId, "Image");
});

bot.onText(/\/getfile_(.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const uniqueId = match[1];

  // Query the database for the file
  db.get(
    `SELECT file_id, file_name FROM files WHERE id = ?`,
    [uniqueId],
    (err, row) => {
      if (err) {
        console.error("Database error:", err);
        bot.sendMessage(
          chatId,
          "An error occurred while retrieving the file. Please try again."
        );
        return;
      }

      if (!row) {
        bot.sendMessage(chatId, "Invalid or expired link.");
        return;
      }

      const { file_id, file_name } = row;

      // Determine the file type based on its metadata
      if (file_name === "Image") {
        // Handle photos
        bot
          .sendPhoto(chatId, file_id, { protect_content: true })
          .catch((err) => {
            console.error("Error sending photo:", err);
            bot.sendMessage(chatId, "Failed to send the photo.");
          });
      } else if (file_name === "Video") {
        // Handle videos
        bot
          .sendVideo(chatId, file_id, { protect_content: true })
          .catch((err) => {
            console.error("Error sending video:", err);
            bot.sendMessage(chatId, "Failed to send the video.");
          });
      } else {
        // Handle documents or other files
        bot
          .sendDocument(chatId, file_id, { protect_content: true })
          .catch((err) => {
            console.error("Error sending document:", err);
            bot.sendMessage(chatId, "Failed to send the document.");
          });
      }
    }
  );
});
