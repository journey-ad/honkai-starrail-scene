varying vec2 vUv;
uniform sampler2D bg;
uniform vec2 resolution;
uniform sampler2D diffuse;
uniform float time;

vec3 fun1(vec3 param1, vec3 param2){
    vec3 param10 = 1. - param1;
    vec3 param15 = 1. - param2;
    vec3 param16 = param10 * param15;
    vec3 param17 = 1. - param16;
    return param17;
}


void main(){
    vec2 param7 = gl_FragCoord.xy / resolution;
    vec4 param8 = texture2D(bg, param7);
    vec4 param13 = texture2D(diffuse, vUv);
    vec3 param18 = fun1(param13.rgb, param8.rgb);
    vec3 param20 = mix(param8.rgb, param18, smoothstep(.05,1.,param13.a*(.05*sin(time*10.)+.95)));
    vec4 param22 = vec4(param20, param8.a);
    gl_FragColor = param22;
}
