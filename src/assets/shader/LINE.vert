uniform vec3 points[SEGMENT+1];
varying vec3 vUv;
varying vec3 vNormal;

void main(){

  const float numSegment = float(SEGMENT);
  float percent = uv.y * numSegment;
  vec3 start = points[int(percent)];

  vUv = vec3(uv, percent);

  vec3 newPosition = start;//-C*position.y;

  vec4 mvPosition = modelViewMatrix * vec4(newPosition,1.);

  mvPosition.xy += position.xy;

  vNormal = normalMatrix * normal;
  
  gl_Position = projectionMatrix * mvPosition;
}
