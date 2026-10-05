import React from "react";
import { createRoot } from "react-dom/client";
import Router from "./Router.jsx";
import { MotionProvider } from "./motion/MotionContext.jsx";
import "./style.css";
import "./polish.css";

createRoot(document.getElementById("root")).render(
  <MotionProvider>
    <Router />
  </MotionProvider>,
);
