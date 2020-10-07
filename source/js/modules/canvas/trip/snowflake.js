import {
  animateProgress,
  tick,
  skewCtx,
} from '../common/helpers';

export default class Snowflake {
  constructor(props) {
    const {
      duration,
      ctx,
      position,
      skew,
      scale,
    } = props;

    this.duration = duration;
    this.ctx = ctx;

    this.snowflake = {
      src: `img/result__images--trip/snowflake.png`,
      width: 200,
      height: 200,
    };

    this.timePerFrame = 1000 / 25;

    this.initialPosition = position;
    this.skew = skew;
    this.scale = scale;

    this.positionAnimationRequest = null;
    this.maxOffset = 50;
    this.currentOffset = 0;
    this.offsetProgress = 0;

    this.opacity = 0;

    this.animatePosition = this.animatePosition.bind(this);
  }

  endAnimation() {
    this.positionAnimationRequest = null;
  }

  opacityAnimationTick(from, to) {
    return (progress) => {
      this.opacity = tick(from, to, progress);
    };
  }

  translateYAnimationTick() {
    this.currentOffset = 10 * Math.sin(this.offsetProgress) + this.maxOffset / 2;
    this.offsetProgress += 25;
  }

  animate() {
    animateProgress(this.opacityAnimationTick(0, 1), this.duration);
    this.positionAnimationRequest = requestAnimationFrame(this.animatePosition);
  }

  animatePosition(currentTime) {
    if (!this.lastFrameUpdateTime) {
      this.lastFrameUpdateTime = currentTime;
    }

    this.timePassedSinceLastUpdate = currentTime - this.lastFrameUpdateTime;

    if (this.timePassedSinceLastUpdate > this.timePerFrame) {
      this.lastFrameUpdateTime = currentTime;

      this.translateYAnimationTick();
    }

    if (this.positionAnimationRequest) {
      requestAnimationFrame(this.animatePosition);
    }
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.initialPosition.left, this.initialPosition.top - this.currentOffset);
    skewCtx(this.ctx, ...this.skew);
    this.ctx.scale(...this.scale);
    this.ctx.globalAlpha = this.opacity;
    this.ctx.drawImage(this.snowflake.img, 0, 0, this.snowflake.width, this.snowflake.height);
    this.ctx.restore();
  }

  prepareImage() {
    this.snowflake.img = new Image();
    this.snowflake.img.src = this.snowflake.src;
  }
}
