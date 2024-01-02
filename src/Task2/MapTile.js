import * as THREE from 'three';
import { setUpScene } from '../components/ThreeScene';
import React, { useRef, useEffect, useMemo } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { makeProjection, projectLatLngToPoint } from './Projection';

const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const rayCaster = new THREE.Raycaster();
let intersectionPoint =new THREE.Vector3();
let zoomTarget = new THREE.Vector3();
let coordinatesStr="322650 3706594"
let projection ="+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs +type=crs"
let lat ="33.484177969551"
let lng= "73.0911479190149"
let modelmaxheight;
export default function MapTile() {
    const refContainer = useRef(null);
    const { scene, camera, renderer, controls,helper } = useMemo(() => setUpScene(refContainer.current), []);


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
        // document.addEventListener('mousedown', onMouseClick, false);
        // document.addEventListener('wheel', onMouseWheel, { passive: false });
    }, []);

    function addFloor(){
        const geometry = new THREE.BoxGeometry(150, 150, 0);
        const texture = new THREE.TextureLoader().load(
            `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&size=500x500&scale=2&zoom=19&maptype=satellite&key=AIzaSyAo1viD-Ut0TzXTyihevwuf-9tv_J3dPa0`
        );
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const cube = new THREE.Mesh(geometry, material);

        // cube.rotation= THREE.MathUtils.degToRad(90);
        cube.receiveShadow = true;
        cube.userData.name = 'ground';
        cube.position.set(1,1,-8)
        // cube.rotation.x = -Math.PI/2;
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

            root.position.sub(center);
            // root.rotation.x = -Math.PI/2;


            gltf.scene.traverse(function (child) {
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

        controls.enableDamping =true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.7;
        controls.enablePan =true;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = 60 * (Math.PI/180);
        controls.minDistance = 2;
        controls.maxDistance = 500;
        // let target = projectLatLngToPoint();
        // controls.target.set(target.x, target.y,modelmaxheight)
        controls.target.set(0, 0, 0)
        controls.update();
    }
    return <div ref={refContainer}></div>;
}
