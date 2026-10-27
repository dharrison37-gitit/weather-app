import "./styles.css";

const BASE_TIMELINE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
const API_KEY = "S99YY6U6SCWUJFQ763DTS23ZJ";
const METRIC = "unitGroup=metric";
const US = "unitGroup=us";
const form = document.querySelector("[data-form]");
const tempSymbol = "\u00B0";
const percentSymbol = "\u0025";
const sampleLocations = ["Oklahoma City, OK", "New York, NY", "Washington, DC"];

getDataAsync(sampleLocations[Math.floor(Math.random() * 3)]).then((data) => {
  const weather = processWeatherData(data);
  displayWeatherDataAsync(weather);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const location = formData.get("location");
  if (!location) return;

  getDataAsync(location).then((data) => {
    const weather = processWeatherData(data);
    displayWeatherDataAsync(weather);
    displayForecast(weather);
  });

  form.reset();
});

//#region Current Conditions Rendering
async function displayWeatherDataAsync(weather) {
  const {
    address,
    description,
    currently: { temp, feelslike, humidity, windspeed, conditions, icon },
  } = weather;

  // Clear currently rendered content
  const currentConditions = document.querySelector("#current-conditions");
  currentConditions.replaceChildren();

  // Target element to place template clone
  const currentConditionsTemplate = document.querySelector("#current-conditions-template");

  const conditionsClone = document.importNode(currentConditionsTemplate.content, true);

  const locationElem = conditionsClone.querySelector("[data-current-location]");
  locationElem.textContent = address;

  const tempElem = conditionsClone.querySelector("[data-current-temp]");
  tempElem.textContent = `Currently ${parseInt(temp)}${tempSymbol}F`;

  const feelslikeElem = conditionsClone.querySelector("[data-feels-like]");
  feelslikeElem.textContent = `Feels like: ${parseInt(feelslike)}${tempSymbol}F`;

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

async function displayForecast(weather) {
  // Target placement for template
  const weatherForecast = document.querySelector("#weather-forecast");
  weatherForecast.replaceChildren();

  // Template creation
  const weatherForecastTemplate = document.querySelector("#weather-forecast-template");
  const forecastClone = document.importNode(weatherForecastTemplate.content, true);

  const forecastHeader = forecastClone.querySelector("[data-forecast-header]");
  forecastHeader.textContent = "7 Day Outlook";

  const forecastContainer = forecastClone.querySelector("[data-forecast-container]");

  for (const day of weather.days.slice(0, 7)) {
    const dateStr = day.datetime;
    const [year, month, dayVal] = dateStr.split("-");
    const dateObj = new Date(year, month - 1, dayVal);
    const abbrDay = dateObj.toLocaleDateString("en-US", { weekday: "short" });

    const dayEl = document.createElement("div");
    dayEl.classList.add("day");
    dayEl.textContent = abbrDay;

    const highs = document.createElement("div");
    highs.textContent = `High ${parseInt(day.tempmax)}${tempSymbol}`;

    const lows = document.createElement("div");
    lows.textContent = `Low ${parseInt(day.tempmin)}${tempSymbol}`;

    const temps = document.createElement("div");
    temps.textContent = `${parseInt(day.tempmax)}${tempSymbol} / ${parseInt(day.tempmin)}${tempSymbol}`;

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

async function getDataAsync(location) {
  try {
    const encodedLocation = encodeURI(location);
    const response = await fetch(`${BASE_TIMELINE_URL}/${encodedLocation}?${US}&key=${API_KEY}`);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Fetch failed", error);
  }
}

function processWeatherData(data) {
  if (!data) return;

  return {
    address: data.address,
    description: data.description,
    currently: data.currentConditions,
    days: data.days,
    alerts: data.alerts,
  };
}

async function loadWeatherIcon(iconName) {
  try {
    const module = await import(`./assets/icons/${iconName}.svg`);
    return module.default;
  } catch (error) {
    console.log("Image not found", error);
  }
}
