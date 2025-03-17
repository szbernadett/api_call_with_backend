let express = require("express");
let router = express.Router();
let axios = require("axios");


const { getCitySearchInfo, getCurrentTempSearchInfo, getAttractionSearchInfo, getForecastSearchInfo } = require("../utils/searchInfoFactory");
const createCities = require("../utils/cityFactory");
const SearchInfo = require("../models/SearchInfo");
const { allAttractionCategories } = require("../models/AttractionCategory");
const { City, CityEntity } = require("../models/City");


router.get("/search", async (req, res) => { 
  const cityName = req.query.cityName;
  const categories = JSON.parse(decodeURIComponent(req.query.categories));


  try {
    let dbCities = await City.find({ searchTerm: cityName });
    if(dbCities.length > 0){
      console.log("Updating cities fetched from database for search term: ", cityName);
      const existingCities = dbCities.map(city => {
        const cityEntity = city.toCityEntity();
        return cityEntity;
      });
      const citeisWithUpdatedTemperature = await fetchCitiesWithTemperature(existingCities);
      const citiesWithUpdatedForecast = await fetchCitiesWithForecast(citeisWithUpdatedTemperature);
      const citiesWithFilteredAttractions = citiesWithUpdatedForecast.map(city => {
        city.populateAttractionsForDisplay(categories);
        return city;
      });
      res.json({cities: citiesWithFilteredAttractions});
    
    } else {
      console.log("Creating new city entities from API data for search term: ", cityName);
      const citySearchInfo = getCitySearchInfo(cityName);
      const options = {
        headers: citySearchInfo.headers
      };
      const cityDataResponse = await axios.get(citySearchInfo.url, options);
      const cityData = {};
      if(cityDataResponse.ok){
        cityData = cityDataResponse.data;
      }

      const initialCities = createCities(cityData, cityName);
      const uniqueCities = initialCities.length > 0 ? getUniqueCities(initialCities) : [];

      const citiesWithTemp = await fetchCitiesWithTemperature(uniqueCities);
      const citiesWithAttractions = await fetchCitiesWithAttractions(citiesWithTemp, categories);
      const citiesWithForecast = await fetchCitiesWithForecast(citiesWithAttractions);
      
      
      await City.insertMany(
        citiesWithForecast.map(city => ({
          searchTerm: city.searchTerm,
          name: city.name,
          countryName: city.countryName,
          population: city.population,
          latitude: city.latitude,
          longitude: city.longitude,
          attractions: city.attractions
        }))
      );
  
      res.json({ cities: citiesWithForecast });
    
    }
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
        const attractionsSearchInfo = getAttractionSearchInfo(city.latitude, city.longitude, allAttractionCategories);
        const options = {
          headers: attractionsSearchInfo.headers
        };
        const response = await axios.get(attractionsSearchInfo.url, options);
        city.attractions= response.ok ? response.data : [];
        city.populateAttractionsForDisplay(selectedCategories);
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