export default (ratio, width, height) => {
  if (width / ratio > height) {
    return { x: width, y: width / ratio };
  }

  return { x: height * ratio, y: height};
}
