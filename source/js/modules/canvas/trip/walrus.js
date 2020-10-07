import {
  animateEasing,
  animateProgress,
  rotateCtx,
  tick
} from '../common/helpers';
import {bounce, makeEaseOut} from '../common/time-functions';

export default class Walrus {
  constructor({duration, ctx}) {
    this.duration = duration;
    this.ctx = ctx;

    this.walrus = {
      src: `img/result__images--trip/sea-calf.png`,
      width: 400,
      height: 400,
    };

    this.ice = {
      src: `img/result__images--trip/ice.png`,
      width: 408,
      height: 167,
    };

    this.initialPosition = {
      top: window.innerHeight,
      left: window.innerWidth / 2 - this.walrus.width / 2,
    };
    this.finalPosition = {
      top: window.innerHeight / 2 - this.walrus.height / 2 + 100,
      left: window.innerWidth / 2 - this.walrus.width / 2,
    };

    this.translateY = 0;
    this.angle = 30;
  }

  getCenter() {
    return {x: this.finalPosition.left + (this.walrus.width / 2), y: this.translateY + (this.walrus.height / 2)};
  }

  translateYAnimationTick(from, to) {
    return (progress) => {
      this.translateY = tick(from, to, progress);
    };
  }

  rotateAnimationTick(from, to) {
    return (progress) => {
      this.angle = tick(from, to, progress);
    };
  }

  animate() {
    animateProgress(this.translateYAnimationTick(this.initialPosition.top, this.finalPosition.top), this.duration);
    setTimeout(() => {
      animateEasing(this.rotateAnimationTick(30, 0), this.duration * 0.6, makeEaseOut(bounce));
    }, this.duration * 0.4);
  }

  draw() {
    this.ctx.save();
    const {x, y} = this.getCenter();
    rotateCtx(this.ctx, this.angle, x, y);
    this.ctx.translate(this.finalPosition.left, this.translateY);
    this.ctx.drawImage(this.ice.img, 0, 180, this.ice.width, this.ice.height);
    this.ctx.drawImage(this.walrus.img, 0, 0, this.walrus.width, this.walrus.height);
    this.ctx.restore();
  }

  prepareImage() {
    this.walrus.img = new Image();
    this.walrus.img.src = this.walrus.src;

    this.ice.img = new Image();
    this.ice.img.src = this.ice.src;
  }
}
