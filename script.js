import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Edit this object after inspecting your own licensed GLB material names.
const vehicleConfigs = {
  venue: { name: "Hyundai Venue", category: "Compact SUV · 2025", model: "models/venue.glb", basePrice: 789900, bodyMaterials: ["Body", "Paint"], interiorMaterials: ["Interior"], wheelMaterials: ["Wheel", "Rim"], defaultColour: "white", specs: [["120 PS", "Turbo power"], ["20.99 kmpl", "Best mileage"], ["1,800 mm", "Width"], ["5", "Seats"]], description: "A feature-rich compact SUV with city-friendly dimensions, confident road presence and connected technology." },
  "grand-i10-nios": { name: "Hyundai Grand i10 Nios", category: "Hatchback · 2025", model: "models/grand-i10-nios.glb", basePrice: 547000, bodyMaterials: ["Body", "Paint"], interiorMaterials: ["Interior"], wheelMaterials: ["Wheel", "Rim"], defaultColour: "white", specs: [["27.5", "km/kg CNG"], ["1.2L", "Kappa petrol"], ["3,815 mm", "Length"], ["5", "Seats"]], description: "A practical, easy-to-drive hatchback with a spacious cabin and city-friendly running costs." },
  i20: { name: "Hyundai i20", category: "Premium hatchback · 2025", model: "models/i20.glb", basePrice: 600000, bodyMaterials: ["Body", "Paint"], interiorMaterials: ["Interior"], wheelMaterials: ["Wheel", "Rim"], defaultColour: "white", specs: [["20 kmpl", "Best mileage"], ["1.0L", "Turbo GDi"], ["311 L", "Boot space"], ["5", "Seats"]], description: "A premium hatchback with expressive styling, connected features and a well-finished cabin." },
  verna: { name: "Hyundai Verna", category: "Sedan · 2025", model: "models/verna.glb", basePrice: 1099000, bodyMaterials: ["Body", "Paint"], interiorMaterials: ["Interior"], wheelMaterials: ["Wheel", "Rim"], defaultColour: "white", specs: [["160 PS", "Turbo power"], ["20.6 kmpl", "Best mileage"], ["528 L", "Boot space"], ["5-star", "Safety rating"]], description: "A refined sedan blending strong turbo performance, generous space and advanced safety technology." },
  creta: { name: "Hyundai Creta", category: "Midsize SUV · 2025", model: "models/creta.glb", basePrice: 1091000, bodyMaterials: ["Body", "Paint"], interiorMaterials: ["Interior"], wheelMaterials: ["Wheel", "Rim"], defaultColour: "white", specs: [["160 PS", "Turbo power"], ["21.8 kmpl", "Best mileage"], ["433 L", "Boot space"], ["ADAS", "Available"]], description: "A confident midsize SUV with a panoramic sunroof, multiple powertrains and everyday comfort." },
  alcazar: { name: "Hyundai Alcazar", category: "6/7-seat SUV · 2025", model: "models/alcazar.glb", basePrice: 1451000, bodyMaterials: ["Body", "Paint"], interiorMaterials: ["Interior"], wheelMaterials: ["Wheel", "Rim"], defaultColour: "white", specs: [["7", "Seats"], ["20.4 kmpl", "Best mileage"], ["1.5L", "Turbo petrol"], ["ADAS", "Available"]], description: "A premium family SUV with flexible seating, a comfortable cabin and long-distance confidence." },
  "ioniq-5": { name: "Hyundai Ioniq 5", category: "Electric crossover · 2025", model: "models/ioniq-5.glb", basePrice: 4595000, bodyMaterials: ["Body", "Paint"], interiorMaterials: ["Interior"], wheelMaterials: ["Wheel", "Rim"], defaultColour: "white", specs: [["631 km", "ARAI range"], ["84 kWh", "Battery"], ["350 kW", "Fast charging"], ["EV", "PMSM motor"]], description: "A futuristic electric crossover with ultra-fast charging, a flexible interior and distinctive design." }
};

