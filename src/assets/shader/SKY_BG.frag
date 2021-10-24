varying vec2 vUv;
uniform float time;
uniform float speed;
uniform sampler2D diffuse;
uniform sampler2D flowMap;
float fun1(){
    float param5 = time * speed;
    return param5;
}

vec2 fun2(vec2 param1, vec2 param2){
    vec2 param9 = vUv * param1;
    float param6 = fun1();
    vec2 param11 = param6 * param2;
    vec2 param12 = param9 + param11;
    return param12;
}


void main(){
    vec2 param13 = fun2(vec2(6.), vec2(1.));
    vec4 param17 = texture2D(flowMap, param13);
    float param23 = 0.05 * time;
    float param24 = param17.b + param23;
    float param31 = param24 + 0.5;
    vec2 param19 = (param17.rg + -.5) * -0.05;
    float param25 = fract(param24);
    float param32 = fract(param31);
    vec2 param26 = param19 * param25;
    vec2 param33 = param19 * param32;
    vec2 param27 = vUv + param26;
    vec2 param35 = param33 + vUv;
    float param37 = (param25 + -0.5) * 2.;
    vec4 param28 = texture2D(diffuse, param27);
    vec4 param36 = texture2D(diffuse, param35);
    float param38 = abs(param37);
    vec4 param39 = mix(param28, param36, param38);
    gl_FragColor = param39;
}
