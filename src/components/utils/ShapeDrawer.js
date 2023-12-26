import * as THREE from "three";

const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const rayCaster = new THREE.Raycaster();
let intersectionPoint =new THREE.Vector3();
export function ShapeDrawer(selectedShape, camera, clickPosition, scene, selectedColor, radius, width, height, depth) {
    getDrawPosition(camera, clickPosition,scene);
    let geometry;
    const material = new THREE.MeshBasicMaterial({
        color: selectedColor,
    });
    if (selectedShape === 'sphere') {
        geometry = addSphere(selectedColor, radius);
    } else if (selectedShape === 'cube') {
        geometry = addCube(selectedColor, width, height, depth);
    }
    addShape(geometry,material, intersectionPoint, scene);
}
function getDrawPosition(camera, clickPosition,scene){
    planeNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
    rayCaster.setFromCamera(clickPosition, camera);
    rayCaster.ray.intersectPlane(plane, intersectionPoint);
}

const addSphere = (selectedColor, radius) => new THREE.SphereGeometry(radius, 32, 16);
const addCube = (selectedColor, width, height, depth) => new THREE.BoxGeometry(width, height, depth);
function addShape(geometry,material, positions, scene) {
    const shape = new THREE.Mesh(geometry, material);
    shape.position.copy(positions);
    shape.userData.name = "shape";
    shape.renderOrder = 0;
    scene.add(shape);
}


