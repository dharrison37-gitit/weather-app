import "./styles.css";

const BASE_TIMELINE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
const API_KEY = "S99YY6U6SCWUJFQ763DTS23ZJ";
const STORAGE_KEY = "WEATHER-location";
const form = document.querySelector("[data-form]");
const tempSymbol = "\u00B0";
const percentSymbol = "\u0025";
const sampleLocations = ["Oklahoma City, OK", "New York, NY", "Washington, DC"];

let cachedWeather = null;
let cachedLocation = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null;
let unit = "F";

async function getDataAsync(location) {
  try {
    const encodedLocation = encodeURI(location);
    const response = await fetch(`${BASE_TIMELINE_URL}/${encodedLocation}?&key=${API_KEY}`);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    cachedWeather = await response.json();

    renderWeather();
    renderForecast();
  } catch (error) {
    console.log("Fetch failed", error);
  }
}

if (!cachedLocation) getDataAsync(sampleLocations[Math.floor(Math.random() * 3)]);
else getDataAsync(cachedLocation);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const location = formData.get("location");
  if (!location) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));

  const cachedLocation = JSON.parse(localStorage.getItem(STORAGE_KEY));

  getDataAsync(location);

  form.reset();
});

//#region Current Conditions
async function renderWeather() {
  const {
    address,
    description,
    currentConditions: { temp, feelslike, humidity, windspeed, conditions, icon },
  } = cachedWeather;

  const displayTemp = convertTemp(temp, unit);
  const displayFeelslike = convertTemp(feelslike, unit);

  // Clear currently rendered content
  const currentConditions = document.querySelector("#current-conditions");
  currentConditions.replaceChildren();

  // Target element to place template clone
  const currentConditionsTemplate = document.querySelector("#current-conditions-template");

  const conditionsClone = document.importNode(currentConditionsTemplate.content, true);

  const locationElem = conditionsClone.querySelector("[data-current-location]");
  locationElem.textContent = address;

  const toggleUnitButton = conditionsClone.querySelector("[data-unit-toggle]");
  toggleUnitButton.addEventListener("click", () => {
    if (!cachedWeather) return;

    unit = unit === "F" ? "C" : "F";
    renderWeather();
    renderForecast();
  });

  const tempElem = conditionsClone.querySelector("[data-current-temp]");
  tempElem.textContent = `Currently ${parseInt(displayTemp)}${tempSymbol}${unit}`;

  const feelslikeElem = conditionsClone.querySelector("[data-feels-like]");
  feelslikeElem.textContent = `Feels like: ${parseInt(displayFeelslike)}${tempSymbol}${unit}`;

  const humidityElem = conditionsClone.querySelector("[data-humidity]");
  humidityElem.textContent = `Humidity: ${parseInt(humidity)}${percentSymbol}`;

  const windElem = conditionsClone.querySelector("[data-winds]");
  windElem.textContent = `Winds: ${windspeed} mph`;

  const conditionsElem = conditionsClone.querySelector("[data-conditions]");
  conditionsElem.textContent = conditions;

  const conditionsIcon = conditionsClone.querySelector("[data-icon]");
  conditionsIcon.src = await loadWeatherIcon(icon);

  const descriptionElem = conditionsClone.querySelector("[data-current-description]");
  descriptionElem.textContent = description;

  currentConditions.appendChild(conditionsClone);
}
//#endregion

//#region Forecast Rendering
async function renderForecast() {
  // Target placement for template
  const weatherForecast = document.querySelector("#weather-forecast");
  weatherForecast.replaceChildren();

  // Template creation
  const weatherForecastTemplate = document.querySelector("#weather-forecast-template");
  const forecastClone = document.importNode(weatherForecastTemplate.content, true);

  const forecastHeader = forecastClone.querySelector("[data-forecast-header]");
  forecastHeader.textContent = "7 Day Outlook";

  const forecastContainer = forecastClone.querySelector("[data-forecast-container]");

  for (const day of cachedWeather.days.slice(0, 7)) {
    const dateStr = day.datetime;
    const [year, month, dayVal] = dateStr.split("-");
    const dateObj = new Date(year, month - 1, dayVal);
    const abbrDay = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const displayTempMax = convertTemp(day.tempmax, unit);
    const displayTempMin = convertTemp(day.tempmin, unit);

    const dayEl = document.createElement("div");
    dayEl.classList.add("day");
    dayEl.textContent = abbrDay;

    const temps = document.createElement("div");
    temps.textContent = `${parseInt(displayTempMax)}${tempSymbol} / ${parseInt(displayTempMin)}${tempSymbol}`;

    const iconImg = document.createElement("img");
    iconImg.src = await loadWeatherIcon(day.icon);

    const iconContainer = document.createElement("div");
    iconContainer.classList.add("weather-icon");

    iconContainer.appendChild(iconImg);

    dayEl.appendChild(iconContainer);
    dayEl.appendChild(temps);

    forecastContainer.appendChild(dayEl);
  }

  forecastClone.appendChild(forecastContainer);

  weatherForecast.appendChild(forecastClone);
}
//#endregion

async function loadWeatherIcon(iconName) {
  try {
    const module = await import(`./assets/icons/${iconName}.svg`);
    return module.default;
  } catch (error) {
    console.log("Image not found", error);
  }
}

function convertTemp(temp, testUnit) {
  if (testUnit === "C") {
    return (((temp - 32) * 5) / 9).toFixed(0);
  }
  return temp.toFixed(0);
}
