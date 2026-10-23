const $ = (selector) => document.querySelector(selector);
let mode = "login";

function setStatus(message, tone = "") {
  const status = $("#authStatus");
  status.textContent = message;
  status.dataset.tone = tone;
}

function setMode(nextMode) {
  mode = nextMode;
  document.querySelectorAll(".tabs button").forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));
  const register = mode === "register";
  $("#nameField").hidden = !register;
  $("#formKicker").textContent = register ? "NEW GARAGE" : "WELCOME BACK";
  $("#formTitle").textContent = register ? "Create your private garage" : "Log in with your mobile";
  $("#formDescription").textContent = register ? "Verify your mobile number to securely associate vehicles with your account." : "We verify ownership with a one-time code. Your vehicle data is only shown inside your signed-in account.";
  $("#requestOtp").firstChild.textContent = register ? "Create verification code " : "Send verification code ";
  setStatus("");
}

async function requestOtp(event) {
  event.preventDefault();
  const payload = { phone: $("#phone").value, purpose: mode };
  if (mode === "register") payload.name = $("#name").value;
  $("#requestOtp").disabled = true;
  try {
    const response = await fetch("/api/auth/request-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not request verification code.");
    $("#authForm").hidden = true;
    $("#verifyForm").hidden = false;
    setStatus(result.devOtp ? `Local development code: ${result.devOtp}` : result.message, "success");
    $("#otp").focus();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    $("#requestOtp").disabled = false;
  }
}

async function verifyOtp(event) {
  event.preventDefault();
  const payload = { phone: $("#phone").value, code: $("#otp").value, purpose: mode };
  if (mode === "register") payload.name = $("#name").value;
  const response = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json();
  if (!response.ok) return setStatus(result.error || "Verification failed.", "error");
  await loadDashboard();
}

function vehicleCard(vehicle) {
  const service = vehicle.nextServiceDate ? new Date(`${vehicle.nextServiceDate}T00:00:00`).toLocaleDateString() : "Not scheduled";
  return `<article class="vehicle-card" data-vehicle-card="${vehicle.id}"><h3>${vehicle.make} ${vehicle.model}</h3><span class="registration">${vehicle.registrationNumber}</span><div class="vehicle-stats"><div><strong>${vehicle.year || "—"}</strong><span>Model year</span></div><div><strong>${vehicle.mileage || "—"}</strong><span>Current mileage</span></div><div><strong>${service}</strong><span>Next service</span></div><div><strong>Private</strong><span>Owner verified</span></div></div><div class="vehicle-history"><strong>Maintenance history</strong><br>${vehicle.serviceHistory?.length ? vehicle.serviceHistory.join("<br>") : "No service records have been added yet."}${vehicle.notes ? `<br><br><strong>Notes:</strong> ${vehicle.notes}` : ""}</div></article>`;
}

async function loadDashboard() {
  const response = await fetch("/api/auth/session");
  if (!response.ok) return;
  const result = await response.json();
  window.garageVehicles = result.vehicles;
  $("#authCard").hidden = true;
  $("#dashboard").hidden = false;
  $("#welcomeTitle").textContent = `${result.user.name}'s car dashboard`;
  $("#accountPhone").textContent = `Verified mobile: ${result.user.phone}`;
  $("#vehicleList").innerHTML = result.vehicles.length ? result.vehicles.map(vehicleCard).join("") : `<div class="empty-state"><strong>No car is registered with your account yet.</strong><p>Add your vehicle below to keep its details and future service reminders private to you.</p></div>`;
  $("#dashboardVehicle").hidden = !result.vehicles.length;
  document.querySelectorAll("[data-vehicle-card]").forEach((card) => card.addEventListener("click", () => window.dispatchEvent(new CustomEvent("garage:select", { detail: card.dataset.vehicleCard }))));
  window.dispatchEvent(new CustomEvent("garage:vehicles-ready"));
  $("#addVehicle").querySelector("p:not(.kicker)").textContent = result.vehicles.length ? "Add another vehicle and keep each car’s information in your private account." : "No car is registered with your account yet. Add one here to create your private dashboard.";
}

async function saveVehicle(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const response = await fetch("/api/vehicles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
  const result = await response.json();
  if (!response.ok) return setStatus(result.error || "Vehicle could not be saved.", "error");
  event.currentTarget.reset();
  setStatus("Vehicle linked to your verified account.", "success");
  await loadDashboard();
}

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.reload();
}

document.querySelectorAll(".tabs button").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
$("#authForm").addEventListener("submit", requestOtp);
$("#verifyForm").addEventListener("submit", verifyOtp);
$("#vehicleForm").addEventListener("submit", saveVehicle);
$("#changeNumber").addEventListener("click", () => { $("#authForm").hidden = false; $("#verifyForm").hidden = true; setStatus(""); });
$("#logout").addEventListener("click", logout);
loadDashboard().catch(() => {});
