import {
  Scene,
  PerspectiveCamera,
  WebGL1Renderer,
  DataTexture,
  RGBFormat,
  FloatType,
  ShaderMaterial,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import FBO from "./FBO";
import simulationVertex from "../../shaders/FBO/simulation/vertex.glsl";
import simulationFragment from "../../shaders/FBO/simulation/fragment.glsl";
import renderVertex from "../../shaders/FBO/render/vertex.glsl";
import renderFragment from "../../shaders/FBO/render/fragment.glsl";

function getRandomData(width, height, size) {
  var len = width * height * 3;
  var data = new Float32Array(len);
  while (len--) data[len] = (Math.random() - 0.5) * size;
  return data;
}

class App {
  constructor() {
    console.clear();

    this.onResize = this.onResize.bind(this);
    this.render = this.render.bind(this);

    this.initScene();
    this.initRenderer();
    this.initCamera();

    // The width and the height of the FBO will determine the amount
    // of particules. Ex: A 256x256 FBO will handle 65536 particles
    const width = 256;
    const height = 256;

    //populate a Float32Array of random positions
    const data = getRandomData(width, height, 256);
    //convertes it to a FloatTexture
    var positions = new DataTexture(data, width, height, RGBFormat, FloatType);
    positions.needsUpdate = true;

    //simulation shader used to update the particles' positions
    this.simulationMaterial = new ShaderMaterial({
      uniforms: { positions: { type: "t", value: positions } },
      vertexShader: simulationVertex,
      fragmentShader: simulationFragment,
    });

    //render shader to display the particles on screen
    //the 'positions' uniform will be set after the FBO.update() call
    this.renderMaterial = new ShaderMaterial({
      uniforms: {
        positions: { type: "t", value: null },
        pointSize: { type: "f", value: 2 },
      },
      vertexShader: renderVertex,
      fragmentShader: renderFragment,
    });

    //init the FBO
    this.FBO = new FBO({
      width,
      height,
      renderer: this.renderer,
      simulationMaterial: this.simulationMaterial,
      renderMaterial: this.renderMaterial,
    });
    this.scene.add(this.FBO.particles);

    this.setRendererSize();
    this.render();
  }

  initScene() {
    this.scene = new Scene();
  }

  initCamera() {
    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 100;
    new OrbitControls(this.camera, this.renderer.domElement);
  }

  initRenderer() {
    this.renderer = new WebGL1Renderer({
      canvas: document.getElementById("js-canvas"),
      antialias: true,
    });
    this.renderer.setClearColor(0x263339);
    window.addEventListener("resize", this.onResize);
  }

  onResize() {
    this.setRendererSize();
  }

  setRendererSize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    requestAnimationFrame(this.render);
    this.FBO.update(this.renderer);

    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }
}

export default App;
