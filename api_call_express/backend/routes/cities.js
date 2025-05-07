let express = require("express");
let router = express.Router();
let axios = require("axios");
const mongoose = require("mongoose");
const auth = require("../middleware/auth"); // Import auth middleware

const { getCitySearchInfo, getCurrentTempSearchInfo, getAttractionSearchInfo, getForecastSearchInfo } = require("../utils/searchInfoFactory");
const { createCities, ensureAttractionsIsArray } = require("../utils/cityFactory");
const SearchInfo = require("../models/SearchInfo");
const { allAttractionCategories } = require("../models/AttractionCategory");
const { City, CityEntity, FETCH_FAILED_MARKER } = require("../models/City");

// Add rate limiting and retry logic to API calls
const fetchWithRetry = async (url, options = {}, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add a small delay between retries, increasing with each attempt
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
      
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        console.log(`Rate limited on attempt ${attempt + 1}, waiting before retry...`);
        // Get retry-after header if available
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay * 2;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
};

// Add caching to reduce API calls
const NodeCache = require('node-cache');
const apiCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Cached API fetch function
const cachedFetch = async (url, options = {}, cacheKey = url) => {
  // Check cache first
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    console.log(`Using cached data for: ${cacheKey}`);
    return cachedData;
  }
  
  // If not in cache, fetch from API with retry logic
  const data = await fetchWithRetry(url, options);
  
  // Store in cache
  apiCache.set(cacheKey, data);
  
  return data;
};

// Add detailed logging for API calls
const logApiCall = (endpoint, status, message) => {
  console.log(`[API] ${new Date().toISOString()} | ${endpoint} | Status: ${status} | ${message}`);
};

