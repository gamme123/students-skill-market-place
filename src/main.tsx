import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const redirect = window.location.search.match(/[?&]p=([^&]*)/);

if (redirect) {
  const route = decodeURIComponent(redirect[1]).replace(/~and~/g, "&");
  const query = window.location.search
    .replace(/^\?/, "")
    .split("&")
    .filter((part) => part && !part.startsWith("p="))
    .join("&");
  const hash = window.location.hash || "";
  const url = route + (query ? `?${query}` : "") + hash;

  window.history.replaceState(null, "", url);
}

createRoot(document.getElementById("root")!).render(<App />);
