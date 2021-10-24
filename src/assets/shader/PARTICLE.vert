
uniform vec3 points[SEGMENT+1];
uniform float time;
attribute float id;

varying vec3 vUv;

void main(){
  const float numSegment = float(SEGMENT);
  float percent = id * numSegment;
  float scale = 1.+.5*sin(time + id*12.);
  vec3 start = points[int(percent)];

  vUv = vec3(uv,percent);

  vec3 newPosition = start+position*scale;//-C*position.y;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition,1.);
}
