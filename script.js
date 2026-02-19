const API_KEY = "584d76eb9a244805a5611807261602";
const LOCATION = "Apple Valley, CA";

async function getWeather() {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(LOCATION)}&days=3&aqi=yes&alerts=yes`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Existing renders
    renderCurrent(data);
    renderHourly(data);
    renderForecast(data);

    // New mega‑dashboard renders
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
    updateDiagnostics(true, data);

  } catch (e) {
    updateDiagnostics(false, null);
  }
}


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

function renderHourly(data) {
  const hours = data.forecast.forecastday[0].hour;
  let html = "";

  const now = new Date().getHours();

  for (let i = now; i < now + 12; i++) {
    const h = hours[i];
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

function renderForecast(data) {
  let html = "";

  data.forecast.forecastday.forEach(day => {
    html += `
      <div class="day-block">
        <h4>${day.date}</h4>
        <img src="${day.day.condition.icon}">
        <p>${day.day.avgtemp_f}°F</p>
        <p>${day.day.condition.text}</p>
      </div>
    `;
  });

  // Load saved settings
function loadSettings() {
  const tempUnit = localStorage.getItem("tempUnit") || "f";
  const windUnit = localStorage.getItem("windUnit") || "mph";
  const theme = localStorage.getItem("theme") || "dark";
  const refresh = localStorage.getItem("refresh") || "60000";

  document.getElementById("tempUnit").value = tempUnit;
  document.getElementById("windUnit").value = windUnit;
  document.getElementById("theme").value = theme;
  document.getElementById("refresh").value = refresh;

  applyTheme(theme);
  REFRESH_RATE = parseInt(refresh);
}

// Save settings when changed
function setupSettingsListeners() {
  document.getElementById("tempUnit").onchange = e => {
    localStorage.setItem("tempUnit", e.target.value);
    getWeather();
  };

  document.getElementById("windUnit").onchange = e => {
    localStorage.setItem("windUnit", e.target.value);
    getWeather();
  };

  document.getElementById("theme").onchange = e => {
    localStorage.setItem("theme", e.target.value);
    applyTheme(e.target.value);
  };

  document.getElementById("refresh").onchange = e => {
    localStorage.setItem("refresh", e.target.value);
    REFRESH_RATE = parseInt(e.target.value);
  };
}

// Apply theme
function applyTheme(theme) {
  if (theme === "light") {
    document.body.style.background = "#f2f2f2";
    document.body.style.color = "#111";
  } else {
    document.body.style.background = "#111";
    document.body.style.color = "#eee";
  }
}

// Refresh interval variable
let REFRESH_RATE = 60000;

// =============== MEGA UI RENDER FUNCTIONS ===============

function renderLocationBanner(data) {
  const loc = data.location;
  document.getElementById("locationName").textContent =
    `Weather for ${loc.name}, ${loc.region || loc.country}`;
  document.getElementById("locationCoords").textContent =
    `Lat: ${loc.lat.toFixed(2)}, Lon: ${loc.lon.toFixed(2)}`;
}

function renderGlance(data) {
  const c = data.current;
  document.getElementById("visVal").textContent = `${c.vis_miles} mi`;
  document.getElementById("pressureVal").textContent = `${c.pressure_in} inHg`;
  const dew = c.dewpoint_f || c.temp_f; // fallback if dewpoint not present
  document.getElementById("dewVal").textContent = `${dew}°F`;
  document.getElementById("cloudVal").textContent = `${c.cloud}%`;
  document.getElementById("uvVal").textContent = c.uv;
  document.getElementById("gustVal").textContent = `${c.gust_mph} mph`;
}

function renderTempTrend(data) {
  const hours = data.forecast.forecastday[0].hour;
  const tempUnit = localStorage.getItem("tempUnit") || "f";
  let html = "";

  hours.forEach(h => {
    const t = tempUnit === "c" ? h.temp_c + "°C" : h.temp_f + "°F";
    html += `
      <div class="hour-block">
        <p>${h.time.split(" ")[1]}</p>
        <p>${t}</p>
      </div>
    `;
  });

  document.getElementById("tempTrend").innerHTML = html;
}

function renderPrecipChart(data) {
  const hours = data.forecast.forecastday[0].hour;
  let html = "";

  hours.forEach(h => {
    const rain = h.chance_of_rain || 0;
    const snow = h.chance_of_snow || 0;
    const total = Math.max(rain, snow);

    html += `
      <div class="hour-block">
        <p>${h.time.split(" ")[1]}</p>
        <div style="height:60px; width:20px; background:#333; border-radius:6px; margin:0 auto; overflow:hidden;">
          <div style="height:${total}%; width:100%; background:${snow > rain ? "#a0c4ff" : "#4aa3ff"};"></div>
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
  document.getElementById("windDirText").textContent =
    `${c.wind_dir} at ${c.wind_mph} mph`;
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
  document.getElementById("sunArc").textContent =
    `Sunrise: ${astro.sunrise} • Sunset: ${astro.sunset} • Moon: ${astro.moon_phase}`;
}

function renderAlerts(data) {
  const alerts = data.alerts && data.alerts.alert ? data.alerts.alert : [];
  const box = document.getElementById("alertBox");

  if (!alerts.length) {
    box.textContent = "No active alerts.";
    return;
  }

  let html = "";
  alerts.forEach(a => {
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
  const tempUnit = localStorage.getItem("tempUnit") || "f";
  const temp = tempUnit === "c" ? c.temp_c + "°C" : c.temp_f + "°F";

  const html = `
    <p style="font-size:24px; margin:0;">${temp}</p>
    <p style="margin:0;">${c.condition.text}</p>
    <p style="margin:0; font-size:12px;">Wind: ${c.wind_mph} mph • Humidity: ${c.humidity}%</p>
  `;

  document.getElementById("miniWidget").innerHTML = html;
}

// =============== DIAGNOSTICS & CONTROLS ===============

function updateDiagnostics(ok, data) {
  document.getElementById("diagUpdate").textContent =
    new Date().toLocaleTimeString();
  document.getElementById("diagAPI").textContent = ok ? "OK" : "Error";

  const locOverride = localStorage.getItem("customLocation") || "None";
  document.getElementById("diagLoc").textContent = locOverride;
}

// Force refresh button
document.getElementById("forceRefresh").onclick = () => {
  getWeather();
};

// Sidebar toggle
document.getElementById("sidebarToggle").onclick = () => {
  const sb = document.getElementById("sidebar");
  if (sb.style.left === "0px") {
    sb.style.left = "-260px";
  } else {
    sb.style.left = "0px";
  }
};

  
// Replace your loop with this:
async function autoRefresh() {
  await getWeather();
  setTimeout(autoRefresh, REFRESH_RATE);
}

// Initialize
loadSettings();
setupSettingsListeners();
autoRefresh();

  document.getElementById("forecast-content").innerHTML = html;
}

getWeather();
