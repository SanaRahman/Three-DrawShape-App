import * as THREE from 'three';
import { setUpScene } from '../components/ThreeScene';
import React, { useRef, useEffect, useMemo } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const rayCaster = new THREE.Raycaster();
let intersectionPoint =new THREE.Vector3();
let zoomTarget = new THREE.Vector3();
export default function MapTile() {
    const refContainer = useRef(null);
    const { scene, camera, renderer, controls } = useMemo(() => setUpScene(refContainer.current), []);


    function onMouseClick(event) {
        // Calculate the mouse position relative to the canvas
        const clickPosition = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        planeNormal.copy(camera.position).normalize();
        plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
        rayCaster.setFromCamera(clickPosition, camera);
        rayCaster.ray.intersectPlane(plane, zoomTarget);
    }
    function onMouseWheel(event) {
        const delta = event.deltaY || (-event.detail * 40);

        const zoomFactor = 1 + delta * 0.001;

        // Calculate the new camera position based on the zoom factor and the zoom target
        const cameraPosition = camera.position.clone().sub(zoomTarget);
        cameraPosition.multiplyScalar(zoomFactor);
        camera.position.copy(zoomTarget.clone().add(cameraPosition));

        // Update the orbit controls
        controls.target.copy(zoomTarget);
        controls.update();

    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 3.0);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 4.0);
    directionalLight.position.set(1, 1, 9);
    scene.add(directionalLight);



        useEffect(() => {
        setUpScene();
        const geometry = new THREE.BoxGeometry(150, 150, 0);
        const texture = new THREE.TextureLoader().load(
            'https://maps.googleapis.com/maps/api/staticmap?center=33.484177969551,73.0911479190149&size=500x500&scale=2&zoom=19&maptype=satellite&key=AIzaSyAo1viD-Ut0TzXTyihevwuf-9tv_J3dPa0'
        );
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const cube = new THREE.Mesh(geometry, material);

        // cube.rotation= THREE.MathUtils.degToRad(90); 
        cube.receiveShadow = true;
        cube.userData.name = 'ground';
        cube.position.set(1,1,-8)
        scene.add(cube);

        let i=0;
        let  modelmaxheight = 0
        const loader = new GLTFLoader();
        loader.load('models/model2/model.glb', function (gltf) {
            const root = gltf.scene;
            let bbox = new THREE.Box3().setFromObject(root);
            // modelmaxheight = bbox.max.z;
            // let modelmaxwidth = bbox.max.x;
            let center = bbox.getCenter(new THREE.Vector3());
            root.position.sub(center);

            gltf.scene.traverse(function (child) {
                const textureNumber = i.toString().padStart(4, '0')
                const textureFileName = `models/model2/odm_textured_model_geo_material${textureNumber}_map_Kd.png`;
                i++;
                var textureLoader = new THREE.TextureLoader();
                const modelTexture = textureLoader.load( textureFileName);
                const modelMaterial = new THREE.MeshStandardMaterial({ map: modelTexture, transparent: true });
                if (child.isMesh) {
                    child.material.map.name = modelMaterial;
                    console.log(child.material)
                }
             })

            scene.add(root);
            document.addEventListener('mousedown', onMouseClick, false);
            document.addEventListener('wheel', onMouseWheel, { passive: false });


        });

        refContainer.current && refContainer.current.appendChild(renderer.domElement);

        const animate = () => {
            requestAnimationFrame(animate);
            // controls.update();
            renderer.render(scene, camera);
        };
        animate();
    }, []);

    return <div ref={refContainer}></div>;
}
