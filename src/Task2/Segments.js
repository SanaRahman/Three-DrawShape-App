import * as THREE from 'three';

let polygons = new Array();


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
            }
        }

        for(let vertex of vertices){
            console.log(vertex);
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

    export function  getPolygons(){
        return polygons;
    }
