import { Mesh } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import hat from './textured.obj';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

// Create a scene

function rain(cloud: THREE.Mesh, rainDrop: THREE.SphereGeometry, material: THREE.Material, scene:THREE.Scene ):THREE.Mesh {
    
    const a = cloud.geometry.getAttribute('position').array;
    var i =  Math.floor(Math.random() * a.length*2);
    const x = a[3*i];
    const y = a[3*i+1];
    const z = a[3*i+2];
    var gl = cloud.getWorldPosition(new THREE.Vector3(x,y,z));
    const rain = new THREE.Mesh(rainDrop, material);
    rain.name = 'rain';
    rain.position.x = x;
    rain.position.y = y;
    rain.position.z = z;
    rain.translateX(gl.x);
    rain.translateY(gl.y);
    rain.translateZ(gl.z);
    scene.add(rain);
    
    return rain;

}

function main(){
  const scene = new THREE.Scene();

  // Create a camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  // Create a renderer
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  const raycaster = new THREE.Raycaster()

  const texture = new THREE.TextureLoader().load("./Swim.jpg");
  const texture2 = new THREE.TextureLoader().load("./water.jpeg");
  scene.background = new THREE.TextureLoader().load("./sky.jpeg");
  scene.background.mapping = THREE.EquirectangularReflectionMapping;
  
  let time  = 0.0;
  let mouseX = 0;
  let mouseY = 0;
  let mouseClick = 0;
  let point = new THREE.Vector3();
  let point2 = new THREE.Vector3();


// Add event listener to update the mouseClick variable
renderer.domElement.addEventListener('mousedown', () => {
    mouseClick = 1;
    time = 0.0;
});

// Add another event listener to set the mouseClick variable back to 0
renderer.domElement.addEventListener('mouseup', () => {
    mouseClick = 0;
    time = 0.0;
});

// Add event listeners to update the mouseX and mouseY variables



// Create a plane geometry
const boxGeometry = new THREE.BoxGeometry(10, 10, 10, 100, 100, 100);
const planeGeometry = new THREE.PlaneGeometry(100,100,100,100);
const sphereGeometry = new THREE.SphereGeometry(0.3,12,12);



// Create a custom material
const material = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: time },
        map: { value: texture },
        mouseX: { value: mouseX},
        mouseY: { value: mouseY},
        mouseClick: {value:mouseClick},
        pointX: {value:point.x},
        pointY: {value:point.y},
        pointZ: {value:point.z},
    },
    vertexShader: `
        uniform float time;
        uniform sampler2D map;
        uniform float mouseX;
        uniform int mouseClick;
        uniform float pointX;
        uniform float pointY;
        uniform float pointZ;
        varying vec2 vUv;
        void main() {
            vUv = uv;
            vec3 newPosition = position;
            vec4 glopos4 = modelMatrix * vec4(position,1.0);
            vec3 glopos = vec3(glopos4.x, glopos4.y, glopos4.z); 
            //newPosition = position+vec3(0.0, 0.0, cos(position.x * time) * 3.0);
            if(mouseClick == 1){
                float step = 0.0;
                float dist = sqrt((pointX-glopos.x)*(pointX-glopos.x)+(pointY-glopos.y)*(pointY-glopos.y)+(pointZ-glopos.z)*(pointZ-glopos.z));
                float sstep= 10.0*time-dist;
                if(sstep>0.0) step = 1.0;
                if(dist<1.0) dist = 1.0; 
                newPosition = position + vec3(0.0,0.0,10.0*step*sin(time-dist)/dist/sqrt(dist));
            }
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        uniform sampler2D map;
        varying vec2 vUv;
        void main() {
            vec4 color= vec4(1.0,1.0,1.0,1.0);
            gl_FragColor = color;
        }
    `
});
const material3 = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: time },
        map: { value: texture },
        mouseX: { value: mouseX},
        mouseY: { value: mouseY},
        mouseClick: {value:mouseClick},
        pointX: {value:point2.x},
        pointY: {value:point2.y},
        pointZ: {value:point2.z}
    },
    vertexShader: `
        uniform float time;
        uniform sampler2D map;
        uniform float mouseX;
        uniform float mouseY;
        uniform int mouseClick;
        uniform float pointX;
        uniform float pointY;
        uniform float pointZ;
        varying vec2 vUv;
        varying vec3 pos;
        varying vec3 norm;
        void main() {
            vUv = uv;
            pos = position;
            norm = normal;
            vec3 newPosition = vec3(0.0,0.0,0.0);
            newPosition = position+vec3(0.0, 0.0, cos(position.x * time) * 3.0);
            if(mouseClick == 1){
                float step = 0.0;
                float dist = sqrt((pointX-position.x)*(pointX-position.x)+(pointY-position.y)*(pointY-position.y)+(pointZ-position.z)*(pointZ-position.z));
                float sstep= 10.0*time-dist;
                if(sstep>0.0) step = 1.0;
                if(dist<1.0) dist = 1.0; 
                newPosition = position + vec3(0.0,0.0,200.0*step*sin(time-dist)/dist/dist);
            }
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        #define PI 3.141592
    
        precision highp float;
        uniform sampler2D map;
        uniform mat4 modelMatrix;
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        varying vec3 pos;
        varying vec3 norm;
        varying vec2 vUv;
        void main() {
            vec4 glpos4 = modelMatrix*vec4(pos, 1.0);
            vec3 glpos = vec3(glpos4[0]/glpos4[3],glpos4[1]/glpos4[3],glpos4[2]/glpos4[3]);
            vec3 normalworld = normalize(mat3(transpose(inverse(modelMatrix)))*norm);
            vec3 r = normalize(reflect(normalize(-cameraPosition+glpos), normalworld));
            float u2 = (PI+atan(r[2],r[0]))/2.0/PI;
            float v2 = atan(sqrt(r[2]*r[2]+r[0]*r[0]),-r[1])/PI;
            vec2 environment = vec2(u2,v2);
            vec4 color= texture2D(map,environment);
            gl_FragColor = color;
        }
    `
});
const material2 = new THREE.MeshStandardMaterial( { envMap: texture } );
const light = new THREE.AmbientLight( new THREE.Color(0x505050) );
light.intensity = 1;


