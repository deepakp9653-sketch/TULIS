'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LiquidShaderGradientProps {
  className?: string;
}

export const LiquidShaderGradient: React.FC<LiquidShaderGradientProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    const getWidth = () => container.clientWidth || window.innerWidth || 800;
    const getHeight = () => container.clientHeight || window.innerHeight || 600;

    let width = getWidth();
    let height = getHeight();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // GLSL Custom Luminous Liquid Glass Gradient Shader
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      varying vec2 vUv;

      // Simplex noise / fluid curl
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = vUv;
        float time = uTime * 0.22;

        // Multi-frequency organic liquid fluid distortion
        float n1 = snoise(uv * 1.8 + vec2(time * 0.25, time * 0.18));
        float n2 = snoise(uv * 2.8 - vec2(n1 * 0.6, time * 0.32));
        float n3 = snoise(uv * 1.2 + vec2(n2 * 0.4, time * 0.12));

        // Locked FinTech Sage/Forest Palette (#12160F baseline, #3E7D5A, #5FA97D accent)
        vec3 cDark = vec3(0.07, 0.086, 0.059);          // #12160F baseline
        vec3 cForest = vec3(0.243, 0.490, 0.353);       // #3E7D5A accent start
        vec3 cSage = vec3(0.373, 0.663, 0.490);         // #5FA97D accent end

        // Soft, organic blending with low intensity
        vec3 color = mix(cDark, cForest, smoothstep(-0.5, 0.8, n1));
        color = mix(color, cSage, smoothstep(-0.3, 0.7, n2) * 0.45);

        // Soft radial fade with moderate opacity (max ~0.22)
        vec2 center = uv - vec2(0.5, 0.45);
        float dist = length(center);
        float alpha = smoothstep(0.9, 0.1, dist) * 0.22;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation Loop with performance.now()
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      uniforms.uTime.value = (performance.now() - startTime) * 0.001;
      renderer.render(scene, camera);
    };
    animate();

    // High-precision ResizeObserver for instant adaptation to container size
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width > 0 && cr.height > 0) {
          renderer.setSize(cr.width, cr.height);
          uniforms.uResolution.value.set(cr.width, cr.height);
        }
      }
    });
    resizeObserver.observe(container);

    // Subtle interactive mouse ripple
    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      uniforms.uMouse.value.set(x, y);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};
