export function extractMapData(map) {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const bounds = map.getBounds();

    const extractedData = `Map Center: [${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}]
Zoom Level: ${zoom.toFixed(2)}
Bounds: SW [${bounds.getSouthWest().lng.toFixed(4)}, ${bounds.getSouthWest().lat.toFixed(4)}], NE [${bounds.getNorthEast().lng.toFixed(4)}, ${bounds.getNorthEast().lat.toFixed(4)}]`;

    navigator.clipboard.writeText(extractedData)
        .then(() => {
            alert("Xarita ma'lumotlari clipboardga nusxalandi:\n" + extractedData);
        })
        .catch(err => {
            console.error("Clipboardga nusxalashda xato yuz berdi: ", err);
            alert("Xarita ma'lumotlarini nusxalashda xato yuz berdi. Konsolni tekshiring.");
        });
}
