const knowledgeBase = {
  engine: { title: "Start with the warning light safely.", summary: "A warning light can be caused by anything from a loose fuel cap to an emissions or engine fault.", urgency: "MEDIUM URGENCY", causes: [["Loose fuel cap", "Check that the cap clicks tightly after refuelling."], ["Sensor or emissions fault", "The car may still drive normally, but a diagnostic scan is needed."], ["Low fluid or overheating", "Stop driving if the temperature warning is red or steam is visible."]], actions: [["Check the dashboard", "Note which light is on and whether it is steady or flashing."], ["Check the fuel cap", "Turn the engine off, let it cool, and check the cap is secure."], ["Book a scan", "If the light stays on, have the stored fault code read by a technician."]] },
  brakes: { title: "Brake noise deserves attention.", summary: "Squealing can be surface dust or pad wear; grinding, pulling, or a soft pedal is more urgent.", urgency: "HIGH URGENCY", causes: [["Worn brake pads", "The wear indicator may squeal when pads need replacement."], ["Debris or surface rust", "Light noise after rain can clear after gentle braking."], ["Disc, caliper, or hydraulic issue", "Grinding, pulling, or a soft pedal needs immediate inspection."]], actions: [["Check the pedal", "Do not drive if the pedal feels soft or braking distance has changed."], ["Look through the wheel", "Check for obvious damage or a severely worn pad without touching hot parts."], ["Arrange inspection", "Use an authorised workshop for brake-system diagnosis."]] },
  start: { title: "Let’s narrow down why it won’t start.", summary: "The most common causes are a weak battery, a key issue, or a fuel/ignition fault.", urgency: "MEDIUM URGENCY", causes: [["Weak battery", "Dim lights and a rapid clicking sound often point to low battery voltage."], ["Starter or connection fault", "One heavy click with full lights may need a technician."], ["Key, fuel, or immobiliser issue", "A warning symbol or no crank can require a diagnostic scan."]], actions: [["Check electrical power", "Turn on the headlights. If they are very dim, avoid repeated starting attempts."], ["Try the spare key", "If available, check whether the immobiliser recognises the other key."], ["Get a battery test", "A roadside technician can test the battery and starting circuit safely."]] },
  ac: { title: "Check the simple cooling causes first.", summary: "Warm air may be caused by a low refrigerant charge, a fuse, a blocked filter, or a compressor fault.", urgency: "LOW TO MEDIUM", causes: [["Cabin filter restriction", "A dirty filter can reduce airflow and cooling performance."], ["Low refrigerant", "A leak needs proper recovery and recharge equipment."], ["Fan, fuse, or compressor fault", "Electrical or refrigerant-system work should be handled professionally."]], actions: [["Check airflow", "Compare fan speeds and check whether air is weak from every vent."], ["Inspect the filter", "Replace it only if you can access the correct filter safely for your model."], ["Book AC service", "Do not release refrigerant yourself; use a qualified AC technician."]] },
  tyres: { title: "Inspect tyres and suspension before a long drive.", summary: "Uneven wear, bouncing, or knocking can affect grip and braking.", urgency: "MEDIUM URGENCY", causes: [["Incorrect tyre pressure", "Pressure changes can create uneven wear and poor handling."], ["Wheel alignment imbalance", "Pulling or steering-wheel vibration may need alignment or balancing."], ["Worn suspension part", "Clunks and repeated bouncing should be inspected."]], actions: [["Check cold pressure", "Use the pressure listed on the driver-door label, not the tyre sidewall."], ["Inspect tread", "Look for bulges, exposed cords, or tread below the legal limit."], ["Avoid damaged tyres", "Do not drive on a bulged, punctured, or visibly damaged tyre."]] },
  other: { title: "A clear description helps us narrow it down.", summary: "Include when it happens, what you hear or see, and whether any warning light is on.", urgency: "NEEDS MORE DETAIL", causes: [["Sound or vibration", "Note whether it changes with speed, braking, steering, or engine revs."], ["Warning light", "Share the exact symbol and whether it is steady or flashing."], ["Recent work or event", "Mention a service, pothole, refuelling, or battery change before it began."]], actions: [["Record the symptom", "Write down the conditions and frequency."], ["Check for immediate danger", "Stop if there is smoke, fuel smell, loss of braking, or overheating."], ["Submit more detail", "The more specific the description, the more useful the next step."]] }
};
const selected = { issue: "other" };
const $ = (selector) => document.querySelector(selector);
const videoGuides = {
  tyres: ["Check your tyre pressure safely", "Use a pressure gauge on cold tyres, compare with the door-sticker value, and replace the valve cap.", ["Park safely and find the recommended pressure.", "Measure each tyre while cold.", "Add air in short bursts and recheck."]],
  engine: ["Check the fuel cap and warning light", "A loose fuel cap is a safe first check. Never open a hot coolant system.", ["Park and switch the engine off.", "Tighten the fuel cap until it clicks.", "If the light stays on, book a diagnostic scan."]],
  ac: ["Replace a cabin air filter", "If airflow is weak, a cabin filter may be clogged. Check your model manual before opening the housing.", ["Switch the car off and locate the filter cover.", "Remove and compare the old filter.", "Fit the new filter in the marked airflow direction."]],
  start: ["Prepare for a safe jump start", "Only use a compatible battery and follow your owner’s manual. Stop if the battery is cracked or leaking.", ["Park both vehicles safely and switch them off.", "Connect cables in the exact order in the manual.", "Start the assisting vehicle, then your car, and remove cables in reverse order."]],
  brakes: ["Brake noise: what to check", "A visual check is okay, but never attempt brake repairs without proper tools and training.", ["Park on level ground and let components cool.", "Look for obvious debris or damage without touching hot parts.", "Do not drive if the pedal is soft, braking changes, or grinding continues."]],
  other: ["Make a useful symptom video", "Record the sound or warning safely while parked. This helps a technician diagnose the issue.", ["Park somewhere safe before recording.", "Capture the dashboard and describe when it happens.", "Share the clip with a qualified technician."]]
};
let videoTimer;
function updateVideoGuide(issue) {
  const guide = videoGuides[issue] || videoGuides.other;
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
  $("#resultSection").hidden = false;
  $("#technician").classList.add("inspection-ready");
  $("#resultSection").scrollIntoView({ behavior: "smooth", block: "start" });
}
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
  else if (text.includes("engine") || text.includes("light") || text.includes("overheat")) selected.issue = "engine";
  renderResult(selected.issue);
});
$("#playGuide").addEventListener("click", () => {
  const guide = videoGuides[selected.issue] || videoGuides.other;
  const steps = guide[2];
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
