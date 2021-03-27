# ✨

Trying to wrap my head around the FBO technique following along [Nicolas Barradeau's FBO Particles blog post](http://barradeau.com/blog/?p=621).

## Stuff that changed in ThreeJS since the article was posted

- Use WebGL1Renderer, otherwise the WebGLRenderer that now uses WebGL2 by default, `gl.getExtension()` will always return `null` and and error will be thrown when we check for support.
- Within the FBO class update method, when updating the texture uniform value, don't set it to render texture object but use its `.texture` property instead. Like so :

  ```js
  // NOPE
  particles.material.uniforms.positions.value = rtt;

  // YEP
  particles.material.uniforms.positions.value = rtt.texture;
  ```

- update the `BufferGeometry.addAttribute` method to `BufferGeometry.setAttribute`. Syntax stays the same.
- Enable the `WEBGL_color_buffer_float` extension to maximise portability and get rid of warning.
  ```js
  gl.getExtension("WEBGL_color_buffer_float");
  ```
