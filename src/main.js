import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { btnActive, setupCloseButton } from "./utils/ui.js";
import { updateGeolocation } from "./utils/geolocation.js";
import { activateLineDrawing, deactivateLineDrawing, getDrawnLineGeoJSON, isLineModeActive, clearDrawnLine } from "./utils/drawing.js";

const myLocation = document.querySelector('[data-tool="location"]');
const markerBtn = document.querySelector('[data-tool="marker"]');
const lineBtn = document.querySelector('[data-tool="line"]');
const userInfoPanel = document.querySelector(".user-info");
const closeBtn=document.querySelector(".close-btn")
const downloadBtn = document.querySelector('[data-tool="download"]');

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
  let isMarkerModeActive = false; // Marker rejimini kuzatish uchun o'zgaruvchi

  markerBtn.onclick = () => {
    btnActive(markerBtn, controlsButtons);
    // Boshqa rejimni o'chirish
    if (isLineModeActive()) {
      deactivateLineDrawing(map);
    }

    if (!isMarkerModeActive) {
      isMarkerModeActive = true;
      map.on("click", handleMapClick);
    } else {
      isMarkerModeActive = false;
      map.off("click", handleMapClick);
    }
  };

  lineBtn.onclick = () => {
    btnActive(lineBtn, controlsButtons);
    // Boshqa rejimni o'chirish
    if (isMarkerModeActive) {
      isMarkerModeActive = false;
      map.off("click", handleMapClick);
      if (userMarker) {
        userMarker.remove();
        userMarker = null;
      }
      coords[0].textContent = `[0,0]`;
    }

    if (!isLineModeActive()) {
      activateLineDrawing(map, coords);
    } else {
      deactivateLineDrawing(map);
    }
  };

  function handleMapClick(e) {
    const lngLat = e.lngLat;
    if (userMarker) {
      userMarker.setLngLat(lngLat);
    } else {
      userMarker = new mapboxgl.Marker({ color: "red", anchor: 'center' })
        .setLngLat(lngLat)
        .addTo(map);
    }
    coords[0].textContent = `[${lngLat.lng.toFixed(4)},${lngLat.lat.toFixed(4)}]`;
  }

  downloadBtn.onclick = () => {
    const featuresToDownload = [];

    if (userMarker) {
      const lngLat = userMarker.getLngLat();
      featuresToDownload.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lngLat.lng, lngLat.lat],
        },
        properties: {},
      });
    }

    const drawnLine = getDrawnLineGeoJSON();
    if (drawnLine) {
      featuresToDownload.push(drawnLine);
    }

    if (featuresToDownload.length > 0) {
      const geojson = {
        type: "FeatureCollection",
        features: featuresToDownload,
      };
      const dataStr = JSON.stringify(geojson, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "map_data.geojson";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert("Yuklab olish uchun xaritada marker yoki chiziq belgilang!");
    }
  };

  setupCloseButton(closeBtn, userInfoPanel);
});
