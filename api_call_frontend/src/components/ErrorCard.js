import React from "react";
import { Card, CardContent, Typography, Grid2 } from "@mui/material";

export default function ErrorCard() {
  return (
    <Grid2 container justifyContent="center">
      <Grid2>
        <Card
          style={{
            minWidth: 320,
            maxWidth: 320,
            minHeight: 400,
            opacity: 0.98,
            marginBottom: "10px",
            margintop: "20px",
          }}
        >
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              There was an error while performing the search
            </Typography>
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  );
}
