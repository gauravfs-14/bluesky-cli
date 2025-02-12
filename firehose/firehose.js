import WebSocket from "ws";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import inquirer from "inquirer";
import chalk from "chalk";

// Database Setup
const DB_FILE = "bluesky_posts.db";
let db;

async function setupDatabase() {
  db = await open({ filename: DB_FILE, driver: sqlite3.Database });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId TEXT UNIQUE,
      authorDid TEXT,
      text TEXT,
      createdAt TEXT,
      images TEXT,
      videos TEXT,
      fullData TEXT
    )
  `);
}

// Bluesky Jetstream API URL
const JETSTREAM_URL = "wss://jetstream1.us-west.bsky.network/subscribe";
const COLLECTION = "app.bsky.feed.post"; // Only capture posts

async function subscribeToJetstream(keywords) {
  console.log(chalk.blue("🔹 Connecting to Bluesky Jetstream API..."));

  async function savePostToDatabase(postId, authorDid, text, createdAt, images, videos, fullData) {
    try {
      await db.run(
        `INSERT INTO posts (postId, authorDid, text, createdAt, images, videos, fullData) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [postId, authorDid, text, createdAt, images, videos, fullData]
      );
      console.log(chalk.green("✅ Post saved to database!"));
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT") {
        console.log(chalk.gray("⚠ Post already exists in database."));
      } else {
        console.error(chalk.red("❌ Database Error:"), err);
      }
    }
  }

  function connect() {
    const ws = new WebSocket(JETSTREAM_URL);

    ws.on("open", () => {
      console.log(chalk.green("✅ Connected to Jetstream"));
      console.log(chalk.yellow(`🔍 Listening for keywords: ${keywords.join(", ")}`));
    });

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.kind === "commit" && message.commit.collection === "app.bsky.feed.post") {
          const post = message.commit.record;
          const authorDid = message.did;
          const postId = `${authorDid}/${message.commit.cid}`;
          const text = post.text || "";
          const createdAt = post.createdAt || "";
          
          // Extract images and videos from post
          let images = [];
          let videos = [];
          
          if (post.embed) {
            if (post.embed.images) {
              images = post.embed.images.map(img => img.fullsize);
            }
            if (post.embed.external && post.embed.external.uri) {
              if (post.embed.external.uri.includes("youtube") || post.embed.external.uri.includes("vimeo")) {
                videos.push(post.embed.external.uri);
              }
            }
          }

        //   console.log(chalk.gray(`🔍 Checking post: ${text}`));

          // ✅ Match keyword filter
          if (keywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()))) {
            console.log(chalk.green(`\n📌 MATCHED POST from ${authorDid}:`));
            console.log(chalk.yellow(text));
            console.log(chalk.magenta(`🔗 Post ID: ${postId}\n`));

            // Save to SQLite
            await savePostToDatabase(postId, authorDid, text, createdAt, JSON.stringify(images), JSON.stringify(videos), JSON.stringify(post));
          }
        }
      } catch (err) {
        // console.error(chalk.red("❌ Error processing message:"), err);
      }
    });

    ws.on("close", () => {
      console.log(chalk.red("⚠ Connection closed. Reconnecting in 5s..."));
      setTimeout(connect, 5000);
    });

    ws.on("error", (error) => {
      console.error(chalk.red("❌ WebSocket Error:"), error);
    });
  }

  connect();
}

// Start Firehose Stream
export async function firehoseMain() {
  await setupDatabase();

  const { keywords } = await inquirer.prompt([
    { type: "input", name: "keywords", message: "Enter keywords (comma-separated):" },
  ]);

  const keywordList = keywords.split(",").map((k) => k.trim()).filter(Boolean);

  console.log(chalk.blue("🚀 Streaming posts with keywords:"), chalk.yellow(keywordList.join(", ")));

  subscribeToJetstream(keywordList);
}
