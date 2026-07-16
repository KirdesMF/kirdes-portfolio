export const beadCurtainVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec4 a_corner;
layout(location = 1) in vec2 a_position;
layout(location = 2) in float a_glyphIndex;

uniform vec2 u_resolution;
uniform vec2 u_glyphSize;
uniform vec2 u_atlasGrid;

out vec2 v_uv;

void main() {
  float column = mod(a_glyphIndex, u_atlasGrid.x);
  float row = floor(a_glyphIndex / u_atlasGrid.x);
  vec2 worldPosition = a_position + a_corner.xy * u_glyphSize;

  v_uv = vec2(
    (column + a_corner.z) / u_atlasGrid.x,
    1.0 - (row + a_corner.w) / u_atlasGrid.y
  );

  gl_Position = vec4(
    (worldPosition.x / u_resolution.x) * 2.0 - 1.0,
    ((worldPosition.y / u_resolution.y) * 2.0 - 1.0) * -1.0,
    0.0,
    1.0
  );
}
`;

export const beadCurtainFragmentShader = `#version 300 es
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
