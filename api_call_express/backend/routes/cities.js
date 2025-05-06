let express = require("express");
let router = express.Router();
let axios = require("axios");
const auth = require("../middleware/auth"); // Import auth middleware

const { getCitySearchInfo, getCurrentTempSearchInfo, getAttractionSearchInfo, getForecastSearchInfo } = require("../utils/searchInfoFactory");
const createCities = require("../utils/cityFactory");
const SearchInfo = require("../models/SearchInfo");
const { allAttractionCategories } = require("../models/AttractionCategory");
const { City, CityEntity } = require("../models/City");

// Protect the search route with auth middleware
router.get("/search", auth, async (req, res) => { 
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
      const cityData = cityDataResponse.status === 200 ? cityDataResponse.data : [];
     

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

// Add this new route for deleting a city
router.delete("/:id", auth, async (req, res) => {
  const cityId = req.params.id;
  
  try {
    // Find the city by ID
    const city = await City.findOne({ 
      $or: [
        { _id: mongoose.isValidObjectId(cityId) ? cityId : null },
        { "name": cityId }
      ]
    });
    
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    
    // Delete the city
    await City.deleteOne({ _id: city._id });
    
    res.json({ message: "City deleted successfully" });
  } catch (error) {
    console.error("Error deleting city:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports=router;
