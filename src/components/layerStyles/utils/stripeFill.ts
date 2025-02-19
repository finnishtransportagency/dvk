import { Fill } from 'ol/style';

export function getStripeFill(color1: string, color2: string): Fill {
  const canvas = document.createElement('canvas');
  canvas.width = 50;
  canvas.height = 50;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const gradient = context.createLinearGradient(50, 0, 0, 50);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1 / 8, color1);
  gradient.addColorStop(1 / 8, color2);
  gradient.addColorStop(3 / 8, color2);
  gradient.addColorStop(3 / 8, color1);
  gradient.addColorStop(5 / 8, color1);
  gradient.addColorStop(5 / 8, color2);
  gradient.addColorStop(7 / 8, color2);
  gradient.addColorStop(7 / 8, color1);
  gradient.addColorStop(1, color1);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 50, 50);

  return new Fill({
    color: context.createPattern(canvas, 'repeat'),
  });
}
