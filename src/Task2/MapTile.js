import * as THREE from 'three';
import { setUpScene } from '../components/ThreeScene';
import React, { useRef, useEffect, useMemo } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default function MapTile() {
    const refContainer = useRef(null);
    const { scene, camera, renderer, controls } = useMemo(() => setUpScene(refContainer.current), []);

    useEffect(() => {
        setUpScene();
        const geometry = new THREE.BoxGeometry(100, 100, 4);
        const texture = new THREE.TextureLoader().load(
            'https://maps.googleapis.com/maps/api/staticmap?center=42.3359182924998,-71.60280179232359&size=500x500&scale=2&zoom=19&maptype=satellite&key=AIzaSyAo1viD-Ut0TzXTyihevwuf-9tv_J3dPa0'
        );
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const cube = new THREE.Mesh(geometry, material);

        cube.rotateX(-Math.PI / 4);
        cube.receiveShadow = true;
        cube.userData.name = 'ground';
        scene.add(cube);


            const loader = new GLTFLoader();
        loader.load('models/model.glb', function (gltf) {
            const mesh = gltf.scene;

            // Calculate the center of the box geometry
            // const boxCenter = new THREE.Vector3();
            // geometry.computeBoundingBox();
            // geometry.boundingBox.getCenter(boxCenter);

            // Set the position of the loaded model to the center of the box
            // mesh.position.copy(boxCenter);
            mesh.traverse((node) => {
                if (node.isMesh) {
                    // Replace 'your_textures_path' with the path to your textures directory
                    const texturePath = `modelTextures/${node.material.name}.png`;
                    const textured = new THREE.TextureLoader().load(texturePath);
                    node.material.map = textured;
                    node.material.needsUpdate = true;
                }
            });

            mesh.rotateX(-Math.PI / 4);
            mesh.position.set(-5,-120,0);
            scene.add(mesh);
        }, undefined, function (error) {
            console.error(error);
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
