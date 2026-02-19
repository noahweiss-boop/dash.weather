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

  document.getElementById("forecast-content").innerHTML = html;
}

getWeather();
