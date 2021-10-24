varying vec2 vUv2;
varying vec2 vUv;
uniform float time;
uniform float speed;
uniform sampler2D noise;
uniform vec3 dir;
uniform sampler2D diffuse;
uniform vec3 color;
uniform float opacity;
float fun1(){
    float param5 = time * speed;
    return param5;
}

vec2 fun2(vec2 param1, vec2 param2){
    vec2 param9 = vUv2 * param1;
    float param6 = fun1();
    vec2 param11 = param6 * param2;
    vec2 param12 = param9 + param11;
    return param12;
}


void main(){
    vec3 param16 = normalize(dir);
    vec2 param19 = param16.xy * .2;
    vec4 param27 = texture2D(diffuse, vUv);
    vec2 param13 = fun2(vec2(1.,2.), vec2(1.,.5));
    vec2 param20 = param13 + param19;
    vec4 param21 = texture2D(noise, param20);
    float param30 = dot(param27.rgb, color);
    float param32 = param30 * param27.a;
    float param24 = param21.r * .3;
    float param33 = saturate(param32);
    float param34 = param24 * param33;
    vec3 param36 = param34 + param27.rgb;
    vec4 param38 = vec4(param36+opacity*color, param27.a);
    gl_FragColor = param38;
}
