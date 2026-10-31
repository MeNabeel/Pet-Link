import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * CloudShader
 * Renders soft, organic, flowing WHITE clouds drifting smoothly across a sky-blue background.
 * Uses GPU fragment shaders with procedural fBm noise and an ultra-smooth 2D canvas fallback.
 * Strictly non-intrusive (pointer-events-none, contained inside the card).
 */
export const CloudShader = ({
  className,
  speed = 0.6,
  opacity = 0.45,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isRunning = true;
    let animationFrameId;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveSpeed = prefersReducedMotion ? 0 : speed;

    let gl = null;
    try {
      gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" }) ||
           canvas.getContext("experimental-webgl", { alpha: true });
    } catch {
      gl = null;
    }

    if (!gl) {
      // High-performance 2D procedural drifting white clouds fallback
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const clouds = [
        { x: -50, y: 35, r: 120, vx: 0.18, alpha: 0.45 },
        { x: 180, y: 70, r: 160, vx: 0.22, alpha: 0.4 },
        { x: 380, y: 40, r: 140, vx: 0.15, alpha: 0.5 },
        { x: 560, y: 90, r: 190, vx: 0.25, alpha: 0.35 },
        { x: 740, y: 55, r: 150, vx: 0.19, alpha: 0.42 },
      ];

      const render2DFallback = () => {
        if (!isRunning) return;
        const w = (canvas.width = canvas.parentElement?.clientWidth || 600);
        const h = (canvas.height = canvas.parentElement?.clientHeight || 260);

        ctx.clearRect(0, 0, w, h);

        clouds.forEach((cloud) => {
          cloud.x += cloud.vx * effectiveSpeed;
          if (cloud.x - cloud.r > w) cloud.x = -cloud.r;

          const grad = ctx.createRadialGradient(
            cloud.x, cloud.y, cloud.r * 0.15,
            cloud.x, cloud.y, cloud.r
          );
          grad.addColorStop(0, `rgba(255, 255, 255, ${cloud.alpha * opacity})`);
          grad.addColorStop(0.5, `rgba(255, 255, 255, ${cloud.alpha * 0.6 * opacity})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
          ctx.fill();
        });

        animationFrameId = requestAnimationFrame(render2DFallback);
      };

      animationFrameId = requestAnimationFrame(render2DFallback);
      return () => {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      };
    }

    // WebGL Shader setup: Pure Soft White Clouds with Billowing fBm
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_opacity;

      float hash(vec2 p) {
        p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
        return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
      }

      float noise(in vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      float fbm(in vec2 p) {
        float f = 0.0;
        mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        f += 0.5000 * noise(p); p = m * p;
        f += 0.2500 * noise(p); p = m * p;
        f += 0.1250 * noise(p); p = m * p;
        f += 0.0625 * noise(p);
        return f;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv.x *= u_resolution.x / u_resolution.y;

        // Smooth horizontal drift across the sky
        vec2 drift = vec2(u_time * 0.025, 0.0);

        // Billowing cloud structure
        vec2 q = vec2(fbm(uv * 1.5 + drift), fbm(uv * 1.5 + vec2(5.2, 1.3) + drift * 0.8));
        vec2 r = vec2(fbm(uv * 2.2 + 2.0 * q + vec2(1.7, 9.2) + drift * 0.5),
                      fbm(uv * 2.2 + 2.0 * q + vec2(8.3, 2.8) + drift * 0.6));
        float f = fbm(uv * 2.0 + 2.5 * r + drift * 0.4);

        // Soft white cloud puff distribution
        float cloudDensity = smoothstep(-0.15, 0.65, f);

        // Pure white color (#FFFFFF)
        vec3 whiteCloud = vec3(1.0, 1.0, 1.0);

        // Alpha calculation tuned for visible soft white clouds over sky blue
        float alpha = cloudDensity * u_opacity * 0.55;

        gl_FragColor = vec4(whiteCloud, alpha);
      }
    `;

    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const opacityLoc = gl.getUniformLocation(program, "u_opacity");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let startTime = performance.now();

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const render = (now) => {
      if (!isRunning) return;
      resize();

      const elapsed = (now - startTime) * 0.001 * effectiveSpeed;
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, elapsed);
      gl.uniform1f(opacityLoc, opacity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteBuffer(posBuffer);
        gl.deleteProgram(program);
      }
    };
  }, [speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "pointer-events-none absolute inset-0 z-0 h-full w-full rounded-[inherit]",
        className
      )}
      style={{
        mixBlendMode: "screen",
      }}
      aria-hidden="true"
    />
  );
};

export default CloudShader;
