import * as THREE from 'three';
import { setUpScene } from '../components/ThreeScene';
import React, { useRef, useEffect, useMemo } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { makeProjection, projectLatLngToPoint } from './Projection';
// import {setSelectedObject} from "../components/utils/ShapeModifier";
import { makeShape, getPolygons ,getMeasurmentLables} from './Segments';
import { DragControls } from 'three/addons/controls/DragControls.js';
import { CSS2DRenderer} from "three/addons";

let modelObjects =new Array();

let coordinatesStr="322650 3706594"
let projection ="+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs +type=crs"
let lat ="33.484177969551"
let lng= "73.0911479190149"

let height;
let width;

let rayCaster = null;
let mouseMovePosition =null;
let mouseClickPosition =null;

let isDrawing = false;
let pointsArray = new Array();
let lineArray = new Array();
let vertices = new Array();
let allVertices =new Array();
let Polygons;
let dragControls;
let vertexIndex= null;
let isCtrlPressed = false;

let labelRenderer = new CSS2DRenderer();
let drawing_line_Material = new THREE.LineBasicMaterial({
    color: 'red',
    linewidth: 2,
    transparent: true,
    depthTest: false,
});

    export default function MapTile() {
    const refContainer = useRef(null);
    const { scene, camera, renderer, controls } = useMemo(() => setUpScene(refContainer.current), []);
    mouseClickPosition = new THREE.Vector2();
    mouseMovePosition =new THREE.Vector2();
    rayCaster = new THREE.Raycaster();

    window.addEventListener('resize', () => {
            width = window.innerWidth
            height = window.innerHeight
            camera.aspect = width / height
            camera.updateProjectionMatrix()
            renderer.setSize(width, height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            renderer.render(scene, camera)
            labelRenderer.setSize(window.innerWidth,window.innerHeight)
        })

    useEffect(() => {
            setUpScene();
            addFloor();
            loadModel();
            setControl();
            labelRenderer.setSize(window.innerWidth,window.innerHeight)
            labelRenderer.domElement.style.position = "fixed";
            labelRenderer.domElement.style.top = "2px";
            labelRenderer.domElement.style.left = "0px";
            labelRenderer.domElement.style.pointerEvents = "none";

            refContainer.current && refContainer.current.appendChild(renderer.domElement);
            refContainer.current.appendChild(labelRenderer.domElement);

            const animate = () => {
                requestAnimationFrame(animate);
                controls.update();
                labelRenderer.render(scene, camera);
                renderer.render(scene, camera);
            };
            animate();
        }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleMouseDown, false);
        document.addEventListener('mousemove', handleMouseMove, false);
        document.addEventListener('mouseup', handleMouseUp, false);
        window.addEventListener('keydown', onKeyDown, false);
        window.addEventListener('keyup', onKeyUp, false);

        // document.addEventListener('wheel', onMouseWheel, { passive: false });
    }, []);

    const handleMouseDown = (event) => {
        var isLeftClick = (event.which === 1 || event.button === 0);
        if (isLeftClick && isDrawing!= null) {
            isDrawing= true;
            const intersects =getMousePosition(event);
            if (intersects.length > 0) {
                let point= intersects[0].point;
                if (pointsArray.length > 2) {
                    if (point.distanceTo(pointsArray[0]) < 0.5) {
                        completeSegment();
                    }
                    else{
                        pointsArray.push(point);
                        drawVertex(point);
                        drawLine();
                    }
                }else{
                    pointsArray.push(point);
                    drawVertex(point);
                    drawLine();
                }
            }
        }
    }

    function drawLine(){
        let geometry = new THREE.BufferGeometry().setFromPoints(
            [
                pointsArray.slice(-1)[0],
                pointsArray.slice(-1)[0],
            ]
        );
        let line = new THREE.LineSegments(
            geometry,
            drawing_line_Material
        );
        line.frustumCulled = false;
        lineArray.push(line);
        scene.add(lineArray.slice(-1)[0]);
    }
    function completeSegment(){
        if(isDrawing){
            makeShape(pointsArray,vertices,scene);
            pointsArray = [];
            for (let line in lineArray) {
                lineArray
                    .slice(-1)[0]
                    .material.color.setHex(0xff0000);
                scene.remove(lineArray[line]);
                lineArray[line].geometry.dispose();
            }

            lineArray = [];
            vertices = [];
            isDrawing= null;
        }
        setDragControls();
    }
    
    const setDragControls = () => {
        Polygons= getPolygons();
        dragControls =new DragControls(allVertices, camera, renderer.domElement);
            dragControls.addEventListener("hoveron", dragHoverOn);
            dragControls.addEventListener("hoveroff", dragHoverOff);
            dragControls.addEventListener("dragstart", dragStart);
            dragControls.addEventListener("dragend", dragEnd);
            dragControls.addEventListener("drag", onDrag);
    }

   const dragHoverOn = (event) => {
        event.object.material.color.setHex(0x00ff00);
    };

    const  dragHoverOff = (event) => {
        event.object.material.color.setHex(0x000000);
    };
    const dragStart= (event) => {
        let vertexId= event.object.uuid;
        let segment = event.object.parent;
        for (let i in segment.children) {
            if (segment.children[i].uuid === vertexId) {
                vertexIndex= i;
            }
        }
        controls.enabled = false;
    }
    const dragEnd= (event) => {
        controls.enabled = true;
    }
    const onDrag= (event) => {
            let geometry = event.object.geometry;
            geometry.computeBoundingBox();
            let center = new THREE.Vector3();
            geometry.boundingBox.getCenter(center);
            event.object.localToWorld(center);

            event.object.parent.geometry.attributes.position.setXYZ(
                vertexIndex,
                center.x,
                center.y,
                center.z
            );
            event.object.parent.geometry.attributes.position.needsUpdate = true;
            let coordinates = [];
            for (
                let i = 0;
                i < event.object.parent.geometry.attributes.position.count;
                i++
            ) {
                coordinates.push({
                    x: event.object.parent.geometry.attributes.position.getX(i),
                    y: event.object.parent.geometry.attributes.position.getY(i),
                    z: event.object.parent.geometry.attributes.position.getZ(i),
                });
            }

            let edges = [];
            for (let i = 0; i < coordinates.length; i++) {
                edges.push(
                    new THREE.Vector3(
                        coordinates[i].x,
                        coordinates[i].y,
                        coordinates[i].z
                    )
                );
                if (i + 1 < coordinates.length) {
                    edges.push(
                        new THREE.Vector3(
                            coordinates[i + 1].x,
                            coordinates[i + 1].y,
                            coordinates[i + 1].z
                        )
                    );
                }
            }
            edges.push(
                new THREE.Vector3(
                    coordinates[0].x,
                    coordinates[0].y,
                    coordinates[0].z
                )
            );
            geometry = new THREE.BufferGeometry().setFromPoints(edges);

            event.object.parent.children.slice(-1)[0].geometry.attributes.position =
                geometry.attributes.position;
            event.object.parent.children.slice(
                -1
            )[0].geometry.attributes.position.needsUpdate = true;

            geometry.dispose();

            updateLabelPositions(event, center);

    }

    function updateLabelPositions(event, center){
        let parentId = event.object.parent.uuid;

        for( let polygon in Polygons){
            if(Polygons[polygon]["shape"].uuid === parentId){
                for(let line of Polygons[polygon]["lines"]){
                    console.log(line)
                    let marker1UUID = line["vertexId1"] ;
                    let marker2UUID = line["vertexId2"];
                    console.log(marker1UUID);

                    if (marker1UUID === event.object.uuid || marker2UUID === event.object.uuid) {
                        let id = line["id"];
                        console.log(id)
                        if (marker1UUID === event.object.uuid) {
                            line["point1"] = center;
                        } else {
                            line["point2"] = center;
                        }


                        let distance = center.distanceTo(marker1UUID === event.object.uuid ? line["point2"] : line["point1"]) * 3.281;
                        let feet = Math.floor(distance);
                        let inches = Math.round((distance - feet) * 12);
                        let label= getMeasurmentLables();
                        label[id].element.innerText = `${feet}'${inches}" ft`;
                        label[id].position.lerpVectors(
                            marker1UUID === event.object.uuid ? center : line["point1"],
                            marker1UUID === event.object.uuid ? line["point2"] : center,
                            0.5
                        );

                        line["measurement"] = distance;
                    }
                }
            }
            Polygons[polygon]["shape"].geometry.computeBoundingBox();
            center = new THREE.Vector3();
            Polygons[polygon]["shape"].geometry.boundingBox.getCenter(center);
        }

    }
    const handleMouseMove =(event) => {
        if(isDrawing && pointsArray.length > 0){
            const intersects =getMousePosition(event);
            updateLine(intersects);
        }

        if (isCtrlPressed ) {
          controls.enabledPan =true;
        }
    }
    function updateLine(intersects){
        if (intersects.length > 0) {
            lineArray.slice(
                -1
            )[0].geometry.attributes.position.array[3] =
                intersects[0].point.x;
            lineArray.slice(
                -1
            )[0].geometry.attributes.position.array[4] =
                intersects[0].point.y;
            lineArray.slice(
                -1
            )[0].geometry.attributes.position.array[5] =
                intersects[0].point.z;
            lineArray.slice(
                -1
            )[0].geometry.attributes.position.needsUpdate = true;
        }
    }
    function undo(){
        if(isDrawing){
            if (pointsArray.length > 0) {
                pointsArray.pop();
            }

            if (lineArray.length > 0) {
                let lastLine = lineArray.pop();
                scene.remove(lastLine);
                lastLine.geometry.dispose();
            }

            if (vertices.length > 0) {
                let lastVertex = vertices.pop();
                // const event = {
                //     clientX: mouseMovePosition.x,
                //     clientY: mouseMovePosition.y,
                //     clientZ: -1
                // };
                // console.log(event)
                // handleMouseMove(event);
                scene.remove(lastVertex);
                allVertices.pop();
            }
        }
    }
    function onKeyDown(event) {
        if (event.key === 'Control') {
            isCtrlPressed = true;
        }
        else if (event.key === 'Enter' && pointsArray.length > 2) {
            completeSegment();
            isDrawing= false;
        }
        else if(event.key === 'Escape'){
            undo();
        }
    }
    function onKeyUp(event) {
        if (!event.ctrlKey) {
            isCtrlPressed = false;
            controls.enabledPan = false;
        }
    }
    const handleMouseUp = (event) =>{
    }
    function drawVertex(position){
        let geometry = new THREE.CircleGeometry( 0.2, 32 );
        let material = new THREE.MeshBasicMaterial( { color: 'black' } );

        material.depthTest = false;

        let circle = new THREE.Mesh( geometry, material );
        circle.position.copy(position);
        circle.name = "vertex";
        circle.renderOrder = 1;
        scene.add(circle);
        vertices.push(circle)
        allVertices.push(circle);
    }
    function getMousePosition(event) {

        mouseMovePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouseMovePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;


        rayCaster = new THREE.Raycaster();
        rayCaster.setFromCamera(mouseMovePosition, camera);
        return  rayCaster.intersectObjects( modelObjects, false );
    }
    function addFloor(){
        const geometry = new THREE.BoxGeometry(150, 150, 0);
        const texture = new THREE.TextureLoader().load(
            `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&size=500x500&scale=2&zoom=19&maptype=satellite&key=AIzaSyAo1viD-Ut0TzXTyihevwuf-9tv_J3dPa0`
        );
        const material = new THREE.MeshStandardMaterial({ map: texture ,  roughness: 0.8,});
        const cube = new THREE.Mesh(geometry, material);
        cube.receiveShadow = true;
        cube.userData.name = 'ground';
        cube.position.set(1,1,-8)
        scene.add(cube);
        const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
        renderTarget.texture.encoding = THREE.sRGBEncoding;
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
        directionalLight.position.set(0, 0, -2); // Direction of the light
        scene.add(directionalLight);
    }

    function loadModel(){
        let i=0;
        const loader = new GLTFLoader();
        loader.load('models/model2/model.glb', function (gltf) {
            const root = gltf.scene;
            let bbox = new THREE.Box3().setFromObject(root);
            // modelmaxheight = bbox.max.z;
            let center = bbox.getCenter(new THREE.Vector3());
            root.position.sub(center);

            gltf.scene.traverse(function (child) {
                modelObjects.push(child)
                const textureNumber = i.toString().padStart(4, '0')
                const textureFileName = `models/model2/odm_textured_model_geo_material${textureNumber}_map_Kd.png`; i++;
                var textureLoader = new THREE.TextureLoader();
                const modelTexture = textureLoader.load( textureFileName);
                const modelMaterial = new THREE.MeshStandardMaterial({ map: modelTexture, transparent: true });
                if (child.isMesh) {
                    child.material.map.name = modelMaterial;
                }
            })

            scene.add(root);
        });
    }
    function setControl() {
        camera.position.set(-50, 0, 10);
        controls.listenToKeyEvents(window);
        controls.mouseButtons = {
            LEFT: null,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.ROTATE,
        };

        controls.zoomToCursor = true
        controls.rotateSpeed = 1;
        controls.enablePan =true;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = 60 * (Math.PI/180);
        controls.minDistance = 2;
        controls.maxDistance =150;
        controls.target.set(0, 0, 0)
        controls.update();
    }

    return <div ref={refContainer}></div>;
}
