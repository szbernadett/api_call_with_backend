const SearchInfo = require("../models/SearchInfo");
const City = require("../models/City");

const rapidKey = process.env.RAPID_API_KEY;

const getCitySearchInfo = (city) => {
  if (city) {
    return new SearchInfo(
      "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
      { namePrefix: city, limit: 6 },
      {
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
        "X-RapidAPI-Key": rapidKey,
      }
    );
  } else {
    return new SearchInfo();
  }
};

const getCurrentTempSearchInfo = (latitude, longitude) => {
  if (latitude && longitude) {
    return new SearchInfo(
      "https://weatherapi-com.p.rapidapi.com/current.json",
      { q: `${latitude},${longitude}` },
      {
        "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
        "X-RapidAPI-Key": rapidKey,
      }
    );
  } else {
    return new SearchInfo();
  }
};

const getAttractionSearchInfo = (
  latitude,
  longitude,
  selectedCategories
) => {
  const radius = City.attracionSearchRadius; // distance from the point of search (city) in metres
  const limit = City.resultsPerAttractionCat * selectedCategories.length; // retrieve max 500 results for each category
  const preparedCategories = selectedCategories.join(",");
  if (latitude && longitude && selectedCategories) {
    return new SearchInfo(
      "https://opentripmap-places-v1.p.rapidapi.com/en/places/radius",
      {
        kinds: preparedCategories,
        format: "json",
        limit: limit,
        lon: longitude,
        radius: radius,
        lat: latitude,
      },
      {
        "X-RapidAPI-Host": "opentripmap-places-v1.p.rapidapi.com",
        "X-RapidAPI-Key": rapidKey,
      }
    );
  } else {
    return new SearchInfo();
  }
};

const getForecastSearchInfo = (latitude, longitude) => {
  const numOfDays = 3; // how many days should the forecast include
  if (latitude && longitude) {
    return new SearchInfo(
      "https://weatherapi-com.p.rapidapi.com/forecast.json",
      {
        q: `${latitude},${longitude}`,
        days: numOfDays,
      },
      {
        "x-rapidapi-key": rapidKey,
        "x-rapidapi-host": "weatherapi-com.p.rapidapi.com",
      }
    );
  } else {
    return new SearchInfo();
  }
};

module.exports = {getCitySearchInfo, getCurrentTempSearchInfo, getAttractionSearchInfo, getForecastSearchInfo};