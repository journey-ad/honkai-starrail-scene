varying vec2 vUv;
uniform float time;
uniform float speed;
uniform sampler2D diffuse;
float fun1(){
    float param3 = time * speed;
    return param3;
}


void main(){
    vec4 param7 = texture2D(diffuse, vUv);
    float param14 = param7.a * 3.283185307;
    float param4 = fun1();
    float param15 = param14 + param4;
    float param16 = sin(param15);
    float param12 = smoothstep(0., 0.5, param7.a);
    float param17 = (param16 + 1.) * .1;
    float param18 = param12 * param17;
    vec4 param19 = vec4(param7.rgb , param7.a);
    param19.rgb -= param18;
    gl_FragColor = param19;
}
