'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ChromaKeyVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  threshold?: number;
  smoothing?: number;
  spillThreshold?: number;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  ariaLabel?: string;
}

export const ChromaKeyVideo: React.FC<ChromaKeyVideoProps> = ({
  src,
  className = '',
  style = {},
  threshold = 0.15,
  smoothing = 0.10,
  spillThreshold = 0.18,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  ariaLabel = 'TULIS Animation',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [, setWebglSupported] = useState(true);

  const isVisibleRef = useRef(false);
  const animIdRef = useRef<number>(0);
  const videoCallbackIdRef = useRef<number>(0);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!video || !canvas || !container) return;

    let gl: WebGLRenderingContext | null = null;
    let ctx2d: CanvasRenderingContext2D | null = null;
    let texture: WebGLTexture | null = null;
    let program: WebGLProgram | null = null;
    let vs: WebGLShader | null = null;
    let fs: WebGLShader | null = null;
    let posBuffer: WebGLBuffer | null = null;
    let texBuffer: WebGLBuffer | null = null;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Try WebGL initialization
    try {
      gl =
        canvas.getContext('webgl', {
          alpha: true,
          premultipliedAlpha: false,
          antialias: true,
          powerPreference: 'high-performance',
        }) ||
        (canvas.getContext('experimental-webgl', {
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: 'high-performance',
        }) as WebGLRenderingContext | null);
    } catch {
      gl = null;
    }

    if (gl) {
      // Vertex Shader
      const vsSource = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = a_texCoord;
        }
      `;

      // Fragment Shader with production-grade Chroma Key and green spill suppression
      const fsSource = `
        precision mediump float;
        uniform sampler2D u_video;
        uniform float u_threshold;
        uniform float u_smoothing;
        uniform float u_spill;
        varying vec2 v_texCoord;

        void main() {
          vec4 color = texture2D(u_video, v_texCoord);
          
          float maxRB = max(color.r, color.b);
          float diff = color.g - maxRB;
          
          float alpha = 1.0 - smoothstep(u_threshold, u_threshold + u_smoothing, diff);
          
          if (diff > u_spill) {
            float spillFactor = smoothstep(u_spill, u_threshold, diff);
            color.g = mix(color.g, maxRB, spillFactor);
          }
          
          gl_FragColor = vec4(color.rgb, color.a * alpha);
        }
      `;

      const createShader = (type: number, source: string) => {
        if (!gl) return null;
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      vs = createShader(gl.VERTEX_SHADER, vsSource);
      fs = createShader(gl.FRAGMENT_SHADER, fsSource);

      if (vs && fs) {
        program = gl.createProgram();
        if (program) {
          gl.attachShader(program, vs);
          gl.attachShader(program, fs);
          gl.linkProgram(program);

          if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program);

            posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.bufferData(
              gl.ARRAY_BUFFER,
              new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
              gl.STATIC_DRAW
            );

            const posLoc = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

            texBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
            gl.bufferData(
              gl.ARRAY_BUFFER,
              new Float32Array([0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0]),
              gl.STATIC_DRAW
            );

            const texLoc = gl.getAttribLocation(program, 'a_texCoord');
            gl.enableVertexAttribArray(texLoc);
            gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

            const thresholdLoc = gl.getUniformLocation(program, 'u_threshold');
            const smoothingLoc = gl.getUniformLocation(program, 'u_smoothing');
            const spillLoc = gl.getUniformLocation(program, 'u_spill');
            gl.uniform1f(thresholdLoc, threshold);
            gl.uniform1f(smoothingLoc, smoothing);
            gl.uniform1f(spillLoc, spillThreshold);

            texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          }
        }
      }
    } else {
      setWebglSupported(false);
      ctx2d = canvas.getContext('2d');
    }

    const hasVideoFrameCallback =
      typeof (video as any).requestVideoFrameCallback === 'function';

    const drawFrame = () => {
      if (!video || video.readyState < 2) return;

      const targetW = video.videoWidth || 960;
      const targetH = video.videoHeight || 540;

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        if (gl) {
          gl.viewport(0, 0, targetW, targetH);
        }
        if (!isLoadedRef.current) {
          isLoadedRef.current = true;
          setIsLoaded(true);
        }
      }

      if (gl && program && texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (!isLoadedRef.current) {
          isLoadedRef.current = true;
          setIsLoaded(true);
        }
      } else if (ctx2d) {
        ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx2d.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const thresh255 = threshold * 255;
        const smooth255 = smoothing * 255;
        const spill255 = spillThreshold * 255;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const maxRB = r > b ? r : b;
          const diff = g - maxRB;

          if (diff > thresh255 + smooth255) {
            data[i + 3] = 0;
          } else if (diff > thresh255) {
            const factor = 1 - (diff - thresh255) / smooth255;
            data[i + 3] = Math.round(data[i + 3] * factor);
            data[i + 1] = maxRB;
          } else if (diff > spill255) {
            const spillFactor = (diff - spill255) / Math.max(1, thresh255 - spill255);
            data[i + 1] = Math.round(g * (1 - spillFactor) + maxRB * spillFactor);
          }
        }
        ctx2d.putImageData(imgData, 0, 0);
        if (!isLoadedRef.current) {
          isLoadedRef.current = true;
          setIsLoaded(true);
        }
      }
    };

    const render = () => {
      if (!isVisibleRef.current) {
        animIdRef.current = 0;
        return;
      }

      drawFrame();

      if (!prefersReducedMotion || !isLoadedRef.current) {
        if (hasVideoFrameCallback && !video.paused) {
          videoCallbackIdRef.current = (video as any).requestVideoFrameCallback(() => {
            render();
          });
        } else {
          animIdRef.current = requestAnimationFrame(render);
        }
      } else {
        animIdRef.current = 0;
      }
    };

    const startRendering = () => {
      if (hasVideoFrameCallback) {
        if (!videoCallbackIdRef.current && !video.paused) {
          videoCallbackIdRef.current = (video as any).requestVideoFrameCallback(() => {
            render();
          });
        } else if (!animIdRef.current) {
          animIdRef.current = requestAnimationFrame(render);
        }
      } else if (!animIdRef.current) {
        animIdRef.current = requestAnimationFrame(render);
      }
    };

    const stopRendering = () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
        animIdRef.current = 0;
      }
      if (videoCallbackIdRef.current && hasVideoFrameCallback) {
        (video as any).cancelVideoFrameCallback(videoCallbackIdRef.current);
        videoCallbackIdRef.current = 0;
      }
    };

    const handleVideoReady = () => {
      if (!isLoadedRef.current) {
        isLoadedRef.current = true;
        setIsLoaded(true);
      }
      drawFrame();
      if (isVisibleRef.current && autoPlay && video.paused) {
        video.play().catch(() => {});
      }
      startRendering();
    };

    video.addEventListener('loadeddata', handleVideoReady);
    video.addEventListener('canplay', handleVideoReady);
    video.addEventListener('play', startRendering);

    if (video.readyState >= 2) {
      handleVideoReady();
    }

    // High-performance IntersectionObserver with generous rootMargin:
    // Primes and plays the video 400px before scrolling into viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting;
        isVisibleRef.current = intersecting;

        if (intersecting) {
          if (autoPlay && video.paused) {
            video.play().catch(() => {});
          }
          startRendering();
        } else {
          if (!video.paused) {
            video.pause();
          }
          stopRendering();
        }
      },
      {
        rootMargin: '400px 0px 400px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      stopRendering();
      video.removeEventListener('loadeddata', handleVideoReady);
      video.removeEventListener('canplay', handleVideoReady);
      video.removeEventListener('play', startRendering);

      // Clean GPU memory
      if (gl) {
        if (texture) gl.deleteTexture(texture);
        if (posBuffer) gl.deleteBuffer(posBuffer);
        if (texBuffer) gl.deleteBuffer(texBuffer);
        if (program) {
          if (vs) gl.deleteShader(vs);
          if (fs) gl.deleteShader(fs);
          gl.deleteProgram(program);
        }
      }
    };
  }, [src, threshold, smoothing, spillThreshold, autoPlay]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block overflow-hidden ${className}`}
      style={style}
    >
      {/* 
        Source video element:
        Kept in layout with absolute 1px opacity-0 so browser decoders NEVER throttle it (unlike display:none / hidden)
        preload="auto" ensures initial keyframes are instantly available without scroll buffering lag.
      */}
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        crossOrigin="anonymous"
        preload="auto"
        className="absolute top-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none -z-50"
        aria-hidden="true"
      />

      {/* Hardware-accelerated canvas with green screen completely removed */}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={ariaLabel}
        className="w-full h-full object-contain pointer-events-none select-none transition-opacity duration-200"
        style={{
          opacity: isLoaded ? 1 : 0,
        }}
      />
    </div>
  );
};
