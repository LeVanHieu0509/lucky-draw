// polyfills
import "web-animations-js/web-animations.min";
import "element-remove-polyfill";

// styles
// import "./assets/scss/index.scss";
import "./output.css";
// main

// PWA
window.addEventListener("load", () => {
  navigator.serviceWorker
    .register("./service-worker.js")
    .then((registration) => {
      console.info("SW registered: ", registration);
    })
    .catch((registrationError) => {
      console.info("SW registration failed: ", registrationError);
    });
});
