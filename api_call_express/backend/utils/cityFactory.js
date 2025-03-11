const { CityEntity } = require("../models/City");

// creates inital city objects after the first api call to use in further code
function createCities(data, searchTerm) {
  if (!Array.isArray(data)) {
    console.error("Expected data to be an array, but got:", data);
    return [];
  }

  return data.map(
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