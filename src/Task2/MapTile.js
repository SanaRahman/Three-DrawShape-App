import * as THREE from 'three';
import { setUpScene } from '../components/ThreeScene';
import React, { useRef, useEffect, useMemo } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { makeProjection, projectLatLngToPoint } from './Projection';
import {setSelectedObject} from "../components/utils/ShapeModifier";
import {ShapeDrawer} from "../components/utils/ShapeDrawer";
import { makeShape, getPolygons } from './Segments';
import { DragControls } from 'three/addons/controls/DragControls.js';

// Use makeShape and addPolygon functions as needed

let modelObjects =new Array();

let coordinatesStr="322650 3706594"
let projection ="+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs +type=crs"
let lat ="33.484177969551"
let lng= "73.0911479190149"

let modelmaxheight;
let height;
let width;

let rayCaster = null;
let mouseMovePosition =null;
let mouseClickPosition =null;

let isDrawing = false;
let pointsArray = new Array();
let lineArray = new Array();
let vertices = new Array();
let allvertices =new Array();
let Polygons;
let dragControls;
let vertexIndex= null;
let draggable = null;

let drawing_line_Material = new THREE.LineBasicMaterial({
    color: 'red',
    linewidth: 2,
    transparent: true,
    depthTest: false,
});
// let Polygons;
    export default function MapTile() {
    const refContainer = useRef(null);
    const { scene, camera, renderer, controls } = useMemo(() => setUpScene(refContainer.current), []);
    mouseClickPosition = new THREE.Vector2();
    mouseMovePosition =new THREE.Vector2();
    rayCaster = new THREE.Raycaster();



    useEffect(() => {
            setUpScene();
            addFloor();
            loadModel();
            setControl();
            refContainer.current && refContainer.current.appendChild(renderer.domElement);

            const animate = () => {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();
        }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleMouseDown, false);
        document.addEventListener('mousemove', handleMouseMove, false);
        document.addEventListener('mouseup', handleMouseUp, false);

        // document.addEventListener('wheel', onMouseWheel, { passive: false });
    }, []);

    const handleMouseDown = (event) => {
        var isLeftClick = (event.which === 1 || event.button === 0);
        if (isLeftClick && isDrawing!= null) {
            isDrawing= true;
            const intersects =getMousePosition(event);
            if (intersects.length > 0) {
                let point= intersects[0].point;
                if (pointsArray.length > 0) {
                    if (point.distanceTo(pointsArray[0]) < 0.5) {
                        completeSegment();
                    }
                    else{
                        pointsArray.push(point);
                        drawVertex(point);
                        drawLine();
                        console.log(pointsArray);
                    }
                }else{
                    pointsArray.push(point);
                    drawVertex(point);
                    drawLine();
                    console.log(pointsArray);
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
        Polygons= getPolygons();
        console.log(Polygons.object);
        // isDrawing= null;
        setDragControls();
        // console.log(Polygons[0].shape.object.children[0]);
    }
    
    const setDragControls = () => {
        Polygons= getPolygons();
        dragControls =new DragControls(allvertices, camera, renderer.domElement);
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
        // controls.enabled = false;
    }
    const dragEnd= (event) => {

    }
    const onDrag= (event) => {
        let geometry = event.object.geometry;
        geometry.computeBoundingBox();
        let center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        event.object.localToWorld(center);
        ////console.log(center);
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
        //console.log(edges)
        geometry = new THREE.BufferGeometry().setFromPoints(edges);
        //geometry = new THREE.EdgesGeometry(event.object.parent.geometry, 90)

        event.object.parent.children.slice(-1)[0].geometry.attributes.position =
            geometry.attributes.position;
        event.object.parent.children.slice(
            -1
        )[0].geometry.attributes.position.needsUpdate = true;

        geometry.dispose();
    }
    const handleMouseMove =(event) => {
        if(isDrawing && pointsArray.length > 0){
            const intersects =getMousePosition(event);
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
    }

    document.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
           isDrawing= false;
        }
    });
    const handleMouseUp = (event) =>{
    }
    function drawVertex(position){
        const cubeGeometry = new THREE.BoxGeometry(0.17, 0.17, 0.1);
        const cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0xC0C0C0,
        });
        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0x404040,
            linewidth: 4,
        });
        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        const wireframeGeometry = new THREE.EdgesGeometry(cubeGeometry);
        const wireframe = new THREE.LineSegments(
            wireframeGeometry,
            wireframeMaterial
        );
        position.z +=0.1
        cubeMesh.position.copy(position);
        wireframe.position.copy(position);
        cubeMesh.depthTest = false;
        cubeMesh.renderOrder= 3;
        wireframe.renderOrder =3;
        cubeMesh.userData.name="vertex";
        cubeMesh.name="vertex"
        // cubeMesh.add(wireframe)
        scene.add(cubeMesh);
        // scene.add(wireframe);
        vertices.push(cubeMesh)
        allvertices.push(cubeMesh);
    }
    function getMousePosition(event) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        rayCaster = new THREE.Raycaster();
        rayCaster.setFromCamera(mouse, camera);
        return  rayCaster.intersectObjects( modelObjects, false );
    }
    function addFloor(){
        const geometry = new THREE.BoxGeometry(150, 150, 0);
        const texture = new THREE.TextureLoader().load(
            `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&size=500x500&scale=2&zoom=19&maptype=satellite&key=AIzaSyAo1viD-Ut0TzXTyihevwuf-9tv_J3dPa0`
        );
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const cube = new THREE.Mesh(geometry, material);
        cube.receiveShadow = true;
        cube.userData.name = 'ground';
        cube.position.set(1,1,-8)
        scene.add(cube);
    }
    function loadModel(){
        let i=0;
        const loader = new GLTFLoader();
        loader.load('models/model2/model.glb', function (gltf) {
            const root = gltf.scene;
            let bbox = new THREE.Box3().setFromObject(root);
            modelmaxheight = bbox.max.z;
            let center = bbox.getCenter(new THREE.Vector3());
             height = bbox.max.y - bbox.min.y;
             width = bbox.max.x - bbox.min.x;
            console.log('Height of the bounding box:', height);
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

        // controls.enableDamping =true;
        // controls.dampingFactor = 0.25;

        controls.rotateSpeed = 0.7;
        controls.enablePan =true;
        controls.minPolarAngle = 0;
        // let h= controls.minPolarAngle;
        controls.maxPolarAngle = 60 * (Math.PI/180);
        // controls.minDistance = 2;
        // controls.maxDistance = 500;
        // let target = projectLatLngToPoint();
        // controls.target.set(target.x, target.y,modelmaxheight)
        controls.target.set(0, 0, 0)
        controls.update();

    }

    return <div ref={refContainer}></div>;
}
