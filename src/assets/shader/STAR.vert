uniform float time;
uniform vec3 range;

varying float vAlpha;
varying vec2 vUv;

attribute vec2 offset;
attribute vec3 rnd;

vec2 fun1(vec2 param1, float param2){
    float param5 = sin(param2);
    float param4 = cos(param2);
    float param7 = param5 * -1.;
    mat2 param8 = mat2(param4, param7, param5, param4);
    vec2 param10 = param8 * param1;
    return param10;
}

void main(){
  

  float now = fract(time*rnd.x+rnd.y);

  vUv = uv;
  vUv = vec2((vUv.y+floor(rnd.y*5.))/5.,vUv.x);

  vAlpha = smoothstep(0.,.5,sin(now*3.14))*rnd.z;
  float size = smoothstep(0.5,1.,sin(now*15.+rnd.z));
  vec3 newPosition = vec3(offset.x*range.x,offset.y*range.y+now*150., now*200.)+vec3(fun1(position.xy,now*15.)*rnd.z*size,0.);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition,1.)  ;
}
