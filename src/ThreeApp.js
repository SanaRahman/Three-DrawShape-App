import * as THREE from 'three';
import { setUpScene } from './ThreeScene';
import React, { useRef, useEffect, useMemo } from 'react';


let intersectionPoint = null;
let planeNormal = null;
let plane = null;
let rayCaster = null;
let selectedObject = null;
let isDragging = null;
let mousePosition =null;

export default function ThreeApp ( {selectedShape,
    modificationValue,
    radius,
    height,
    width,
    depth,
    selectedColor,
    movementOption,
    updateSlider,
    menuVisible,
    }){
    const refContainer = useRef(null);
    const { scene, camera, renderer, controls,planex} =
        useMemo(() => setUpScene(refContainer.current), []);
    let clickPosition = new THREE.Vector2();
    mousePosition =new THREE.Vector2();
    intersectionPoint =new THREE.Vector3();
    planeNormal =new THREE.Vector3();
    plane =new THREE.Plane();
    rayCaster = new THREE.Raycaster();

    useEffect(() => {

       setUpScene()
        refContainer.current && refContainer.current.appendChild(renderer.domElement);
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate(); 
    }, []);

    const handleMouseDown = (event) => {
        clickPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        clickPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

        if(modificationValue){
           setSelectedObject();
           updateSlider(selectedObject);
        }
        else if(movementOption === 'drag'){
            setSelectedObject();
            isDragging=true;
        }
        else if(selectedShape === 'sphere' || selectedShape === 'cube'){
            drawShape();
        }
    }
    const handleMouseUp = (event) => {
        isDragging = false;
        if(selectedObject && movementOption === 'drag'){
            // console.log(`Dropping ${draggable.userData.name}`)
            selectedObject= null;
        }
    }
    const handleMouseMove = (event) => {
        if (isDragging && selectedObject != null ) {
            mousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mousePosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            console.log("mouse moving");
            dragObject();
        }
    }

    useEffect(() => {

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);


        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);

        };


    }, [selectedShape, selectedColor,
       radius,width,height,depth,
       modificationValue,movementOption]);

    function dragObject(){
        rayCaster.setFromCamera(mousePosition, camera);
        const found = rayCaster.intersectObjects(scene.children);
        if(found.length >0 ){
            for(let o of found){
                selectedObject.position.x =o.point.x;
                selectedObject.position.y = o.point.y;
            }
        }
    }
    function drawShape(){
      planeNormal.copy(camera.position).normalize();
      plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
      rayCaster.setFromCamera(clickPosition, camera);
      rayCaster.ray.intersectPlane(plane, intersectionPoint);
        if(selectedShape === 'sphere'){
          addSphere(intersectionPoint);
        }
    }
    function addSphere (positions){
      console.log(selectedColor);
      const geometry = new THREE.SphereGeometry( radius, 32, 16 );
      const circleMaterial = new THREE.MeshBasicMaterial({
          color:selectedColor,
      });
      addShape(geometry, circleMaterial,positions);
    }
    function addShape(geometry, material,positions) {
      const shape = new THREE.Mesh(geometry, material);
      shape.position.copy(positions);
      shape.userData.name="shape";
      scene.add(shape);
    }

    function setSelectedObject(){
      rayCaster.setFromCamera( clickPosition, camera );
        const intersects = rayCaster.intersectObjects( scene.children );
        if(intersects.length > 0){
            const shapeObject = intersects.find(obj => obj.object.userData.name === "shape");
            if (shapeObject) {
                // const newColor = new THREE.Color(); // Set this to the desired hue
                // shapeObject.object.material.color = newColor;
                selectedObject = shapeObject.object;
            }
        }
    }

    useEffect(() => {
      if(modificationValue){
      modifyShape(radius, height, width, depth);}
    }, [radius, height, width, depth, selectedColor]);

    useEffect(() => {
        console.log("called")
        if(movementOption ==='rotate'){
            controls.enableRotate = true;
            controls.enableZoom =true;
        }
        else if(movementOption === undefined || movementOption === 'drag'){
            controls.enableRotate = false;
            controls.enableZoom =false;
        }
    }, [movementOption]);
    function modifyShape(radius, height, width, depth){
      if( selectedObject.geometry.type === 'SphereGeometry'){
        selectedObject.geometry = new THREE.SphereGeometry(radius);
        selectedObject.material.color.set(selectedColor);
      }
    }

  return (
    <div  ref={refContainer}>
    </div>
  );
}