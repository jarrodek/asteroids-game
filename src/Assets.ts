import { ImageInfo } from "./types.js";

const asteroids: ImageInfo[] = [
  {
    src: 'assets/a1.png',
    width: 120,
    height: 121
  },
  {
    src: 'assets/a2.png',
    width: 120,
    height: 121
  },
  {
    src: 'assets/a3.png',
    width: 100,
    height: 72
  },
  {
    src: 'assets/a4.png',
    width: 120,
    height: 104
  },
];

function loadImage(info: ImageInfo): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image(info.width, info.height);
    img.onload = (): void => {
      resolve(img);
    };
    img.onerror = (): void => {
      reject(new Error(`Unable to load an image: ${info.src}`));
    };
    img.src = info.src;
  });
}

export function loadAsteroids(): Promise<HTMLImageElement[]> {
  const ps = asteroids.map(i => loadImage(i));
  return Promise.all(ps);
}
