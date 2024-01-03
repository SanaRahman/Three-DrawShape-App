import * as THREE from 'three';
import { setUpScene } from './ThreeScene';
import React, { useRef, useEffect, useMemo } from 'react';

import {setSelectedObject, modifyShape, modifyColor} from './utils/ShapeModifier';
import {ShapeDrawer} from "./utils/ShapeDrawer";

let rayCaster = null;
let selectedObject=  null;
let isDragging = null;
let mousePosition =null;
let clickPosition =null;

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
    const { scene, camera, renderer, controls} =
    useMemo(() => setUpScene(refContainer.current), []);

    clickPosition = new THREE.Vector2();
    mousePosition =new THREE.Vector2();
    rayCaster = new THREE.Raycaster();

    useEffect(() => {

       setUpScene()
        refContainer.current && refContainer.current.appendChild(renderer.domElement);
        const animate = () => {
            // hover();
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate(); 
    }, []);

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
    const handleMouseDown = (event) => {
        clickPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        clickPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        if(selectedObject){
            selectedObject.material.opacity = 1;
            selectedObject.material.transparent = false;
            selectedObject.material.needsUpdate = true;
            selectedObject =null;
        }
        if(modificationValue){
            selectedObject= setSelectedObject(rayCaster, clickPosition, scene,camera);
           if(selectedObject)
           {
               updateSlider(selectedObject);
           }
        }
        else if(movementOption === 'drag'){
            selectedObject= setSelectedObject(rayCaster, clickPosition, scene,camera);
            isDragging=true;
        }
        else if((selectedShape === 'sphere' || selectedShape === 'cube')
            && movementOption !== 'rotate'){
            ShapeDrawer(selectedShape, camera, clickPosition, scene, selectedColor, radius, width, height, depth);
        }
    }
    const handleMouseUp = (event) => {
        isDragging = false;
        if(selectedObject && movementOption === 'drag'){
            selectedObject.material.opacity = 1;
            selectedObject.material.transparent = false;
            selectedObject.material.needsUpdate = true;
            selectedObject= null;
        }
    }
    const handleMouseMove = (event) => {
        if (isDragging && selectedObject != null ) {
            mousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mousePosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            dragObject();
        }
    }

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


    function hover(){
        if (selectedObject) {
            selectedObject.material.transparent=true;
            selectedObject.material.opacity=0.5;
            console.log(selectedObject);

        }
    }
    useEffect(() => {
        hover();
    }, [selectedObject]);

    useEffect(() => {
      if(modificationValue){
      modifyShape(selectedObject,radius, height, width, depth);}
    }, [selectedObject, radius, height, width, depth, selectedColor]);

    useEffect(() => {
        if(modificationValue){
            modifyColor(selectedObject, selectedColor);}
    }, [selectedObject, radius, height, width, depth, selectedColor]);

    useEffect(() => {
        if(movementOption ==='rotate'){
            controls.enableRotate = true;
            controls.enableZoom =true;
        }
        else if(movementOption === undefined || movementOption === 'drag'){
            controls.enableRotate = false;
            controls.enableZoom =false;
        }
    }, [movementOption]);


  return (
    <div  ref={refContainer}>
    </div>
  );
}