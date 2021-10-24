varying vec2 vUv;
uniform float time;
uniform float speed;
uniform sampler2D diffuse;
uniform sampler2D flowMap;
vec2 fun1(vec2 param1){
    vec2 param4 = param1 - vec2(1.,0.);
    float param7 = atan(param4.x,param4.y);
    float param10 = length(param4);
    float param9 = param7 * 0.318309886183790;
    float param12 = param10 * .5;
    vec2 param13 = vec2(param9, param12);
    return param13;
}

float fun2(){
    float param17 = time * speed;
    return param17;
}


void main(){
    vec2 param14 = fun1(vUv);
    float param18 = fun2();
    vec2 param22 = param14 + param18;
    vec4 param23 = texture2D(flowMap, param22);
    vec2 param25 = (param23.gb + -.5) * .002;
    vec2 param26 = vUv + param25;
    vec4 param27 = texture2D(diffuse, vUv);
    float param31 = step(.1, param27.g) * param23.r;
    vec3 param32 = param27.rgb -param31*.2;
    vec4 param33 = vec4(param32, param27.a);
    gl_FragColor = param33;
}
