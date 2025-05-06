import React from "react";
import { Card, CardContent, Typography, Grid2, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ForecastChart from "./ForecastChart";

export default function CardGrid({ cities, onDeleteCity, setCities, setSnackbar }) {
  console.log(cities);
  
  const handleDelete = async (cityId) => {
    try {
      console.log(`Attempting to delete city with ID: ${cityId}`);
      
      // Try to delete by ID first
      let response = await fetch(`https://api-call-with-backend.onrender.com/cities/${encodeURIComponent(cityId)}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      // If that fails, try to delete by name
      if (!response.ok && response.status === 404) {
        console.log(`City not found with ID, trying to delete by name`);
        
        // Extract just the city name without district if possible
        const cityName = cityId.split(' District')[0].split(',')[0];
        
        response = await fetch(`https://api-call-with-backend.onrender.com/cities/${encodeURIComponent(cityName)}`, {
          method: "DELETE",
          credentials: "include"
        });
      }
      
      if (response.ok) {
        console.log(`Successfully deleted city: ${cityId}`);
        
        // Update the local state to remove the deleted city
        if (typeof onDeleteCity === 'function') {
          // If parent component provided a handler, use it
          console.log("Using parent onDeleteCity function");
          onDeleteCity(cityId);
        } else if (setCities) {
          // Otherwise update local state directly
          console.log("Using local setCities function");
          setCities(prevCities => {
            console.log("Filtering cities:", prevCities.length);
            // Create a new array without the deleted city
            return prevCities.filter(city => {
              const shouldKeep = 
                city.id !== cityId && 
                city.name !== cityId && 
                !city.name.includes(cityId);
              
              if (!shouldKeep) {
                console.log(`Removing city: ${city.name}`);
              }
              
              return shouldKeep;
            });
          });
        } else {
          console.warn("No method available to update city list after deletion");
        }
        
        // Show success message if we have a snackbar function
        setSnackbar && setSnackbar({
          open: true,
          message: `City deleted successfully`,
          severity: "success"
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to delete city:", errorData.message || response.statusText);
        
        // Show error message if we have a snackbar function
        setSnackbar && setSnackbar({
          open: true,
          message: `Failed to delete city: ${errorData.message || response.statusText}`,
          severity: "error"
        });
      }
    } catch (error) {
      console.error("Error deleting city:", error);
      
      // Show error message if we have a snackbar function
      setSnackbar && setSnackbar({
        open: true,
        message: `Error deleting city: ${error.message}`,
        severity: "error"
      });
    }
  };
  
  return (
    <Grid2
      container
      spacing={2}
      justifyContent="center"
      alignItems="flex-start"
    >
      {cities.map((city) => (
        <Grid2
          key={city.id || city.name}
          xs={12}
          sm={6}
          md={4}
          lg={3}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Card
            style={{
              minWidth: 320,
              maxWidth: 320,
              marginBottom: "10px",
              opacity: 0.97,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" component="div">
                  {city.name}
                </Typography>
                <IconButton 
                  onClick={() => handleDelete(city.id || city.name)}
                  size="small"
                  color="error"
                  aria-label="delete city"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Country:</strong> {city.countryName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Population:</strong> {city.population}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Latitude:</strong> {city.latitude}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Longitude:</strong> {city.longitude}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Current Temperature:</strong>{" "}
                {city.currentTemp === "No data available"
                  ? city.currentTemp
                  : `${city.currentTemp}°C`}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
              >
                <strong>Attractions:</strong>
                {city.displayAttractions &&
                Object.keys(city.displayAttractions).length > 0 ? (
                  Object.entries(city.displayAttractions).map(([category, values]) => (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      key={category}
                    >
                      <strong>{category}:</strong> {values.join(", ")}
                    </Typography>
                  ))
                ) : (
                  <em>None available</em>
                )}
              </Typography>
              {city.forecast?.length > 0 && (
                <ForecastChart forecast={city.forecast} />
              )}
            </CardContent>
          </Card>
        </Grid2>
      ))}
    </Grid2>
  );
}
