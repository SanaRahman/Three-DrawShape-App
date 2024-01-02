import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls";

let scene = null;
let camera = null;
let renderer = null;
export function setUpScene() {

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.outputColorSpace =THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000)
        let cameraZ = 15;

        camera.up.set(0, 0, 1);
        camera.position.set(-4, 0, 10);
        const helper = new THREE.CameraHelper( camera );
        scene.add( helper );

        renderer.setSize(window.innerWidth, window.innerHeight);
        scene.background = new THREE.Color(0x808080); // Gray background

        const ambientLight = new THREE.AmbientLight(0xffffff, 3.0);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 4.0);
        directionalLight.position.set(1, 1, 9);
        scene.add(directionalLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();

        const  AxesHelper = new THREE.AxesHelper(200);
        scene.add(AxesHelper);

         const gridHelper= new THREE.GridHelper(100,10);


    return { scene, camera, renderer, controls,helper };
}

