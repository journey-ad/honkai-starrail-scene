/**
 * @file 混合光影效果
 * 用于混合渲染光影效果：背景彩虹阳光、列车车灯和bloom等光影效果
 */

import * as THREE from 'three'
import shaderSetting from "@/config/shaderSetting.js";

// 创建一个基础材质的浅拷贝
// https://threejs.org/docs/index.html?q=ShaderMaterial#api/zh/materials/ShaderMaterial.clone
const material = shaderSetting.BASIC.clone()

// 打开材质开关，在shader编译阶段启用相关处理
material.defines.USE_TEXTURE = true

// 指定传给shader的uniform变量diffuse，值会被设置为光影效果的贴图
material.uniforms.diffuse = {
  value: null
}

// 创建一个正交相机
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

// 创建光影场景
const scene = new THREE.Scene()

// 使用光影材质创建网格，尺寸为2*2 对应正交相机的视口，使光效与物体刚好重合
const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), material);

scene.add(mesh)

// 禁用自动更新矩阵，猜测是此处用于混合光效的相机位置恒定，无需变换矩阵，禁用自动更新可以提高性能
scene.autoUpdate = false

/**
 * @class 混合光影效果类
 */
class BlendRender {
  /**
   * 混合渲染器
   * @param {THREE.WebGLRenderer} renderer 渲染器实例
   * @param {THREE.WebGLRenderTarget} diffuseTarget 光效缓冲区
   * @param {THREE.WebGLRenderTarget} renderTarget 目标缓冲区
   * @param {boolean} clear 是否清除目标缓冲区
   */
  static render(renderer, diffuseTarget, renderTarget, clear = true) {
    // 从光效缓冲区中获取光效纹理并设置给光影材质
    material.uniforms.diffuse.value = diffuseTarget.texture

    /**
     * 渲染光影场景到目标缓冲区
     * ref: https://github.com/mrdoob/three.js/blob/7043802877/src/renderers/WebGLRenderer.js#L1027
     */
    renderer.render(scene, camera, renderTarget, clear)
  }
}

export { BlendRender }