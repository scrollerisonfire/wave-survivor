import { Texture } from 'pixi.js';
import { rnd } from './util';

type Draw = (g: CanvasRenderingContext2D) => void;

/** Draws a sprite with the raw HTML5 Canvas 2D API (origin at the centre) and wraps it as a Pixi texture. */
function make(w: number, h: number, draw: Draw): Texture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  g.translate(w / 2, h / 2);
  draw(g);
  return Texture.from(c);
}

function star(g: CanvasRenderingContext2D, spikes: number, outer: number, inner: number): void {
  g.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i * Math.PI) / spikes;
    const d = i % 2 ? inner : outer;
    g.lineTo(Math.cos(a) * d, Math.sin(a) * d);
  }
  g.closePath();
}

function diamond(g: CanvasRenderingContext2D, hw: number, hh: number): void {
  g.beginPath();
  g.moveTo(0, -hh);
  g.lineTo(hw, 0);
  g.lineTo(0, hh);
  g.lineTo(-hw, 0);
  g.closePath();
}

export function createTextures() {
  return {
    ship: make(40, 40, (g) => {
      g.shadowColor = '#38e8ff';
      g.shadowBlur = 8;
      g.fillStyle = '#38e8ff';
      g.beginPath();
      g.moveTo(16, 0);
      g.lineTo(-12, -12);
      g.lineTo(-6, 0);
      g.lineTo(-12, 12);
      g.closePath();
      g.fill();
      g.fillStyle = '#fff';
      g.fillRect(-2, -2, 6, 4);
    }),
    sw: make(28, 28, (g) => {
      g.fillStyle = '#ff4fa3';
      star(g, 5, 13, 7);
      g.fill();
      g.fillStyle = '#2a0818';
      g.beginPath();
      g.arc(0, 0, 3, 0, 7);
      g.fill();
    }),
    da: make(26, 26, (g) => {
      g.fillStyle = '#a77bff';
      diamond(g, 9, 12);
      g.fill();
      g.fillStyle = '#1b1040';
      g.fillRect(-2, -3, 4, 6);
    }),
    ta: make(44, 44, (g) => {
      g.fillStyle = '#ffc94a';
      star(g, 6, 20, 16);
      g.fill();
      g.fillStyle = '#4a3200';
      star(g, 6, 11, 9);
      g.fill();
    }),
    bullet: make(16, 8, (g) => {
      g.shadowColor = '#ffe27a';
      g.shadowBlur = 6;
      g.fillStyle = '#ffe27a';
      g.fillRect(-6, -2, 12, 4);
    }),
    gem: make(14, 14, (g) => {
      g.fillStyle = '#38e8ff';
      diamond(g, 5, 6);
      g.fill();
    }),
    puff: make(16, 16, (g) => {
      const r = g.createRadialGradient(0, 0, 0, 0, 0, 8);
      r.addColorStop(0, '#fff');
      r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r;
      g.fillRect(-8, -8, 16, 16);
    }),
    stars: (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 512;
      const g = c.getContext('2d') as CanvasRenderingContext2D;
      for (let i = 0; i < 110; i++) {
        g.globalAlpha = rnd(0.15, 0.8);
        g.fillStyle = Math.random() < 0.2 ? '#7fb4ff' : '#fff';
        const s = Math.random() < 0.1 ? 2 : 1;
        g.fillRect(rnd(0, 512), rnd(0, 512), s, s);
      }
      return Texture.from(c);
    })(),
  };
}

export type Textures = ReturnType<typeof createTextures>;
