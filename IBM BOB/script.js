/**
 * script.js — Smart Student Academic & Career Path Advisor
 * =========================================================
 * Full CRUD task manager with filter (All / Active / Completed),
 * live search, stats bar, and localStorage persistence.
 *
 * Architecture:
 *  - state         : single source of truth
 *  - render()      : re-draws the task list from state (no DOM diffs)
 *  - event wiring  : at the bottom, attached once on DOMContentLoaded
 */

"use strict";

// ─────────────────────────────────────────────
// 1. STATE
// ─────────────────────────────────────────────

/** @type {{ tasks: Task[], filter: string, search: string }} */
const state = {
  tasks: [],        // array of task objects
  filter: "all",    // "all" | "active" | "completed"
  search: "",       // live search query
};

/**
 * @typedef {Object} Task
 * @property {string}  id        - unique identifier (timestamp-based)
 * @property {string}  title     - task title
 * @property {string}  category  - Academic | Career | Personal | Research
 * @property {string}  priority  - High | Medium | Low
 * @property {string}  due       - ISO date string or ""
 * @property {boolean} completed - completion status
 * @property {number}  createdAt - Unix timestamp for stable sorting
 */

// ─────────────────────────────────────────────
// 2. PERSISTENCE  (localStorage)
// ─────────────────────────────────────────────

const STORAGE_KEY = "smart_student_tasks";

/** Load tasks from localStorage into state */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.tasks = JSON.parse(raw);
  } catch {
    state.tasks = [];
  }
}

/** Persist current tasks array to localStorage */
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

// ─────────────────────────────────────────────
// 3. HELPERS
// ─────────────────────────────────────────────

/** Generate a simple unique ID */
function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Format a date string (YYYY-MM-DD) into a human-readable label */
function formatDate(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Check whether a due date has passed (overdue) */
function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = dateStr.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  return due < today;
}

/**
 * Return the CSS class(es) for a priority badge.
 * @param {string} priority
 */
function priorityBadgeClass(priority) {
  const map = { High: "badge-high", Medium: "badge-medium", Low: "badge-low" };
  return map[priority] ?? "badge-low";
}

/**
 * Return the CSS class for a category badge.
 * @param {string} category
 */
function categoryBadgeClass(category) {
  const map = {
    Academic: "badge-academic",
    Career:   "badge-career",
    Personal: "badge-personal",
    Research: "badge-research",
  };
  return map[category] ?? "badge-academic";
}

// ─────────────────────────────────────────────
// 4. FILTER + SEARCH — derive visible tasks
// ─────────────────────────────────────────────

/** Return the subset of tasks that match the current filter + search */
function getVisibleTasks() {
  return state.tasks.filter((task) => {
    // Filter by status
    if (state.filter === "active"    && task.completed) return false;
    if (state.filter === "completed" && !task.completed) return false;

    // Filter by search query (case-insensitive, matches title or category)
    if (state.search) {
      const q = state.search.toLowerCase();
      const matchTitle    = task.title.toLowerCase().includes(q);
      const matchCategory = task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchCategory) return false;
    }

    return true;
  });
}

// ─────────────────────────────────────────────
// 5. RENDER — build DOM from state
// ─────────────────────────────────────────────

/** Re-render the entire task list and stats bar */
function render() {
  renderStats();
  renderList();
}

/** Update filter tab labels with live task counts */
function renderStats() {
  const total     = state.tasks.length;
  const completed = state.tasks.filter((t) => t.completed).length;
  const active    = total - completed;

  document.getElementById("filter-btn-all").textContent       = `All (${total})`;
  document.getElementById("filter-btn-active").textContent    = `Active (${active})`;
  document.getElementById("filter-btn-completed").textContent = `Completed (${completed})`;
}

