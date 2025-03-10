import React from "react";
import { Card, CardContent, Typography, Grid2 } from "@mui/material";
import ForecastChart from "./ForecastChart";

export default function CardGrid({ cities }) {
  return (
    <Grid2
      container
      spacing={2} // Adds consistent spacing between grid cells
      justifyContent="center" // Centers grid cells horizontally
      alignItems="flex-start" // Aligns grid cells vertically at the top
    >
      {cities.map((city) => (
        <Grid2
          key={city.id || city.name}
          xs={12}
          sm={6}
          md={4}
          lg={3} // Responsive breakpoints
          style={{ display: "flex", justifyContent: "center" }} // Centers the card within the grid cell
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
              <Typography variant="h5" component="div">
                {city.name}
              </Typography>
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
                {city.attractions &&
                Object.keys(city.attractions).length > 0 ? (
                  Object.entries(city.attractions).map(([category, values]) => (
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
