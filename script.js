const API_KEY = "584d76eb9a244805a5611807261602";
let LOCATION = "Apple Valley, CA";
let REFRESH_RATE = 60000;

// ================= WEATHER FETCH =================

async function getWeather() {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
    LOCATION
  )}&days=3&aqi=yes&alerts=yes`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Core panels
    renderCurrent(data);
    renderHourly(data);
    renderForecast(data);

    // Mega dashboard panels
    renderLocationBanner(data);
    renderGlance(data);
    renderTempTrend(data);
    renderPrecipChart(data);
    renderWindCompass(data);
    renderHumidityGauge(data);
    renderUVMeter(data);
    renderSunCycle(data);
    renderAlerts(data);
    renderMiniWidget(data);

    // Diagnostics
    updateDiagnostics(true, data);
  } catch (e) {
    updateDiagnostics(false, null);
  }
}

// ================= RENDER: CURRENT =================

function renderCurrent(data) {
  const c = data.current;

  const html = `
    <img src="${c.condition.icon}" alt="">
    <h3>${c.temp_f}°F — ${c.condition.text}</h3>
    <p>Feels like: ${c.feelslike_f}°F</p>
    <p>Wind: ${c.wind_mph} mph</p>
    <p>Humidity: ${c.humidity}%</p>
    <p>UV Index: ${c.uv}</p>
  `;
  document.getElementById("current-content").innerHTML = html;
}

// ================= RENDER: HOURLY =================

function renderHourly(data) {
  const hours = data.forecast.forecastday[0].hour;
  let html = "";
  const now = new Date().getHours();

  for (let i = 0; i < 12; i++) {
    const idx = (now + i) % 24;
    const h = hours[idx];

    html += `
      <div class="hour-block">
        <p>${h.time.split(" ")[1]}</p>
        <img src="${h.condition.icon}">
        <p>${h.temp_f}°F</p>
      </div>
    `;
  }

  document.getElementById("hourly-content").innerHTML = html;
}

// ================= RENDER: FORECAST =================

function renderForecast(data) {
  let html = "";

  data.forecast.forecastday.forEach((day) => {
    html += `
      <div class="day-block">
        <h4>${day.date}</h4>
        <img src="${day.day.condition.icon}">
        <p>${day.day.avgtemp_f}°F</p>
        <p>${day.day.condition.text}</p>
      </div>
    `;
  });

  document.getElementById("forecast-content").innerHTML = html;
}

// ================= MEGA UI RENDERS =================

function renderLocationBanner(data) {
  const loc = data.location;
  document.getElementById(
    "locationName"
  ).textContent = `Weather for ${loc.name}, ${loc.region || loc.country}`;
  document.getElementById(
    "locationCoords"
  ).textContent = `Lat: ${loc.lat.toFixed(2)}, Lon: ${loc.lon.toFixed(2)}`;
}

function renderGlance(data) {
  const c = data.current;
  document.getElementById("visVal").textContent = `${c.vis_miles} mi`;
  document.getElementById("pressureVal").textContent = `${c.pressure_in} inHg`;
  const dew = c.dewpoint_f ?? c.temp_f;
  document.getElementById("dewVal").textContent = `${dew}°F`;
  document.getElementById("cloudVal").textContent = `${c.cloud}%`;
  document.getElementById("uvVal").textContent = c.uv;
  document.getElementById("gustVal").textContent = `${c.gust_mph} mph`;
}

function renderTempTrend(data) {
  const hours = data.forecast.forecastday[0].hour;
  let html = "";

  hours.forEach((h) => {
    html += `
      <div class="hour-block">
        <p>${h.time.split(" ")[1]}</p>
        <p>${h.temp_f}°F</p>
      </div>
    `;
  });

  document.getElementById("tempTrend").innerHTML = html;
}

function renderPrecipChart(data) {
  const hours = data.forecast.forecastday[0].hour;
  let html = "";

  hours.forEach((h) => {
    const rain = h.chance_of_rain || 0;
    const snow = h.chance_of_snow || 0;
    const total = Math.max(rain, snow);

    html += `
      <div class="hour-block">
        <p>${h.time.split(" ")[1]}</p>
        <div style="height:60px; width:20px; background:#333; border-radius:6px; margin:0 auto; overflow:hidden;">
          <div style="height:${total}%; width:100%; background:${
      snow > rain ? "#a0c4ff" : "#4aa3ff"
    };"></div>
        </div>
        <p>${total}%</p>
      </div>
    `;
  });

  document.getElementById("precipChart").innerHTML = html;
}

function renderWindCompass(data) {
  const c = data.current;
  document.getElementById("windCompass").textContent = "🧭";
  document.getElementById(
    "windDirText"
  ).textContent = `${c.wind_dir} at ${c.wind_mph} mph`;
}

function renderHumidityGauge(data) {
  const c = data.current;
  const h = c.humidity;
  document.getElementById("humidityFill").style.width = h + "%";
  document.getElementById("humidityText").textContent = `${h}%`;
}

function renderUVMeter(data) {
  const c = data.current;
  const uv = c.uv;
  const pct = Math.min(uv / 11, 1) * 100;
  document.getElementById("uvFill").style.width = pct + "%";
}

function renderSunCycle(data) {
  const astro = data.forecast.forecastday[0].astro;
  document.getElementById(
    "sunArc"
  ).textContent = `Sunrise: ${astro.sunrise} • Sunset: ${astro.sunset} • Moon: ${astro.moon_phase}`;
}

function renderAlerts(data) {
  const alerts = data.alerts && data.alerts.alert ? data.alerts.alert : [];
  const box = document.getElementById("alertBox");

  if (!alerts.length) {
    box.textContent = "No active alerts.";
    return;
  }

  let html = "";
  alerts.forEach((a) => {
    html += `
      <div style="border-left:4px solid #ff5555; padding-left:10px; margin-bottom:10px;">
        <strong>${a.event}</strong><br>
        <span>${a.headline || ""}</span><br>
        <small>${a.effective || ""} → ${a.expires || ""}</small>
      </div>
    `;
  });

  box.innerHTML = html;
}

function renderMiniWidget(data) {
  const c = data.current;

  const html = `
    <p style="font-size:24px; margin:0;">${c.temp_f}°F</p>
    <p style="margin:0;">${c.condition.text}</p>
    <p style="margin:0; font-size:12px;">Wind: ${c.wind_mph} mph • Humidity: ${c.humidity}%</p>
  `;

  document.getElementById("miniWidget").innerHTML = html;
}

// ================= SETTINGS SYSTEM =================

function loadSettings() {
  const windUnit = localStorage.getItem("windUnit") || "mph";
  const theme = localStorage.getItem("theme") || "dark";
  const refresh = localStorage.getItem("refresh") || "60000";

  const windEl = document.getElementById("windUnit");
  const themeEl = document.getElementById("theme");
  const refreshEl = document.getElementById("refresh");

  if (windEl) windEl.value = windUnit;
  if (themeEl) themeEl.value = theme;
  if (refreshEl) refreshEl.value = refresh;

  applyTheme(theme);
  REFRESH_RATE = parseInt(refresh, 10);
}

function setupSettingsListeners() {
  const windEl = document.getElementById("windUnit");
  const themeEl = document.getElementById("theme");
  const refreshEl = document.getElementById("refresh");

  if (windEl) {
    windEl.onchange = (e) => {
      localStorage.setItem("windUnit", e.target.value);
      getWeather();
    };
  }

  if (themeEl) {
    themeEl.onchange = (e) => {
      localStorage.setItem("theme", e.target.value);
      applyTheme(e.target.value);
    };
  }

  if (refreshEl) {
    refreshEl.onchange = (e) => {
      localStorage.setItem("refresh", e.target.value);
      REFRESH_RATE = parseInt(e.target.value, 10);
    };
  }
}

function applyTheme(theme) {
  if (theme === "light") {
    document.body.style.background = "#f2f2f2";
    document.body.style.color = "#111";
  } else {
    document.body.style.background = "#111";
    document.body.style.color = "#eee";
  }
}

// ================= DIAGNOSTICS & CONTROLS =================

function updateDiagnostics(ok, data) {
  const diagUpdate = document.getElementById("diagUpdate");
  const diagAPI = document.getElementById("diagAPI");
  const diagLoc = document.getElementById("diagLoc");

  if (diagUpdate) diagUpdate.textContent = new Date().toLocaleTimeString();
  if (diagAPI) diagAPI.textContent = ok ? "OK" : "Error";

  const locOverride = localStorage.getItem("customLocation") || "None";
  if (diagLoc) diagLoc.textContent = locOverride;
}

const forceBtn = document.getElementById("forceRefresh");
if (forceBtn) {
  forceBtn.onclick = () => {
    getWeather();
  };
}

const sidebarToggle = document.getElementById("sidebarToggle");
if (sidebarToggle) {
  sidebarToggle.onclick = () => {
    const sb = document.getElementById("sidebar");
    if (!sb) return;
    sb.style.left = sb.style.left === "0px" ? "-260px" : "0px";
  };
}

// ================= AUTO REFRESH & INIT =================

async function autoRefresh() {
  await getWeather();
  setTimeout(autoRefresh, REFRESH_RATE);
}

loadSettings();
setupSettingsListeners();
autoRefresh();
// ================= BLIZZARD MODE v2 (CYCLING) =================

// 0 = normal
// 1 = blizzard
let BLIZZARD_STATE = 0;

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === "N") {
    BLIZZARD_STATE = (BLIZZARD_STATE + 1) % 2; // cycles 0 → 1 → 0 → 1...

    if (BLIZZARD_STATE === 1) {
      activateBlizzardMode();
    } else {
      getWeather(); // restore normal
    }
  }
});

function activateBlizzardMode() {
  // Random absurd values
  const temp = -(Math.floor(Math.random() * 60) + 10); // -10 to -70
  const feels = temp - Math.floor(Math.random() * 40);
  const wind = Math.floor(Math.random() * 80) + 20; // 20–100 mph
  const gust = wind + Math.floor(Math.random() * 40);
  const humidity = Math.floor(Math.random() * 40) + 60;
  const visibility = (Math.random() * 0.5).toFixed(1);
  const cloud = Math.floor(Math.random() * 40) + 80;

  const conditions = [
    "Blizzard",
    "Heavy Snow",
    "Whiteout",
    "Extreme Cold",
    "Snow & Wind",
    "Polar Outbreak",
    "Arctic Blast",
    "Ice Crystals",
    "Freezing Fog",
    "Snow Squall"
  ];

  const condition = conditions[Math.floor(Math.random() * conditions.length)];

  // CURRENT CONDITIONS
  document.getElementById("current-content").innerHTML = `
    <img src="https://cdn.weatherapi.com/weather/64x64/night/338.png">
    <h3>${temp}°F — ${condition}</h3>
    <p>Feels like: ${feels}°F</p>
    <p>Wind: ${wind} mph (gusts ${gust} mph)</p>
    <p>Humidity: ${humidity}%</p>
    <p>UV Index: 0</p>
  `;

  // HOURLY CHAOS
  let hourlyHTML = "";
  for (let i = 0; i < 12; i++) {
    const hTemp = temp - Math.floor(Math.random() * 20);
    hourlyHTML += `
      <div class="hour-block">
        <p>??:??</p>
        <img src="https://cdn.weatherapi.com/weather/64x64/night/338.png">
        <p>${hTemp}°F</p>
      </div>
    `;
  }
  document.getElementById("hourly-content").innerHTML = hourlyHTML;

  // FORECAST CHAOS
  let forecastHTML = "";
  for (let i = 0; i < 3; i++) {
    const fTemp = temp - Math.floor(Math.random() * 30);
    const fCond = conditions[Math.floor(Math.random() * conditions.length)];
    forecastHTML += `
      <div class="day-block">
        <h4>???</h4>
        <img src="https://cdn.weatherapi.com/weather/64x64/night/338.png">
        <p>${fTemp}°F</p>
        <p>${fCond}</p>
      </div>
    `;
  }
  document.getElementById("forecast-content").innerHTML = forecastHTML;

  // GLANCE PANEL
  document.getElementById("visVal").textContent = `${visibility} mi`;
  document.getElementById("pressureVal").textContent = `${28 + Math.random().toFixed(2)} inHg`;
  document.getElementById("dewVal").textContent = `${temp - 5}°F`;
  document.getElementById("cloudVal").textContent = `${cloud}%`;
  document.getElementById("uvVal").textContent = `0`;
  document.getElementById("gustVal").textContent = `${gust} mph`;

  // HUMIDITY GAUGE
  document.getElementById("humidityFill").style.width = humidity + "%";
  document.getElementById("humidityText").textContent = `${humidity}%`;

  // UV METER
  document.getElementById("uvFill").style.width = "0%";

  // WIND COMPASS
  document.getElementById("windDirText").textContent = `N at ${wind} mph`;

  // SUN CYCLE
  document.getElementById("sunArc").textContent =
    `Sunrise: ??? • Sunset: ??? • Moon: Frozen`;

  // ALERTS
  document.getElementById("alertBox").innerHTML = `
    <div style="border-left:4px solid #00d0ff; padding-left:10px;">
      <strong>BLIZZARD WARNING</strong><br>
      <span>Life-threatening cold and whiteout conditions.</span><br>
      <small>Effective NOW → Whenever it stops.</small>
    </div>
  `;

  // MINI WIDGET
  document.getElementById("miniWidget").innerHTML = `
    <p style="font-size:24px; margin:0;">${temp}°F</p>
    <p style="margin:0;">${condition}</p>
    <p style="margin:0; font-size:12px;">Wind: ${wind} mph • Visibility: ${visibility} mi</p>
  `;
}
