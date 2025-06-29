import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ElementWeb } from "./screens/ElementWeb";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <ElementWeb />
  </StrictMode>,
);
