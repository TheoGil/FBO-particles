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
    /**
     * CHECK SUPPORT
     */
    const gl = renderer.getContext();

    //1 we need FLOAT Textures to store positions
    //https://github.com/KhronosGroup/WebGL/blob/master/sdk/tests/conformance/extensions/oes-texture-float.html
    if (!gl.getExtension("OES_texture_float")) {
      throw new Error("float textures not supported");
    }

    //2 we need to access textures from within the vertex shader
    //https://github.com/KhronosGroup/WebGL/blob/90ceaac0c4546b1aad634a6a5c4d2dfae9f4d124/conformance-suites/1.0.0/extra/webgl-info.html
    if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
      throw new Error("vertex shader cannot read textures");
    }

    /**
     * FBO SCENE SETUP
     */
    this.scene = new Scene();
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

    /**
     * FBO TEXTURE SETUP
     * The color of every of its pixel will be set by the "simulation fragment shader".
     * That texture will be passed as a uniform to the "render shaders"
     */
    this.renderTarget = new WebGLRenderTarget(width, height, {
      format: RGBAFormat, // Allow to store up to 4 data per pixel (on per channel)
      minFilter: NearestFilter, // important as we want to sample square pixels
      magFilter: NearestFilter, // important as we want to sample square pixels
      type: FloatType, // important as we need precise coordinates (not ints)
    });

    //5 the simulation:
    //create a bi-unit quadrilateral and uses the simulation material to update the Float Texture
    this.planeGeometry = new BufferGeometry();
    // prettier-ignore
    this.planeGeometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array([
        -1, -1, 0,
         1, -1, 0,
         1,  1, 0,
        -1, -1, 0,
         1,  1, 0,
        -1,  1, 0
    ]), 3)
    );
    this.planeGeometry.setAttribute(
      "uv",
      new BufferAttribute(
        new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]),
        2
      )
    );

    this.scene.add(new Mesh(this.planeGeometry, simulationMaterial));

    //6 the particles:
    //create a vertex buffer of size width * height with normalized coordinates
    const l = width * height;
    const vertices = new Float32Array(l * 3);
    for (var i = 0; i < l; i++) {
      let i3 = i * 3;
      vertices[i3] = (i % width) / width;
      vertices[i3 + 1] = i / width / height;
    }

    //create the particles geometry
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(vertices, 3));

    //the rendermaterial is used to render the particles
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