/** Build and inject task cards into #task-list */
function renderList() {
  const list      = document.getElementById("task-list");
  const emptyState = document.getElementById("empty-state");
  const visible   = getVisibleTasks();

  // Clear existing items
  list.innerHTML = "";

  if (visible.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  // Build each card
  visible.forEach((task) => {
    const li = document.createElement("li");
    li.setAttribute("data-id", task.id);

    const dueDateHTML = task.due
      ? `<span class="text-xs ${isOverdue(task.due) && !task.completed ? "due-overdue" : "text-gray-400"} flex items-center gap-1">
           <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
           </svg>
           ${formatDate(task.due)}${isOverdue(task.due) && !task.completed ? " · Overdue" : ""}
         </span>`
      : "";

    li.innerHTML = `
      <div class="task-card ${task.completed ? "completed-card" : ""}">
        <div class="flex items-start gap-3">

          <!-- Completion checkbox -->
          <input
            type="checkbox"
            class="task-checkbox mt-0.5"
            aria-label="Mark task as ${task.completed ? "active" : "completed"}"
            ${task.completed ? "checked" : ""}
            data-action="toggle"
          />

          <!-- Task body -->
          <div class="flex-1 min-w-0">
            <!-- Title -->
            <p class="task-title-text text-sm font-semibold text-gray-800 leading-snug break-words">${escapeHtml(task.title)}</p>

            <!-- Badges + due date -->
            <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span class="badge ${categoryBadgeClass(task.category)}">${task.category}</span>
              <span class="badge ${priorityBadgeClass(task.priority)}">${task.priority}</span>
              ${dueDateHTML}
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <!-- Edit -->
            <button class="icon-btn edit" data-action="edit" aria-label="Edit task" title="Edit">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <!-- Delete -->
            <button class="icon-btn delete" data-action="delete" aria-label="Delete task" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>

        </div>
      </div>
    `;

    list.appendChild(li);
  });
}

/**
 * Escape HTML special characters to prevent XSS in task titles.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─────────────────────────────────────────────
// 6. CRUD OPERATIONS
// ─────────────────────────────────────────────

/**
 * Add a brand-new task to state.
 * @param {{ title: string, category: string, priority: string, due: string }} data
 */
function addTask(data) {
  /** @type {Task} */
  const task = {
    id:        generateId(),
    title:     data.title.trim(),
    category:  data.category,
    priority:  data.priority,
    due:       data.due,
    completed: false,
    createdAt: Date.now(),
  };
  state.tasks.unshift(task); // newest on top
  saveToStorage();
  render();
}

/**
 * Update an existing task by id.
 * @param {string} id
 * @param {{ title: string, category: string, priority: string, due: string }} data
 */
function updateTask(id, data) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;

  task.title    = data.title.trim();
  task.category = data.category;
  task.priority = data.priority;
  task.due      = data.due;

  saveToStorage();
  render();
}

/**
 * Toggle a task's completion status.
 * @param {string} id
 */
function toggleTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveToStorage();
  render();
}

/**
 * Delete a task by id.
 * @param {string} id
 */
function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  saveToStorage();
  render();
}

/** Remove all completed tasks */
function clearCompleted() {
  state.tasks = state.tasks.filter((t) => !t.completed);
  saveToStorage();
  render();
}

// ─────────────────────────────────────────────
// 7. FORM  (Add + Edit mode)
// ─────────────────────────────────────────────

// DOM references for the form
const taskForm    = document.getElementById("task-form");
const titleInput  = document.getElementById("task-title");
const categorySel = document.getElementById("task-category");
const prioritySel = document.getElementById("task-priority");
const dueInput    = document.getElementById("task-due");
const editIdInput = document.getElementById("edit-id");
const submitBtn   = document.getElementById("submit-btn");
const cancelBtn   = document.getElementById("cancel-btn");
const formHeading = document.getElementById("form-heading");
const titleError  = document.getElementById("title-error");

/** Switch the form into "edit" mode for a specific task */
function enterEditMode(task) {
  formHeading.textContent   = "Edit Task";
  submitBtn.textContent     = "Save Changes";
  editIdInput.value         = task.id;
  titleInput.value          = task.title;
  categorySel.value         = task.category;
  prioritySel.value         = task.priority;
  dueInput.value            = task.due;
  cancelBtn.classList.remove("hidden");

  // Scroll form into view smoothly
  taskForm.scrollIntoView({ behavior: "smooth", block: "center" });
  titleInput.focus();
}

/** Reset the form back to "add new" mode */
function exitEditMode() {
  formHeading.textContent = "Add New Task";
  submitBtn.textContent   = "Add Task";
  editIdInput.value       = "";
  titleError.classList.add("hidden");
  taskForm.reset();
  cancelBtn.classList.add("hidden");
}