const colours = { white: { name: "Polar White", hex: "#e9edf0", price: 0 }, black: { name: "Abyss Black", hex: "#171a1d", price: 0 }, red: { name: "Dragon Red", hex: "#aa2e2f", price: 15000 }, blue: { name: "Hazel Blue", hex: "#385b78", price: 15000 }, silver: { name: "Titan Grey", hex: "#879198", price: 0 }, grey: { name: "Amazon Grey", hex: "#515a62", price: 0 } };
const wheels = { standard: { name: "Standard Alloy", price: 0 }, diamond: { name: "Diamond Cut Alloy", price: 25000 }, black: { name: "Black Alloy", price: 18000 }, premium: { name: "Premium Alloy", price: 35000 } };
const interiors = { black: { name: "Black", price: 0 }, beige: { name: "Beige", price: 20000 } };
const cameraPositions = { exterior: [4.5, 2.3, 6], front: [0, 1.5, 6], rear: [0, 1.6, -6], driver: [-6, 2, 1], passenger: [6, 2, 1], interior: [0, 1.4, 1.2] };
const comparisonData = {
  venue: { price: "₹7.89–15.51 lakh", powertrain: "1.2L petrol · 1.0L turbo · 1.5L diesel", economy: "18.05–24.2 kmpl", seats: "5", type: "Compact SUV" },
  "grand-i10-nios": { price: "₹5.47–8.09 lakh", powertrain: "1.2L petrol / CNG", economy: "16 kmpl · 27.5 km/kg", seats: "5", type: "Hatchback" },
  i20: { price: "₹6.00–10.68 lakh", powertrain: "1.2L petrol · 1.0L turbo", economy: "16–20 kmpl", seats: "5", type: "Premium hatchback" },
  verna: { price: "₹10.99–18.46 lakh", powertrain: "1.5L petrol · 1.5L turbo", economy: "18.6–20.6 kmpl", seats: "5", type: "Sedan" },
  creta: { price: "₹10.91–20.46 lakh", powertrain: "1.5L petrol · turbo · diesel", economy: "17.4–21.8 kmpl", seats: "5", type: "Midsize SUV" },
  alcazar: { price: "₹14.51–21.96 lakh", powertrain: "1.5L diesel · 1.5L turbo", economy: "17.5–20.4 kmpl", seats: "6/7", type: "Family SUV" },
  "ioniq-5": { price: "₹45.95–55.70 lakh", powertrain: "84 kWh electric motor", economy: "631 km ARAI range", seats: "5", type: "Electric crossover" }
};

let selectedKey = "venue";
let state = { colour: "white", wheels: "standard", interior: "black" };
let scene, camera, renderer, controls, currentModel, placeholder, autoRotate = false;
let targetCamera = new THREE.Vector3(...cameraPositions.exterior);
const $ = (selector) => document.querySelector(selector);
const money = (number) => `₹${number.toLocaleString("en-IN")}`;

function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#121b24");
  camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(...cameraPositions.exterior);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  $("#canvasMount").appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.06; controls.minDistance = 2.5; controls.maxDistance = 11; controls.maxPolarAngle = Math.PI / 2.05; controls.target.set(0, 0.8, 0);
  scene.add(new THREE.HemisphereLight("#dceeff", "#27313b", 2.2));
  const key = new THREE.DirectionalLight("#ffffff", 4); key.position.set(4, 7, 5); key.castShadow = true; scene.add(key);
  const rim = new THREE.DirectionalLight("#7faeff", 3); rim.position.set(-5, 3, -5); scene.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial({ color: "#101820", roughness: .3, metalness: .25 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  window.addEventListener("resize", resize);
  resize();
  renderer.domElement.addEventListener("pointerdown", () => { if (autoRotate) toggleAutoRotate(false); });
  animate();
}

function resize() { if (!renderer) return; const mount = $("#canvasMount"); const width = mount.clientWidth; const height = mount.clientHeight; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); }

function createPlaceholder() {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: colours[state.colour].hex, metalness: .65, roughness: .24 });
  const dark = new THREE.MeshStandardMaterial({ color: "#17242e", metalness: .3, roughness: .2 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.8, .65, 1.65), bodyMaterial); body.position.y = .85; body.castShadow = true; group.add(body);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.05, .38, 1.55), bodyMaterial); hood.position.set(-1.72, 1.15, 0); hood.rotation.z = -.1; hood.castShadow = true; group.add(hood);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.85, .62, 1.4), bodyMaterial); roof.position.set(.25, 1.38, 0); roof.rotation.z = .12; roof.castShadow = true; group.add(roof);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.6, .42, 1.43), dark); glass.position.set(.22, 1.45, 0); glass.rotation.z = .12; group.add(glass);
  [-1.25, 1.25].forEach((x) => { const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .22, 32), new THREE.MeshStandardMaterial({ color: "#111519", roughness: .4 })); wheel.rotation.x = Math.PI / 2; wheel.position.set(x, .45, .82); wheel.castShadow = true; group.add(wheel.clone()); wheel.position.z = -.82; group.add(wheel); });
  group.scale.setScalar(1.05); group.position.y = .2; return group;
}

function disposeModel(object) { object?.traverse((child) => { if (child.geometry) child.geometry.dispose(); if (child.material) (Array.isArray(child.material) ? child.material : [child.material]).forEach((material) => { material.map?.dispose(); material.dispose(); }); }); }
function removeCurrentVehicle() { if (currentModel) { scene.remove(currentModel); disposeModel(currentModel); currentModel = null; } }
function showPlaceholder(hideError = true) { removeCurrentVehicle(); placeholder = createPlaceholder(); currentModel = placeholder; scene.add(currentModel); $("#viewerLoading").hidden = true; $("#modelError").hidden = hideError; applyColour(); }

