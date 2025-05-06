const { ReverseAttractionCategory } = require("./AttractionCategory");
const { allAttractionCategories } = require("./AttractionCategory");
const mongoose = require("mongoose");

// Traditional JavaScript Class for Dynamic Processing
class CityEntity {
  static attractionPerCatLimit = 5;
  static resultsPerAttractionCat = 500;
  static attracionSearchRadius = 5000;

  constructor(
    searchTerm,
    name,
    countryName,
    population,
    latitude,
    longitude,
    currentTemp = 0,
    attractions = [],
    displayAttractions = {},
    forecast = {}
  ) {
    this.searchTerm = searchTerm;
    this.name = name;
    this.countryName = countryName;
    this.population = population;
    this.latitude = latitude;
    this.longitude = longitude;
    this.currentTemp = currentTemp;
    this.attractions = attractions;
    this.displayAttractions = displayAttractions;
    this.forecast = forecast;
    this.id = name + latitude; // Unique ID for frontend
  }

  // Filter attractions for display based on selected categories
  populateAttractionsForDisplay(selectedCategories) {
    // Initialize displayAttractions if it doesn't exist
    this.displayAttractions = this.displayAttractions || {};
    
    // Ensure attractions is always an array
    if (!Array.isArray(this.attractions)) {
      console.warn(`Attractions is not an array for ${this.name}:`, typeof this.attractions);
      
      // Try to extract features if it's in GeoJSON format
      if (this.attractions && Array.isArray(this.attractions.features)) {
        this.attractions = this.attractions.features;
      } else {
        this.attractions = [];
      }
    }
    
    if (this.attractions.length > 0 && Array.isArray(selectedCategories) && selectedCategories.length > 0) {
      console.log(`Processing ${this.attractions.length} attractions for ${this.name}`);
      let catsToMatch = [...selectedCategories];

      this.attractions.forEach((feature) => {
        if (feature && feature.name) {
          if (catsToMatch.length > 0) {
            // Make sure kinds exists and is a string
            const kinds = typeof feature.kinds === 'string' ? feature.kinds : '';
            
            const matchingCat = catsToMatch.find((cat) =>
              kinds.split(",").includes(cat)
            );

            if (matchingCat) {
              let catToKey = ReverseAttractionCategory[matchingCat];
              this.displayAttractions[catToKey] =
                this.displayAttractions[catToKey] || [];

              if (this.displayAttractions[catToKey].length < CityEntity.attractionPerCatLimit) {
                this.displayAttractions[catToKey].push(feature.name);
              } else {
                catsToMatch = catsToMatch.filter((item) => item !== matchingCat);
              }
            }
          }
        }
      });
    }
  }

  //  Extract weather forecast from API response
  extractForecastData(apiData) {
    this.forecast = apiData.forecast.forecastday.map((fDay) => ({
      date: fDay.date,
      avgTemp: fDay.day.avgtemp_c,
    }));
  }
}

//  Mongoose Schema for Persistent Storage
const CitySchema = new mongoose.Schema(
  {
    searchTerm: { type: String, required: true },
    name: { type: String, required: true },
    countryName: { type: String, required: true },
    population: { type: Number, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    attractions: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

// Convert Mongoose City to `CityEntity`
CitySchema.methods.toCityEntity = function () {
  // Ensure attractions is an array
  let attractions = this.attractions;
  if (!Array.isArray(attractions)) {
    console.warn(`Attractions is not an array in MongoDB for ${this.name}`);
    attractions = Array.isArray(attractions?.features) ? attractions.features : [];
  }
  
  return new CityEntity(
    this.searchTerm,
    this.name,
    this.countryName,
    this.population,
    this.latitude,
    this.longitude,
    0, // Default currentTemp
    attractions, // Use the sanitized attractions
    {}, // Empty displayAttractions, to be populated dynamically
    {} // Empty forecast, to be populated dynamically
  );
};

CitySchema.methods.getDisplayAttractions = function (selectedCategories) {
  const cityEntity = this.toCityEntity();
  cityEntity.populateAttractionsForDisplay(selectedCategories);
  return cityEntity.displayAttractions;
};

// Ensure virtuals are included in JSON responses
CitySchema.set("toJSON", { virtuals: true });
CitySchema.set("toObject", { virtuals: true });

const City = mongoose.model("City", CitySchema);

module.exports = { City, CityEntity };
