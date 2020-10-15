precision mediump float;

uniform sampler2D map;

struct optionsStruct {
  float hueShift;
  bool magnify;
};

uniform optionsStruct options;

struct bubble {
  float radius;
  vec2 position;
};

struct magnificationStruct {
  bubble bubbles[1];
  vec2 resolution;
};

uniform magnificationStruct magnification;

varying vec2 vUv;

vec3 hueShift(vec3 color, float hue) {
  const vec3 k = vec3(0.57735, 0.57735, 0.57735);
  float cosAngle = cos(hue);
  return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

vec4 magnify(sampler2D map, magnificationStruct magnification) {
  vec2 resolution = magnification.resolution;
  vec2 position = magnification.bubbles[0].position;

  float R = magnification.bubbles[0].radius;
  float h = 40.0;
  float hr = R * sqrt(1.0 - ((R - h) / R) * ((R - h) / R));

  vec2 xy = gl_FragCoord.xy - position;
  float r = sqrt(xy.x * xy.x + xy.y * xy.y);
  vec2 new_xy = r < hr ? xy * (R - h) / sqrt(R * R - r * r) : xy;

  return texture2D(map, (new_xy + position) / resolution);
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
    return texture2D(originalTexture, gl_FragCoord.xy / resolution.xy);
  }
}

void main() {
  vec4 texel = texture2D(map, vUv);
  vec4 result = texel;

  if (options.hueShift != 0.0) {
    vec3 hueShifted = hueShift(result.rgb, options.hueShift);

    result = vec4(hueShifted.rgb, 1);
  }

  if (options.magnify) {
    result = magnify1(map, magnification);
  }

  gl_FragColor = result;
}
