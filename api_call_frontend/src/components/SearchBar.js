import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import { textFieldStyles } from "../resources/textFieldStyles";

const CategoryEnum = Object.freeze({
  Historical: "historic",
  Cultural: "cultural",
  Architecture: "architecture",
  Natural: "natural",
  Religion: "religion",
  Sport: "sport",
});

export default function SearchBar({ handleSearch }) {
  const [city, setCity] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([
    CategoryEnum.Cultural,
  ]);

  const handleCheckboxChange = (category) => {
    setSelectedCategories(
      (prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category) // Remove if already selected
          : [...prev, category] // Add if not selected
    );
  };

  const isSearchDisabled = selectedCategories.length === 0;

  return (
    <Box
      display="flex"
      flexDirection="column" // Stack the search bar and checkboxes vertically
      sx={{ width: "100%", mt: 2 }}
    >
      {/* Search bar and button */}
      <Box
        display="flex"
        flexDirection="row" // Align search bar and button horizontally
        alignItems="center"
        //justifyContent="center" // Align items to the left
        sx={{ width: "70%", mx: "auto" }}
      >
        {/* Search input */}
        <TextField
          id="city-input" // Unique ID for accessibility
          label="Enter City"
          variant="outlined"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          inputProps={{
            "aria-label": "Enter city", // Accessible label for screen readers
          }}
          sx={textFieldStyles}
        />

        {/* Search button */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSearch(city, selectedCategories)}
          disabled={isSearchDisabled}
          sx={{
            flex: "0 1 auto",
            color: "#ffffff", // White text for better contrast
            backgroundColor: "#092e4b", // Darker  for sufficient contrast
            "&:hover": {
              backgroundColor: "#0f4163", // Slightly ligher  on hover
            },
            "&:focus": {
              outline: "2px solid #ffffff", // High contrast focus outline
              outlineOffset: "2px",
            },
            "&:disabled": {
              backgroundColor: "#cccccc", // Light gray for disabled state
              color: "#666666", // Ensure text remains legible
            },
          }}
        >
          Search
        </Button>
      </Box>

      {/* Text and checkboxes */}
      {/* Text and checkboxes */}
      <Box
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        alignItems="center"
        sx={{
          gap: 2,
          mt: 2,
          mb: 2,
        }}
      >
        {/* Instructional Text */}
        <Typography
          sx={{
            flex: "0 0 auto", // Do not stretch the text initially
            marginRight: 2, // Add spacing between text and checkboxes
            lineHeight: "1.5rem", // Match checkbox vertical alignment
            whiteSpace: "nowrap", // Prevent wrapping initially
            textAlign: "left", // Align text to the left initially
            "@media (max-width: 600px)": {
              flex: "1 1 100%", // Take full width on small screens
              textAlign: "center", // Center text on small screens
              marginRight: 0, // Remove right margin on small screens
              marginBottom: 1, // Add spacing below text when above checkboxes
            },
          }}
        >
          Select one or more attraction types:
        </Typography>

        {/* Checkboxes */}
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          sx={{
            gap: 1,
            alignItems: "center",
          }}
        >
          {Object.keys(CategoryEnum).map((key) => (
            <FormControlLabel
              key={key}
              control={
                <Checkbox
                  size="medium"
                  checked={selectedCategories.includes(CategoryEnum[key])}
                  onChange={() => handleCheckboxChange(CategoryEnum[key])}
                  sx={{
                    transform: "scale(0.9)", // Make the checkbox slightly smaller
                    "&.Mui-checked": {
                      color: "white", // Change the fill color when checked
                    },
                  }}
                />
              }
              label={key} // Label as the key (e.g., "Historical")
              sx={{
                fontSize: "0.65rem",
                marginRight: 1,
                alignItems: "center",
                display: "inline-flex", // Ensure proper alignment
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
