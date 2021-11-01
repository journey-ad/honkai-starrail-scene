#ifdef USE_TEXTURE
  varying vec2 vUv;
#endif
#ifdef USE_INSTANCE
  attribute vec4 rotation;
  attribute vec3 offset;
  attribute vec3 scale;
#endif
#include <skinning_pars_vertex> // 包含蒙皮动画所需要的定义

#ifdef USE_MORPH
  attribute vec3 morphTarget0;
  attribute vec3 morphTarget1;
  attribute vec3 morphTarget2;
  attribute vec3 morphTarget3;
  uniform float morphTargetInfluences[ 4 ];
#endif

void main(){
    #ifdef USE_TEXTURE
      vUv = uv;
    #endif

    #ifdef USE_INSTANCE
      vec3 scaledPosition = position*scale;
      vec3 transformed = (scaledPosition + 2.0 * cross(rotation.xyz, cross(rotation.xyz, scaledPosition) + rotation.w * scaledPosition))+offset;
    #else
      #include <beginnormal_vertex> // 开始法线处理
      #include <skinbase_vertex> // 骨骼蒙皮基本运算
      #include <skinnormal_vertex> // 骨骼蒙皮法线运算
      #include <defaultnormal_vertex> // 默认法线处理

      #include <begin_vertex>
      
      #ifdef USE_MORPH
        transformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];
        transformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];
        transformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];
        transformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];
      #endif
      #include <skinning_vertex> // 蒙皮顶点处理
    #endif
    #include <project_vertex> // 投影顶点运算
}
