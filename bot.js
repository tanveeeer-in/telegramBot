const TelegramBot = require("node-telegram-bot-api");
const db = require("./src/database.js");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const adminChatId = process.env.ADMIN_CHAT_ID;
console.log("Admin chat ID:", adminChatId);

const channelChatId = "@Demon_Slayer_season_1_2_3_4_anim";

const authorizedUser = (msg) => {
  const userId = msg.from.id;
  if (!adminChatId.includes(userId)) {
    bot.sendMessage(msg.chat.id, "You are not authorized to upload files.");
    return false;
  }
  return true;
};

const handleFileUpload = (msg, fileId, fileName = "File") => {
  const chatId = msg.chat.id;
  // Check if the user is authorized
  if (authorizedUser(msg)) return;
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
  //   const chatId = msg.chat.id;
  //   if (authorizedUser(msg)) {
  //     bot.sendMessage(chatId, "Received your message");
  //   }
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

bot.on("polling_error", (error) => {
  console.error("Polling Error:", error);
});

bot.onText(/\/getfile_(.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const uniqueId = match[1];
  bot
    .getChatMember(channelChatId, msg.from.id)
    .then((data) => {
      console.log("User data:", data);
      if (
        data.status === "member" ||
        data.status === "administrator" ||
        data.status === "creator"
      ) {
        console.log("User is a member of the channel");
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
              // Handle photos.
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
      } else {
        bot.sendMessage(
          chatId,
          "You need to join the channel to access the file. Please join the channel and try again. channel link.",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Join Channel",
                    url: "https://t.me/Demon_Slayer_season_1_2_3_4_anim",
                  },
                ],
                [
                  {
                    text: "Try Again",
                    callback_data: `retry_getfile_${uniqueId}`,
                  },
                ],
              ],
            },
          }
        );
      }
    })
    .catch((err) => {
      console.error("Error checking user membership:", err);
      bot.sendMessage(
        chatId,
        "An error occurred while checking your membership. Please try again."
      );
    });
  // Query the database for the file
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith("retry_getfile_")) {
    const uniqueId = data.split("_")[2];

    bot.getChatMember(channelChatId, query.from.id).then((data) => {
      if (
        data.status === "member" ||
        data.status === "administrator" ||
        data.status === "creator"
      ) {
        console.log("User is a member of the channel");
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
      } else {
        bot.sendMessage(
          chatId,
          "You need to join the channel to access the file. Please join the channel and try again. channel link.",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Join Channel",
                    url: "https://t.me/Demon_Slayer_season_1_2_3_4_anim",
                  },
                ],
                [
                  {
                    text: "Try Again",
                    callback_data: `retry_getfile_${uniqueId}`,
                  },
                ],
              ],
            },
          }
        );
      }
    });
  }

  bot.answerCallbackQuery(query.id);
});

bot.onText(/\/listfiles/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!adminChatId.includes(userId)) {
    bot.sendMessage(chatId, "You are not authorized to view the files.");
    return;
  }

  db.all(`SELECT * FROM files`, [], (err, rows) => {
    if (err) {
      console.log("Error fetching files:", err);
      bot.sendMessage(chatId, "An error occurred while fetching the files.");
      return;
    }

    if (rows.length === 0) {
      bot.sendMessage(chatId, "No files found.");
      return;
    }

    const inlineKeyboard = rows.map((row) => [
      {
        text: `Delete: ${row.file_name}`,
        callback_data: `delete_${row.id}`,
      },
    ]);
    bot.sendMessage(chatId, "Here are the files:", {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  });
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  const fileId = data.split("_")[1];
  if (data.startsWith("delete_")) {
    bot.sendMessage(chatId, "Are you sure you want to delete this file?", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Yes",
              callback_data: `confirm_delete_${fileId}`,
            },
            {
              text: "No",
              callback_data: "cancel_delete",
            },
          ],
        ],
      },
    });
  } else if (data.startsWith("confirm_delete_")) {
    db.run(`DELETE FROM files WHERE id = ?`, [fileId], (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        bot.sendMessage(chatId, "An error occurred while deleting the file.");
        return;
      }
      if (this.changes === 0) {
        bot.sendMessage(chatId, "No files found.");
        return;
      } else {
        bot.sendMessage(chatId, "File deleted successfully.");
      }
    });
  } else if (data === "cancel_delete") {
    bot.sendMessage(chatId, "Deletion cancelled.");
  }

  bot.answerCallbackQuery(query.id);
});

