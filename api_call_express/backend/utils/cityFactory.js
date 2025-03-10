const City = require("../models/City");

// creates inital city objects after the first api call to use in further code
function createCities(data) {
  if (!Array.isArray(data)) {
    console.error("Expected data to be an array, but got:", data);
    return [];
  }

  return data.map(
    (cityData) =>
      new City(
        cityData.name,
        cityData.country,
        cityData.population,
        cityData.latitude,
        cityData.longitude
      )
  );
}

module.exports = createCities;