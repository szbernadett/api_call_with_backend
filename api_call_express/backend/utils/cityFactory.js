const { CityEntity } = require("../models/City");

// creates inital city objects after the first api call to use in further code
function createCities(response, searchTerm) {
  if (!Array.isArray(response?.data)) {
    console.error("Expected data to be an array, but got:", response);
    return [];
  }

  return response?.data.map(
    (cityData) =>
      new CityEntity(
        searchTerm,
        cityData.name,
        cityData.country,
        cityData.population,
        cityData.latitude,
        cityData.longitude
      )
  );
}

// Add a utility function to ensure attractions is an array
function ensureAttractionsIsArray(city) {
  if (!Array.isArray(city.attractions)) {
    console.warn(`Attractions is not an array for ${city.name}, fixing it`);
    
    // Try to extract features if it's in GeoJSON format
    if (city.attractions && Array.isArray(city.attractions.features)) {
      city.attractions = city.attractions.features;
    } else if (typeof city.attractions === 'string') {
      // Try to parse if it's a JSON string
      try {
        const parsed = JSON.parse(city.attractions);
        city.attractions = Array.isArray(parsed) ? parsed : 
                          (Array.isArray(parsed?.features) ? parsed.features : []);
      } catch (e) {
        city.attractions = [];
      }
    } else {
      city.attractions = [];
    }
  }
  return city;
}

// Export the utility function
module.exports = {
  createCities,
  ensureAttractionsIsArray};
