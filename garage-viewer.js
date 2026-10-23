import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let scene;
let camera;
let renderer;
let controls;
let model;
let activeVehicle;

const $ = (selector) => document.querySelector(selector);

function makeApproximation(vehicle) {
  const group = new THREE.Group();
  const isSuv = /suv|venue|creta|alcazar/i.test(`${vehicle.model} ${vehicle.variant}`);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: "#657ea1", metalness: 0.55, roughness: 0.3 });
  const glassMaterial = new THREE.MeshStandardMaterial({ color: "#172a42", metalness: 0.2, roughness: 0.16 });
  const tyreMaterial = new THREE.MeshStandardMaterial({ color: "#0a0f17", roughness: 0.56 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.66, 1.68), bodyMaterial);
  body.position.y = 0.82;
  body.castShadow = true;
  group.add(body);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.37, 1.58), bodyMaterial);
  hood.position.set(-1.72, 1.13, 0);
  hood.rotation.z = -0.08;
  hood.castShadow = true;
  group.add(hood);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(isSuv ? 2.15 : 1.85, 0.7, 1.4), bodyMaterial);
  roof.position.set(0.22, isSuv ? 1.45 : 1.35, 0);
  roof.rotation.z = isSuv ? 0.04 : 0.12;
  roof.castShadow = true;
  group.add(roof);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(isSuv ? 1.9 : 1.62, 0.46, 1.43), glassMaterial);
  glass.position.set(0.2, isSuv ? 1.48 : 1.42, 0);
  glass.rotation.z = isSuv ? 0.04 : 0.12;
  group.add(glass);
  [-1.25, 1.25].forEach((x) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.24, 32), tyreMaterial);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.43, 0.85);
    wheel.castShadow = true;
    group.add(wheel);
    const rearWheel = wheel.clone();
    rearWheel.position.z = -0.85;
    group.add(rearWheel);
  });
  group.position.y = 0.16;
  return group;
}

function dispose(object) {
  object?.traverse((child) => {
    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.filter(Boolean).forEach((material) => material.dispose());
  });
}

function initViewer() {
  const mount = $("#viewerStage");
  if (!mount || renderer) return;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(4.6, 2.5, 6);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 2.6;
  controls.maxDistance = 10;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.target.set(0, 0.9, 0);
  scene.add(new THREE.HemisphereLight("#e4efff", "#111c2e", 2.2));
  const key = new THREE.DirectionalLight("#ffffff", 3.5);
  key.position.set(4, 7, 5);
  key.castShadow = true;
  scene.add(key);
  const rim = new THREE.DirectionalLight("#739cff", 2.5);
  rim.position.set(-5, 3, -5);
  scene.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial({ color: "#0a1424", roughness: 0.32, metalness: 0.22 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  window.addEventListener("resize", resize);
  $("#viewerReset").addEventListener("click", reset);
  $("#viewerFullscreen").addEventListener("click", () => document.fullscreenElement ? document.exitFullscreen() : $("#vehicleViewer").requestFullscreen?.());
  resize();
  animate();
}

function resize() {
  if (!renderer) return;
  const mount = $("#viewerStage");
  const width = mount.clientWidth;
  const height = mount.clientHeight;
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function reset() {
  if (!controls) return;
  camera.position.set(4.6, 2.5, 6);
  controls.target.set(0, 0.9, 0);
  controls.reset();
}

function renderVehicle(vehicle) {
  initViewer();
  activeVehicle = vehicle;
  $("#viewerLoading").hidden = false;
  $("#viewerError").hidden = true;
  if (model) {
    scene.remove(model);
    dispose(model);
  }
  const finish = (loadedModel, note, status) => {
    model = loadedModel;
    scene.add(model);
    $("#viewerLoading").hidden = true;
    $("#viewerNote").textContent = note;
    $("#selectedVehicleName").textContent = `${vehicle.make} ${vehicle.model}${vehicle.variant ? ` · ${vehicle.variant}` : ""}`;
    $("#selectedVehicleStatus").textContent = status;
    renderDetails(vehicle);
    reset();
  };
  if (!vehicle.viewer?.assetUrl) {
    finish(makeApproximation(vehicle), vehicle.viewer?.message || "Approximate showroom model.", "Approximate model · exact GLB/GLTF asset not available");
    return;
  }
  new GLTFLoader().load(vehicle.viewer.assetUrl, (gltf) => {
    gltf.scene.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);
    gltf.scene.position.y += size.y / 2;
    gltf.scene.scale.setScalar(3.8 / Math.max(size.x, size.y, size.z));
    finish(gltf.scene, vehicle.viewer.message, "Verified vehicle asset · exact model file");
  }, undefined, () => {
    $("#viewerError").hidden = false;
    $("#viewerError").textContent = "The verified model could not be loaded. Showing the safe approximate showroom model.";
    finish(makeApproximation(vehicle), "Verified asset failed to load; approximate showroom model shown.", "Approximate model · asset loading failed");
  });
}

function renderDetails(vehicle) {
  const rows = [
    ["Registration", vehicle.registrationNumber || "Not provided"],
    ["Year", vehicle.year || "Not provided"],
    ["Fuel", vehicle.fuelType || "Not provided"],
    ["Transmission", vehicle.transmission || "Not provided"],
    ["Mileage", vehicle.mileage || "Not provided"],
    ["Next service", vehicle.nextServiceDate || "Not scheduled"]
  ];
  $("#vehicleDetails").innerHTML = `<p class="kicker">VEHICLE DETAILS</p><h3>${vehicle.make} ${vehicle.model}</h3><div class="detail-grid">${rows.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div><div class="detail-history"><strong>Service history</strong><p>${vehicle.serviceHistory?.length ? vehicle.serviceHistory.join("<br>") : "No maintenance records have been added yet."}</p></div>`;
}

function selectVehicle(id) {
  const vehicle = (window.garageVehicles || []).find((item) => item.id === id);
  if (!vehicle) return;
  const select = $("#vehicleSelect");
  select.innerHTML = (window.garageVehicles || []).map((item) => `<option value="${item.id}">${item.make} ${item.model}</option>`).join("");
  select.value = id;
  document.querySelectorAll("[data-vehicle-card]").forEach((card) => card.classList.toggle("selected", card.dataset.vehicleCard === id));
  renderVehicle(vehicle);
}

function animate() {
  requestAnimationFrame(animate);
  controls?.update();
  if (renderer) renderer.render(scene, camera);
}

window.addEventListener("garage:vehicles-ready", () => {
  if (window.garageVehicles?.length) selectVehicle(window.garageVehicles[0].id);
});
window.addEventListener("garage:select", (event) => selectVehicle(event.detail));
document.addEventListener("DOMContentLoaded", () => {
  $("#vehicleSelect")?.addEventListener("change", (event) => selectVehicle(event.target.value));
  if (window.garageVehicles?.length) selectVehicle(window.garageVehicles[0].id);
});
