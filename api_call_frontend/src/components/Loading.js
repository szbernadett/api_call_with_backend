import { Box, Typography, CircularProgress } from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{
        display: "flex", // Flex layout
        flexDirection: "column", // Stack children vertically
        justifyContent: "center", // Center content vertically in available space
        alignItems: "center", // Center content horizontally
        flexGrow: 1, // Take up remaining space between header and footer
      }}
    >
      <Box
        style={{
          background: "#fff",
          opacity: 0.95,
          display: "flex",
          justifyContent: "center",
          padding: "40px",
          mt: 4,
        }}
      >
        <Typography variant="h4" sx={{ color: "#376589", marginRight: "30px" }}>
          Loading
        </Typography>
        <CircularProgress
          sx={{
            color: "#376589",
          }}
        />
      </Box>
    </Box>
  );
}