/** Validate and collect form values */
function getFormData() {
  const title = titleInput.value.trim();

  if (!title) {
    titleError.classList.remove("hidden");
    titleInput.focus();
    return null;
  }

  titleError.classList.add("hidden");

  return {
    title,
    category: categorySel.value,
    priority: prioritySel.value,
    due:      dueInput.value,
  };
}

// Form submit handler
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = getFormData();
  if (!data) return; // validation failed

  const editingId = editIdInput.value;

  if (editingId) {
    updateTask(editingId, data);
  } else {
    addTask(data);
  }

  exitEditMode();
});

// Cancel edit button
cancelBtn.addEventListener("click", exitEditMode);

// ─────────────────────────────────────────────
// 8. TASK LIST EVENT DELEGATION
// ─────────────────────────────────────────────

/**
 * Use a single delegated listener on #task-list for all
 * toggle / edit / delete actions. Avoids attaching handlers
 * per card, which is important when cards are re-rendered often.
 */
document.getElementById("task-list").addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  if (!action) return;

  // Walk up to the nearest [data-id] element (the <li>)
  const li = e.target.closest("[data-id]");
  if (!li) return;

  const id = li.dataset.id;

  if (action === "toggle") {
    toggleTask(id);
  } else if (action === "edit") {
    const task = state.tasks.find((t) => t.id === id);
    if (task) enterEditMode(task);
  } else if (action === "delete") {
    if (confirm("Delete this task?")) deleteTask(id);
  }
});

// ─────────────────────────────────────────────
// 9. FILTER BUTTONS
// ─────────────────────────────────────────────

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Update active style
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active-filter"));
    btn.classList.add("active-filter");

    // Update state and re-render
    state.filter = btn.dataset.filter;
    render();
  });
});

// ─────────────────────────────────────────────
// 10. LIVE SEARCH
// ─────────────────────────────────────────────

document.getElementById("search-input").addEventListener("input", (e) => {
  state.search = e.target.value.trim();
  render();
});

// ─────────────────────────────────────────────
// 11. CLEAR COMPLETED
// ─────────────────────────────────────────────

document.getElementById("clear-completed-btn").addEventListener("click", () => {
  const count = state.tasks.filter((t) => t.completed).length;
  if (count === 0) return;
  if (confirm(`Remove all ${count} completed task(s)?`)) {
    clearCompleted();
  }
});

// ─────────────────────────────────────────────
// 12. BOOTSTRAP — seed demo data on first visit
// ─────────────────────────────────────────────

/**
 * Seed a few sample tasks so a first-time visitor sees something.
 * Only runs when localStorage is empty.
 */
function seedDemoTasks() {
  if (state.tasks.length > 0) return;

  const demos = [
    {
      title:    "Prepare internship resume & cover letter",
      category: "Career",
      priority: "High",
      due:      "",
      completed: false,
    },
    {
      title:    "Complete Chapter 5 exercises — Linear Algebra",
      category: "Academic",
      priority: "High",
      due:      getTodayPlusDays(3),
      completed: false,
    },
    {
      title:    "Read research paper on Machine Learning ethics",
      category: "Research",
      priority: "Medium",
      due:      getTodayPlusDays(7),
      completed: false,
    },
    {
      title:    "Register for the campus career fair",
      category: "Career",
      priority: "Medium",
      due:      "",
      completed: true,
    },
    {
      title:    "Review notes from yesterday's lecture",
      category: "Academic",
      priority: "Low",
      due:      "",
      completed: true,
    },
  ];

  demos.forEach((d) => {
    state.tasks.push({
      id:        generateId(),
      title:     d.title,
      category:  d.category,
      priority:  d.priority,
      due:       d.due,
      completed: d.completed,
      createdAt: Date.now(),
    });
  });

  saveToStorage();
}

/** Helper: returns a date string N days from today */
function getTodayPlusDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

// ─────────────────────────────────────────────
// 13. INIT
// ─────────────────────────────────────────────

(function init() {
  loadFromStorage();
  seedDemoTasks();
  render();
})();
