const STORAGE_KEY = "hydro-buddy-state";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const defaultState = {
  goal: 2000,
  cupSize: 250,
  reminderMinutes: 60,
  remindersEnabled: false,
  currentAmount: 0,
  logs: [],
  streak: 0,
  completedDate: null,
  lastOpenedDate: todayKey(),
};

let state = loadState();
let reminderTimer = null;
let toastTimer = null;

const elements = {
  currentAmount: document.querySelector("#currentAmount"),
  goalAmount: document.querySelector("#goalAmount"),
  cupSizeLabel: document.querySelector("#cupSizeLabel"),
  meterPercent: document.querySelector("#meterPercent"),
  waterFill: document.querySelector("#waterFill"),
  progressMessage: document.querySelector("#progressMessage"),
  remainingMessage: document.querySelector("#remainingMessage"),
  settingsForm: document.querySelector("#settingsForm"),
  goalInput: document.querySelector("#goalInput"),
  cupInput: document.querySelector("#cupInput"),
  reminderInput: document.querySelector("#reminderInput"),
  addCupButton: document.querySelector("#addCupButton"),
  reminderToggle: document.querySelector("#reminderToggle"),
  reminderStatus: document.querySelector("#reminderStatus"),
  sipList: document.querySelector("#sipList"),
  resetButton: document.querySelector("#resetButton"),
  streakCount: document.querySelector("#streakCount"),
  streakMessage: document.querySelector("#streakMessage"),
  toast: document.querySelector("#toast"),
};

rollOverIfNeeded();
render();
scheduleReminders();

elements.settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const goal = clampNumber(Number(formData.get("goal")), 250, 10000);
  const cupSize = clampNumber(Number(formData.get("cup")), 50, 2000);
  const reminderMinutes = clampNumber(Number(formData.get("reminder")), 5, 240);

  state = {
    ...state,
    goal,
    cupSize,
    reminderMinutes,
  };

  saveState();
  render();
  scheduleReminders();
  showToast("Splash plan saved! Your goal is ready.");
});

elements.addCupButton.addEventListener("click", () => addWater(state.cupSize));

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => addWater(Number(button.dataset.add)));
});

elements.reminderToggle.addEventListener("click", async () => {
  state.remindersEnabled = !state.remindersEnabled;

  if (state.remindersEnabled) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      state.remindersEnabled = false;
      showToast("Browser notifications are blocked, but you can still track sips here.");
    } else {
      showToast("Hydro Buddy will remind you to drink water.");
    }
  } else {
    showToast("Reminders paused. Keep sipping when you can.");
  }

  saveState();
  render();
  scheduleReminders();
});

elements.resetButton.addEventListener("click", () => {
  state.currentAmount = 0;
  state.logs = [];
  state.completedDate = state.completedDate === todayKey() ? null : state.completedDate;
  saveState();
  render();
  showToast("Today has been reset. Fresh glass, fresh start!");
});

function addWater(amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return;
  }

  const beforeAmount = state.currentAmount;
  state.currentAmount += amount;
  state.logs = [
    {
      amount,
      time: new Date().toISOString(),
    },
    ...state.logs,
  ].slice(0, 30);

  if (beforeAmount < state.goal && state.currentAmount >= state.goal) {
    celebrateGoal();
  } else {
    showToast(randomSipMessage(amount));
  }

  saveState();
  render();
}

function celebrateGoal() {
  const currentDate = todayKey();

  if (state.completedDate !== currentDate) {
    state.streak = getYesterdayKey() === state.completedDate ? state.streak + 1 : Math.max(state.streak, 1);
    state.completedDate = currentDate;
  }

  showToast("Goal crushed! You are officially a hydration hero.");
}

