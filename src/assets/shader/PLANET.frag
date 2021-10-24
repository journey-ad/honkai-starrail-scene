varying vec2 vUv;
uniform float time;
uniform sampler2D bg;
uniform sampler2D diffuse;
uniform sampler2D flowMap;
vec2 fun1(vec2 param1, vec2 param2){
    vec2 param7 = vUv * param1;
    vec2 param10 = time * param2;
    vec2 param11 = param7 + param10;
    return param11;
}

vec2 fun2(vec2 param3, float param4){
    float param17 = sin(param4);
    float param16 = cos(param4);
    float param19 = param17 * -1.;
    mat2 param20 = mat2(param16, param19, param17, param16);
    vec2 param24 = param20 * param3;
    return param24;
}


void main(){
    float param15 = time * .005;
    vec2 param23 = vUv * vec2(25.);
    vec2 param12 = fun1(vec2(34.), vec2(.1,.07));
    vec4 param33 = texture2D(flowMap, param12);
    vec2 param25 = fun2(param23, param15);
    vec4 param36 = texture2D(flowMap, param25);
    vec2 param38 = param33.rg * param36.br;
    vec2 param50 = param33.gb * param36.rg;
    vec2 param39 = 0.012 * param38;
    vec2 param51 = 0.013 * param50;
    vec2 param41 = param39 + vUv;
    vec2 param53 = param51 + vUv;
    vec4 param42 = texture2D(diffuse, param41);
    vec4 param54 = texture2D(diffuse, param53);
    vec3 param45 = param42.rgb * param42.a;
    vec3 param57 = param54.rgb * param54.a;
    vec3 param59 = mix(param45, param57, param36.b);
    float param60 = mix(param42.a, param54.a, param36.b);
    vec4 param28 = texture2D(bg, vUv);
    vec3 param61 = param59 / param60;
    vec3 param62 = saturate(param61);
    vec3 param63 = mix(param28.rgb, param62, param60);
    vec4 param65 = vec4(param63, param28.a);
    gl_FragColor = param65;
}
