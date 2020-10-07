export const tick = (from, to, progress) => from + progress * (to - from);

export const rotateCtx = (ctx, angle, cx, cy) => {
  ctx.translate(cx, cy);
  ctx.rotate((Math.PI / 180) * angle);
  ctx.translate(-cx, -cy);
};

export const rotateCoords = (cx, cy, x, y, angle) => {
  const newX = (x - cx) * Math.cos(angle * Math.PI / 180) - (y - cy) * Math.sin(angle * Math.PI / 180) + cx;
  const newY = (x - cx) * Math.sin(angle * Math.PI / 180) + (y - cy) * Math.cos(angle * Math.PI / 180) + cy;
  return {x: newX, y: newY};
};

export const skewCtx = (ctx, x, y) => {
  ctx.transform(1, x, y, 1, 0, 0);
};

export const animateDuration = (render, duration) => new Promise((resolve) => {
  let start = Date.now();
  (function loop() {
    let p = Date.now() - start;
    if (p > duration) {
      render(duration);
      resolve(true);
    } else {
      requestAnimationFrame(loop);
      render(p);
    }
  }());
});

export const animateProgress = (render, duration) => new Promise((resolve) => {
  let start = Date.now();
  (function loop() {
    let p = (Date.now() - start) / duration;
    if (p > 1) {
      render(1);
      resolve(true);
    } else {
      requestAnimationFrame(loop);
      render(p);
    }
  }());
});

export const animateEasing = (render, duration, easing) => new Promise((resolve) => {
  let start = Date.now();
  (function loop() {
    let p = (Date.now() - start) / duration;
    if (p > 1) {
      render(1);
      resolve(true);
    } else {
      requestAnimationFrame(loop);
      render(easing(p));
    }
  }());
});

export const runSerial = async (tasks) => {
  let result = Promise.resolve();
  tasks.forEach((task) => {
    result = result.then(task);
  });
  return result;
};
