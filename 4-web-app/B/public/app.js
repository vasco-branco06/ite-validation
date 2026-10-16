"use strict";

const FIELDS = ["customer_name", "phone", "cake", "pickup_date", "pickup_time"];

const form = document.getElementById("order-form");
const formMessage = document.getElementById("form-message");
const formTitle = document.getElementById("form-title");
const cancelEdit = document.getElementById("cancel-edit");
const saveButton = form.querySelector('button[type="submit"]');
const sections = {
  upcoming: { list: document.getElementById("upcoming"), empty: document.getElementById("no-upcoming") },
  past: { list: document.getElementById("past"), empty: document.getElementById("no-past") },
};

function readForm() {
  const values = {};
  for (const name of FIELDS) values[name] = form.elements[name].value;
  values.pickup_time = values.pickup_time || null;
  return values;
}

function showMessage(text) {
  formMessage.textContent = text;
}

// The same rules and messages as the server (src/validate.ts); the server checks again.
const REQUIRED_MESSAGES = {
  customer_name: "Customer name is required.",
  phone: "Phone is required.",
  cake: "Cake is required.",
  pickup_date: "Pickup date is required.",
};
const PHONE_PATTERN = /^[0-9 +]*[0-9][0-9 +]*$/;
const TIME_PATTERN = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function checkForm(values) {
  const errors = {};
  for (const [field, message] of Object.entries(REQUIRED_MESSAGES)) {
    if (values[field].trim() === "") errors[field] = message;
  }
  if (!errors.phone && !PHONE_PATTERN.test(values.phone)) {
    errors.phone = "Phone may contain only digits, spaces and +.";
  }
  if (!errors.pickup_date && values.pickup_date < todayLocal()) {
    errors.pickup_date = "Pickup date is in the past.";
  }
  if (values.pickup_time !== null && !TIME_PATTERN.test(values.pickup_time)) {
    errors.pickup_time = "Pickup time must be HH:MM.";
  }
  return errors;
}

function clearErrors() {
  for (const name of FIELDS) {
    form.elements[name].classList.remove("invalid");
    form.elements[name].removeAttribute("aria-invalid");
    document.getElementById(`${name}-error`).textContent = "";
  }
  showMessage("");
}

// Highlights each field with an error and shows its message; never touches what was typed.
function showErrors(errors) {
  let first = null;
  for (const [name, message] of Object.entries(errors)) {
    if (!FIELDS.includes(name)) continue;
    const input = form.elements[name];
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    document.getElementById(`${name}-error`).textContent = message;
    first ??= input;
  }
  if (errors._form) showMessage(errors._form);
  else if (first) showMessage("Please fix the highlighted fields. Nothing was saved.");
  first?.focus();
}

// The id of the order being edited, or null when the form is for a new order.
let editingId = null;
// True while a Save is on its way; further submits are ignored (R-013).
let saving = false;
// One key per new order. A retry of the same form reuses it, so the server saves the order once.
let submissionKey = crypto.randomUUID();

function startEdit(order) {
  editingId = order.id;
  for (const name of FIELDS) form.elements[name].value = order[name] ?? "";
  formTitle.textContent = "Edit order";
  form.classList.add("editing");
  cancelEdit.hidden = false;
  clearErrors();
  form.elements.customer_name.focus();
}

function resetForm() {
  editingId = null;
  submissionKey = crypto.randomUUID();
  form.reset();
  clearErrors();
  formTitle.textContent = "New order";
  form.classList.remove("editing");
  cancelEdit.hidden = true;
}

cancelEdit.addEventListener("click", resetForm);

function renderOrder(order) {
  const item = document.createElement("li");
  item.className = order.picked_up ? "order picked-up" : "order";
  item.dataset.testid = "order";
  item.dataset.id = String(order.id);

  const add = (field, text) => {
    const span = document.createElement("span");
    span.className = field;
    span.dataset.testid = field;
    span.textContent = text;
    item.appendChild(span);
  };
  add("pickup_date", order.pickup_date);
  if (order.pickup_time) add("pickup_time", order.pickup_time);
  add("customer_name", order.customer_name);
  add("phone", order.phone);
  add("cake", order.cake);

  const actions = document.createElement("div");
  actions.className = "actions";
  if (!order.picked_up) {
    const pickedUp = document.createElement("button");
    pickedUp.type = "button";
    pickedUp.textContent = "Picked up";
    pickedUp.addEventListener("click", () => markPickedUp(order.id, pickedUp));
    actions.appendChild(pickedUp);
  }
  const edit = document.createElement("button");
  edit.type = "button";
  edit.textContent = "Edit";
  edit.addEventListener("click", () => startEdit(order));
  actions.appendChild(edit);
  const del = document.createElement("button");
  del.type = "button";
  del.className = "delete";
  del.textContent = "Delete";
  del.addEventListener("click", () => deleteOrder(order.id, del));
  actions.appendChild(del);
  item.appendChild(actions);
  return item;
}

async function markPickedUp(id, button) {
  button.disabled = true;
  try {
    const res = await fetch(`/api/orders/${id}/picked-up`, { method: "POST" });
    if (!res.ok) showMessage("The order could not be marked as picked up.");
    await loadOrders();
  } catch {
    showMessage("The order could not be marked as picked up. Please try again.");
    button.disabled = false;
  }
}

async function deleteOrder(id, button) {
  if (!window.confirm("Are you sure?")) return;
  button.disabled = true;
  try {
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 404) {
      showMessage("The order could not be deleted.");
      button.disabled = false;
      return;
    }
    if (editingId === id) resetForm();
    await loadOrders();
  } catch {
    showMessage("The order could not be deleted. Please try again.");
    button.disabled = false;
  }
}

// The server sends the orders already split and sorted: { upcoming: [...], past: [...] }.
function renderOrders(orders) {
  for (const [name, { list, empty }] of Object.entries(sections)) {
    const items = orders[name] ?? [];
    list.replaceChildren(...items.map(renderOrder));
    empty.hidden = items.length > 0;
  }
}

async function loadOrders() {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Could not load the orders.");
  renderOrders(await res.json());
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (saving) return;
  clearErrors();
  const values = readForm();
  const errors = checkForm(values);
  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    return;
  }
  saving = true;
  saveButton.disabled = true;
  try {
    const headers = { "Content-Type": "application/json" };
    if (editingId === null) headers["Idempotency-Key"] = submissionKey;
    const res = await fetch(editingId === null ? "/api/orders" : `/api/orders/${editingId}`, {
      method: editingId === null ? "POST" : "PUT",
      headers,
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (body.errors) showErrors(body.errors);
      else showMessage("The order could not be saved.");
      return;
    }
    resetForm();
    await loadOrders();
  } catch {
    showMessage("The order could not be saved. Please try again.");
  } finally {
    saving = false;
    saveButton.disabled = false;
  }
});

loadOrders().catch((err) => showMessage(err.message));
