
# 🎓 Smart Student Academic & Career Path Advisor

> A modern, minimalist task management web app built specifically for university students to organize their academic workload and career preparation in one place.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![No Framework](https://img.shields.io/badge/No_Framework-Vanilla_JS-blue?style=flat)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

**Smart Student Academic & Career Path Advisor** is a lightweight, browser-based task manager designed to solve a real problem faced by university students: managing academic tasks, career preparation steps, research projects, and personal goals all at once — without a centralized system.

The app runs entirely in the browser with **no backend, no installation, and no account required**. All data is persisted locally via `localStorage`, so tasks survive page refreshes and browser restarts.

---

## ✨ Features

### Core Task Management (CRUD)
| Feature | Description |
|---|---|
| ➕ **Create** | Add tasks with title, category, priority, and optional due date |
| 📖 **Read** | View all tasks in a clean card-based list |
| ✏️ **Update** | Edit any existing task inline via the same form |
| 🗑️ **Delete** | Remove individual tasks with a confirmation prompt |

### Status & Filtering
- ✅ **Toggle completion** — mark any task as Active or Completed with one click
- 🔍 **Live search** — filter tasks by title or category in real time
- 📂 **Dynamic filter tabs** — switch between **All**, **Active**, and **Completed** views instantly
- 🧹 **Clear all completed** — bulk-remove finished tasks in one action

### UX & Visual
- 📊 **Live counters** on filter tabs — `All (10)`, `Active (7)`, `Completed (3)`
- 🔴 **Overdue indicator** — due dates that have passed are highlighted in red
- 🏷️ **Category badges** — Academic, Career, Personal, Research
- 🎯 **Priority badges** — High, Medium, Low with color coding
- 💾 **localStorage persistence** — data survives page refresh
- 🌱 **Demo seed data** — pre-loaded tasks for first-time visitors
- 📱 **Fully responsive** — mobile-first design, works on all screen sizes

---

## 🛠️ Tech Stack

| Technology | Role |
|---|---|
| **HTML5** | Semantic page structure |
| **Tailwind CSS** (CDN) | Primary utility-first styling |
| **Custom CSS** (`style.css`) | Supplemental styles: custom checkbox, badges, animations |
| **Vanilla JavaScript** | All app logic — CRUD, filtering, rendering, persistence |
| **localStorage API** | Client-side data persistence |
| **Google Fonts — Inter** | Clean, modern typography |

> ⚠️ **Zero dependencies.** No React, Vue, jQuery, or any external JS library.

---

## 📁 Project Structure

```
smart-student-advisor/
│
├── index.html      # App shell — semantic HTML, Tailwind config, layout
├── style.css       # Supplemental custom styles (badges, checkbox, animations)
└── script.js       # All JavaScript — state, CRUD, render, filters, localStorage
```

### Architecture at a Glance (`script.js`)

```
state {}             → Single source of truth (tasks array, filter, search)
    │
    ├── loadFromStorage()   → Read tasks from localStorage on init
    ├── saveToStorage()     → Persist after every mutation
    │
    ├── addTask()           → Create
    ├── updateTask()        → Update
    ├── toggleTask()        → Toggle completed/active
    ├── deleteTask()        → Delete
    ├── clearCompleted()    → Bulk delete
    │
    ├── getVisibleTasks()   → Derive filtered + searched subset
    │
    ├── render()            → Entry point: calls renderStats + renderList
    ├── renderStats()       → Updates filter tab counters
    └── renderList()        → Builds task cards via DOM injection
```

---

## 🚀 Getting Started

No build tools, no `npm install`, no server required.

### Option 1 — Open directly in browser
```bash
# Clone the repository
git clone https://github.com/your-username/smart-student-advisor.git

# Navigate into the project folder
cd smart-student-advisor

# Open index.html in your browser
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

### Option 2 — Use Live Server (VS Code)
1. Install the **Live Server** extension in VS Code.
2. Right-click `index.html` → **Open with Live Server**.
3. The app opens at `http://127.0.0.1:5500`.

### Option 3 — Deploy to GitHub Pages
1. Push the repository to GitHub.
2. Go to **Settings → Pages**.
3. Set source to `main` branch, root `/`.
4. The app will be live at `https://your-username.github.io/smart-student-advisor/`.

---

## 📖 Usage Guide

### Adding a Task
1. Fill in the **Task Title** (required).
2. Select a **Category**: Academic 📚, Career 💼, Personal 🎯, or Research 🔬.
3. Select a **Priority**: High 🔴, Medium 🟡, or Low 🟢.
4. Optionally pick a **Due Date**.
5. Click **Add Task**.

### Editing a Task
1. Click the ✏️ edit icon on any task card.
2. The form switches to *Edit mode* with the task's current values pre-filled.
3. Make your changes and click **Save Changes**.
4. Click **Cancel** to discard.

### Completing a Task
- Click the **circular checkbox** on the left side of any task card to toggle it between Active ↔ Completed.

### Filtering Tasks
- Use the **All / Active / Completed** tabs — each tab shows a live count.
- Use the **search bar** to find tasks by title or category.

### Clearing Completed Tasks
- Click **"Clear all completed"** at the bottom of the page to remove all finished tasks at once.

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Primary Blue | `#2563eb` | Buttons, active states, header |
| Light Blue | `#eff6ff` | Page background |
| Accent Orange | `#f97316` | Logo icon, accent elements |
| Success Green | `#22c55e` | Completed checkbox |
| Danger Red | `#ef4444` | Delete button, overdue dates |
| Font | Inter (Google Fonts) | All text |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a **Pull Request**.

Please keep changes minimal and consistent with the existing code style.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for students, by a student.</p>
  <p><strong>Smart Student Academic & Career Path Advisor</strong></p>
</div>
