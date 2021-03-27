uniform sampler2D positions; // Data texture containing original positions

varying vec2 vUv;

void main() {
    vec3 pos = texture2D(positions, vUv).rgb;

    gl_FragColor = vec4(pos, 1.0);
}