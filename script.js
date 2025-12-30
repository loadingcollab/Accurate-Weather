const API_KEY = "c0086e719c9cc6c1ec5356fd85049e78";

const $ = id => document.getElementById(id);

const hourlySection = $("hourly");
const dailySection = $("daily");

$("searchBtn").onclick = searchCity;
$("locBtn").onclick = loadLocation;
$("modeBtn").onclick = toggleMode;

$("cityInput").addEventListener("keydown", e => {
  if (e.key === "Enter") searchCity();
});

window.onload = loadLocation;

function toggleMode() {
  document.body.classList.toggle("light");
  document.body.classList.toggle("dark");
}

function searchCity() {
  const city = $("cityInput").value.trim();
  if (city) loadByCity(city);
}

function loadLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    loadByCoords(pos.coords.latitude, pos.coords.longitude);
  });
}

async function loadByCity(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
  );
  const data = await res.json();
  showCurrent(data);
  loadForecast(data.coord.lat, data.coord.lon);
}

async function loadByCoords(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
  const data = await res.json();
  showCurrent(data);
  loadForecast(lat, lon);
}

function showCurrent(d) {
  $("city").innerText = d.name;
  $("temp").innerText = Math.round(d.main.temp) + "°C";
  $("desc").innerText = d.weather[0].description;
  $("icon").innerText = icon(d.weather[0].main);

  $("feels").innerText = "Feels: " + d.main.feels_like + "°C";
  $("minmax").innerText = "Min/Max: " + d.main.temp_min + "° / " + d.main.temp_max + "°";
  $("humidity").innerText = "Humidity: " + d.main.humidity + "%";
  $("pressure").innerText = "Pressure: " + d.main.pressure + " hPa";
  $("wind").innerText = "Wind: " + d.wind.speed + " m/s";
  $("visibility").innerText = "Visibility: " + (d.visibility / 1000) + " km";

  $("sunrise").innerText =
    "Sunrise: " + new Date(d.sys.sunrise * 1000).toLocaleTimeString();
  $("sunset").innerText =
    "Sunset: " + new Date(d.sys.sunset * 1000).toLocaleTimeString();
}

async function loadForecast(lat, lon) {
  hourlySection.classList.add("hidden");
  dailySection.classList.add("hidden");

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,alerts&appid=${API_KEY}`
  );
  const data = await res.json();

  if (data.hourly?.length) {
    hourlySection.classList.remove("hidden");
    $("hourlyContainer").innerHTML = "";
    data.hourly.slice(0, 12).forEach(h => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <div>${new Date(h.dt * 1000).getHours()}:00</div>
        <div>${icon(h.weather[0].main)}</div>
        <div>${Math.round(h.temp)}°</div>`;
      $("hourlyContainer").appendChild(div);
    });
  }

  if (data.daily?.length) {
    dailySection.classList.remove("hidden");
    $("dailyContainer").innerHTML = "";
    data.daily.slice(0, 10).forEach(d => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <div>${new Date(d.dt * 1000).toDateString().slice(0, 10)}</div>
        <div>${icon(d.weather[0].main)}</div>
        <div>${Math.round(d.temp.max)}° / ${Math.round(d.temp.min)}°</div>`;
      $("dailyContainer").appendChild(div);
    });
  }
}

function icon(type) {
  if (type === "Clear") return "☀️";
  if (type === "Clouds") return "☁️";
  if (type === "Rain") return "🌧️";
  if (type === "Snow") return "❄️";
  if (type === "Thunderstorm") return "⛈️";
  return "🌤️";
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}