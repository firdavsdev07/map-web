import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
const myLocation = document.querySelector('[data-tool="location"]');
const markerBtn = document.querySelector('[data-tool="marker"]');
const controlsButtons = document.querySelectorAll(
  `.controls-container [data-tool]`,
);
const coords = document.getElementsByClassName("coords");
mapboxgl.accessToken =
  "pk.eyJ1IjoibmFqaW1vdiIsImEiOiJjbWRmazhzdG0wZHVzMmlzOGdrNHFreWV6In0.ENVcoFkxKIqNeCEax2JoFg";

// ---------------------------------
function btnActive(activeBtn) {
  controlsButtons.forEach((btn) => {
    btn.classList.remove("active");
  });
  activeBtn.classList.add("active");
}

// ---------------------------------

const map = new mapboxgl.Map({
  container: "map",
  logoPosition: "bottom-right",
  attributionControl: false,
  center: [69.2753, 41.3126], // Centered on the circle
  style: "mapbox://styles/mapbox/dark-v11",
  projection: "mercator",
  zoom: 10, // Zoom in closer
});
const state = {
  longitude: null,
  latitude: null,
  id: null,
  tracking: false,
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
    btnActive(myLocation);
    if (!state.tracking) {
      state.tracking = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude, speed } = position.coords;
          state.longitude = longitude;
          state.latitude = latitude;

          coords[0].textContent = `[${longitude.toFixed(4)},${latitude.toFixed(4)}]`;

          const geoJSONPoint = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          };
          map.getSource("me").setData(geoJSONPoint);
          map.flyTo({ center: [longitude, latitude], zoom: 14 });
          console.log(longitude, latitude);
        },
        (error) => {
          console.error(error);
        },
      );
    }
  };
});
