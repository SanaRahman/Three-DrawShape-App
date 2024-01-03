import * as THREE from "three";

export function setSelectedObject(rayCaster, clickPosition, scene,camera){
    rayCaster.setFromCamera( clickPosition, camera );
    const intersects = rayCaster.intersectObjects( scene.children );
    if(intersects.length > 0){
        const shapeObject = intersects.find(obj => obj.object.userData.name === "shape");
        if (shapeObject) {
            const selectedObject = shapeObject.object;
            selectedObject.material.transparent = true;
            selectedObject.material.opacity = 0.5;
            selectedObject.material.needsUpdate = true;
            return selectedObject;
        }
    }
    return null;
}
export function modifyShape(selectedObject,radius, height, width, depth){
    if(selectedObject){
        if( selectedObject.geometry.type === 'SphereGeometry'){
            selectedObject.geometry = new THREE.SphereGeometry(radius);
        }
         if( selectedObject.geometry.type === 'BoxGeometry'){
            selectedObject.geometry = new THREE.BoxGeometry(width,height,depth);
        }
    }
}

export function modifyColor(selectedObject, selectedColor){
    if(selectedObject) {
        selectedObject.material.color.set(selectedColor);
    }
}