let express = require("express");
let router = express.Router();
let axios = require("axios");


const { getCitySearchInfo, getCurrentTempSearchInfo, getAttractionSearchInfo, getForecastSearchInfo } = require("../utils/searchInfoFactory");
const createCities = require("../utils/cityFactory");
const SearchInfo = require("../models/SearchInfo");

router.get("/search", async (req, res) => { 
  const cityName = req.query.cityName;
  const categories = JSON.parse(decodeURIComponent(req.query.categories));

  if (!cityName) {
    return res.status(400).json({ error: "Please enter a city name to search" });
  }

  try {
    const citySearchInfo = getCitySearchInfo(cityName);
    const options = {
      headers: citySearchInfo.headers
    };
    const cityDataResponse = await axios.get(citySearchInfo.url, options);
    const cityData = cityDataResponse.data;

    const initialCities = createCities(cityData.data);
    const uniqueCities = getUniqueCities(initialCities);

    const citiesWithTemp = await fetchCitiesWithTemperature(uniqueCities);
    const citiesWithAttractions = await fetchCitiesWithAttractions(citiesWithTemp, categories);
    const citiesWithForecast = await fetchCitiesWithForecast(citiesWithAttractions);

    res.json({ cities: citiesWithForecast });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

const fetchCitiesWithTemperature = async (cities) => {
  return Promise.all(
    cities.map(async (city) => {
      try {
        const currentTempSearchInfo = getCurrentTempSearchInfo(city.latitude, city.longitude);
        const options = {
          headers: currentTempSearchInfo.headers
        };
        const response = await axios.get(currentTempSearchInfo.url, options);
        city.currentTemp = response.data?.current?.temp_c || "No data available";
      } catch (error) {
        console.warn("Error fetching temperature data:", error.message);
        city.currentTemp = "No data available";
      }
      return city;
    })
  );
};

// Fetch attractions
const fetchCitiesWithAttractions = async (cities, selectedCategories) => {
  return Promise.all(
    cities.map(async (city) => {
      try {
        const attractionsSearchInfo = getAttractionSearchInfo(city.latitude, city.longitude, selectedCategories);
        const options = {
          headers: attractionsSearchInfo.headers
        };
        const response = await axios.get(attractionsSearchInfo.url, options);
        city.populateAttractions(response.data, selectedCategories);
      } catch (error) {
        console.warn("Error fetching attractions data:", error.message);
      }
      return city;
    })
  );
};

const fetchCitiesWithForecast = async (cities) => {
  return Promise.all(
    cities.map(async (city) => {
      try {
        const forecastSearchInfo = getForecastSearchInfo(city.latitude, city.longitude);
        const options = {
          headers: forecastSearchInfo.headers
        };
        const response = await axios.get(forecastSearchInfo.url, options);
        city.extractForecastData(response.data);
      } catch (error) {
        console.warn("Error fetching forecast data:", error.message);
      }
      return city;
    })
  );
};

function getUniqueCities(cities) {
  return Array.from(new Map(cities.map((city) => [city.id, city])).values());
}

module.exports=router;