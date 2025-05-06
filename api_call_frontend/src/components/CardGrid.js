import React from "react";
import { Card, CardContent, Typography, Grid2, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ForecastChart from "./ForecastChart";

export default function CardGrid({ cities, onDeleteCity }) {
  console.log(cities);
  
  const handleDelete = async (cityId) => {
    try {
      const response = await fetch(`https://api-call-with-backend.onrender.com/cities/${cityId}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (response.ok) {
        // Call the parent component's handler to update UI
        onDeleteCity(cityId);
      } else {
        console.error("Failed to delete city");
      }
    } catch (error) {
      console.error("Error deleting city:", error);
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
                  onClick={() => handleDelete(city.id)}
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
