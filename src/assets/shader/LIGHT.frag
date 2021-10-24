varying vec2 vUv;
uniform float time;
uniform float speed;
uniform sampler2D diffuse;
uniform sampler2D flowMap;
float fun1(){
    float param7 = time * speed;
    return param7;
}

vec2 fun2(vec2 param1, float param2){
    float param11 = sin(param2);
    float param10 = cos(param2);
    float param13 = param11 * -1.;
    mat2 param14 = mat2(param10, param13, param11, param10);
    vec2 param16 = param14 * param1;
    return param16;
}

vec2 fun3(vec2 param3, vec2 param4){
    vec2 param17 = fun2(vUv, .9);
    vec2 param19 = param17 * param3;
    float param8 = fun1();
    vec2 param21 = param8 * param4;
    vec2 param22 = param19 + param21;
    return param22;
}


void main(){
    vec2 param23 = fun3(vec2(.4,4.), vec2(1.));
    vec4 param29 = texture2D(flowMap, param23);
    vec4 param26 = texture2D(diffuse, vUv);
    float param31 = (param29.r + 4.) * .2;
    float param33 = param31 * param26.a;
    vec4 param34 = vec4(param26.rgb, param33);
    gl_FragColor = param34;
}
