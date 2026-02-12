// ========== SCENE SETUP MODULE ==========
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export let scene, camera, renderer, controls;
export let ambientLight, directionalLight;
export let matrixSkyDome;

export function initScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 35, 35);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 15;
    controls.maxDistance = 60;

    ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    scene.add(directionalLight);

    matrixSkyDome = createMatrixSkyDome();
    if (matrixSkyDome) scene.add(matrixSkyDome);

    window.addEventListener('resize', onWindowResize);

    return { scene, camera, renderer, controls };
}

function createMatrixSkyDome() {
    const skyGeo = new THREE.SphereGeometry(100, 64, 64);
    const skyUniforms = { uTime: { value: 0 } };

    const vertexShader = `
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float uTime;
        varying vec3 vPosition;

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            vec3 color = vec3(0.0, 0.05, 0.1);
            vec2 uv = vPosition.xy * 0.1;
            float pattern = random(floor(uv + uTime * 0.1));
            color += vec3(0.0, 0.2, 0.3) * pattern * 0.3;
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const skyMat = new THREE.ShaderMaterial({
        uniforms: skyUniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide
    });

    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.userData.uniforms = skyUniforms;
    return skyMesh;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function clearScene() {
    while(scene.children.length > 0) scene.remove(scene.children[0]);
}

export function updateSkyDome(time) {
    if (matrixSkyDome && matrixSkyDome.userData.uniforms) {
        matrixSkyDome.userData.uniforms.uTime.value = time;
    }
}
