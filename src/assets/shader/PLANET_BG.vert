varying vec3 vUv;
void main(){
  vUv = vec3(uv,position.z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
}