function render() {
  const percent = Math.min(Math.round((state.currentAmount / state.goal) * 100), 100);
  const remaining = Math.max(state.goal - state.currentAmount, 0);

  elements.currentAmount.textContent = state.currentAmount.toLocaleString();
  elements.goalAmount.textContent = state.goal.toLocaleString();
  elements.cupSizeLabel.textContent = state.cupSize.toLocaleString();
  elements.meterPercent.textContent = `${percent}%`;
  elements.waterFill.style.height = `${percent}%`;
  elements.remainingMessage.textContent =
    remaining > 0
      ? `${remaining.toLocaleString()} ml left to reach your goal.`
      : "Goal complete! Extra sips are bonus sparkle.";

  elements.progressMessage.textContent = getProgressMessage(percent);
  elements.goalInput.value = state.goal;
  elements.cupInput.value = state.cupSize;
  elements.reminderInput.value = state.reminderMinutes;
  elements.streakCount.textContent = state.streak.toLocaleString();
  elements.streakMessage.textContent =
    state.streak > 0
      ? `Nice! You have hit your goal ${state.streak} day${state.streak === 1 ? "" : "s"} in a row.`
      : "Reach your goal today to start a shiny streak.";

  renderReminderStatus();
  renderLogs();
}

function renderReminderStatus() {
  elements.reminderToggle.classList.toggle("is-on", state.remindersEnabled);
  elements.reminderToggle.textContent = state.remindersEnabled ? "Pause reminders" : "Start reminders";
  elements.reminderStatus.textContent = state.remindersEnabled
    ? `You will get a nudge every ${state.reminderMinutes} minutes.`
    : "Reminders are paused.";
}

function renderLogs() {
  elements.sipList.replaceChildren();

  if (state.logs.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-log";
    emptyItem.textContent = "No sips logged yet. Tap a button to add water.";
    elements.sipList.append(emptyItem);
    return;
  }

  state.logs.forEach((log) => {
    const item = document.createElement("li");
    const amount = document.createElement("strong");
    const time = document.createElement("span");

    amount.textContent = `+${Number(log.amount).toLocaleString()} ml`;
    time.textContent = formatTime(log.time);

    item.append(amount, time);
    elements.sipList.append(item);
  });
}

function scheduleReminders() {
  if (reminderTimer) {
    window.clearInterval(reminderTimer);
    reminderTimer = null;
  }

  if (!state.remindersEnabled) {
    return;
  }

  reminderTimer = window.setInterval(() => {
    sendReminder();
  }, state.reminderMinutes * 60 * 1000);
}

function sendReminder() {
  const remaining = Math.max(state.goal - state.currentAmount, 0);
  const message =
    remaining > 0
      ? `Time for a sip! ${remaining.toLocaleString()} ml left for today's goal.`
      : "You reached your goal. A tiny bonus sip still counts as self-care.";

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Hydro Buddy", {
      body: message,
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='%2320c4ff' d='M32 4C20 18 12 29 12 40a20 20 0 0 0 40 0C52 29 44 18 32 4Z'/%3E%3Ccircle cx='25' cy='37' r='3' fill='%23162447'/%3E%3Ccircle cx='39' cy='37' r='3' fill='%23162447'/%3E%3Cpath fill='none' stroke='%23162447' stroke-width='4' stroke-linecap='round' d='M24 46c4 4 12 4 16 0'/%3E%3C/svg%3E",
    });
  }

  showToast(message);
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return true;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

function rollOverIfNeeded() {
  const currentDate = todayKey();

  if (state.lastOpenedDate === currentDate) {
    return;
  }

  const completedYesterday = state.completedDate === getDateKey(Date.now() - DAY_IN_MS);

  state.currentAmount = 0;
  state.logs = [];
  state.lastOpenedDate = currentDate;

  if (!completedYesterday && state.completedDate !== currentDate) {
    state.streak = 0;
  }

  saveState();
}

function loadState() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return {
      ...defaultState,
      ...stored,
      logs: Array.isArray(stored?.logs) ? stored.logs : [],
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(Math.round(value), min), max);
}

function getProgressMessage(percent) {
  if (percent >= 100) {
    return "Your water goal is glowing. Amazing work!";
  }

  if (percent >= 75) {
    return "Almost there! Your inner water drop is cheering.";
  }

  if (percent >= 50) {
    return "Halfway hydrated and cruising.";
  }

  if (percent > 0) {
    return "Great start. Keep the splash streak going.";
  }

  return "Add your first splash to start the day.";
}

function randomSipMessage(amount) {
  const messages = [
    `${amount.toLocaleString()} ml added. Splash-tastic!`,
    "Tiny sip, big sparkle.",
    "Hydration points collected.",
    "Your future self says thank you.",
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 3200);
}

function todayKey() {
  return getDateKey(Date.now());
}

function getYesterdayKey() {
  return getDateKey(Date.now() - DAY_IN_MS);
}

function getDateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
