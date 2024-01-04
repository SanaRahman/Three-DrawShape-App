import * as THREE from 'three';
import { setUpScene } from '../components/ThreeScene';
import React, { useRef, useEffect, useMemo } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { makeProjection, projectLatLngToPoint } from './Projection';
import {setSelectedObject} from "../components/utils/ShapeModifier";
import {ShapeDrawer} from "../components/utils/ShapeDrawer";

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
let startPoint = null;
let endPoint = null;

let isDrawing = null;
let segmentCompleted = false;
let lineGeometry,linePositions;

let linePoints={};
let linesArray= new Array();
let Segments = {};

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
        if (isLeftClick) {
            const intersects =getMousePosition(event);
            if (intersects.length > 0) {
                startPoint = intersects[0].point;
                // endPoint = intersects[0].point;

                if (isDrawing ){
                 isDrawing= false;
                 endPoint = intersects[0].point;
                 setLineEnd("set");
                }
                else{
                    isDrawing=true;
                    console.log("startPoint:");
                    console.log(startPoint);
                    drawEdge(startPoint);
                    setLineStart();
                }
            }
        }
        else{
            Segments["SegmentA"]= linesArray;
            console.log(Segments);
        }
    }
    const handleMouseMove =(event) => {
        if(isDrawing){
            const intersects =getMousePosition(event);
            if (intersects.length > 0) {
                endPoint = intersects[0].point;
                setLineEnd("update");
            }
        }
    }
    function setLineStart(){
        const lineMaterial = new THREE.LineBasicMaterial({ color: 'red' });
        lineGeometry = new THREE.BufferGeometry();
        linePositions = [];
        const positions = new Float32Array(6);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const line = new THREE.Line(lineGeometry, lineMaterial);
        linePositions[0] = startPoint.x;
        linePositions[1] = startPoint.y;
        linePositions[2] = startPoint.z;
        lineGeometry.attributes.position.array.set(linePositions);
        lineGeometry.attributes.position.needsUpdate = true;
        scene.add(line);
        linePoints = { start: startPoint, end: null };
    }
    function setLineEnd(str){
        linePositions[3] = endPoint.x;
        linePositions[4] = endPoint.y;
        linePositions[5] = endPoint.z;
        lineGeometry.attributes.position.array.set(linePositions);
        lineGeometry.attributes.position.needsUpdate = true;
        linePoints.end = endPoint;
        if(str === "set"){
            linesArray.push({ ...linePoints });
            console.log(linesArray)
            if(linesArray.length> 1){
                // console.log(endPoint);
                // console.log(linesArray[0].start)
                console.log(endPoint.distanceTo(linesArray[0].start)<=1);
                console.log("near");
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
    function drawEdge(position){
        const cubeGeometry = new THREE.BoxGeometry(0.17, 0.17, 0.1);
        const cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0xC0C0C0, // Gray color
        });

        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0x404040, // Dark gray wireframe color
            linewidth: 4, // Adjust wireframe linewidth
        });

        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        const wireframeGeometry = new THREE.EdgesGeometry(cubeGeometry);
        const wireframe = new THREE.LineSegments(
            wireframeGeometry,
            wireframeMaterial
        );
        position.z +=0.2
        cubeMesh.position.copy(position);
        wireframe.position.copy(position);

        scene.add(cubeMesh);
        scene.add(wireframe);

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

            // const boundingBoxGeometry = new THREE.BoxGeometry(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z);
            // const boundingBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
            // const boundingBox = new THREE.Mesh(boundingBoxGeometry, boundingBoxMaterial);
            // boundingBox.position.set(0,0,0);
            // scene.add(boundingBox);

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
            console.log(modelObjects);
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

        // controls.rotateSpeed = 0.7;
        controls.enablePan =true;
        controls.minPolarAngle = 0;
        let h= controls.minPolarAngle;
        controls.maxPolarAngle = 60 * (Math.PI/180);
        // controls.minDistance = 2;
        // controls.maxDistance = 500;
        // let target = projectLatLngToPoint();
        // controls.target.set(target.x, target.y,modelmaxheight)
        controls.target.set(0, 0, 0)
        controls.update();

    }

   function drawSegment(){

   }



    return <div ref={refContainer}></div>;
}
