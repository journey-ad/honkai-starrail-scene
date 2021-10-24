attribute vec3 start;
attribute vec3 end;
attribute vec3 rnd;

uniform vec3 bezierPos[NUM_SEGMENT];

uniform float time;
uniform float progress;
uniform float ending;

varying float vAlpha;
varying vec2 vUv;

vec3 quadraticBezier(vec3 a,vec3 b,vec3 c,float t){
  float s = 1.-t;
  vec3 q = s*s*a+2.*s*t*b+t*t*c;
  return q;
}

vec2 fun1(vec2 param1, float param2){
    float param5 = sin(param2);
    float param4 = cos(param2);
    float param7 = param5 * -1.;
    mat2 param8 = mat2(param4, param7, param5, param4);
    vec2 param10 = param8 * param1;
    return param10;
}


void main(){
 
  const float numSegment = float(NUM_SEGMENT)-2.;

  float nowTime = fract(time*rnd.x+start.y);

  int i0 = int(nowTime*numSegment);
  int i1 = i0+1;
  int i2 = i0+2;

  float p0 = float(i0)/numSegment;				
	vec3 sp = mix(bezierPos[i0],bezierPos[i1],.5);
	vec3 ep = mix(bezierPos[i1],bezierPos[i2],.5);
	vec3 np = quadraticBezier(sp,bezierPos[i1],ep,(nowTime-p0)*numSegment);

  vec3 newPosition = np + +vec3(fun1(position.xy,nowTime*15.)*rnd.z,0.)+mix(start,end,sin(nowTime*6.)*.5+.5)*mix(.2,1.5,smoothstep(.3,1.,nowTime+rnd.y));

  
  vUv = fun1(uv - .5, start.z+nowTime)+.5;
  vUv = vec2((vUv.y+floor(rnd.y*5.))/5.,vUv.x);
  vAlpha = smoothstep(0.,.1,sin(nowTime*3.14))*rnd.z*(1.-smoothstep(progress-.3,progress,nowTime))*(smoothstep(ending-.3,ending,nowTime));

  vec4 mvPosition = modelViewMatrix * vec4(newPosition,1.);
  gl_Position = projectionMatrix * mvPosition;
}
