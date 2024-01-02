// Projection.js
import proj4 from 'proj4';

const projection = "+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs +type=crs";
const lat = "33.484177969551";
const lng = "73.0911479190149";
let coordinatesStr = "322650 3706594";

coordinatesStr = coordinatesStr.split(" ");
const originX = parseInt(coordinatesStr[0]);
const originY = parseInt(coordinatesStr[1]);

function makeProjection() {
    return proj4(projection);
}

function projectLatLngToPoint() {
    const proj = makeProjection();
    const cord = proj.forward([parseFloat(lng), parseFloat(lat)]);
    let x = cord[0];
    let y = cord[1];
    x = x - originX;
    y = y - originY;
    console.log(x, y);
    return { x: x, y: y };
}

export { makeProjection, projectLatLngToPoint };
