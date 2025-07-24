import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { btnActive, setupCloseButton } from "./utils/ui.js";
import { updateGeolocation } from "./utils/geolocation.js";

const myLocation = document.querySelector('[data-tool="location"]');
const markerBtn = document.querySelector('[data-tool="marker"]');
const userInfoPanel = document.querySelector(".user-info");
const closeBtn=document.getElementsByClassName("close-btn")

const controlsButtons = document.querySelectorAll(
  `.controls-container [data-tool]`,
);
const coords = document.getElementsByClassName("coords");
mapboxgl.accessToken =
  "pk.eyJ1IjoibmFqaW1vdiIsImEiOiJjbWRmazhzdG0wZHVzMmlzOGdrNHFreWV6In0.ENVcoFkxKIqNeCEax2JoFg";

// ---------------------------------

const map = new mapboxgl.Map({
  container: "map",
  logoPosition: "bottom-right",
  attributionControl: false,
  center: [69.2753, 41.3126], // Centered on the circle
  style: "mapbox://styles/mapbox/dark-v11",
  hash: true,
  // minZoom: 5,
  // maxZoom: 18,
  projection: "mercator",
  zoom: 10, // Zoom in closer
});
const state = {
  longitude: null,
  latitude: null,
  id: null,
  tracking: false,
};
const locationInfo = {
  longitude: document.getElementById("user-lon"),
  latitude: document.getElementById("user-lat"),
  speed: document.getElementById("user-speed"),
  // container: document.getElementById("location-info"),
};
map.on("load", async () => {
  console.log("Xarita yuklandi");
  // const response = await (await fetch("/data.geojson")).json();
  map.addSource("me", {
    type: "geojson",
    data: null,
  });
  map.addLayer({
    id: "me",
    source: "me",
    type: "circle",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        5,
        12,
        10,
        18,
        14,
        24,
      ],
      "circle-radius": 10, // boshlang'ich
      "circle-color": "#3B82F6",
      "circle-opacity": 0.7,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 2,
    },
  });
  myLocation.onclick = () => {
    btnActive(myLocation, controlsButtons);
    updateGeolocation(map, coords, locationInfo, userInfoPanel, state);
  };
  let userMarker = null;

  window.onclick = () => {
    map.once("click", (e) => {
      const lngLat = e.lngLat;
      // console.log(e);
      if (userMarker) {
        userMarker.setLngLat(lngLat);
      } else {
        userMarker = new mapboxgl.Marker({ color: "red" })
          .setLngLat(lngLat)
          .addTo(map);
      }
    });
    btnActive(markerBtn, controlsButtons);

  };
});
