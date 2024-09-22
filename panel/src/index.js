import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const { chrome } = window;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Setup default panel
// https://groups.google.com/g/google-chrome-developer-tools/c/yQTC9ptPo8o?pli=1
// https://stackoverflow.com/questions/78765596/why-cant-the-icon-for-the-chrome-extension-i-developed-be-displayed
chrome.devtools?.panels.create(
  "App State Dumper",
  "",
  "panel/index.html",
  function (panel) {
    // code invoked on panel creation
    console.log(panel);
  }
);