// Protect the search route with auth middleware
router.get("/search", auth, async (req, res) => { 
  const cityName = req.query.cityName;
  const categories = JSON.parse(decodeURIComponent(req.query.categories));

  try {
    let dbCities = await City.find({ searchTerm: cityName });
    if(dbCities.length > 0){
      console.log("Updating cities fetched from database for search term: ", cityName);
      
      // Log the structure of the first city to debug
      console.log("First city structure:", {
        name: dbCities[0].name,
        attractionsType: typeof dbCities[0].attractions,
        isArray: Array.isArray(dbCities[0].attractions),
        attractionsLength: dbCities[0].attractions ? 
          (typeof dbCities[0].attractions === 'string' ? 
            dbCities[0].attractions.length : 
            (Array.isArray(dbCities[0].attractions) ? 
              dbCities[0].attractions.length : 'N/A')) : 'N/A'
      });
      
      const existingCities = dbCities.map(city => {
        // Fix attractions before creating CityEntity
        if (typeof city.attractions === 'string') {
          try {
            city.attractions = JSON.parse(city.attractions);
          } catch (e) {
            console.warn(`Failed to parse attractions string for ${city.name}`);
            city.attractions = [];
          }
        }
        
        const cityEntity = city.toCityEntity();
        return ensureAttractionsIsArray(cityEntity);
      });
      
      const citiesWithUpdatedTemperature = await fetchCitiesWithTemperature(existingCities);
      
      // Check if any cities need to refetch attractions
      const citiesNeedingAttractions = citiesWithUpdatedTemperature.filter(city => 
        city.shouldRefetchAttractions && city.shouldRefetchAttractions()
      );
      
      let citiesWithUpdatedAttractions = citiesWithUpdatedTemperature;
      if (citiesNeedingAttractions.length > 0) {
        console.log(`Refetching attractions for ${citiesNeedingAttractions.length} cities`);
        citiesWithUpdatedAttractions = await fetchCitiesWithAttractions(
          citiesWithUpdatedTemperature, 
          categories
        );
        
        // Update the database with new attractions data
        for (const city of citiesWithUpdatedAttractions) {
          if (!city.shouldRefetchAttractions || !city.shouldRefetchAttractions()) {
            await City.updateOne(
              { name: city.name, latitude: city.latitude },
              { attractions: city.attractions }
            );
          }
        }
      }
      
      const citiesWithUpdatedForecast = await fetchCitiesWithForecast(citiesWithUpdatedAttractions);
      
      const citiesWithFilteredAttractions = citiesWithUpdatedForecast.map(city => {
        // Ensure attractions is an array before calling populateAttractionsForDisplay
        if (!Array.isArray(city.attractions)) {
          console.warn(`Attractions is not an array for ${city.name} before populateAttractionsForDisplay`);
          city.attractions = [];
        }
        
        // Skip populateAttractionsForDisplay if attractions has the fetch failed marker
        if (!city.shouldRefetchAttractions || !city.shouldRefetchAttractions()) {
          city.populateAttractionsForDisplay(categories);
        }
        
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
        citiesWithForecast.map(city => {
          // Ensure attractions is serialisable
          let attractions = city.attractions;
          if (!Array.isArray(attractions)) {
            console.warn(`Attractions is not an array when saving ${city.name}`);
            attractions = Array.isArray(attractions?.features) ? attractions.features : [];
          }
          
          return {
            searchTerm: city.searchTerm,
            name: city.name,
            countryName: city.countryName,
            population: city.population,
            latitude: city.latitude,
            longitude: city.longitude,
            attractions: attractions // Use the sanitised attractions
          };
        })
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
        // Check if we should refetch attractions
        const shouldRefetch = city.shouldRefetchAttractions ? 
                             city.shouldRefetchAttractions() : false;
        
        // If attractions exist and are valid, and we don't need to refetch, skip API call
        if (Array.isArray(city.attractions) && 
            city.attractions.length > 0 && 
            !city.attractions[0]?._fetchFailed && 
            !shouldRefetch) {
          console.log(`Using existing attractions for ${city.name}`);
          city.populateAttractionsForDisplay(selectedCategories);
          return city;
        }
        
        console.log(`Fetching attractions for ${city.name}`);
        const attractionsSearchInfo = getAttractionSearchInfo(city.latitude, city.longitude, allAttractionCategories);
        const options = {
          headers: attractionsSearchInfo.headers
        };
        
        // Use our improved fetch with retry and caching
        const cacheKey = `attractions_${city.latitude}_${city.longitude}`;
        let attractionsData;
        
        try {
          // Try to use axios directly with response type checking
          const response = await axios.get(attractionsSearchInfo.url, options);
          
          // Check if response is HTML instead of JSON
          const contentType = response.headers['content-type'] || '';
          if (contentType.includes('text/html')) {
            console.error('API returned HTML instead of JSON. Possible rate limiting or authentication issue.');
            throw new Error('API returned HTML instead of JSON');
          }
          
          // Check if response data is a string and looks like HTML
          if (typeof response.data === 'string' && 
              (response.data.trim().toLowerCase().startsWith('<!doctype') || 
               response.data.trim().toLowerCase().startsWith('<html'))) {
            console.error('API returned HTML content. Possible rate limiting or authentication issue.');
            throw new Error('API returned HTML content');
          }
          
          attractionsData = response.data;
        } catch (error) {
          console.warn("Error fetching attractions:", error.message);
          // Use the special marker to indicate fetch failure
          city.attractions = [{ 
            ...FETCH_FAILED_MARKER,
            message: `Could not load attractions: ${error.message}`
          }];
          city.displayAttractions = {};
          return city;
        }
        
        // Ensure attractions is an array
        if (!Array.isArray(attractionsData)) {
          console.warn(`Attractions data is not an array for ${city.name}:`, typeof attractionsData);
          
          // Try to extract features if it's in GeoJSON format
          if (attractionsData && Array.isArray(attractionsData.features)) {
            attractionsData = attractionsData.features;
          } else {
            // If we can't get a valid array, use an empty array (successful fetch but no results)
            attractionsData = [];
          }
        }
        
        city.attractions = attractionsData;
        
        // Log what we got
        console.log(`Got ${city.attractions.length} attractions for ${city.name}`);
        
        // Populate display attractions
        city.populateAttractionsForDisplay(selectedCategories);
      } catch (error) {
        console.warn("Error in attractions processing:", error.message);
        // Use the special marker to indicate fetch failure
        city.attractions = [{ 
          ...FETCH_FAILED_MARKER,
          message: `Could not process attractions: ${error.message}`
        }];
        city.displayAttractions = {};
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

// Update the delete route to handle city deletion more precisely
router.delete("/:id", auth, async (req, res) => {
  const cityId = req.params.id;
  
  try {
    console.log(`Attempting to delete city with ID: ${cityId}`);
    
    // First, try to find the exact city by name, ID, or computed ID
    let city = null;
    
    // If it looks like a MongoDB ObjectId, try that first
    if (mongoose.isValidObjectId(cityId)) {
      city = await City.findById(cityId);
      if (city) {
        console.log(`Found city by ObjectId: ${city.name}`);
      }
    }
    
    // If not found by ObjectId, try exact name match
    if (!city) {
      city = await City.findOne({ name: cityId });
      if (city) {
        console.log(`Found city by exact name: ${city.name}`);
      }
    }
    
    // If still not found, try case-insensitive exact match
    if (!city) {
      city = await City.findOne({ 
        name: { $regex: `^${cityId}$`, $options: 'i' }
      });
      if (city) {
        console.log(`Found city by case-insensitive name: ${city.name}`);
      }
    }
    
    // If still not found, check if we're trying to delete a district
    if (!city && cityId.includes('District')) {
      // For "X District", try to find exact match
      city = await City.findOne({ 
        name: { $regex: `^${cityId}$`, $options: 'i' }
      });
      if (city) {
        console.log(`Found district by exact name: ${city.name}`);
      }
    }
    
    // If still not found, try partial match as last resort
    if (!city) {
      const cities = await City.find({ 
        name: { $regex: cityId, $options: 'i' }
      });
      
      if (cities.length > 0) {
        // If multiple matches, prefer exact match or district match
        const exactMatch = cities.find(c => 
          c.name.toLowerCase() === cityId.toLowerCase() ||
          (cityId.includes('District') && c.name.toLowerCase() === cityId.toLowerCase())
        );
        
        if (exactMatch) {
          city = exactMatch;
          console.log(`Found city by partial match (exact): ${city.name}`);
        } else {
          // If no exact match, take the first one
          city = cities[0];
          console.log(`Found city by partial match (first): ${city.name}`);
        }
      }
    }
    
    if (!city) {
      console.log(`City not found with ID: ${cityId}`);
      return res.status(404).json({ message: "City not found" });
    }
    
    console.log(`Deleting city: ${city.name} (${city._id})`);
    
    // Delete the city
    const result = await City.deleteOne({ _id: city._id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "City not found or already deleted" });
    }
    
    console.log(`Successfully deleted city: ${city.name}`);
    res.json({ message: "City deleted successfully", deletedCity: city.name });
  } catch (error) {
    console.error("Error deleting city:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports=router;
