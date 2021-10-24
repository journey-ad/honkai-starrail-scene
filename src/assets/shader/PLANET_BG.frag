varying vec3 vUv;
uniform sampler2D diffuse;
void main(){
  gl_FragColor = texture2D(diffuse,vUv.xy) ;
  #ifdef EARTH
  gl_FragColor.a *= smoothstep(-300.,0.,-vUv.z);
  #else
  gl_FragColor.a *= smoothstep(-800.,0.,-vUv.z);
  #endif
}
