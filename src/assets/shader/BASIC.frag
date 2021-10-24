#ifdef USE_TEXTURE
  uniform sampler2D diffuse;
  varying vec2 vUv;
#else
  uniform vec3 color;
#endif

uniform float opacity;

void main(){
  #ifdef USE_TEXTURE
    gl_FragColor = texture2D(diffuse,vUv);
  #else
    gl_FragColor = vec4(color,1.);
  #endif

  #ifdef ALPHA_TEST
      if(gl_FragColor.a<.5){
    discard;
}

  #endif
  gl_FragColor.a*=opacity;

}

