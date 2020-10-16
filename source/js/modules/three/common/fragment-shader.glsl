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
  bubbleStruct bubbles[2];
  vec2 resolution;
};

uniform magnificationStruct magnification;

varying vec2 vUv;

vec3 hueShift(vec3 color, float hue) {
  const vec3 k = vec3(0.57735, 0.57735, 0.57735);
  float cosAngle = cos(hue);
  return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

float getOffset(vec2 point, vec2 circle) {
  return sqrt(pow(point.x - circle.x, 2.0) + pow(point.y - circle.y, 2.0));
}

bool isInsideTheCircle(vec2 point, vec2 circle, float radius) {
  float offset = getOffset(point, circle);
  return offset < radius;
}

bool isOutlineOfTheCircle(vec2 point, vec2 circle, float radius, float outlineThickness) {
  float offset = getOffset(point, circle);
  return floor(offset) >= floor(radius) && floor(offset) <= floor(radius + outlineThickness);
}

vec4 magnify(sampler2D map, magnificationStruct magnification) {
  float outlineThickness = 2.0;
  vec3 outlineColor = vec3(255.0, 255.0, 255.0);
  float AA_RANGE = 2.0;

  vec2 resolution = magnification.resolution;

  const int currentBubbleIndex = 0;

  // for (int index = 0; index < magnification.bubbles.length(); index++) {
  //   bubbleStruct currentBubble = magnification.bubbles[index];
  //   vec2 currentPosition = currentBubble.position;
  //   float R = bubble.radius;
  //   vec2 offset = gl_FragCoord - currentPosition;

  //   // if (gl_FragCoord.x > currentPosition.x && gl_FragCoord.y > currentPosition.y && gl_FragCoord.x + radius < )
  // }

  vec2 position = magnification.bubbles[currentBubbleIndex].position;

  float R = magnification.bubbles[currentBubbleIndex].radius;
  float h = 40.0;
  float hr = R * sqrt(1.0 - ((R - h) / R) * ((R - h) / R));

  // for (int index = 0; i < magnification.bubbles.length; index++) {
  // }

  vec2 xy = gl_FragCoord.xy;
  float offset = sqrt(pow(xy.x - position.x, 2.0) + pow(xy.y - position.y, 2.0));

  bool pointIsInside = isInsideTheCircle(xy, position, hr);
  bool pointIsOutline = isOutlineOfTheCircle(xy, position, hr, outlineThickness);

  vec2 newXy = pointIsInside ? (xy - position) * (R - h) / sqrt(pow(R, 2.0) - pow(offset, 2.0)) + position : xy;

  vec2 oldResolution = xy / vUv;
  vec2 newVUv = (newXy) / resolution;

  if (pointIsOutline) {
    return mix(texture2D(map, newVUv), vec4(outlineColor, 1.0), 1.0);
  }

  return texture2D(map, newVUv);
}

vec4 magnify1(sampler2D originalTexture, magnificationStruct magnification) {
  float exp = 30.0;
  float zoom = 2.0;
  float outlineThickness = 4.0;
  float AA_RANGE = 2.0;
  vec3 outlineColor = vec3(255.0, 255.0, 255.0);

  vec2 resolution = magnification.resolution;
  vec2 position = magnification.bubbles[0].position;
  float radius = magnification.bubbles[0].radius;

  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 pos_uv = position / resolution;

  float dist = distance(gl_FragCoord.xy, position);

  float z;
  vec2 p;

  if (dist < radius) {
      // https://www.wolframalpha.com/input/?i=plot+1.0+-+(pow(x+%2F+r,+e)+*+(1.0+-+(1.0+%2F+(z))))
      z = 1.0 - (pow(dist / radius, exp) * (1.0 - (1.0 / (zoom))));
      p = ((uv - pos_uv) / z) + pos_uv;
      return vec4(vec3(texture2D(originalTexture, p)), 1.0);
  } else if (dist <= radius + outlineThickness) {
      float w = outlineThickness / 2.0;
      float alpha = smoothstep(0.0, AA_RANGE, dist - radius) - smoothstep(outlineThickness - AA_RANGE, outlineThickness, dist - radius);

      if (dist <= radius + outlineThickness / 2.0) {
          // Inside outline.
          return mix(texture2D(originalTexture, uv), vec4(outlineColor, 1.0), alpha);
      } else {
          // Outside outline.
          return mix(texture2D(originalTexture, gl_FragCoord.xy / resolution.xy), vec4(outlineColor, 1.0), alpha);
      }
  } else {
    return texture2D(originalTexture, vUv);
  }
}

void main() {
  vec4 result = texture2D(map, vUv);

  if (options.magnify) {
    result = magnify(map, magnification);
  }

  if (options.hueShift != 0.0) {
    vec3 hueShifted = hueShift(result.rgb, options.hueShift);

    result = vec4(hueShifted.rgb, 1);
  }

  gl_FragColor = result;
}
