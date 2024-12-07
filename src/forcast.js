import axios from "axios";
import React, { useState } from "react";
import ReactAnimatedWeather from "react-animated-weather";
import apiKeys from "./apiKeys";

function Forcast(props) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState(null);
  const [icon, setIcon] = useState(props.icon || "CLEAR_DAY"); // Default icon

  const defaults = {
    color: "white",
    size: 112,
    animate: true,
  };

  // Map weather conditions to icon names for ReactAnimatedWeather
  const mapWeatherToIcon = (weatherMain) => {
    switch (weatherMain) {
      case "Haze":
        return "CLEAR_DAY";
      case "Clouds":
        return "CLOUDY";
      case "Rain":
        return "RAIN";
      case "Snow":
        return "SNOW";
      case "Dust":
        return "WIND";
      case "Drizzle":
        return "SLEET";
      case "Fog":
      case "Smoke":
        return "FOG";
      case "Tornado":
        return "WIND";
      case "Thunderstorm":
        return "RAIN";
      default:
        return "CLEAR_DAY";
    }
  };

  // Function to fetch weather data
  const search = (city) => {
    const cityName = city && city.trim() !== "" ? city : query;
    if (!cityName) {
      setError({ message: "Please enter a city name", query: "" });
      return;
    }

    axios
      .get(`${apiKeys.base}weather?q=${cityName}&units=metric&APPID=${apiKeys.key}`)
      .then((response) => {
        const { weather: weatherData, name, sys } = response.data;
        setWeather(response.data);
        setQuery("");
        setError(null);

        // Update the icon based on the weather description
        const updatedIcon = mapWeatherToIcon(weatherData[0].main);
        setIcon(updatedIcon);

        // Pass updated city and country to parent component
        if (props.onSearchUpdate) {
          props.onSearchUpdate(name, sys.country);
        }

        // Log the weather data to console every time it's updated
        console.log("Weather Forecast Updated:", {
          city: name,
          country: sys.country,
          temperature: Math.round(response.data.main.temp),
          description: weatherData[0].main,
          humidity: Math.round(response.data.main.humidity),
          windSpeed: Math.round(response.data.wind.speed),
        });
      })
      .catch(() => {
        setWeather(null);
        setError({ message: "City not found", query: cityName });
      });
  };

  return (
    <div className="forecast">
      {/* Weather Icon Section */}
      <div className="forecast-icon">
        <ReactAnimatedWeather
          icon={icon}
          color={defaults.color}
          size={defaults.size}
          animate={defaults.animate}
        />
      </div>

      {/* Weather Details Section */}
      <div className="today-weather">
        {/* Dynamically update the weather description */}
        <h3>{weather ? weather.weather[0].main : props.weather || "Clear"}</h3>

        {/* Search Box */}
        <div className="search-box">
          <input
            type="text"
            className="search-bar"
            placeholder="Search any city"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
          <div className="img-box">
            <img
              src="https://images.avishkaar.cc/workflow/newhp/search-white.png"
              alt="Search"
              onClick={() => search(query)}
            />
          </div>
        </div>

        {/* Weather Information */}
        <ul>
          {weather ? (
            <div>
              {/* City Name and Weather Icon */}
              <li className="cityHead">
                <p>
                  {weather.name}, {weather.sys.country}
                </p>
                <img
                  className="temp"
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                  alt={weather.weather[0].icon}
                />
              </li>

              {/* Temperature */}
              <li>
                Temperature{" "}
                <span className="temp">
                  {Math.round(weather.main.temp)}°C ({weather.weather[0].main})
                </span>
              </li>

              {/* Humidity */}
              <li>
                Humidity{" "}
                <span className="temp">{Math.round(weather.main.humidity)}%</span>
              </li>

              {/* Visibility */}
              <li>
                Visibility{" "}
                <span className="temp">{Math.round(weather.visibility / 1000)} km</span>
              </li>

              {/* Wind Speed */}
              <li>
                Wind Speed{" "}
                <span className="temp">{Math.round(weather.wind.speed)} km/h</span>
              </li>
            </div>
          ) : (
            <li className="error-message">
              {error ? `${error.query}: ${error.message}` : "Search for a city to display weather information."}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Forcast;
