export const textWaterfallVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;

uniform vec2 u_resolution;
uniform vec2 u_textSize;
uniform vec2 u_p0;
uniform vec2 u_p1;
uniform vec2 u_p2;
uniform vec2 u_p3;
uniform int u_layerCount;

out vec2 v_uv;
out float v_depth;

vec2 cubicBezier(float t, vec2 p0, vec2 p1, vec2 p2, vec2 p3) {
  float inv = 1.0 - t;
  return inv * inv * inv * p0 + 3.0 * inv * inv * t * p1 + 3.0 * inv * t * t * p2 + t * t * t * p3;
}

void main() {
  v_uv = a_uv;

  float denom = max(1.0, float(u_layerCount - 1));
  float depth = float(gl_InstanceID) / denom;
  float scale = mix(0.28, 1.18, depth * depth);
  vec2 curvePosition = cubicBezier(1.0 - depth, u_p0, u_p1, u_p2, u_p3);
  vec2 centered = (a_position - u_textSize * 0.5) * scale;
  vec2 worldPos = curvePosition + centered;

  v_depth = depth;
  gl_Position = vec4((worldPos.x / u_resolution.x) * 2.0 - 1.0, ((worldPos.y / u_resolution.y) * 2.0 - 1.0) * -1.0, 0.0, 1.0);
}
`;

export const textWaterfallFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_atlas;
uniform float u_pxRange;

in vec2 v_uv;
in float v_depth;
out vec4 outColor;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main() {
  vec3 msd = texture(u_atlas, v_uv).rgb;
  float sd = median(msd.r, msd.g, msd.b) - 0.5;
  float screenDistance = sd * u_pxRange;
  float fill = step(0.0, screenDistance);
  float outline = step(0.0, screenDistance) * step(screenDistance, 0.58);
  float alpha = max(fill, outline);

  if (alpha <= 0.01) {
    discard;
  }

  vec3 color = outline > 0.0 ? vec3(0.96, 0.98, 1.0) : vec3(0.0);
  outColor = vec4(color, alpha);
}
`;
