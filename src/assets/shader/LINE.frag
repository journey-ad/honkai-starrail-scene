varying vec3 vUv;
uniform float time;
uniform float speed;
uniform float seed;
uniform sampler2D noise;
uniform float opacity;
uniform vec3 colorDark;
uniform vec3 colorLight;

float fun1(){
    float param5 = time * speed;
    return param5;
}

vec2 fun2(vec2 param1, vec2 param2){
    vec2 param9 = vUv.xy * param1+seed;
    float param6 = fun1();
    vec2 param11 = param6 * param2;
    vec2 param12 = param9 + param11;
    return param12;
}


void main(){
    //float alpha = smoothstep(0.,.5,abs(sin(vUv.z*3.14)));
    vec2 param13 = fun2(vec2(.5,float(SEGMENT)/5.), vec2(.0,.3));
    vec4 param19 = texture2D(noise, param13);
    float param26 = (param19.r) * smoothstep(0.,.5,sin(3.14*opacity));
    vec4 param27 = vec4(mix(colorDark,colorLight,param19.r),param26);
    gl_FragColor = param27;
}
