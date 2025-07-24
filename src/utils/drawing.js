let currentLinePoints = [];
let isLineDrawingActive = false;
let lineSourceId = 'drawn-line-source';
let lineLayerId = 'drawn-line-layer';
let linePointSourceId = 'drawn-line-points-source';
let linePointLayerId = 'drawn-line-points-layer';

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
        // Finalize the line (no special action needed here, as it's already drawn)
        coords[0].textContent = `Line finished: ${currentLinePoints.length} points`;
    } else {
        // If only one point, clear it
        clearDrawnLine(map);
        coords[0].textContent = `[0,0]`;
    }
    deactivateLineDrawing(map);
}

export function activateLineDrawing(map, coords) {
    if (!isLineDrawingActive) {
        isLineDrawingActive = true;
        currentLinePoints = []; // Reset points for a new line
        clearDrawnLine(map); // Clear any previous line
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
        // Optionally remove the temporary line/points if not finalized
        // For now, we keep the last drawn line visible until a new one is started or cleared.
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

export function clearDrawnLine(map) {
    if (map.getSource(lineSourceId)) {
        map.getSource(lineSourceId).setData({
            type: 'FeatureCollection',
            features: []
        });
    }
    currentLinePoints = [];
}

export function isLineModeActive() {
    return isLineDrawingActive;
}
