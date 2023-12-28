import * as THREE from 'three';
import { setUpScene } from '../components/ThreeScene';
import React, { useRef, useEffect, useMemo } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default function MapTile() {
    const refContainer = useRef(null);
    const { scene, camera, renderer, controls } = useMemo(() => setUpScene(refContainer.current), []);

    useEffect(() => {
        setUpScene();
        const geometry = new THREE.BoxGeometry(150, 150, 0);
        const texture = new THREE.TextureLoader().load(
            'https://maps.googleapis.com/maps/api/staticmap?center=42.3359182924998,-71.60280179232359&size=500x500&scale=2&zoom=19&maptype=satellite&key=AIzaSyAo1viD-Ut0TzXTyihevwuf-9tv_J3dPa0'
        );
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const cube = new THREE.Mesh(geometry, material);

        // cube.rotation= THREE.MathUtils.degToRad(90); 
        cube.receiveShadow = true;
        cube.userData.name = 'ground';
        scene.add(cube);

      

        var textureLoader = new THREE.TextureLoader();
        var modelTexturesPath = 'modelTextures/';
        
        // var modelMaterial = new THREE.MeshBasicMaterial({ map: modelTexture });


        // const textureMapping = {};

        // Iterate over the range from 1 to 19
        // for (let i = 0; i <= 19; i++) {
        //     const textureNumber = i.toString().padStart(4, '0'); // Pad with zeros
        //     const textureFileName = `odm_textured_model_geo_material${textureNumber}_map_Kd.png`;
        //     console.log(textureFileName);
        //     // textureMapping[`part${i}`] = textureFileName;
        // }

        let i=0;
        const loader = new GLTFLoader();
        loader.load('models/model.glb', function (gltf) {
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                //    const textureFileName = textureMapping[child.name];
                const textureNumber = i.toString().padStart(4, '0')
                // const textureNumber = child.name.split('_')[3]; // Extracting the number part
                const textureFileName = `odm_textured_model_geo_material${textureNumber}_map_Kd.png`;
                console.log(textureFileName)
                i++;
                // Load and apply the texture
                const modelTexture = textureLoader.load(modelTexturesPath + textureFileName);
                const modelMaterial = new THREE.MeshBasicMaterial({ map: modelTexture });
                child.material = modelMaterial;
                }
             })

         gltf.scene.position.z = -90
         gltf.scene.position.x = -10
         gltf.scene.rotation.z= THREE.MathUtils.degToRad(-5);
         scene.add(gltf.scene);
        });

        refContainer.current && refContainer.current.appendChild(renderer.domElement);

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
    }, []);

    return <div ref={refContainer}></div>;
}
