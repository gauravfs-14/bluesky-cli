# 🚀 Bluesky CLI

![npm version](https://img.shields.io/npm/v/bluesky-cli)
![npm downloads](https://img.shields.io/npm/dm/bluesky-cli)
![license](https://img.shields.io/npm/l/bluesky-cli)
![GitHub stars](https://img.shields.io/github/stars/gauravfs-14/bluesky-cli)
![GitHub issues](https://img.shields.io/github/issues/gauravfs-14/bluesky-cli)

Bluesky CLI now offers two modes:

## Features

### Search Mode

- **Authenticate** using your Bluesky handle and App Password.
- **Search posts** by entering keyword(s) and number of posts to fetch.
- Results are saved as JSON (`posts.json`) and CSV (`posts.csv`).

### Firehose Mode

- **Stream live posts** from the Bluesky Jetstream API.
- **Filter posts** using comma-separated keywords.
  - _New:_ If a keyword contains an underscore (e.g., `bike_commute`), underscores are replaced with spaces so that the tool filters for the exact phrase (i.e. "bike commute").
- Captured posts are stored in an SQLite database (`bluesky_posts.db`).

---

## ⚙️ Prerequisites

- **Node.js & NPM** installed.
- Valid **Bluesky account** credentials.
- SQLite support (automatically handled via dependencies).

---

## 📥 Installation

Install the CLI globally via **NPM**:

```sh
npm install -g bluesky-cli
```

---

## 🛠 Usage

Navigate to the folder you want to save the response to. And then open a terminal window there.

### Search Mode

Run the CLI tool:

```sh
bluesky-cli search
```

#### 📝 Step-by-Step Walkthrough

Once you run the command, the CLI will prompt you for:
1️⃣ **Bluesky Handle & App Password** (for authentication)  
2️⃣ **Search Terms** (comma-separated keywords)  
3️⃣ **Number of Posts to Fetch**  
4️⃣ **Date Range** (Start & End date in `YYYY-MM-DD` format)  
5️⃣ **Sorting Order** (`latest` or `top`)  
6️⃣ **File Name** (for saving results)  
7️⃣ **Generate HTML Output?** (Yes/No)

#### 🔍 Example Usage

```sh
$ bluesky-cli search
✔ Enter your Bluesky handle: yourname.bsky.social
✔ Enter your Bluesky App Password:
✔ Enter search terms: AI, Machine Learning
✔ How many posts do you want to fetch? 10
```

#### 📂 Output Files

- **`bluesky_posts.json`** → JSON file containing search results.
- **`bluesky_posts.csv`** → CSV file displaying posts (if selected).

### Firehose Mode

Run the CLI tool:

```sh
bluesky-cli firehose
```

#### 📝 Step-by-Step Walkthrough

Once you run the command, the CLI will prompt you for:
1️⃣ **Bluesky Handle & App Password** (for authentication)  
2️⃣ **Keywords** (comma-separated keywords to filter posts)  
3️⃣ **Database File Name** (for storing posts)

#### 🔍 Example Usage

```sh
$ bluesky-cli firehose
✔ Enter keywords: AI, Machine_Learning
```

#### 📂 Output Files

- **`bluesky_firehose.db`** → SQLite database file containing captured posts.

---

## ⚠️ Notes

- If **authentication fails**, ensure you use the correct **handle** and **App Password**.
- Ensure the **date format** is correct (`YYYY-MM-DD`).
- **Sorting order options**: `latest` (newest posts first) or `top` (most engaged posts).

---

## 🔄 Updating the Package

If you have installed **bluesky-cli** globally and a new version is released, update it using:

```sh
npm update -g bluesky-cli
```

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

We welcome contributions! If you'd like to contribute, feel free to submit issues or pull requests on the [GitHub Repository](https://github.com/gauravfs-14/bluesky-cli). 🚀

💡 **Suggestions?** Create an issue or start a discussion!

---

## ⭐ Support & Feedback

If you like this project, don't forget to ⭐ star the repository on GitHub!
