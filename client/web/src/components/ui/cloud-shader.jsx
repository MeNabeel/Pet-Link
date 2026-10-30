import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * CloudShader
 * Aceternity UI WebGL shader background component.
 * Renders soft, procedural, drifting clouds using GPU fragment shaders.
 * Designed with low opacity, high performance, and safe fallback.
 */
export const CloudShader = ({
  className,
  speed = 0.5,
  opacity = 0.12,
  color = "#0066CC",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) {
      gl = canvas.getContext("experimental-webgl", { alpha: true });
    }

    let animationFrameId;
    let isRunning = true;

    if (!gl) {
      // Fallback: 2D subtle animated cloud gradient
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let offset = 0;
      const render2DFallback = () => {
        if (!isRunning) return;
        const width = (canvas.width = canvas.parentElement?.clientWidth || 300);
        const height = (canvas.height = canvas.parentElement?.clientHeight || 200);

        ctx.clearRect(0, 0, width, height);
        offset += 0.2 * speed;

        const gradient = ctx.createRadialGradient(
          (width / 2 + Math.sin(offset * 0.02) * 50),
          (height / 2 + Math.cos(offset * 0.02) * 20),
          20,
          width / 2,
          height / 2,
          width * 0.6
        );
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.15)");
        gradient.addColorStop(0.5, "rgba(0, 102, 204, 0.08)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        animationFrameId = requestAnimationFrame(render2DFallback);
      };

      animationFrameId = requestAnimationFrame(render2DFallback);
      return () => {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      };
    }

    // WebGL Shader setup
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;

      // 2D Random
      float random(in vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      // 2D Value Noise
      float noise(in vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      // Fractal Brownian Motion
      float fbm(in vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(st);
          st *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        st.x *= u_resolution.x / u_resolution.y;

        vec2 q = vec2(0.0);
        q.x = fbm(st + 0.02 * u_time);
        q.y = fbm(st + vec2(1.0));

        vec2 r = vec2(0.0);
        r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.015 * u_time);
        r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.0126 * u_time);

        float f = fbm(st + r);

        // Soft sky and subtle cloud color mapping in PetLink tones
        vec3 color = mix(
          vec3(0.0, 0.4, 0.8), // #0066CC
          vec3(0.4, 0.75, 0.98), // Sky blue
          clamp((f * f) * 4.0, 0.0, 1.0)
        );

        color = mix(
          color,
          vec3(1.0, 1.0, 1.0),
          clamp(length(q), 0.0, 1.0)
        );

        float alpha = smoothstep(0.15, 0.8, f) * 0.45;
        gl_FragColor = vec4(color, alpha);
      }
    `;

    const createShader = (gl, type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const positionAttributeLocation = gl.getAttribLocation(program, "position");
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    const timeUniformLocation = gl.getUniformLocation(program, "u_time");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const width = canvas.parentElement.clientWidth;
      const height = canvas.parentElement.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    window.addEventListener("resize", resize);
    resize();

    let startTime = performance.now();

    const render = (time) => {
      if (!isRunning) return;
      resize();

      const elapsed = (time - startTime) * 0.001 * speed;

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform1f(timeUniformLocation, elapsed);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [speed]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]",
        className
      )}
      style={{ opacity }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full block"
      />
    </div>
  );
};

export default CloudShader;

