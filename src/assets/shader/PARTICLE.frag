varying vec3 vUv;
uniform float opacity;
uniform vec3 colorDark;
uniform vec3 colorLight;

void main(){
  float dist = .5-length(vUv.xy - .5);
  float alpha = smoothstep(0.1,.3,dist);
  float param26 = (alpha) * smoothstep(0.,.3,sin(3.14*opacity));;
  vec4 param27 = vec4(mix(colorDark,colorLight,dist), param26*.5);
  gl_FragColor = param27;
}
