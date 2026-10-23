const knowledgeBase = {
  engine: { title: "Start with the warning light safely.", summary: "A warning light can be caused by anything from a loose fuel cap to an emissions or engine fault.", urgency: "MEDIUM URGENCY", causes: [["Loose fuel cap", "Check that the cap clicks tightly after refuelling."], ["Sensor or emissions fault", "The car may still drive normally, but a diagnostic scan is needed."], ["Low fluid or overheating", "Stop driving if the temperature warning is red or steam is visible."]], actions: [["Check the dashboard", "Note which light is on and whether it is steady or flashing."], ["Check the fuel cap", "Turn the engine off, let it cool, and check the cap is secure."], ["Book a scan", "If the light stays on, have the stored fault code read by a technician."]] },
  brakes: { title: "Brake noise deserves attention.", summary: "Squealing can be surface dust or pad wear; grinding, pulling, or a soft pedal is more urgent.", urgency: "HIGH URGENCY", causes: [["Worn brake pads", "The wear indicator may squeal when pads need replacement."], ["Debris or surface rust", "Light noise after rain can clear after gentle braking."], ["Disc, caliper, or hydraulic issue", "Grinding, pulling, or a soft pedal needs immediate inspection."]], actions: [["Check the pedal", "Do not drive if the pedal feels soft or braking distance has changed."], ["Look through the wheel", "Check for obvious damage or a severely worn pad without touching hot parts."], ["Arrange inspection", "Use an authorised workshop for brake-system diagnosis."]] },
  start: { title: "Let’s narrow down why it won’t start.", summary: "The most common causes are a weak battery, a key issue, or a fuel/ignition fault.", urgency: "MEDIUM URGENCY", causes: [["Weak battery", "Dim lights and a rapid clicking sound often point to low battery voltage."], ["Starter or connection fault", "One heavy click with full lights may need a technician."], ["Key, fuel, or immobiliser issue", "A warning symbol or no crank can require a diagnostic scan."]], actions: [["Check electrical power", "Turn on the headlights. If they are very dim, avoid repeated starting attempts."], ["Try the spare key", "If available, check whether the immobiliser recognises the other key."], ["Get a battery test", "A roadside technician can test the battery and starting circuit safely."]] },
  ac: { title: "Check the simple cooling causes first.", summary: "Warm air may be caused by a low refrigerant charge, a fuse, a blocked filter, or a compressor fault.", urgency: "LOW TO MEDIUM", causes: [["Cabin filter restriction", "A dirty filter can reduce airflow and cooling performance."], ["Low refrigerant", "A leak needs proper recovery and recharge equipment."], ["Fan, fuse, or compressor fault", "Electrical or refrigerant-system work should be handled professionally."]], actions: [["Check airflow", "Compare fan speeds and check whether air is weak from every vent."], ["Inspect the filter", "Replace it only if you can access the correct filter safely for your model."], ["Book AC service", "Do not release refrigerant yourself; use a qualified AC technician."]] },
  tyres: { title: "Inspect tyres and suspension before a long drive.", summary: "Uneven wear, bouncing, or knocking can affect grip and braking.", urgency: "MEDIUM URGENCY", causes: [["Incorrect tyre pressure", "Pressure changes can create uneven wear and poor handling."], ["Wheel alignment imbalance", "Pulling or steering-wheel vibration may need alignment or balancing."], ["Worn suspension part", "Clunks and repeated bouncing should be inspected."]], actions: [["Check cold pressure", "Use the pressure listed on the driver-door label, not the tyre sidewall."], ["Inspect tread", "Look for bulges, exposed cords, or tread below the legal limit."], ["Avoid damaged tyres", "Do not drive on a bulged, punctured, or visibly damaged tyre."]] },
  other: { title: "A clear description helps us narrow it down.", summary: "Include when it happens, what you hear or see, and whether any warning light is on.", urgency: "NEEDS MORE DETAIL", causes: [["Sound or vibration", "Note whether it changes with speed, braking, steering, or engine revs."], ["Warning light", "Share the exact symbol and whether it is steady or flashing."], ["Recent work or event", "Mention a service, pothole, refuelling, or battery change before it began."]], actions: [["Record the symptom", "Write down the conditions and frequency."], ["Check for immediate danger", "Stop if there is smoke, fuel smell, loss of braking, or overheating."], ["Submit more detail", "The more specific the description, the more useful the next step."]] }
};
const selected = { issue: "other" };
const ollamaConfig = { endpoint: "http://127.0.0.1:11434/api/generate", model: "deepseek-r1:latest" };
const researchConfig = { endpoint: "/api/research" };
const officialResources = {
  manuals: "https://www.hyundai.com/in/en/connect-to-service/hyundai-service/owners-manual",
  maintenance: "https://www.hyundai.com/in/en/connect-to-service/hyundai-service/periodic-maintenance-frequency",
  warranty: "https://www.hyundai.com/in/en/connect-to-service/warranty-policy/overview",
  campaigns: "https://www.hyundai.com/in/en/connect-to-service/important-customer-notification",
  roadside: "https://hyundai.awpassistance.in/Plan.aspx"
};
const hyundaiDetails = {
  "Grand i10 Nios": { summary: "City hatchback guidance: check tyre pressure, fluids, battery, clutch feel, brakes, and scheduled filters.", warranty: "Confirm coverage and exclusions in the official policy", manual: officialResources.manuals },
  Venue: { summary: "Compact SUV guidance: check turbo/engine warnings, DCT or manual shift behaviour, tyres, brakes, and cooling.", warranty: "Confirm coverage and exclusions in the official policy", manual: officialResources.manuals },
  i20: { summary: "Hatchback guidance: check engine warnings, clutch or DCT behaviour, AC airflow, tyres, and battery voltage.", warranty: "Confirm coverage and exclusions in the official policy", manual: officialResources.manuals },
  Verna: { summary: "Sedan guidance: check oil level, turbo or engine warnings, brakes, steering alignment, and automatic shift quality.", warranty: "Confirm coverage and exclusions in the official policy", manual: officialResources.manuals },
  Creta: { summary: "SUV guidance: check engine or diesel warnings, automatic/DCT response, tyre condition, cooling, and ADAS alerts.", warranty: "Confirm coverage and exclusions in the official policy", manual: officialResources.manuals },
  "Other model": { summary: "Select the exact model and year before using specifications, fluid grades, tyre pressures, or warning-light meanings.", warranty: "Confirm model-specific warranty terms", manual: officialResources.manuals }
};
const extendedKnowledgeBase = {
  oil: { title: "Treat oil warnings and leaks seriously.", summary: "Low oil can damage an engine quickly; a red oil-pressure warning means stop safely and switch the engine off.", urgency: "HIGH URGENCY", causes: [["Low engine oil", "Check the level on level ground only after following the owner’s manual procedure."], ["Oil leak", "Puddles, fresh drips, or a burning-oil smell need inspection."], ["Oil-pressure or sensor fault", "A warning that remains on while the engine runs requires professional diagnosis."]], actions: [["Stop for a red oil warning", "Do not continue driving to a workshop; request roadside help if the warning remains on."], ["Check the level safely", "Use the specified oil grade and never overfill."], ["Book service", "Have leaks, filters, and oil pressure checked by a qualified technician."]] },
  transmission: { title: "Gear changes should be smooth and predictable.", summary: "Slipping, harsh engagement, a burning smell, or inability to select a gear can become unsafe or cause expensive damage.", urgency: "MEDIUM TO HIGH", causes: [["Low or contaminated fluid", "The correct fluid and level procedure are model-specific."], ["Clutch wear", "Engine revs rising without matching acceleration can indicate clutch slip."], ["Automatic or DCT control fault", "Delayed shifts, warning lights, or repeated jerks may need a scan and software check."]], actions: [["Avoid hard acceleration", "Reduce load and stop if the car will not select gears or smells burnt."], ["Check for leaks", "Look for fluid under the car without touching hot components."], ["Arrange a diagnostic inspection", "Do not open or refill a sealed transmission system without the correct procedure."]] },
  battery: { title: "Check the battery and charging system.", summary: "Slow cranking, dim lights, repeated jump starts, or a battery warning can indicate a weak battery or alternator fault.", urgency: "MEDIUM URGENCY", causes: [["Discharged or aged battery", "Short trips, heat, and age can reduce battery capacity."], ["Loose or corroded connection", "Poor terminals can cause intermittent electrical problems."], ["Alternator or belt fault", "A battery light while driving means the car may stop after the battery is depleted."]], actions: [["Avoid repeated cranking", "Repeated attempts can flatten the battery and overheat the starter."], ["Inspect only when off", "Check for loose terminals or visible damage; never bridge terminals with metal."], ["Request a battery test", "Use a qualified technician for charging-system testing and correct jump-start procedure."]] },
  electrical: { title: "Electrical faults need controlled diagnosis.", summary: "Multiple warning lights, power-window failure, dead accessories, or an infotainment reboot may be a fuse, wiring, battery, or module issue.", urgency: "LOW TO MEDIUM", causes: [["Blown fuse", "A fuse can fail because of an underlying short; never replace it with a higher rating."], ["Low system voltage", "A weak battery or alternator can trigger unrelated warning lights."], ["Wiring or control-module fault", "Water ingress and damaged wiring need professional inspection."]], actions: [["Note what failed together", "Record the exact systems and warning messages."], ["Check the manual fuse chart", "Only replace a fuse with the same rating if the manual allows it."], ["Stop if there is smoke", "Disconnecting systems or probing airbags should be left to a technician."]] },
  fuel: { title: "Fuel smell or unusual smoke is a stop signal.", summary: "Poor economy may be maintenance-related, but fuel leaks, strong fuel smell, or heavy smoke can indicate fire or engine risk.", urgency: "HIGH URGENCY", causes: [["Fuel leak or vapour leak", "A strong smell after parking or visible wetness needs immediate attention."], ["Air-fuel or emissions fault", "A check-engine light with poor running needs a diagnostic scan."], ["Oil or coolant entering combustion", "Blue, white, or persistent black smoke needs professional diagnosis."]], actions: [["Stop away from ignition sources", "Switch off the engine and do not smoke or use flames nearby."], ["Do not search for a leak while hot", "Wait for professional assistance."], ["Arrange towing", "Do not drive with a fuel leak, heavy smoke, or severe misfire."]] },
  steering: { title: "Steering and alignment affect control.", summary: "Pulling, a crooked wheel, heavy steering, or steering vibration may involve tyres, alignment, suspension, or power assistance.", urgency: "MEDIUM TO HIGH", causes: [["Unequal tyre pressure", "Small pressure differences can make a car pull."], ["Alignment or wheel balance", "Pothole impacts can disturb alignment or bend a wheel."], ["Suspension or steering component wear", "Loose joints or power-assist faults can reduce control."]], actions: [["Check cold tyre pressure", "Use the door-label specification, not the sidewall maximum."], ["Reduce speed", "Avoid high-speed driving if the car pulls or the wheel vibrates."], ["Stop for heavy or failed steering", "Have the vehicle recovered for inspection."]] },
  lights: { title: "Keep lighting and visibility systems working.", summary: "Failed lamps, wipers, washers, or demisting can reduce visibility and should be fixed before night or rain driving.", urgency: "LOW TO HIGH", causes: [["Blown bulb or fuse", "A single failed lamp may be a bulb; repeated fuse failure suggests a fault."], ["Low washer fluid or blocked jet", "Simple cleaning or the correct fluid may restore operation."], ["Wiper motor, switch, or wiring fault", "Loss of both wipers in rain is unsafe."]], actions: [["Check the control and fuse chart", "Use the vehicle manual and the correct replacement rating."], ["Clean lenses and washer jets", "Do not use sharp metal tools in jets."], ["Do not drive without visibility", "Stop safely if wipers, headlights, or demisting fail in poor conditions."]] }
};
Object.assign(knowledgeBase, extendedKnowledgeBase);
const $ = (selector) => document.querySelector(selector);
const videoGuides = {
  tyres: ["Check your tyre pressure safely", "Use a pressure gauge on cold tyres, compare with the door-sticker value, and replace the valve cap.", ["Park safely and find the recommended pressure.", "Measure each tyre while cold.", "Add air in short bursts and recheck."]],
  engine: ["Check the fuel cap and warning light", "A loose fuel cap is a safe first check. Never open a hot coolant system.", ["Park and switch the engine off.", "Tighten the fuel cap until it clicks.", "If the light stays on, book a diagnostic scan."]],
  ac: ["Replace a cabin air filter", "If airflow is weak, a cabin filter may be clogged. Check your model manual before opening the housing.", ["Switch the car off and locate the filter cover.", "Remove and compare the old filter.", "Fit the new filter in the marked airflow direction."]],
  start: ["Prepare for a safe jump start", "Only use a compatible battery and follow your owner’s manual. Stop if the battery is cracked or leaking.", ["Park both vehicles safely and switch them off.", "Connect cables in the exact order in the manual.", "Start the assisting vehicle, then your car, and remove cables in reverse order."]],
  brakes: ["Brake noise: what to check", "A visual check is okay, but never attempt brake repairs without proper tools and training.", ["Park on level ground and let components cool.", "Look for obvious debris or damage without touching hot parts.", "Do not drive if the pedal is soft, braking changes, or grinding continues."]],
  other: ["Make a useful symptom video", "Record the sound or warning safely while parked. This helps a technician diagnose the issue.", ["Park somewhere safe before recording.", "Capture the dashboard and describe when it happens.", "Share the clip with a qualified technician."]]
};
Object.assign(videoGuides, {
  oil: ["Check engine oil safely", "Use the owner’s manual procedure, the correct oil grade, and never open a hot engine or overfill.", ["Park level and switch the engine off.", "Wait as specified, then check the dipstick or display.", "Stop and call for help if a red oil warning remains on."]],
  transmission: ["Notice gearbox symptoms safely", "Do not force a gear or continue driving through repeated slipping, harsh shifts, or a burning smell.", ["Park safely and note the selected gear.", "Check for warning messages or visible leaks without touching hot parts.", "Book a scan or request recovery if shifting becomes unsafe."]],
  battery: ["Check battery symptoms safely", "Use only the jump-start procedure in the owner’s manual and stop if the battery is cracked, swollen, or leaking.", ["Switch off electrical loads.", "Check for visible terminal looseness or corrosion without shorting the posts.", "Arrange a battery and charging-system test."]],
  electrical: ["Check a fuse safely", "Only use the same fuse rating shown in the manual; repeated fuse failure needs professional diagnosis.", ["Switch the vehicle off.", "Find the correct fuse chart in the manual.", "Stop if wiring is hot, wet, melted, or smoking."]],
  fuel: ["Respond to fuel smell or smoke", "Fuel leaks and heavy smoke can create fire or engine risks and are not home-repair jobs.", ["Stop away from traffic and ignition sources.", "Switch the engine off and do not smoke.", "Call roadside assistance or request towing."]],
  steering: ["Check steering and alignment clues", "Do not continue at speed if steering is heavy, loose, or the vehicle pulls sharply.", ["Check cold tyre pressures.", "Note whether pulling changes while braking.", "Arrange alignment or inspection; recover the car if control is affected."]],
  lights: ["Check lights and wipers safely", "Visibility failures are safety-critical in rain or darkness.", ["Switch the car off before checking bulbs or fuses.", "Use the manual’s fuse and bulb instructions.", "Do not drive if headlights, wipers, or demisting are unavailable."]]
});
const preTripTasks = [
  { id: "tyre-pressure", title: "Check tyre pressure", category: "tyres", icon: "◌", time: "5 min", difficulty: "Easy", safety: "Use door label", tools: "Gauge / pump", steps: [["🚙", "Park on level ground with tyres cold.", "Find the vehicle-specific pressure on the door label or manual."], ["◌", "Remove the valve cap.", "Connect the gauge squarely to the valve."], ["▣", "Compare the reading with the label.", "Add or release air in short bursts; refit the cap."], ["✓", "Walk around the car once more.", "Do not drive on a bulged, cut, or damaged tyre."]] },
  { id: "tyre-damage", title: "Inspect tyres for damage", category: "tyres", icon: "◉", time: "4 min", difficulty: "Easy", safety: "No tyre repairs", tools: "Torch", steps: [["🚙", "Turn the steering for access and park safely.", "Look at all four tyres, not only the visibly affected one."], ["◉", "Scan the sidewalls and tread.", "Look for bulges, cuts, exposed cords, nails, or missing tread."], ["↔", "Compare wear across the tread.", "Uneven wear can indicate pressure, alignment, or suspension problems."], ["⚠", "Stop if damage is visible.", "Use roadside help or a tyre professional; do not drive on a damaged tyre."]] },
  { id: "engine-oil", title: "Check engine oil level", category: "engine", icon: "◒", time: "6 min", difficulty: "Easy", safety: "Cool engine", tools: "Cloth", steps: [["🚙", "Park level, switch off, and wait as your manual specifies.", "Keep clear of moving or hot engine parts."], ["⌁", "Locate the dipstick or electronic oil display.", "Use the exact procedure in the owner manual."], ["▥", "Read between the marks.", "If low, add only the specified oil gradually—never overfill."], ["✓", "Recheck and close securely.", "A red oil-pressure warning while running means stop and get help."]] },
  { id: "coolant", title: "Check coolant safely", category: "engine", icon: "◍", time: "3 min", difficulty: "Easy", safety: "Cold engine only", tools: "Manual", steps: [["🚙", "Let the engine become completely cool.", "Never loosen a hot cooling-system cap."], ["◍", "Find the translucent coolant reservoir.", "Read the MIN and MAX marks from outside."], ["＋", "Compare the level with the marks.", "Only use manufacturer-approved coolant and procedure if topping up is allowed."], ["⚠", "Close the cap and inspect for leaks.", "Persistent loss, steam, or overheating needs roadside or technician help."]] },
  { id: "washer-fluid", title: "Check washer fluid", category: "visibility", icon: "💧", time: "2 min", difficulty: "Easy", safety: "Use correct fluid", tools: "Washer fluid", steps: [["▣", "Park and switch the engine off.", "Find the washer-fluid reservoir using the manual."], ["💧", "Check the level indicator or reservoir.", "Do not confuse it with the coolant reservoir."], ["＋", "Add suitable washer fluid if needed.", "Avoid plain water where freezing or contamination is a concern."], ["✓", "Test briefly and clean spills.", "Blocked jets or pump faults need service if cleaning does not help."]] },
  { id: "wipers", title: "Inspect windshield wipers", category: "visibility", icon: "⌁", time: "3 min", difficulty: "Easy", safety: "No cracked blades", tools: "Cloth", steps: [["⌁", "Lift each wiper carefully if the manual permits.", "Check the rubber edge for splits, hardening, or missing sections."], ["≋", "Inspect the arm and spring.", "Make sure the arm is not bent or loose."], ["💧", "Use washer fluid and test on a clean screen.", "Do not run dry wipers across dusty glass."], ["✓", "Replace or service if streaking remains.", "Do not drive in rain if visibility is poor."]] },
  { id: "lights", title: "Test all exterior lights", category: "visibility", icon: "☼", time: "5 min", difficulty: "Easy", safety: "Use a helper", tools: "Helper / reflection", steps: [["☼", "With the car parked, switch on headlights and hazards.", "Walk around the front, rear, and sides."], ["↔", "Test left and right indicators.", "Confirm the dashboard indicator behaves normally."], ["●", "Press the brake pedal with a helper or safe reflection.", "Check both brake lights and the high-level lamp."], ["✓", "Record any failed lamp.", "Use the manual for bulb/fuse guidance or book service."]] },
  { id: "battery", title: "Check battery condition", category: "electrical", icon: "▣", time: "3 min", difficulty: "Easy", safety: "No metal bridging", tools: "Torch", steps: [["▣", "Switch off the car and all electrical loads.", "Locate the battery using the manual."], ["◉", "Look for swelling, cracks, leaks, or loose mounting.", "Do not touch leaking battery material."], ["＋", "Check terminals for visible corrosion.", "Never bridge terminals or probe electrical systems."], ["⚠", "Stop if damaged or repeatedly flat.", "Arrange a battery and charging-system test."]] },
  { id: "belts-mirrors", title: "Check seat belts and mirrors", category: "visibility", icon: "◫", time: "4 min", difficulty: "Easy", safety: "Adjust parked", tools: "None", steps: [["◫", "Inspect each belt webbing and buckle.", "Look for frays, cuts, slow retraction, or a buckle that will not latch."], ["✓", "Pull each belt firmly once.", "It should lock and release correctly."], ["◒", "Clean and set mirrors while parked.", "Remove blind spots without obstructing the view."], ["⚠", "Do not drive with a failed restraint.", "Have the belt or mounting inspected professionally."]] },
  { id: "fuel-range", title: "Check fuel and estimated range", category: "emergency", icon: "⛽", time: "2 min", difficulty: "Easy", safety: "Plan a margin", tools: "Route plan", steps: [["⛽", "Read the fuel gauge and range display.", "Treat the estimate as approximate, not a guarantee."], ["⌁", "Consider traffic, hills, weather, and AC use.", "Range can change quickly in real conditions."], ["→", "Plan a suitable refuelling stop.", "Do not rely on the last warning segment for a long journey."], ["✓", "Keep a safety margin.", "Never carry fuel in an unapproved container."]] },
  { id: "spare-kit", title: "Check spare tyre and emergency kit", category: "emergency", icon: "🧰", time: "6 min", difficulty: "Easy", safety: "Do not work under car", tools: "Manual", steps: [["🧰", "Open the luggage compartment while parked.", "Find the spare, jack, warning triangle, and tools."], ["◉", "Check the spare visually and confirm inflation guidance.", "Do not assume the spare uses the same pressure."], ["⌁", "Check the jack and wheel wrench are present.", "Never go under a car supported only by a jack."], ["✓", "Pack a torch, gloves, charger, and first-aid kit.", "Replace missing or damaged emergency equipment."]] },
  { id: "windshield", title: "Inspect and clean windshield", category: "visibility", icon: "▱", time: "4 min", difficulty: "Easy", safety: "Park first", tools: "Glass cloth", steps: [["▱", "Park in shade if possible.", "Look across the glass from inside and outside."], ["✦", "Check for chips, cracks, and spreading damage.", "Do not use abrasive tools on the glass."], ["💧", "Apply suitable glass cleaner to a cloth.", "Avoid contaminating the dashboard or sensors."], ["✓", "Wipe until clear and check at an angle.", "A damaged windshield may need specialist repair before travel."]] },
  { id: "fluid-leaks", title: "Check for visible fluid leaks", category: "engine", icon: "╱", time: "3 min", difficulty: "Easy", safety: "No hot parts", tools: "Torch / cardboard", steps: [["🚙", "Look under the parked car from the side.", "Never crawl underneath or touch hot components."], ["╱", "Look for fresh drops or wet patches.", "Note the colour, smell, and location without handling it."], ["⚠", "Treat fuel, brake fluid, or coolant concerns seriously.", "Do not drive if there is a strong fuel smell or active leak."], ["☎", "Arrange inspection or recovery.", "A piece of cardboard can help show a technician the drip pattern."]] },
  { id: "closures", title: "Check doors, bonnet, and boot", category: "emergency", icon: "▣", time: "3 min", difficulty: "Easy", safety: "Close securely", tools: "None", steps: [["▣", "Open each door, the bonnet, and the boot while parked.", "Check hinges, latches, and visible seals."], ["⇩", "Close each panel firmly without slamming unnecessarily.", "Confirm the dashboard shows no open-panel warning."], ["↔", "Try each door handle gently.", "Doors should latch and remain closed."], ["✓", "Do not travel with an unsecured panel.", "Have a damaged latch or seal repaired."]] },
  { id: "emergency-kit", title: "Prepare an emergency kit", category: "emergency", icon: "✚", time: "8 min", difficulty: "Easy", safety: "Keep accessible", tools: "Kit bag", steps: [["✚", "Choose a visible, secure place in the cabin or boot.", "Do not block pedals, airbags, or the driver’s view."], ["🔦", "Pack a torch, charger, first-aid supplies, gloves, and water.", "Check batteries and expiry dates."], ["⚠", "Add a warning triangle and reflective vest.", "Use them only when safely away from traffic."], ["✓", "Keep documents and emergency contacts available.", "Call roadside help rather than attempting unsafe roadside repairs."]] }
];
let preTripSelected = null;
let preTripStep = 0;
let preTripTimer = null;
let preTripSpeed = 1;
const preTripCompleted = new Set();
function renderPreTripTasks() {
  const category = document.querySelector("#preTripFilters .active")?.dataset.category || "all";
  const query = ($("#preTripSearch").value || "").toLowerCase().trim();
  const visible = preTripTasks.filter((task) => (category === "all" || task.category === category) && (!query || `${task.title} ${task.tools} ${task.safety}`.toLowerCase().includes(query)));
  $("#preTripTasks").innerHTML = visible.map((task) => `<button class="pretrip-task ${preTripSelected?.id === task.id ? "selected" : ""} ${preTripCompleted.has(task.id) ? "done" : ""}" data-task="${task.id}" type="button"><span class="pretrip-task-top"><span class="pretrip-task-icon">${task.icon}</span><span><strong>${task.title}</strong><small>${task.safety}</small></span></span><span class="pretrip-task-meta"><b>${task.time}</b><span>${task.difficulty}</span><span>${task.tools}</span></span></button>`).join("") || `<p class="chat-status">No checks match that search.</p>`;
  document.querySelectorAll("[data-task]").forEach((button) => button.addEventListener("click", () => openPreTripTask(button.dataset.task)));
}
function updatePreTripProgress() {
  const count = preTripCompleted.size;
  $("#preTripProgress").textContent = `${count} / ${preTripTasks.length} complete`;
  $("#preTripProgressBar").style.width = `${Math.round(count / preTripTasks.length * 100)}%`;
}
function renderPreTripStep() {
  if (!preTripSelected) return;
  const step = preTripSelected.steps[preTripStep];
  $("#scenePart").textContent = step[0];
  $("#sceneLabel").textContent = step[1];
  $("#tutorialStepNumber").textContent = `Step ${preTripStep + 1} of ${preTripSelected.steps.length}`;
  $("#tutorialCaption").textContent = step[2];
  $("#tutorialProgressBar").style.width = `${Math.round((preTripStep + 1) / preTripSelected.steps.length * 100)}%`;
  $("#tutorialScene").classList.remove("is-playing");
  void $("#tutorialScene").offsetWidth;
  $("#tutorialScene").classList.add("is-playing");
  $("#tutorialPrev").disabled = preTripStep === 0;
  $("#tutorialNext").disabled = preTripStep === preTripSelected.steps.length - 1;
  $("#tutorialTranscript").innerHTML = preTripSelected.steps.map((item, index) => `<li><strong>Step ${index + 1}:</strong> ${item[1]} — ${item[2]}</li>`).join("");
  $("#tutorialWarning").hidden = !["⚠", "☎"].includes(step[0]);
}
function openPreTripTask(id) {
  clearInterval(preTripTimer);
  preTripSelected = preTripTasks.find((task) => task.id === id);
  preTripStep = 0;
  $("#tutorialCategory").textContent = preTripSelected.category.toUpperCase();
  $("#tutorialTitle").textContent = preTripSelected.title;
  $("#tutorialMeta").textContent = `${preTripSelected.time} · ${preTripSelected.difficulty} · Tools: ${preTripSelected.tools}`;
  $("#tutorialComplete").textContent = preTripCompleted.has(id) ? "✓ Completed" : "✓ Mark complete";
  $("#tutorialPanel").hidden = false;
  renderPreTripTasks();
  renderPreTripStep();
  $("#tutorialPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function playPreTrip() {
  if (!preTripSelected) return;
  clearInterval(preTripTimer);
  $("#tutorialPlay").textContent = "Ⅱ Pause";
  preTripTimer = setInterval(() => {
    if (preTripStep >= preTripSelected.steps.length - 1) {
      clearInterval(preTripTimer);
      $("#tutorialPlay").textContent = "▶ Play";
      return;
    }
    preTripStep += 1;
    renderPreTripStep();
  }, 2600 / preTripSpeed);
}
function initPreTrip() {
  renderPreTripTasks();
  updatePreTripProgress();
  $("#preTripSearch").addEventListener("input", renderPreTripTasks);
  document.querySelectorAll("#preTripFilters button").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll("#preTripFilters button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderPreTripTasks();
  }));
  $("#tutorialClose").addEventListener("click", () => { clearInterval(preTripTimer); $("#tutorialPanel").hidden = true; });
  $("#tutorialPlay").addEventListener("click", () => {
    if (preTripTimer) { clearInterval(preTripTimer); preTripTimer = null; $("#tutorialPlay").textContent = "▶ Play"; } else playPreTrip();
  });
  $("#tutorialPrev").addEventListener("click", () => { if (preTripStep > 0) { preTripStep -= 1; renderPreTripStep(); } });
  $("#tutorialNext").addEventListener("click", () => { if (preTripSelected && preTripStep < preTripSelected.steps.length - 1) { preTripStep += 1; renderPreTripStep(); } });
  $("#tutorialRestart").addEventListener("click", () => { clearInterval(preTripTimer); preTripTimer = null; preTripStep = 0; $("#tutorialPlay").textContent = "▶ Play"; renderPreTripStep(); });
  $("#tutorialSpeed").addEventListener("change", (event) => { preTripSpeed = Number(event.target.value); if (preTripTimer) playPreTrip(); });
  $("#tutorialFullscreen").addEventListener("click", () => $("#tutorialPanel").requestFullscreen?.());
  $("#tutorialComplete").addEventListener("click", () => {
    if (!preTripSelected) return;
    if (preTripCompleted.has(preTripSelected.id)) preTripCompleted.delete(preTripSelected.id); else preTripCompleted.add(preTripSelected.id);
    $("#tutorialComplete").textContent = preTripCompleted.has(preTripSelected.id) ? "✓ Completed" : "✓ Mark complete";
    renderPreTripTasks();
    updatePreTripProgress();
  });
  $("#tutorialAsk").addEventListener("click", () => {
    if (!preTripSelected) return;
    $("#chatInput").value = `Explain the current ${preTripSelected.title} step for my ${$("#modelSelect").value}.`;
    $("#motoriqChat").scrollIntoView({ behavior: "smooth" });
    $("#chatInput").focus();
  });
}
function updateModelDetail() {
  const model = $("#modelSelect").value;
  const detail = hyundaiDetails[model] || hyundaiDetails["Other model"];
  $("#modelDetailTitle").textContent = model;
  $("#modelDetailSummary").textContent = detail.summary;
  $("#modelWarranty").textContent = detail.warranty;
  $("#modelManualLink").href = detail.manual;
}
let videoTimer;
let diagnosisRequestId = 0;
let activeGuide = null;
const chatHistory = [{
  role: "system",
  content: "You are MotorIQ, a cautious automotive assistant for Hyundai vehicles in India. Give clear, safety-first guidance. Do not invent model-specific specifications. Never instruct users to work on airbags, open hot cooling systems, release refrigerant, disable safety systems, or drive an unsafe vehicle. Recommend an authorised technician or roadside assistance for smoke, fuel leaks, overheating, loss of braking, or unsafe steering."
}];
function updateVideoGuide(issue) {
  const guide = videoGuides[issue] || videoGuides.other;
  activeGuide = { title: guide[0], description: guide[1], steps: guide[2], generated: false };
  $("#videoKicker").textContent = "QUICK HOW-TO · CUSTOMER SAFE";
  $("#videoTitle").textContent = guide[0];
  $("#videoDescription").textContent = guide[1];
  $("#videoStep").textContent = "Press play to see the steps";
  $("#videoProgress").style.width = "0%";
  $("#videoGuide").classList.remove("playing");
}
function renderResult(issue) {
  const data = knowledgeBase[issue];
  $("#resultTitle").textContent = data.title;
  $("#resultSummary").textContent = `${$("#makeSelect").value} ${$("#modelSelect").value}: ${data.summary}`;
  $("#urgencyPill").textContent = data.urgency;
  $("#causeList").innerHTML = data.causes.map(([title, text]) => `<div class="cause-row"><span>!</span><div><strong>${title}</strong><p>${text}</p></div></div>`).join("");
  $("#actionList").innerHTML = data.actions.map(([title, text], index) => `<div class="action-row"><span>${index + 1}</span><div><strong>${title}</strong><p>${text}</p></div></div>`).join("");
  updateVideoGuide(issue);
  $("#aiResult").hidden = true;
  $("#resultSection").hidden = false;
  $("#technician").classList.add("inspection-ready");
  $("#resultSection").scrollIntoView({ behavior: "smooth", block: "start" });
}
function cleanOllamaResponse(text) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}
async function researchProblem(issue, symptom) {
  const model = $("#modelSelect").value;
  const year = $("#yearSelect").value;
  const query = `${model} ${year} ${issue} ${symptom}`.trim();
  const response = await fetch(`${researchConfig.endpoint}?q=${encodeURIComponent(query)}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Web research returned ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload.sources)) throw new Error("Web research returned an invalid result");
  return payload.sources;
}
async function requestOllama(issue, symptom, sources) {
  const model = $("#modelSelect").value;
  const make = $("#makeSelect").value;
  const year = $("#yearSelect").value;
  const data = knowledgeBase[issue] || knowledgeBase.other;
  const prompt = `You are MotorIQ, a cautious automotive triage assistant for ${make} ${model}, ${year}, in India.
User symptom: ${symptom || "No additional description; use the selected category."}
Category: ${issue}
Curated baseline: ${data.summary}
Live research sources fetched now:
${sources.length ? sources.map((source, index) => `${index + 1}. ${source.title} — ${source.snippet}\nPage excerpt: ${source.excerpt || "The page could not be read; use only the search snippet."}\nURL: ${source.url}`).join("\n") : "No trusted source was found; rely on the curated baseline and official manual links."}

Use these verified reference boundaries: the Hyundai owner manual is the authority for warning lights, tyre pressures, fluid specifications, and model/year procedures; the Hyundai warranty policy excludes many wear-and-tear items and requires authorised warranty service; the official Hyundai campaign page is the authority for VIN-based recall or service-campaign status.

Return JSON only with this exact shape:
{"title":"short title","summary":"plain-language explanation","urgency":"LOW|MEDIUM|HIGH|STOP","causes":["cause 1","cause 2","cause 3"],"actions":["safe action 1","safe action 2","safe action 3"],"escalate":true,"guide":{"title":"short animated guide title","description":"one sentence explaining the safe check","steps":["short scene 1","short scene 2","short scene 3"]}}

The guide must contain exactly 3 or 4 short, visual, customer-safe scenes. It is a storyboard for MotorIQ’s in-page animation, not a real repair video. Never invent model-specific fluid grades, torque values, part numbers, or repair intervals. Do not instruct a user to disable safety systems, work on airbags, open hot cooling systems, release refrigerant, or drive an unsafe car.`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  let response;
  try {
    response = await fetch(ollamaConfig.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: ollamaConfig.model, prompt, stream: false, format: "json", think: false, options: { temperature: 0.2 } }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
  const payload = await response.json();
  const parsed = JSON.parse(cleanOllamaResponse(payload.response || ""));
  if (!parsed || !Array.isArray(parsed.causes) || !Array.isArray(parsed.actions)) throw new Error("Ollama returned an invalid result");
  if (!parsed.guide || typeof parsed.guide.title !== "string" || typeof parsed.guide.description !== "string" || !Array.isArray(parsed.guide.steps) || parsed.guide.steps.length < 3) {
    throw new Error("Ollama returned an invalid animation guide");
  }
  parsed.guide.steps = parsed.guide.steps.filter((step) => typeof step === "string" && step.trim()).slice(0, 4);
  if (parsed.guide.steps.length < 3) throw new Error("Ollama returned too few animation steps");
  return parsed;
}
function renderResearchSources(sources) {
  const container = $("#researchSources");
  container.innerHTML = "";
  if (!sources.length) {
    container.textContent = "No additional trusted web sources were found for this symptom.";
    return;
  }
  sources.slice(0, 5).forEach((source) => {
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = source.title || source.url;
    container.append(link);
  });
}
function renderAnimatedGuide(guide) {
  activeGuide = { title: guide.title, description: guide.description, steps: guide.steps, generated: true };
  $("#videoKicker").textContent = "OLLAMA ANIMATED GUIDE · CUSTOMER SAFE";
  $("#videoTitle").textContent = guide.title;
  $("#videoDescription").textContent = guide.description;
  $("#videoStep").textContent = "Press play to see Ollama’s visual steps";
  $("#videoProgress").style.width = "0%";
  $("#videoGuide").classList.remove("playing");
}
function renderOllamaResult(result) {
  $("#aiTitle").textContent = result.title || "AI-assisted explanation";
  $("#aiSummary").textContent = result.summary || "Ollama provided additional context for this symptom.";
  $("#aiCauses").innerHTML = result.causes.slice(0, 4).map((item) => `<li>${item}</li>`).join("");
  $("#aiActions").innerHTML = result.actions.slice(0, 4).map((item) => `<li>${item}</li>`).join("");
  renderAnimatedGuide(result.guide);
  $("#aiResult").hidden = false;
}
function appendChatMessage(role, content = "") {
  const message = document.createElement("div");
  message.className = `chat-message ${role}`;
  const label = document.createElement("strong");
  label.textContent = role === "user" ? "You" : "MotorIQ";
  const text = document.createElement("p");
  text.textContent = content;
  message.append(label, text);
  $("#chatMessages").append(message);
  message.scrollIntoView({ block: "nearest", behavior: "smooth" });
  return text;
}
async function streamChatReply(messages, onToken) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.error || `Chat request failed with ${response.status}`);
  }
  if (!response.body) throw new Error("The chat response did not provide a stream.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const payload = JSON.parse(line);
      const token = payload.message?.content || "";
      fullText += token;
      onToken(token);
      if (payload.done) return fullText;
    }
    if (done) break;
  }
  if (buffer.trim()) {
    const payload = JSON.parse(buffer);
    const token = payload.message?.content || "";
    fullText += token;
    onToken(token);
  }
  return fullText;
}
function initChat() {
  $("#chatForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = $("#chatInput");
    const send = $("#chatSend");
    const status = $("#chatStatus");
    const content = input.value.trim();
    if (!content || send.disabled) return;
    const context = `Vehicle context: ${$("#makeSelect").value} ${$("#modelSelect").value}, ${$("#yearSelect").value}.`;
    const userContent = `${context}\nUser question: ${content}`;
    chatHistory.push({ role: "user", content: userContent });
    appendChatMessage("user", content);
    input.value = "";
    send.disabled = true;
    send.classList.add("loading");
    status.textContent = "MotorIQ is thinking with Ollama…";
    const reply = appendChatMessage("assistant", "");
    try {
      const answer = await streamChatReply(chatHistory, (token) => {
        reply.textContent += token;
        reply.parentElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
      chatHistory.push({ role: "assistant", content: answer });
      status.textContent = "Ollama response complete.";
    } catch (error) {
      chatHistory.pop();
      reply.parentElement.remove();
      status.textContent = error.message;
    } finally {
      send.disabled = false;
      send.classList.remove("loading");
      input.focus();
    }
  });
  $("#chatClear").addEventListener("click", () => {
    chatHistory.splice(1);
    $("#chatMessages").innerHTML = "";
    appendChatMessage("assistant", "Chat cleared. Tell me your car model, what happened, and any warning light or sound you noticed.");
    $("#chatStatus").textContent = "Uses the local Ollama model configured in OLLAMA_MODEL.";
  });
}
function initMotorIq() {
  initChat();
  initPreTrip();
  $("#modelSelect").addEventListener("change", updateModelDetail);
  updateModelDetail();
  document.querySelectorAll(".symptom-card").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".symptom-card").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    selected.issue = button.dataset.issue;
    $("#issueInput").focus();
  }));
  $("#solveButton").addEventListener("click", () => {
    const text = $("#issueInput").value.trim().toLowerCase();
    if (text.includes("brake") || text.includes("grind") || text.includes("stop")) selected.issue = "brakes";
    else if (text.includes("start") || text.includes("battery") || text.includes("click")) selected.issue = "start";
    else if (text.includes("ac") || text.includes("air") || text.includes("cold")) selected.issue = "ac";
    else if (text.includes("tyre") || text.includes("tire") || text.includes("vibration")) selected.issue = "tyres";
    else if (text.includes("oil") || text.includes("lubric")) selected.issue = "oil";
    else if (text.includes("gear") || text.includes("clutch") || text.includes("transmission") || text.includes("shift")) selected.issue = "transmission";
    else if (text.includes("alternator") || text.includes("charging") || text.includes("dim light")) selected.issue = "battery";
    else if (text.includes("window") || text.includes("fuse") || text.includes("infotainment") || text.includes("electrical")) selected.issue = "electrical";
    else if (text.includes("fuel") || text.includes("smoke") || text.includes("exhaust")) selected.issue = "fuel";
    else if (text.includes("steering") || text.includes("pull") || text.includes("alignment")) selected.issue = "steering";
    else if (text.includes("headlight") || text.includes("wiper") || text.includes("washer") || text.includes("visibility")) selected.issue = "lights";
    else if (text.includes("engine") || text.includes("light") || text.includes("overheat")) selected.issue = "engine";
    renderResult(selected.issue);
    const symptom = $("#issueInput").value.trim();
    const button = $("#solveButton");
    const requestId = ++diagnosisRequestId;
    button.disabled = true;
    button.classList.add("loading");
    $("#aiStatus").textContent = "MotorIQ: researching trusted web sources…";
    researchProblem(selected.issue, symptom).catch((error) => {
      console.warn("MotorIQ web research unavailable:", error);
      return [];
    }).then((sources) => {
      if (requestId !== diagnosisRequestId) return Promise.reject(new Error("Diagnosis superseded"));
      renderResearchSources(sources);
      $("#aiStatus").textContent = sources.length
        ? `MotorIQ: found ${sources.length} trusted web source${sources.length === 1 ? "" : "s"}; asking Ollama…`
        : "MotorIQ: no live sources found; asking Ollama with the curated guide…";
      return requestOllama(selected.issue, symptom, sources);
    }).then((result) => {
      if (requestId !== diagnosisRequestId) return;
      renderOllamaResult(result);
      $("#aiStatus").textContent = "MotorIQ: web research and Ollama solution added.";
    }).catch((error) => {
      if (requestId !== diagnosisRequestId) return;
      $("#aiStatus").textContent = "Live research or Ollama is unavailable; showing the curated safety guide.";
      console.warn("MotorIQ live diagnosis unavailable:", error.name === "AbortError" ? "request timed out" : error);
    }).finally(() => {
      button.disabled = false;
      button.classList.remove("loading");
    });
  });
  $("#playGuide").addEventListener("click", () => {
    const guide = activeGuide || { steps: (videoGuides[selected.issue] || videoGuides.other)[2] };
    const steps = guide.steps;
    clearInterval(videoTimer);
    $("#videoGuide").classList.add("playing");
    let index = 0;
    $("#videoStep").textContent = steps[index];
    $("#videoProgress").style.width = "33%";
    videoTimer = setInterval(() => {
      index += 1;
      if (index >= steps.length) {
        clearInterval(videoTimer);
        $("#videoGuide").classList.remove("playing");
        $("#videoStep").textContent = "Guide complete — stop and get help if anything feels unsafe.";
        $("#videoProgress").style.width = "100%";
        return;
      }
      $("#videoStep").textContent = steps[index];
      $("#videoProgress").style.width = `${Math.round((index + 1) / steps.length * 100)}%`;
    }, 2200);
  });
  $("#locationButton").addEventListener("click", () => {
    const result = $("#locationResult");
    const card = $("#serviceCard");
    const fallbackMap = "https://www.google.com/maps/search/?api=1&query=Hyundai%20authorised%20service%20centre%20India";
    result.hidden = false;
    card.hidden = false;
    $("#directionsLink").href = fallbackMap;
    $("#serviceAddress").textContent = "Showing a Maps search for authorised Hyundai service centres across India.";
    $("#serviceMeta").textContent = "Allow location access for a more precise result, or use the official locator to search by city or PIN code.";
    if (!navigator.geolocation) { result.textContent = "Location is unavailable. Use Get directions or the official locator."; return; }
    result.textContent = "Finding authorised service near you…";
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const query = encodeURIComponent(`Hyundai authorised service centre near ${latitude},${longitude}`);
      $("#directionsLink").href = `https://www.google.com/maps/search/?api=1&query=${query}`;
      $("#serviceName").textContent = "Nearest authorised Hyundai service centre";
      $("#serviceAddress").textContent = "Open the map result to choose the closest verified Hyundai workshop and start navigation.";
      $("#serviceMeta").textContent = "Directions are based on your current location. Confirm hours and availability with the centre.";
      result.hidden = true;
      card.hidden = false;
    }, () => { result.textContent = "Location permission was not granted. Use Get directions or the official locator."; });
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initMotorIq);
else initMotorIq();