bot.on(/\/deletefile (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (userId.toString() !== adminChatId) {
    bot.sendMessage(chatId, "You are not authorized to delete files.");
    return;
  }
  const query = match[1].trim();

  const isId = /^[0-9a-fA-F-]{36}$/.test(query);

  const column = isId ? "id" : "file_name";

  const sql = isId
    ? `SELECT * FROM files WHERE ${column} = ?`
    : `SELECT * FROM files WHERE LOWER(${column}) LIKE LOWER(?)`;

  const param = isId ? query : `%${query}%`;

  db.all(sql, [param], function (err, rows) {
    if (err) {
      console.error("Database error:", err);
      bot.sendMessage(chatId, "An error occurred while retrieving files.");
      return;
    }

    if (rows.length === 0) {
      bot.sendMessage(
        chatId,
        `No file found with the given ${isId ? "ID" : "name"}.`
      );
      return;
    }
    const fileList = rows
      .map((row, index) => `${index + 1}. ${row.file_name} (ID: ${row.id})`)
      .join("\n");

    bot.sendMessage(
      chatId,
      `Found the following file(s):\n\n${fileList}\n\nConfirm deletion?`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Yes, delete", callback_data: `delete_confirm_${query}` },
              { text: "No, cancel", callback_data: `delete_cancel` },
            ],
          ],
        },
      }
    );
  });
});

bot.on("callback_query", (callbackQuery) => {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  if (data.startsWith("delete_confirm_")) {
    const query = data.replace("delete_confirm_", "").trim();
    const isId = /^[0-9a-fA-F-]{36}$/.test(query);

    const column = isId ? "id" : "file_name";
    const sql = isId
      ? `DELETE FROM files WHERE ${column} = ?`
      : `DELETE FROM files WHERE LOWER(${column}) LIKE LOWER(?)`;

    const param = isId ? query : `%${query}%`;
    db.run(sql, [param], function (err) {
      if (err) {
        console.error("Database error:", err);
        bot.sendMessage(
          chatId,
          "An error occurred while deleting the file(s)."
        );
        return;
      }

      if (this.changes === 0) {
        bot.sendMessage(
          chatId,
          `No file(s) found with the given ${isId ? "ID" : "name"}.`
        );
      } else {
        bot.sendMessage(
          chatId,
          `Successfully deleted ${this.changes} file(s).`
        );
      }
    });
  } else if (data === "delete_cancel") {
    bot.sendMessage(chatId, "Deletion canceled.");
  }
});

// Delete all files with confirmation
bot.onText(/\/deleteallfiles/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Check if the user is an admin
  if (userId.toString() !== adminChatId) {
    bot.sendMessage(chatId, "You are not authorized to delete files.");
    return;
  }

  // Ask for confirmation
  bot.sendMessage(chatId, "Are you sure you want to delete all files?", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Yes, delete all", callback_data: "delete_all_confirm" },
          { text: "No, cancel", callback_data: "delete_all_cancel" },
        ],
      ],
    },
  });
});

// Handle inline button responses for delete all
bot.on("callback_query", (callbackQuery) => {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  if (data === "delete_all_confirm") {
    // Execute deletion of all files
    db.run(`DELETE FROM files`, function (err) {
      if (err) {
        console.error("Database error during delete all:", err);
        bot.sendMessage(chatId, "An error occurred while deleting files.");
        return;
      }

      bot.sendMessage(
        chatId,
        `Successfully deleted all files (${this.changes} files).`
      );
    });
  } else if (data === "delete_all_cancel") {
    bot.sendMessage(chatId, "Deletion of all files canceled.");
  }
});

// bot.on("callback_query", (callbackQuery) => {
//   const chatId = callbackQuery.message.chat.id;
//   const data = callbackQuery.data;

//   if (data.startsWith("retry_getfile_")) {
//     // Handle retry logic
//   } else if (data.startsWith("delete_")) {
//     // Handle delete confirmation
//   } else if (data === "delete_all_confirm") {
//     // Handle delete all confirmation
//   } else if (data === "delete_all_cancel") {
//     bot.sendMessage(chatId, "Deletion of all files canceled.");
//   }
//   bot.answerCallbackQuery(callbackQuery.id);
// });
