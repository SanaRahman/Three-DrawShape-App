import * as THREE from 'three';

let polygons = new Array();


   export function makeShape(coordinates,scene){
        for(let i in polygons){
            for(let j in polygons[i]["lines"]){
                for(let c in coordinates){
                    const d = coordinates[c].distanceTo(polygons[i]["lines"][j]["point1"])
                    if(d<=0.2){
                        coordinates[c].set(polygons[i]["lines"][j]["point1"].x,polygons[i]["lines"][j]["point1"].y,polygons[i]["lines"][j]["point1"].z)
                    }
                }
            }
        }

        let polyShape = new THREE.Shape(coordinates.map((coord) => new THREE.Vector2(coord.x, coord.y)))
        const polyGeometry = new THREE.ShapeGeometry(polyShape);
        polyGeometry.setAttribute("position", new THREE.Float32BufferAttribute(coordinates.map(coord => [coord.x, coord.y, coord.z]).flat(), 3))
        let polygon = new THREE.Mesh(polyGeometry, new THREE.MeshBasicMaterial({ color: "red",side: THREE.DoubleSide, opacity:0, transparent:true,depthTest:false}))
        let material = new THREE.LineBasicMaterial( { color: "purple", linewidth: 10 } );

        material.depthTest = false;
        let edges = []
        for(let i=0;i<coordinates.length;i++){
            edges.push(new THREE.Vector3(coordinates[i].x,coordinates[i].y,coordinates[i].z))
            if(i+1<coordinates.length){
                edges.push(new THREE.Vector3(coordinates[i+1].x,coordinates[i+1].y,coordinates[i+1].z))
            }
        }
        edges.push(new THREE.Vector3(coordinates[0].x,coordinates[0].y,coordinates[0].z))
        //console.log(edges)
        let geometry = new THREE.BufferGeometry().setFromPoints(edges)
        let wireframe = new THREE.LineSegments( geometry, material );
        wireframe.renderOrder = 1;
        polygon.add(wireframe);
        scene.add(polygon);
    }

