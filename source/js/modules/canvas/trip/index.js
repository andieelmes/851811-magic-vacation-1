
import Plane from './plane';
import Walrus from './walrus';
import Snowflake from './snowflake';
import {animateDuration} from '../common/helpers';

const ANIMATION_DURATION = 1500;
const TOTAL_DURATION = 3000;
const CANVAS_DURATION_ID = `result__canvas--trip-duration`;
const CANVAS_INIFINITE_ID = `result__canvas--trip-infinite`;

let animate = true;

export const endAnimation = () => {
  animate = false;
};

const drawDuration = async () => {
  const canvasElement = document.getElementById(CANVAS_DURATION_ID);
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;

  const ctx = canvasElement.getContext(`2d`);

  const plane = new Plane({duration: ANIMATION_DURATION, ctx});
  plane.prepareImage();

  const walrus = new Walrus({duration: ANIMATION_DURATION, ctx});
  walrus.prepareImage();

  const render = () => {
    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    plane.draw();
    walrus.draw();

    ctx.restore();
  };

  walrus.animate();
  setTimeout(() => plane.animate(), ANIMATION_DURATION * 0.5);

  animateDuration(render, TOTAL_DURATION);
};

const drawInfinite = async () => {
  const canvasElement = document.getElementById(CANVAS_INIFINITE_ID);
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;

  const ctx = canvasElement.getContext(`2d`);

  const snowflakeLeft = new Snowflake({
    duration: ANIMATION_DURATION,
    ctx,
    position: {
      top: window.innerHeight / 2 + 20,
      left: window.innerWidth / 2 - 370,
    },
    skew: [-0.3, 0.3],
    scale: [1, 1],
  });
  snowflakeLeft.prepareImage();

  const snowflakeRight = new Snowflake({
    duration: ANIMATION_DURATION,
    ctx,
    position: {
      top: window.innerHeight / 2 + 80,
      left: window.innerWidth / 2 + 300,
    },
    skew: [0.3, -0.3],
    scale: [-0.7, 0.7],
  });
  snowflakeRight.prepareImage();

  const render = () => {
    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    snowflakeLeft.draw();
    snowflakeRight.draw();

    ctx.restore();

    if (animate) {
      requestAnimationFrame(render);
    }
  };

  setTimeout(() => snowflakeLeft.animate(), ANIMATION_DURATION * 0.7);
  setTimeout(() => snowflakeRight.animate(), ANIMATION_DURATION * 0.9);

  requestAnimationFrame(render);
};

export default async () => {
  drawDuration();
  drawInfinite();
};
