# 🚀 Bluesky CLI

![npm version](https://img.shields.io/npm/v/bluesky-cli)
![npm downloads](https://img.shields.io/npm/dm/bluesky-cli)
![license](https://img.shields.io/npm/l/bluesky-cli)
![GitHub stars](https://img.shields.io/github/stars/gauravfs-14/bluesky-cli)
![GitHub issues](https://img.shields.io/github/issues/gauravfs-14/bluesky-cli)

🔎 **Bluesky CLI** is a powerful command-line tool that allows users to search for public posts on **Bluesky** using specific search terms. The results are saved as **JSON**, and optionally, as an **HTML** file for easy viewing.

## ✨ Features

✅ Authenticate using a **Bluesky handle** and **App Password**.  
✅ Search for posts using **keywords**.  
✅ Filter results by **date range**.  
✅ Sort results by **latest** or **top**.  
✅ Save results in **JSON** and optionally in **HTML** format.  
✅ Customize the **file name** for saved outputs.

---

## ⚙️ Prerequisites

- **Node.js & NPM** installed.
- A **Bluesky account**.

---

## 📥 Installation

Install the CLI globally via **NPM**:

```sh
npm install -g bluesky-cli
```

---

## 🛠 Usage

Run the CLI tool:

```sh
bluesky-cli search
```

### 📝 Step-by-Step Walkthrough

Once you run the command, the CLI will prompt you for:
1️⃣ **Bluesky Handle & App Password** (for authentication)  
2️⃣ **Search Terms** (comma-separated keywords)  
3️⃣ **Number of Posts to Fetch**  
4️⃣ **Date Range** (Start & End date in `YYYY-MM-DD` format)  
5️⃣ **Sorting Order** (`latest` or `top`)  
6️⃣ **File Name** (for saving results)  
7️⃣ **Generate HTML Output?** (Yes/No)

### 🔍 Example Usage

```sh
$ bluesky-cli search
✔ Enter your Bluesky handle: yourname.bsky.social
✔ Enter your Bluesky App Password:
✔ Enter search terms: AI, Machine Learning
✔ How many posts do you want to fetch? 10
✔ Enter the start date: 2023-01-01
✔ Enter the end date: 2023-12-31
✔ Choose sorting order: latest
✔ Enter the base file name: bluesky_posts
✔ Do you want an HTML output? Yes
```

### 📂 Output Files

- **`bluesky_posts.json`** → JSON file containing search results.
- **`bluesky_posts.html`** → HTML file displaying posts (if selected).

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
