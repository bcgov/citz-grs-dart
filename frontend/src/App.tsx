import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { bcGovTheme } from "./assets/themes/bcGovTheme";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { routes as appRoutes } from "./routes";
import Layout from "./components/layout/MainLayout"

function App() {
  return (
<ThemeProvider theme={bcGovTheme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            {appRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.path}
                element={
                  route.requiresAuth ? (
                    localStorage.getItem("token") ? (
                      <route.component />
                    ) : (
                      <route.component />
                    )
                  ) : (
              
                    <route.component />
                  )
                }
              />
            ))}
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
