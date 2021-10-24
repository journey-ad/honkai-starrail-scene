uniform float time;
varying float vAlpha;
void main(){
  float angle = time*position.z+position.y;
  float x = sin(angle)*position.x;
  float y = cos(angle)*position.x;
  vAlpha = sin(angle*350.)*.3+.7;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(x,y,0.,1.);
  gl_PointSize = 3.;
}
