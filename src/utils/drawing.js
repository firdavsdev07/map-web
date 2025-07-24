let currentLinePoints = [];
let isLineDrawingActive = false;
let lineSourceId = 'drawn-line-source';
let lineLayerId = 'drawn-line-layer';
let linePointSourceId = 'drawn-line-points-source';
let linePointLayerId = 'drawn-line-points-layer';

let currentPolygonPoints = [];
let isPolygonDrawingActive = false;
let polygonSourceId = 'drawn-polygon-source';
let polygonLayerId = 'drawn-polygon-layer';
let polygonPointSourceId = 'drawn-polygon-points-source';
let polygonPointLayerId = 'drawn-polygon-points-layer';

function updateLineOnMap(map, sourceId, data) {
    if (map.getSource(sourceId)) {
        map.getSource(sourceId).setData(data);
    } else {
        map.addSource(sourceId, {
            type: 'geojson',
            data: data
        });
        map.addLayer({
            id: lineLayerId,
            source: sourceId,
            type: 'line',
            paint: {
                'line-color': '#FFD700', // Gold color for the line
                'line-width': 4
            }
        });
        map.addLayer({
            id: linePointLayerId,
            source: sourceId,
            type: 'circle',
            paint: {
                'circle-radius': 6,
                'circle-color': '#FFD700',
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 2
            }
        });
    }
}

function updatePolygonOnMap(map, sourceId, data) {
    if (map.getSource(sourceId)) {
        map.getSource(sourceId).setData(data);
    } else {
        map.addSource(sourceId, {
            type: 'geojson',
            data: data
        });
        map.addLayer({
            id: polygonLayerId,
            source: sourceId,
            type: 'fill',
            paint: {
                'fill-color': '#00BFFF', // Deep Sky Blue for polygon fill
                'fill-opacity': 0.5
            }
        });
        map.addLayer({
            id: polygonLayerId + '-stroke',
            source: sourceId,
            type: 'line',
            paint: {
                'line-color': '#00BFFF',
                'line-width': 2
            }
        });
        map.addLayer({
            id: polygonPointLayerId,
            source: sourceId,
            type: 'circle',
            paint: {
                'circle-radius': 6,
                'circle-color': '#00BFFF',
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 2
            }
        });
    }
}

function handleLineClick(e, map, coords) {
    const lngLat = e.lngLat;
    currentLinePoints.push([lngLat.lng, lngLat.lat]);

    const geojson = {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: currentLinePoints
            },
            properties: {}
        }, {
            type: 'Feature',
            geometry: {
                type: 'MultiPoint',
                coordinates: currentLinePoints
            },
            properties: {}
        }]
    };

    updateLineOnMap(map, lineSourceId, geojson);
    coords[0].textContent = `Line: ${currentLinePoints.length} points`;
}

function handleLineDoubleClick(e, map, coords) {
    e.preventDefault(); // Prevent map zoom on double click
    if (currentLinePoints.length > 1) {
        coords[0].textContent = `Line finished: ${currentLinePoints.length} points`;
    } else {
        clearDrawnLine(map);
        coords[0].textContent = `[0,0]`;
    }
    deactivateLineDrawing(map);
}

function handlePolygonClick(e, map, coords) {
    const lngLat = e.lngLat;
    currentPolygonPoints.push([lngLat.lng, lngLat.lat]);

    const geojson = {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [currentPolygonPoints]
            },
            properties: {}
        }, {
            type: 'Feature',
            geometry: {
                type: 'MultiPoint',
                coordinates: currentPolygonPoints
            },
            properties: {}
        }]
    };

    updatePolygonOnMap(map, polygonSourceId, geojson);
    coords[0].textContent = `Polygon: ${currentPolygonPoints.length} points`;
}

function handlePolygonDoubleClick(e, map, coords) {
    e.preventDefault(); // Prevent map zoom on double click
    if (currentPolygonPoints.length > 2) { // Polygon needs at least 3 points to be valid
        // Close the polygon by adding the first point again
        currentPolygonPoints.push(currentPolygonPoints[0]);
        const geojson = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [currentPolygonPoints]
                },
                properties: {}
            }]
        };
        updatePolygonOnMap(map, polygonSourceId, geojson);
        coords[0].textContent = `Polygon finished: ${currentPolygonPoints.length - 1} points`;
    } else {
        clearDrawnPolygon(map);
        coords[0].textContent = `[0,0]`;
    }
    deactivatePolygonDrawing(map);
}

export function activateLineDrawing(map, coords) {
    if (!isLineDrawingActive) {
        isLineDrawingActive = true;
        currentLinePoints = [];
        clearDrawnLine(map);
        map.on('click', (e) => handleLineClick(e, map, coords));
        map.on('dblclick', (e) => handleLineDoubleClick(e, map, coords));
        coords[0].textContent = `Line drawing active`;
    }
}

export function deactivateLineDrawing(map) {
    if (isLineDrawingActive) {
        isLineDrawingActive = false;
        map.off('click', handleLineClick);
        map.off('dblclick', handleLineDoubleClick);
    }
}

export function activatePolygonDrawing(map, coords) {
    if (!isPolygonDrawingActive) {
        isPolygonDrawingActive = true;
        currentPolygonPoints = [];
        clearDrawnPolygon(map);
        map.on('click', (e) => handlePolygonClick(e, map, coords));
        map.on('dblclick', (e) => handlePolygonDoubleClick(e, map, coords));
        coords[0].textContent = `Polygon drawing active`;
    }
}

export function deactivatePolygonDrawing(map) {
    if (isPolygonDrawingActive) {
        isPolygonDrawingActive = false;
        map.off('click', handlePolygonClick);
        map.off('dblclick', handlePolygonDoubleClick);
    }
}

export function getDrawnLineGeoJSON() {
    if (currentLinePoints.length > 1) {
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: currentLinePoints
            },
            properties: {}
        };
    }
    return null;
}

export function getDrawnPolygonGeoJSON() {
    if (currentPolygonPoints.length > 2) { // Polygon needs at least 3 points to be valid
        // Ensure the polygon is closed for GeoJSON validity
        const finalPoints = [...currentPolygonPoints];
        if (finalPoints[0][0] !== finalPoints[finalPoints.length - 1][0] ||
            finalPoints[0][1] !== finalPoints[finalPoints.length - 1][1]) {
            finalPoints.push(finalPoints[0]);
        }
        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [finalPoints]
            },
            properties: {}
        };
    }
    return null;
}

export function clearDrawnLine(map) {
    if (map.getSource(lineSourceId)) {
        map.getSource(lineSourceId).setData({
            type: 'FeatureCollection',
            features: []
        });
    }
    currentLinePoints = [];
}

export function clearDrawnPolygon(map) {
    if (map.getSource(polygonSourceId)) {
        map.getSource(polygonSourceId).setData({
            type: 'FeatureCollection',
            features: []
        });
    }
    currentPolygonPoints = [];
}

export function isLineModeActive() {
    return isLineDrawingActive;
}

export function isPolygonModeActive() {
    return isPolygonDrawingActive;
}