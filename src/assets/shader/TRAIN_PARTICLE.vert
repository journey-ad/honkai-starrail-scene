attribute vec3 start;
attribute vec3 ctrl;
attribute vec3 end;
attribute vec3 rnd;

uniform float time;

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

mat3 LookAt(vec3 origin, vec3 target) {
		const vec3 rr = vec3(1., 0.,1.);
		vec3 ww = normalize(target - origin);
		vec3 uu = normalize(cross(ww, rr));
		vec3 vv = normalize(cross(uu, ww));		
		return mat3(uu, vv, ww);
}

vec3 getPos(float now){
 
  vec3 nowPnt = quadraticBezier(start,ctrl,end,now);
  nowPnt.y += sin(now*rnd.z*12.+start.x)*start.z;
  return nowPnt;
}

void main(){
  float nowTime = fract(time*rnd.x+rnd.y);
  vec3 nowPnt = getPos(nowTime);
  float nextTime = fract((time+.1)*rnd.x+rnd.y);
  vec3 nextPnt = getPos(nextTime);
  mat3 rotation = LookAt(nowPnt,nextPnt);


  vUv = fun1(uv - .5, start.z+nowTime)+.5;
  vUv = vec2((vUv.y+floor(rnd.y*5.))/5.,vUv.x);

  float scale = smoothstep(0.1,.6,1.-nowTime);
  vAlpha = rnd.z*smoothstep(0.,.1,sin(nowTime*3.14))*scale;
  vec3 scaledPosition = position*rnd.z*(.8+.2*sin(time*rnd.y*14.+start.z));
  vec3 newPosition = -nowPnt.zxy+rotation*scaledPosition;

  vec4 mvPosition = modelViewMatrix * vec4(newPosition,1.);
  gl_Position = projectionMatrix * mvPosition;
}
