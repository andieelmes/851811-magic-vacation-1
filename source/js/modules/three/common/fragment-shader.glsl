precision mediump float;

uniform sampler2D map;

struct optionsStruct {
  float hueShift;
  bool magnify;
};

uniform optionsStruct options;

struct bubbleStruct {
  float radius;
  vec2 position;
};

struct magnificationStruct {
  bubbleStruct bubbles[3];
  vec2 resolution;
};

uniform magnificationStruct magnification;

varying vec2 vUv;

vec3 hueShift(vec3 color, float hue) {
  const vec3 k = vec3(0.57735);
  float cosAngle = cos(hue);
  return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

float getOffset(vec2 point, vec2 circle) {
  return sqrt(pow(point.x - circle.x, 2.0) + pow(point.y - circle.y, 2.0));
}

bool isCurrentBubble(vec2 point, vec2 circle, float radius, float outlineThickness) {
  float offset = getOffset(point, circle);
  return offset < radius + outlineThickness;
}


bool isInsideTheCircle(vec2 point, vec2 circle, float radius) {
  float offset = getOffset(point, circle);
  return offset < radius;
}

bool isOutlineOfTheCircle(vec2 point, vec2 circle, float radius, float outlineThickness) {
  float offset = getOffset(point, circle);
  return floor(offset) >= floor(radius) && floor(offset) <= floor(radius + outlineThickness);
}

vec4 blendOutline(vec4 texture, vec4 outline) {
  return vec4(mix(texture.rgb, outline.rgb, outline.a), texture.a);
}

vec4 magnify(sampler2D map, magnificationStruct magnification) {
  float outlineThickness = 3.0;
  vec4 outlineColor = vec4(1, 1, 1, 0.5);

  vec2 resolution = magnification.resolution;
  bubbleStruct bubble = magnification.bubbles[0];
  vec2 point = gl_FragCoord.xy;

  for (int index = 0; index < 3; index++) {
    bubbleStruct currentBubble = magnification.bubbles[index];

    vec2 currentPosition = currentBubble.position;
    float currentRadius = currentBubble.radius;

    if (isCurrentBubble(point, currentPosition, currentRadius, outlineThickness)) {
      bubble = currentBubble;
    }
  }

  vec2 position = bubble.position;
  float radius = bubble.radius;
  float h = bubble.radius / 2.0;

  float hr = radius * sqrt(1.0 - pow((radius - h) / radius, 2.0));
  float offset = sqrt(pow(point.x - position.x, 2.0) + pow(point.y - position.y, 2.0));

  bool pointIsInside = isInsideTheCircle(point, position, hr);
  bool pointIsOutline = isOutlineOfTheCircle(point, position, hr, outlineThickness);

  vec2 newPoint = pointIsInside ? (point - position) * (radius - h) / sqrt(pow(radius, 2.0) - pow(offset, 2.0)) + position : point;

  vec2 oldResolution = point / vUv;
  vec2 newVUv = (newPoint) / resolution;

  if (pointIsOutline) {
    return blendOutline(texture2D(map, newVUv), outlineColor);
  }

  return texture2D(map, newVUv);
}

void main() {
  vec4 result = texture2D(map, vUv);

  if (options.magnify) {
    result = magnify(map, magnification);
  }

  vec3 hueShifted = hueShift(result.rgb, options.hueShift);
  result = vec4(hueShifted.rgb, 1);

  gl_FragColor = result;
}
