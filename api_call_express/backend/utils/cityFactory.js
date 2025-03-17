const { CityEntity } = require("../models/City");

// creates inital city objects after the first api call to use in further code
function createCities(response, searchTerm) {
  if (!Array.isArray(response)) {
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

module.exports = createCities;