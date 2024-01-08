import * as THREE from 'three';
import {CSS2DObject} from "three/addons";

let polygons = new Array();
let measurementLabels ={};
// import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer'

   export function makeShape(coordinates,vertices,scene){
        let polyShape = new THREE.Shape(coordinates.map((coord) => new THREE.Vector2(coord.x, coord.y)))
        const polyGeometry = new THREE.ShapeGeometry(polyShape);
        polyGeometry.setAttribute("position", new THREE.Float32BufferAttribute(coordinates.map(coord => [coord.x, coord.y, coord.z]).flat(), 3))
        let polygon = new THREE.Mesh(polyGeometry, new THREE.MeshBasicMaterial({ color: "red",side: THREE.DoubleSide, opacity:0, transparent:true,depthTest:false}))

       // setting start and end points for line segments
       //if cords are 3 it returns 6 points

        let edges = []

        for(let i=0;i<coordinates.length;i++){
            edges.push(new THREE.Vector3(coordinates[i].x,coordinates[i].y,coordinates[i].z))
            if(i+1<coordinates.length){
                edges.push(new THREE.Vector3(coordinates[i+1].x,coordinates[i+1].y,coordinates[i+1].z))
                const point1 = coordinates[i];
                const point2 = coordinates[i + 1];
               addLabel(point1, point2, scene)
            }
            else{
                const point1 = coordinates[i];
                const point2 = coordinates[0];
                addLabel(point1,point2,scene)
            }
        }

       for(let vertex of vertices){
           polygon.add(vertex);
       }

        edges.push(new THREE.Vector3(coordinates[0].x,coordinates[0].y,coordinates[0].z))
        let geometry = new THREE.BufferGeometry().setFromPoints(edges)
        let material = new THREE.LineBasicMaterial( { color: "purple", linewidth: 10 } )
        material.depthTest = false;
        let wireframe = new THREE.LineSegments( geometry, material );
        wireframe.renderOrder = 3;

        polygon.add(wireframe);
        scene.add(polygon)
        // scene.add(wireframe);
        let shape={"shape": polygon};
        polygons.push(shape);
    }

    function addLabel(point1, point2, scene){

        const distanceInMeters = point1.distanceTo(point2);
        const totalDistanceInFeet = distanceInMeters * 3.281;
        const totalFeet = Math.floor(totalDistanceInFeet);
        const totalInches = Math.round((totalDistanceInFeet - totalFeet) * 12);

        const measurementDiv = document.createElement('div');
        measurementDiv.className = 'measurementLabel';
        measurementDiv.innerText = `${totalFeet}'${totalInches}" ft`;
        measurementDiv.style.fontSize = '10px';
        measurementDiv.style.backgroundColor = '#005cba'; // Set the background color
        measurementDiv.style.borderRadius = '5px';
        measurementDiv.style.color = 'white'; // Add rounded corners
        measurementDiv.style.padding = '5px'; //

        measurementDiv.style.fontWeight = 'bold';
        const measurementLabel = new CSS2DObject(measurementDiv);
        measurementLabel.position.lerpVectors(
            point1,
            point2,
            0.5
        );
        scene.add(measurementLabel);
    }

    export function  getPolygons(){
        return polygons;
    }
