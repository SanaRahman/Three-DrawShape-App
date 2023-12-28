import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls";

let scene = null;
let camera = null;
let renderer = null;


export function setUpScene() {

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({antialias:true});
        let cameraZ = 55;

        camera.position.set(0, 10, cameraZ);
        camera.lookAt(0, 0, 0)
        renderer.setSize(window.innerWidth, window.innerHeight);
        scene.background = new THREE.Color(0x808080); // Gray background


        const controls = new OrbitControls(camera, renderer.domElement);


        const  AxesHelper = new THREE.AxesHelper(50);
        // scene.add(AxesHelper);

         const gridHelper= new THREE.GridHelper(100,10);

        // const planeGeometry = new THREE.PlaneGeometry(200, 180)
        // const planex = new THREE.Mesh(
        //     planeGeometry,
        //     new THREE.MeshBasicMaterial({ color: 'black', side: THREE.DoubleSide })
        // )
        // planex.rotateX(Math.PI / 2)
        // planex.position.y = -1.75
        // planex.receiveShadow = true
        // planex.userData.name= 'ground';
        // planex.renderOrder = 1;
        // scene.add(planex)

    return { scene, camera, renderer, controls };
}

