const API_KEY = "584d76eb9a244805a5611807261602";
const LOCATION = "Apple Valley, CA";

async function getWeather() {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(LOCATION)}&days=3&aqi=yes&alerts=yes`;

  const res = await fetch(url);
  const data = await res.json();

  renderCurrent(data);
  renderHourly(data);
  renderForecast(data);
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
