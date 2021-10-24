varying vec2 vUv;
uniform sampler2D bg;
uniform vec2 resolution;
uniform sampler2D diffuse;
uniform float time;
vec3 fun1(vec3 param1, vec3 param2){
    vec3 param18 = 1. - param1;
    vec3 param17 = 1. - param2;
    vec3 param19 = 2. * param18;
    vec3 param14 = param2 * param1;
    vec3 param20 = param17 * param19;
    vec3 param16 = param14 * 2.;
    vec3 param21 = 1. - param20;
    vec3 param23 = step(0.5, param1);
    vec3 param24 = mix(param16, param21, param23);
    return param24;
}


void main(){
    vec2 param7 = gl_FragCoord.xy / resolution;
    vec4 param12 = texture2D(diffuse, vUv);
    vec4 param8 = texture2D(bg, param7);
    float param28 = time * 12.;
    float param29 = sin(param28);
    float param31 = param29 * .1;
    float param33 = param31 + 1.;
    float param35 = param33 * max(0.,param12.a-.05);//smoothstep(.05,.4,param12.a);
    vec3 param25 = fun1(param12.rgb, param8.rgb);
    vec3 param36 = mix(param8.rgb, param25, param35);
    vec4 param38 = vec4(param36, param8.a);
    gl_FragColor = param38;
}
