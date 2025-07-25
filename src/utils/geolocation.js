export function updateGeolocation(
  map,
  coords,
  locationInfo,
  userInfoPanel,
  state,
) {
  if (!state.tracking) {
    state.tracking = true;
    state.id = navigator.geolocation.getCurrentPosition(
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

        locationInfo.longitude.textContent = longitude.toFixed(6);
        locationInfo.latitude.textContent = latitude.toFixed(6);
        const speedKmh =
          speed !== null && speed !== undefined
            ? (speed * 3.6).toFixed(1)
            : "0";
        locationInfo.speed.textContent = speedKmh;
        userInfoPanel.style.visibility = "visible";
        setTimeout(() => {
          userInfoPanel.style.visibility = "hidden";
        }, 10000);
        map.flyTo({ center: [longitude, latitude], zoom: 14 });
      },
      (error) => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
      },
    );
  } else {
    navigator.geolocation.clearWatch(state.id);
    state.tracking = false;
  }
}
