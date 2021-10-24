varying vec2 vUv;
uniform float time;
uniform float speed;
uniform sampler2D diffuse;
uniform sampler2D flowMap;
uniform sampler2D noise;
float fun1(){
    float param9 = time * speed;
    return param9;
}

vec2 fun2(vec2 param1, vec2 param2){
    vec2 param13 = vUv * param1;
    float param10 = fun1();
    vec2 param15 = param10 * param2;
    vec2 param16 = param13 + param15;
    return param16;
}


void main(){
    vec2 param28 = fun2(vec2(4.), vec2(1.,.5));
    vec4 param43 = texture2D(flowMap, param28);
    vec2 param17 = fun2(vec2(7.), vec2(-1.,.2));
    vec4 param46 = texture2D(flowMap, param17);
    vec2 param48 = param43.rg * param46.br;
    vec2 param60 = param43.gb * param46.rg;
    vec2 param49 = 0.05 * param48;
    vec2 param61 = 0.09 * param60;
    vec2 param51 = param49 + vUv;
    vec2 param63 = param61 + vUv;
    vec4 param52 = texture2D(diffuse, param51);
    vec4 param64 = texture2D(diffuse, param63);
    vec2 param74 = (param43.gb + -.5) * .02;
    vec2 param39 = fun2(vec2(2.5,3.), vec2(-.5,0.));
    vec2 param75 = param74 + param39;
    vec3 param55 = param52.rgb * param52.a;
    vec3 param67 = param64.rgb * param64.a;
    vec4 param76 = texture2D(noise, param75);
    float param84 = 1. - vUv.x;
    vec3 param69 = mix(param55, param67, param46.b);
    float param70 = mix(param52.a, param64.a, param46.b);
    float param85 = smoothstep(.2, .8, param84);
    vec3 param71 = param69 / param70;
    float param86 = param76.a * param85;
    vec3 param72 = saturate(param71);
    float param88 = param86 * .6;
    vec3 param79 = mix(param72, param76.rgb, param76.a);
    float param89 = param70 + param88;
    vec4 param90 = vec4(param79, param89);
    gl_FragColor = param90;
}
