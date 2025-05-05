const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float u_time;
    uniform sampler2D u_texture;
    varying vec2 vUv;

    void main() {
        vec2 uv = vUv;
        uv.y += sin(uv.x * 10.0 + u_time) * 0.1;
        gl_FragColor = texture2D(u_texture, uv);
    }
`;

document.getElementById("vertexShader").textContent = vertexShader;
document.getElementById("fragmentShader").textContent = fragmentShader;
