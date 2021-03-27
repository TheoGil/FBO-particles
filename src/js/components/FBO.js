import {
  OrthographicCamera,
  Scene,
  NearestFilter,
  RGBAFormat,
  FloatType,
  WebGLRenderTarget,
  Mesh,
  BufferGeometry,
  BufferAttribute,
  Points,
  PlaneGeometry,
} from "three";

/**
 * What's going on :
 * - Here's a scene, containing a single plane, that uses an orthographic camera (no perspective)
 * - The plane fills up the entire camera "viewport"
 * - The plane uses a custom shader (called simulation shader) to set the RGB(A) values of its pixels
 * - This scene will not be rendered onto this HTML canvas but on a Texture (the Frame Buffer Object)
 *   that won't be displayed on screen.
 * - This class also generate a Points mesh, with as much vertices (=== particles) as Rendertexture contains pixels.
 * - The Points uses a custom shader (called render shader) that uses the RenderTexture as an uniform.
 */
export default class FBO {
  constructor({ width, height, renderer, simulationMaterial, renderMaterial }) {
    this.checkSupport(renderer);
    this.initScene();
    this.initCamera();
    this.initRenderTarget(width, height);
    this.initPlane(simulationMaterial);
    this.initParticles(width, height, renderMaterial);
  }

  initScene() {
    this.scene = new Scene();
  }

  initCamera() {
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);
  }

  checkSupport(renderer) {
    const gl = renderer.getContext();

    // we need FLOAT Textures to store positions
    //https://github.com/KhronosGroup/WebGL/blob/master/sdk/tests/conformance/extensions/oes-texture-float.html
    if (!gl.getExtension("OES_texture_float")) {
      throw new Error("float textures not supported");
    }

    // we need to access textures from within the vertex shader
    //https://github.com/KhronosGroup/WebGL/blob/90ceaac0c4546b1aad634a6a5c4d2dfae9f4d124/conformance-suites/1.0.0/extra/webgl-info.html
    if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
      throw new Error("vertex shader cannot read textures");
    }

    // Maximise portability by enabling extension explicitly
    gl.getExtension("WEBGL_color_buffer_float");
  }

  /**
   * FBO TEXTURE SETUP
   * The color of every of its pixel will be set by the "simulation fragment shader".
   * That texture will be passed as a uniform to the "render shaders"
   */
  initRenderTarget(width, height) {
    this.renderTarget = new WebGLRenderTarget(width, height, {
      format: RGBAFormat, // Allow to store up to 4 data per pixel (on per channel)
      minFilter: NearestFilter, // important as we want to sample square pixels
      magFilter: NearestFilter, // important as we want to sample square pixels
      type: FloatType, // important as we need precise coordinates (not ints)
    });
  }

  initPlane(simulationMaterial) {
    // //create a bi-unit quadrilateral and uses the simulation material to update the Float Texture
    // const geometry = new BufferGeometry();

    // // prettier-ignore
    // geometry.setAttribute(
    //   "position",
    //   new BufferAttribute(new Float32Array([
    //     -1, -1, 0,
    //      1, -1, 0,
    //      1,  1, 0,
    //     -1, -1, 0,
    //      1,  1, 0,
    //     -1,  1, 0
    // ]), 3));

    // geometry.setAttribute(
    //   "uv",
    //   new BufferAttribute(
    //     new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]),
    //     2
    //   )
    // );

    // Use 2 for the width and height because we want the vertices to range from -1 to 1
    const geometry = new PlaneGeometry(2, 2, 1, 1);

    this.plane = new Mesh(geometry, simulationMaterial);

    this.scene.add(this.plane);
  }

  initParticles(width, height, renderMaterial) {
    const l = width * height;
    const vertices = new Float32Array(l * 3);
    for (var i = 0; i < l; i++) {
      let i3 = i * 3;
      vertices[i3] = (i % width) / width;
      vertices[i3 + 1] = i / width / height;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(vertices, 3));

    this.particles = new Points(geometry, renderMaterial);
  }

  update(renderer) {
    //1 update the simulation and render the result in a target texture
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(this.scene, this.camera);

    //2 use the result of the swap as the new position for the particles' renderer
    this.particles.material.uniforms.positions.value = this.renderTarget.texture;
  }
}
