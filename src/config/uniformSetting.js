
/**
 * @file 全局状态
 * uniform名字应该是来源于three和glsl编程的概念
 */

import * as THREE from 'three'

const uniforms = {
  fps: {
    value: 1 // 帧率
  },
  delta: {
    value: .016 // 帧生成时间
  },
  time: {
    value: 0 // 程序运行时间
  },
  resolution: {
    value: new THREE.Vector2(1, 1) // 分辨率 [w, h]
  },
  mouse: {
    value: new THREE.Vector2() // 鼠标位置
  },
  offset: {
    value: new THREE.Vector2()
  },
  mouseDelta: {
    value: new THREE.Vector2(0, 0)
  },
  progress: {
    value: 0 // 加载进度 0-1    1.2正常渲染循环
  },
  ending: {
    value: 0
  }
}

export default uniforms