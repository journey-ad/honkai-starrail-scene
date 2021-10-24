varying vec2 vUv;
uniform sampler2D diffuse;
uniform float time;
void main(){
    vec4 param3 = texture2D(diffuse, vUv);
    float param7 = param3.r * 6.283185307;
    float param10 = 3. * time;
    float param11 = param7 + param10;
    float param12 = sin(param11);
    float param13 = (param12 + 1.) * .3;
    vec3 param14 = param3.bbb * param13;
    vec3 param15 = param3.bbb - param14;
    vec4 param17 = vec4(param15, 1.);
    gl_FragColor = param17;
}