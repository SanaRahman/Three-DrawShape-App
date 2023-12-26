import * as THREE from 'three';
import { setUpScene } from './ThreeScene';
import React, { useRef, useEffect, useMemo } from 'react';

let intersectionPoint = null;
let planeNormal = null;
let plane = null;
let rayCaster = null;
let selectedObject = null;
export default function ThreeApp ( {selectedShape,
    modificationValue,
    radius,
    height,
    width,
    depth,
    selectedColor}
    ){
    const refContainer = useRef(null);
    const { scene, camera, renderer, controls} = useMemo(() => setUpScene(refContainer.current), []);
  
    let clickPosition = new THREE.Vector2();

    useEffect(() => {

       setUpScene()
        refContainer.current && refContainer.current.appendChild(renderer.domElement);
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate(); 
    }, []);

    const handleMouseDown = (event) => {
        clickPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        clickPosition.y = -(event.clientY / window.innerHeight) * 2 + 1
        if(modificationValue){
           setSelectedObject();
        }
        else if(selectedShape === 'sphere' || selectedShape === 'cube'){
            drawShape();
        }
    }

    const handleMouseUp = (event) => {

    }
    const handleMouseMove = (event) => {

    }
    useEffect(() => {

       intersectionPoint =new THREE.Vector3();
        planeNormal =new THREE.Vector3();
        plane =new THREE.Plane();
        rayCaster = new THREE.Raycaster();

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
       modificationValue]);
    
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
            selectedObject = intersects[0].object;
        }
    }

    useEffect(() => {
      if(modificationValue){
      modifyShape(radius, height, width, depth);}
    }, [radius, height, width, depth, selectedColor]);

    function modifyShape(radius, height, width, depth){
      if( selectedObject.geometry.type === 'SphereGeometry'){
        selectedObject.geometry = new THREE.SphereGeometry(radius);
        console.log(selectedColor);
        selectedObject.material.color.set(selectedColor);
      }
    }

  return (
    <div id="container" ref={refContainer}>
      {/* ... (rest of your existing JSX) */}
    </div>
  );
}