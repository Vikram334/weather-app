import React from "react";
import apiKeys from "./apiKeys";
import Clock from "react-live-clock";
import Forcast from "./forcast";
import loader from "./resources/images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-animated-weather";

const dateBuilder = (d) => {
  const months = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ];
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const day = days[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
};

const defaults = {
  color: "white",
  size: 112,
  animate: true,
};

class Weather extends React.Component {
  state = {
    lat: undefined,
    lon: undefined,
    temperatureC: undefined,
    city: "Detecting location...",
    country: "",
    main: "Clear", // Default weather condition
    icon: "CLEAR_DAY",
    forecast: [], // Forecast data state
    selectedForecastTemp: undefined,
    isSearchActive: false,
  };

  componentDidMount() {
    if (navigator.geolocation) {
      this.getPosition()
        .then((position) => {
          this.setState({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          if (!this.state.isSearchActive) {
            this.getWeather(position.coords.latitude, position.coords.longitude);
          }
        })
        .catch(() => {
          this.getWeather(23.6889, 86.9661); // Default location
          alert("Location service disabled. Default location will be used for real-time weather.");
        });
    } else {
      alert("Geolocation not available");
    }
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  getPosition = (options) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  // Fetch current weather and forecast
  getWeather = async (lat, lon) => {
    const weather_api_call = await fetch(
      `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
    );
    const data = await weather_api_call.json();

    const forecast_api_call = await fetch(
      `${apiKeys.base}forecast?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
    );
    const forecastData = await forecast_api_call.json();

    console.log("Weather updated:", {
      temperature: data.main.temp,
      weatherMain: data.weather[0].main,
      city: data.name,
      country: data.sys.country,
    });

    const weatherMain = data.weather[0].main;
    this.setState({
      lat,
      lon,
      city: data.name,
      country: data.sys.country,
      temperatureC: Math.round(data.main.temp),
      main: weatherMain,
      icon: this.getWeatherIcon(weatherMain),
      forecast: forecastData.list,
      isSearchActive: true, // Set the search active flag to true after search
    });
  };

  getWeatherIcon = (main) => {
    const iconMap = {
      Haze: "CLEAR_DAY",
      Clouds: "CLOUDY",
      Rain: "RAIN",
      Snow: "SNOW",
      Dust: "WIND",
      Drizzle: "SLEET",
      Fog: "FOG",
      Smoke: "FOG",
      Tornado: "WIND",
      Thunderstorm: "THUNDERSTORM",
    };
    return iconMap[main] || "CLEAR_DAY";
  };

  getBackgroundGif = () => {
    const gifMap = {
      Haze: require("./resources/animation/fog.gif"),
      Clouds: require("./resources/animation/clouds.gif"),
      Rain: require("./resources/animation/rain.gif"),
      Snow: require("./resources/animation/snow.gif"),
      Dust: require("./resources/animation/fog.gif"),
      Drizzle: require("./resources/animation/rain.gif"),
      Fog: require("./resources/animation/fog.gif"),
      Smoke: require("./resources/animation/fog.gif"),
      Tornado: require("./resources/animation/tornado.gif"),
      Thunderstorm: require("./resources/animation/thunderstorm.gif"),
      Clear: require("./resources/animation/clear.gif"),
    };
    return gifMap[this.state.main] || require("./resources/animation/clear.gif");
  };

  handleSearchUpdate = (city, country) => {
    this.setState({ city, country, isSearchActive: true });
    // Fetch weather for the new location after search
    this.getWeatherByCity(city, country);
  };

  handleForecastTemperatureSelect = (temperature) => {
    this.setState({ selectedForecastTemp: temperature });
  };

  getWeatherByCity = async (city, country) => {
    const weather_api_call = await fetch(
      `${apiKeys.base}weather?q=${city},${country}&units=metric&APPID=${apiKeys.key}`
    );
    const data = await weather_api_call.json();

    const forecast_api_call = await fetch(
      `${apiKeys.base}forecast?q=${city},${country}&units=metric&APPID=${apiKeys.key}`
    );
    const forecastData = await forecast_api_call.json();

    console.log("Weather updated:", {
      temperature: data.main.temp,
      weatherMain: data.weather[0].main,
      city: data.name,
      country: data.sys.country,
    });

    const weatherMain = data.weather[0].main;
    this.setState({
      lat: data.coord.lat,
      lon: data.coord.lon,
      city: data.name,
      country: data.sys.country,
      temperatureC: Math.round(data.main.temp),
      main: weatherMain,
      icon: this.getWeatherIcon(weatherMain),
      forecast: forecastData.list,
    });
  };

  render() {
    const backgroundGif = this.getBackgroundGif(); // Dynamically resolve background

    return this.state.temperatureC ? (
      <React.Fragment>
        <div
          className="city"
          style={{
            backgroundImage: `url(${backgroundGif})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <div className="title">
            <h2>{this.state.city}</h2>
            <h3>{this.state.country}</h3>
          </div>
          <div className="mb-icon">
            <ReactAnimatedWeather
              icon={this.state.icon}
              color={defaults.color}
              size={defaults.size}
              animate={defaults.animate}
            />
            <p>{this.state.main}</p>
          </div>
          <div className="date-time">
            <div className="dmy">
              <div id="txt"></div>
              <div className="current-time">
                <Clock format="HH:mm:ss" interval={1000} ticking={true} />
              </div>
              <div className="current-date">{dateBuilder(new Date())}</div>
            </div>
            <div className="temperature">
              <p>
                {this.state.selectedForecastTemp
                  ? `${Math.round(this.state.selectedForecastTemp)}°C`
                  : `${this.state.temperatureC}°C`}
              </p>
            </div>
          </div>
        </div>
        <Forcast
          icon={this.state.icon}
          weather={this.state.main}
          forecast={this.state.forecast}
          onSearchUpdate={this.handleSearchUpdate}
          onForecastTemperatureSelect={this.handleForecastTemperatureSelect}
        />
      </React.Fragment>
    ) : (
      <React.Fragment>
        <img src={loader} style={{ width: "50%", WebkitUserDrag: "none" }} />
        <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>
          Detecting your location
        </h3>
        <h3 style={{ color: "white", marginTop: "10px" }}>
          Your current location will be displayed on the App <br /> & used for
          calculating real-time weather.
        </h3>
      </React.Fragment>
    );
  }
}

export default Weather;