const material5 = new THREE.MeshPhongMaterial({
    color: new THREE.Color('white'), // red color
    specular: 0xffffff, // white specular
    shininess: 1, // high shininess

});


// create a point light
const pointLight = new THREE.PointLight(0xff0000, 10, 100);
pointLight.position.set(50, 50, 50);

// Load the MTL file



// add the point light to the scene
scene.add(pointLight);

// create an ambient light
const ambientLight = new THREE.AmbientLight(new THREE.Color(0xffffff));

// add the ambient light to the scene
scene.add(ambientLight);


  
  
  

// Create a mesh
const box = new THREE.Mesh(boxGeometry, material3);
const plane = new THREE.Mesh(planeGeometry, material);
const plane2 = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({map:texture2, transparent:true, opacity:0.2}));
const sphere = new THREE.Mesh(sphereGeometry,material5);
//plane.position.z = -500;
plane.rotation.x = -0.5 * Math.PI;
plane.position.y = -5;
plane2.rotation.x = -0.5 * Math.PI;
plane2.position.y = -4.9;
box.position.y = 60;
sphere.position.y = 100;

//hat load
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();
mtlLoader.load('./textured2.mtl', (materials) => {
    materials.preload();
    // Set the materials for the objLoader
    console.log(materials.materials);
    objLoader.setMaterials(materials);
    // Load the OBJ file
    const mesh = objLoader.parse(hat).children[0];
    if (mesh instanceof THREE.Mesh) scene.add(mesh);
    mesh.scale.x = 50;
    mesh.scale.y = 50;
    mesh.scale.z = 50;
    mesh.rotateY(Math.PI);
});





document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera({x:mouseX,y:mouseY},camera);
    // Check for intersections with the mesh
    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
        point.copy(intersects[0].point);
        console.log('x: %f , y: %f , z: %f', point.x,point.y,point.z);
    }
    const intersects2 = raycaster.intersectObject(box);
    if (intersects2.length > 0) {
        point2.copy(intersects2[0].point);
    }
});

// Add the plane to the scene
scene.add(box);
scene.add(plane);
scene.add(sphere);
scene.add(plane2);

// Move the camera back so we can see the plane
camera.position.z = 20;

const controls = new OrbitControls(camera, renderer.domElement);
const axeshelper = new THREE.AxesHelper();
scene.add(axeshelper);

// Animate the plane
const animate = () => {
    requestAnimationFrame(animate);
    material.uniforms.mouseX.value = mouseX;
    material.uniforms.mouseY.value = mouseY;
    material.uniforms.mouseClick.value = mouseClick;
    material.uniforms.pointX.value = point.x;
    material.uniforms.pointY.value = point.y;
    material.uniforms.pointZ.value = point.z;
    if(texture.image){
        time += 0.05;
        material.uniforms.time.value = time;
    }
    controls.update();
    renderer.render(scene, camera);
    var raindrop  = rain(box, sphereGeometry, material5, scene);
    scene.traverse(function(obj){
        if(obj.name == 'rain' ){
            obj.position.y -=0.1; 
        }
    } )

};

animate();

}

main();


