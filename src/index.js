import "./styles.css";

const BASE_TIMELINE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
const API_KEY = "S99YY6U6SCWUJFQ763DTS23ZJ";
const METRIC = "unitGroup=metric";
const US = "unitGroup=us";
const form = document.querySelector("[data-form]");
const tempSymbol = "\u00B0";
const percentSymbol = "\u0025";

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const location = formData.get("location");
  if (!location) return;

  getDataAsync(location).then((data) => {
    const weather = processWeatherData(data);
    displayWeatherDataAsync(weather);
    // displayForecast(weather);
  });

  form.reset();
});

// create function to display items on page via template items
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
  feelslikeElem.textContent = `Feels like: ${parseInt(feelslike)}${tempSymbol}`;

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

function displayForecast(weather) {
  // Target placement for template
  const weatherForecast = document.querySelector("#weather-forecast");
  weatherForecast.replaceChildren();

  // Template creation
  const weatherForecastTemplate = document.querySelector("#weather-forecast-template");
  const forecastClone = document.importNode(weatherForecastTemplate.content, true);

  const forecastHeader = forecastClone.querySelector("[data-forecast-header]");
  forecastHeader.textContent = "7 Day Outlook";

  const forecastContainer = forecastClone.querySelector("[data-forecast-container]");

  weather.days.slice(0, 7).forEach((day) => {
    const highs = document.createElement("div");
    highs.textContent = `${parseInt(day.tempmax)}${tempSymbol}`;

    const lows = document.createElement("div");
    lows.textContent = `${parseInt(day.tempmin)}${tempSymbol}`;

    const humidity = document.createElement("div");
    humidity.textContent = `${parseInt(day.humidity)}${percentSymbol}`;

    forecastContainer.appendChild(highs);
    forecastContainer.appendChild(lows);
    forecastContainer.appendChild(humidity);
  });

  forecastClone.appendChild(forecastContainer);

  weatherForecast.appendChild(forecastClone);
}

function displayConsole(weather) {
  console.clear();
  console.log(weather.address);
  console.log(weather.description);
  console.log(weather.windspeed);
  console.log(
    "Temp:",
    weather.currently.temp,
    "Feels like:",
    weather.currently.feelslike,
    "Humidity:",
    weather.currently.humidity
  );

  console.log("Alerts / Special Weather Statements");
  weather.alerts.forEach((alert) => console.log(alert.description));

  console.log("7 Day Outlook");
  weather.days.slice(0, 7).forEach((day) => {
    console.table(day.tempmax, day.tempmin, day.humidity);
  });
}

async function getDataAsync(location) {
  try {
    const response = await fetch(`${BASE_TIMELINE_URL}/${location}?${US}&key=${API_KEY}`);

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
    days: data.days, // could limit to seven
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
