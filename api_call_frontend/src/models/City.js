import { ReverseAttractionCategory } from "./AttractionCategory";

export default class City {
  static attractionPerCatLimit = 5; // how many attractions per category to collect in the pouplateAttractions function
  static resultsPerAttractionCat = 500; // used to determine max how many results to ask for in api call
  static attracionSearchRadius = 5000; // how far the search for tourist attracitons should extend from the city in metres

  constructor(
    name,
    countryName,
    population,
    latitude,
    longitude,
    currentTemp = 0,
    attractions = {},
    forecast = {}
  ) {
    this.name = name;
    this.countryName = countryName;
    this.population = population;
    this.latitude = latitude;
    this.longitude = longitude;
    this.currentTemp = currentTemp;
    this.attractions = attractions; // populated after api call
    this.forecast = forecast; // populated after api call
    this.id = name + latitude; // generated id to use when React needs it to dynamically display an array of cities
  }
  // Collects the first 5 attraction names for each selected category
  populateAttractions(apiData, selectedCategories) {
    if (apiData?.length > 0 && selectedCategories?.length > 0) {
      let catsToMatch = [...selectedCategories];
      // tested on GeoJSON format returned from the Placed API
      apiData.forEach((feature) => {
        if (feature.name) {
          if (catsToMatch.length > 0) {
            const matchingCat = catsToMatch.find((cat) =>
              feature.kinds.split(",").includes(cat)
            );
            if (matchingCat) {
              let catToKey = ReverseAttractionCategory[matchingCat]; // get the key name from the AtrractionCategory based on the value
              this.attractions[catToKey] = this.attractions[catToKey] || []; // if there isn't an array for this category yet, assign it an empty array
              if (
                this.attractions[catToKey].length < // if there are less than the maximum amount of attractions per category in the array
                City.attractionPerCatLimit
              ) {
                this.attractions[catToKey].push(feature.name); // add the attraction name to the array
              } else {
                catsToMatch = catsToMatch.filter(
                  // if the max limit has been reached, remove the category from the array so that it will not be matched further
                  (item) => item !== matchingCat
                );
              }
            }
          }
        }
      });
    }
  }

  extractForecastData(apiData) {
    this.forecast = apiData.forecast.forecastday.map((fDay) => ({
      date: fDay.date, // The date in format yyyy-mm-dd
      avgTemp: fDay.day.avgtemp_c, // The average temperature
    }));
  }
}