function loadVehicle(key) {
  selectedKey = key; const config = vehicleConfigs[key]; state = { colour: config.defaultColour, wheels: "standard", interior: "black" };
  renderVehicleNav(); updateUI(); removeCurrentVehicle(); $("#viewerLoading").hidden = false; $("#modelError").hidden = true; $("#loadingProgress").textContent = "Loading 3D model…";
  const loader = new GLTFLoader();
  loader.load(config.model, (gltf) => { currentModel = gltf.scene; currentModel.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; console.log("Mesh:", child.name, "Material:", child.material?.name); } }); centerAndScale(currentModel); scene.add(currentModel); $("#viewerLoading").hidden = true; applyColour(); }, (event) => { if (event.total) $("#loadingProgress").textContent = `${Math.round(event.loaded / event.total * 100)}%`; }, () => { $("#viewerLoading").hidden = true; showPlaceholder(false); });
}

function centerAndScale(model) { const box = new THREE.Box3().setFromObject(model); const size = box.getSize(new THREE.Vector3()); const center = box.getCenter(new THREE.Vector3()); model.position.sub(center); model.position.y += size.y / 2; const scale = 3.8 / Math.max(size.x, size.y, size.z); model.scale.setScalar(scale); controls.target.set(0, .8, 0); resetCamera(); }
function findMaterials(names) { const materials = []; currentModel?.traverse((child) => { if (!child.isMesh) return; const list = Array.isArray(child.material) ? child.material : [child.material]; list.forEach((material) => { if (names.some((name) => material.name.toLowerCase().includes(name.toLowerCase()))) materials.push(material); }); }); return materials; }
function applyColour() { const config = vehicleConfigs[selectedKey]; const materialList = findMaterials(config.bodyMaterials); materialList.forEach((material) => material.color.set(colours[state.colour].hex)); if (placeholder) placeholder.traverse((child) => { if (child.isMesh && child.geometry.type === "BoxGeometry") child.material.color.set(colours[state.colour].hex); }); updateUI(); }
function changeWheels(key) { state.wheels = key; const materials = findMaterials(vehicleConfigs[selectedKey].wheelMaterials); const colour = key === "black" ? "#161b20" : key === "premium" ? "#d7dde2" : "#9da8af"; materials.forEach((material) => material.color.set(colour)); updateUI(); }
function changeInterior(key) { state.interior = key; findMaterials(vehicleConfigs[selectedKey].interiorMaterials).forEach((material) => material.color.set(key === "beige" ? "#c8b59a" : "#1a2026")); updateUI(); }
function calculatedPrice() { const config = vehicleConfigs[selectedKey]; return config.basePrice + colours[state.colour].price + wheels[state.wheels].price + interiors[state.interior].price; }
function updateUI() { const config = vehicleConfigs[selectedKey]; const colour = colours[state.colour]; $("#vehicleName").textContent = config.name; $("#summaryVehicle").textContent = config.name; $("#vehicleCategory").textContent = config.category; $("#selectedColour").textContent = colour.name; $("#selectedWheels").textContent = wheels[state.wheels].name; $("#selectedInterior").textContent = interiors[state.interior].name; $("#summaryColour").textContent = colour.name; $("#summaryWheels").textContent = wheels[state.wheels].name; $("#summaryInterior").textContent = interiors[state.interior].name; $("#finalPrice").textContent = money(calculatedPrice()); $("#infoTitle").textContent = `${config.name}, made for the everyday.`; $("#infoDescription").textContent = config.description; $("#infoSpecs").innerHTML = config.specs.map(([value, label]) => `<div><b>${value}</b><span>${label}</span></div>`).join(""); renderOptions(); }
function renderOptions() { $("#colourOptions").innerHTML = Object.entries(colours).map(([key, value]) => `<button class="swatch ${state.colour === key ? "selected" : ""}" title="${value.name}" aria-label="${value.name}" style="background:${value.hex}" data-colour="${key}"></button>`).join(""); $("#wheelOptions").innerHTML = Object.entries(wheels).map(([key, value]) => `<button class="choice ${state.wheels === key ? "selected" : ""}" data-wheel="${key}">${value.name}${value.price ? ` · +${money(value.price)}` : ""}</button>`).join(""); $("#interiorOptions").innerHTML = Object.entries(interiors).map(([key, value]) => `<button class="choice ${state.interior === key ? "selected" : ""}" data-interior="${key}">${value.name}${value.price ? ` · +${money(value.price)}` : ""}</button>`).join(""); document.querySelectorAll("[data-colour]").forEach((button) => button.onclick = () => { state.colour = button.dataset.colour; applyColour(); }); document.querySelectorAll("[data-wheel]").forEach((button) => button.onclick = () => changeWheels(button.dataset.wheel)); document.querySelectorAll("[data-interior]").forEach((button) => button.onclick = () => changeInterior(button.dataset.interior)); }
function resetCamera() { targetCamera.set(...cameraPositions.exterior); document.querySelectorAll(".camera-button").forEach((button) => button.classList.toggle("active", button.dataset.camera === "exterior")); }
function moveCamera(position) { targetCamera.set(...cameraPositions[position]); document.querySelectorAll(".camera-button").forEach((button) => button.classList.toggle("active", button.dataset.camera === position)); }
function toggleAutoRotate(value = !autoRotate) { autoRotate = value; $("#autoRotate").classList.toggle("on", value); }
function animate() { requestAnimationFrame(animate); if (autoRotate && currentModel) currentModel.rotation.y += .004; camera.position.lerp(targetCamera, .055); controls.update(); renderer.render(scene, camera); }

