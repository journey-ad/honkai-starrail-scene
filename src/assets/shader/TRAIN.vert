varying vec2 vUv;
varying vec2 vUv2;
vec4 fun1(vec3 param1){
    mat4 param6 = projectionMatrix * modelViewMatrix;
    vec4 param11 = vec4(param1, 1.);
    vec4 param12 = param6 * param11;
    return param12;
}

vec2 fun2(vec2 param2, float param3){
    float param16 = sin(param3);
    float param15 = cos(param3);
    float param18 = param16 * -1.;
    mat2 param19 = mat2(param15, param18, param16, param15);
    vec2 param21 = param19 * param2;
    return param21;
}


void main(){
    vUv = uv;
    vec2 param22 = fun2(uv, .9);
    vUv2 = param22;
    vec4 param13 = fun1(position);
    gl_Position = param13;
}
