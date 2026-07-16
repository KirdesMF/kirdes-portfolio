export const charactersLinesRepelVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec4 a_corner;
layout(location = 1) in vec2 a_home;
layout(location = 2) in vec2 a_displacement;
layout(location = 3) in float a_glyphIndex;

uniform vec2 u_resolution;
uniform vec2 u_glyphSize;
uniform vec2 u_atlasGrid;

out vec2 v_uv;

void main() {
  float column = mod(a_glyphIndex, u_atlasGrid.x);
  float row = floor(a_glyphIndex / u_atlasGrid.x);
  vec2 atlasCell = vec2(column, row);
  float normalizedY = clamp(a_home.y / u_resolution.y, 0.0, 1.0);
  float curveT;
  float curveWeight;

  if (normalizedY <= 0.5) {
    curveT = normalizedY * 2.0;
    curveWeight = curveT + curveT * curveT - curveT * curveT * curveT;
  } else {
    curveT = (normalizedY - 0.5) * 2.0;
    curveWeight = 1.0 - 2.0 * curveT * curveT + curveT * curveT * curveT;
  }

  vec2 worldPosition = a_home + a_displacement * curveWeight + a_corner.xy * u_glyphSize;

  v_uv = vec2(
    (atlasCell.x + a_corner.z) / u_atlasGrid.x,
    1.0 - (atlasCell.y + a_corner.w) / u_atlasGrid.y
  );

  gl_Position = vec4(
    (worldPosition.x / u_resolution.x) * 2.0 - 1.0,
    ((worldPosition.y / u_resolution.y) * 2.0 - 1.0) * -1.0,
    0.0,
    1.0
  );
}
`;

export const charactersLinesPointVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;

uniform vec2 u_resolution;
uniform float u_pointSize;

void main() {
  gl_PointSize = u_pointSize;
  gl_Position = vec4(
    (a_position.x / u_resolution.x) * 2.0 - 1.0,
    ((a_position.y / u_resolution.y) * 2.0 - 1.0) * -1.0,
    0.0,
    1.0
  );
}
`;

export const charactersLinesPointFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  if (dot(centered, centered) > 0.25) {
    discard;
  }
  outColor = u_color;
}
`;

export const charactersLinesOverlayVertexShader = `#version 300 es
precision highp float;

void main() {
  vec2 position = gl_VertexID == 0
    ? vec2(-1.0, -1.0)
    : (gl_VertexID == 1 ? vec2(3.0, -1.0) : vec2(-1.0, 3.0));
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const charactersLinesOverlayFragmentShader = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_pointerActive;
uniform float u_radius;
uniform float u_dpr;
uniform float u_moireSpacing;
uniform float u_moireOffset;
uniform int u_mode;
uniform vec3 u_lineColor;
uniform vec3 u_circleColor;

out vec4 outColor;

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);

  if (u_mode == 0) {
    float lineWidth = max(1.0, u_dpr);
    float repeatedX = mod(pixel.x - u_moireOffset, u_moireSpacing);
    float lineDistance = min(repeatedX, u_moireSpacing - repeatedX);
    float coverage = 1.0 - smoothstep(lineWidth * 0.5, lineWidth * 0.5 + 1.0, lineDistance);

    if (coverage <= 0.01) {
      discard;
    }

    outColor = vec4(u_lineColor, coverage * 0.22);
    return;
  }

  if (u_pointerActive < 0.5) {
    discard;
  }

  vec2 delta = pixel - u_pointer;
  float ringDistance = abs(length(delta) - u_radius);
  float angle = atan(delta.y, delta.x) + 3.14159265359;
  float arcPosition = angle * u_radius;
  float dash = step(mod(arcPosition, 14.0 * u_dpr), 8.0 * u_dpr);
  float coverage = (1.0 - smoothstep(0.2 * u_dpr, 0.65 * u_dpr, ringDistance)) * dash;

  if (coverage <= 0.01) {
    discard;
  }

  outColor = vec4(u_circleColor, coverage * 0.7);
}
`;

export const charactersLinesRepelFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_atlas;
uniform vec4 u_color;

in vec2 v_uv;
out vec4 outColor;

void main() {
  float coverage = texture(u_atlas, v_uv).a;

  if (coverage <= 0.01) {
    discard;
  }

  outColor = vec4(u_color.rgb, u_color.a * coverage);
}
`;