function renderVehicleNav() { const groups = [["SUV", ["venue", "creta", "alcazar"]], ["Hatchback", ["grand-i10-nios", "i20"]], ["Sedan", ["verna"]], ["Electric", ["ioniq-5"]]]; $("#vehicleNav").innerHTML = groups.flatMap(([group, keys]) => keys.map((key) => `<button class="${key === selectedKey ? "active" : ""}" data-vehicle="${key}">${vehicleConfigs[key].name.replace("Hyundai ", "")}<small>${group}</small></button>`)).join(""); document.querySelectorAll("[data-vehicle]").forEach((button) => button.onclick = () => loadVehicle(button.dataset.vehicle)); }
function openModal() { $("#modalVehicle").textContent = vehicleConfigs[selectedKey].name; $("#testDriveModal").hidden = false; $("#confirmation").hidden = true; $("#testDriveForm").hidden = false; }
function renderComparison() {
  const first = $("#compareOne").value;
  const second = $("#compareTwo").value;
  const rows = [["Starting price", "price"], ["Powertrain", "powertrain"], ["Mileage / range", "economy"], ["Seats", "seats"], ["Body style", "type"]];
  $("#comparisonTable").innerHTML = `<div class="compare-row compare-head"><span>Specification</span><strong>${vehicleConfigs[first].name.replace("Hyundai ", "")}</strong><strong>${vehicleConfigs[second].name.replace("Hyundai ", "")}</strong></div>${rows.map(([label, key]) => `<div class="compare-row"><span>${label}</span><b>${comparisonData[first][key]}</b><b>${comparisonData[second][key]}</b></div>`).join("")}`;
}
function initComparison() {
  const options = Object.entries(vehicleConfigs).map(([key, config]) => `<option value="${key}">${config.name}</option>`).join("");
  $("#compareOne").innerHTML = options; $("#compareTwo").innerHTML = options;
  $("#compareOne").value = "venue"; $("#compareTwo").value = "creta";
  $("#compareOne").addEventListener("change", renderComparison); $("#compareTwo").addEventListener("change", renderComparison); renderComparison();
}
document.addEventListener("DOMContentLoaded", () => { initThree(); renderVehicleNav(); loadVehicle(selectedKey); initComparison(); $("#autoRotate").onclick = () => toggleAutoRotate(); $("#resetView").onclick = resetCamera; $("#rotateLeft").onclick = () => { if (currentModel) currentModel.rotation.y -= .18; }; $("#rotateRight").onclick = () => { if (currentModel) currentModel.rotation.y += .18; }; document.querySelectorAll(".camera-button").forEach((button) => button.onclick = () => moveCamera(button.dataset.camera)); $("#resetConfig").onclick = () => { state = { colour: vehicleConfigs[selectedKey].defaultColour, wheels: "standard", interior: "black" }; toggleAutoRotate(false); applyColour(); changeWheels("standard"); changeInterior("black"); resetCamera(); }; $("#usePlaceholder").onclick = showPlaceholder; $("#headerTestDrive").onclick = openModal; $("#testDrive").onclick = openModal; $("#closeModal").onclick = () => { $("#testDriveModal").hidden = true; }; $("#testDriveModal").onclick = (event) => { if (event.target.id === "testDriveModal") $("#testDriveModal").hidden = true; }; $("#testDriveForm").onsubmit = (event) => { event.preventDefault(); $("#testDriveForm").hidden = true; $("#confirmation").hidden = false; }; $("#fullscreenViewer").onclick = () => { const viewer = $("#viewer"); if (document.fullscreenElement) document.exitFullscreen(); else viewer.requestFullscreen?.(); }; });
