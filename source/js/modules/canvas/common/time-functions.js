export const back = (x, timeFraction) => Math.pow(timeFraction, 2) * ((x + 1) * timeFraction - x);

export const bounce = (timeFraction) => {
  // eslint-disable-next-line no-unused-vars, no-constant-condition
  for (let a = 0, b = 1, result; 1; a += b, b /= 2) {
    if (timeFraction >= (7 - 4 * a) / 11) {
      return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2);
    }
  }
};

export const elastic = (x, timeFraction) => {
  return Math.pow(2, 10 * (timeFraction - 1)) * Math.cos(20 * Math.PI * x / 3 * timeFraction);
};

export const circ = (timeFraction) => 1 - Math.sin(Math.acos(timeFraction));

export const makeEaseOut = (func) => {
  return (timeFraction) => {
    return 1 - func(1 - timeFraction);
  };
};

export const makeEaseInOut = (func) => {
  return (timeFraction) => {
    if (timeFraction < 0.5) {
      return func(2 * timeFraction) / 2;
    } else {
      return (2 - func(2 * (1 - timeFraction))) / 2;
    }
  };
};
