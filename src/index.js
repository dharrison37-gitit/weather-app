import "./styles.css";

const BASE_TIMELINE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
const API_KEY = "S99YY6U6SCWUJFQ763DTS23ZJ";
const form = document.querySelector("[data-form]");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const location = formData.get("location");
  if (!location) return;

  getDataAsync(location).then((data) => {
    const weather = processWeatherData(data);
    displayWeatherData(weather);
  });
});

// create function to display items on page via template items
function displayWeatherData(weather) {
  console.clear();
  console.log(weather.address);
  console.log(weather.description);
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
    console.log(`High: ${day.tempmax} Low: ${day.tempmin} Humidity: ${day.humidity}`);
  });
}

async function getDataAsync(location) {
  try {
    const response = await fetch(`${BASE_TIMELINE_URL}/${location}?key=${API_KEY}`);

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

// create function to convert temps between F/C all temps on page
function convertTemperature() {
  return;
}
