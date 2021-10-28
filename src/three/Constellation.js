/**
 * @file 星座特效
 * 用于显示内页背景上的星座特效: 漂浮闪烁的线段和端点
 */

import * as THREE from 'three'
import * as gsap from 'gsap/all'

/**
 * @class 星座端点类
 */
class EndPoint {
  /**
   * 端点生成
   * @param {number} segments 线段数量
   * @param {THREE.ShaderMaterial} material 着色器材质
   * @returns THREE.Mesh
   */
  static create(segments, material) {
    // 使用给定材质创建一个几何体点
    const geometry = (new THREE.InstancedBufferGeometry).copy(new THREE.PlaneBufferGeometry(4, 4))
    // 端点位置比例数组
    const endpointStepArr = new Float32Array(segments + 1)

    for (let i = 0; i <= segments; i++) {
      // 根据线段数量计算各个端点的位置比例
      endpointStepArr[i] = i / segments;
    }

    // 将端点位置比例数组作为属性设置到几何体上
    geometry.addAttribute("id", new THREE.InstancedBufferAttribute(endpointStepArr, 1, true));

    // 创建多边形网格
    const mesh = new THREE.Mesh(geometry, material);

    // 阻止视锥外剔除，猜测是防止端点处于视锥外被剔除导致线段显示异常
    mesh.frustumCulled = false;

    return mesh
  }
}

/**
 * @class 星座特效类
 */
class Constellation {
  /**
   * 生成线条
   * @param {number} segments 分段数量
   * @param {THREE.ShaderMaterial} material 着色器材质
   * @returns THREE.Mesh
   */
  static create(segments, material) {
    // 使用给定材质创建一个几何体三棱柱
    const geometry = new THREE.CylinderBufferGeometry(1, 1, 1, 3, segments, true)
    // 创建多边形网格
    const mesh = new THREE.Mesh(geometry, material)

    // 阻止视锥外剔除
    mesh.frustumCulled = false

    return mesh
  }

  /**
   * 生成一个随机空间坐标
   * 
   * @param {*} step x轴起始位置比例
   * @param {*} val 取值范围
   * @returns {THREE.Vector3} Vector3([起始位置比例*取值范围, 取值范围/2), [-val/2, val/2), [-val/4, val/4))
   */
  static randomPos(step, val = 200) {
    return new THREE.Vector3(
      (step * val) + (Math.random() * val / 2), // x轴随机位置 [起始位置比例*取值范围, 取值范围/2)
      (Math.random() * val) - (val / 2), // y轴随机位置 [-val/2, val/2)
      (Math.random() * val / 2) - (val / 4) // z轴随机位置 [-val/4, val/4)
    )
  }

  static emit(lm, option) {
    let {
      position = new THREE.Vector3, // 星座位置
      scale,
      duration = 10, // 星座持续时间
      obj3D, // 星座的3d object
      lineMaterial // 线段材质
    } = option || {}

    // 限制星座数量，超出复用
    if (this.pool.length > 10) {
      obj3D = this.pool.splice(Math.floor(Math.random() * this.pool.length), 1)[0]
      lineMaterial = obj3D.children[0].material;
    } else {
      // 初始化3d物体作为星座
      obj3D = new THREE.Object3D;

      // 随机设置线段数量为[2, 4]
      const segments = 2 + Math.round(2 * Math.random());

      // 取到线条材质
      lineMaterial = lm.getMaterial({
        shader: "LINE",
        time: 1,
        noise: "noise?wrapS=1000&wrapT=1000"
      })
      // 定义线段数量作为属性
      lineMaterial.defines.SEGMENT = segments;

      const points = {
        value: []
      }

      for (let i = 0; i <= lineMaterial.defines.SEGMENT; i++) {
        points.value[i] = new THREE.Vector3;
      }
      // 推测是把端点位置保存到线条上
      lineMaterial.uniforms.points = points;

      // 创建线条
      const lineMesh = this.create(segments, lineMaterial);
      // 设置渲染顺序
      lineMesh.renderOrder = 1000;

      // 取到端点材质
      const pointMaterial = lm.getMaterial({
        shader: "PARTICLE",
        time: 1,
        noise: "noise?wrapS=1000&wrapT=1000"
      })
      // 创建端点
      const pointMesh = EndPoint.create(segments, pointMaterial);

      // 设置端点属性
      pointMaterial.uniforms.points = lineMaterial.uniforms.points
      pointMaterial.uniforms.opacity = lineMaterial.uniforms.opacity
      pointMaterial.defines.SEGMENT = segments

      // 设置渲染顺序，保证端点在线条上层
      pointMesh.renderOrder = 1001

      // 线条和端点添加到星座
      obj3D.add(lineMesh)
      obj3D.add(pointMesh)
    }

    // 设置可见和随机旋转
    obj3D.visible = true
    obj3D.rotation.z = 6.28 * Math.random()
    lineMaterial.uniforms.seed.value = Math.random()

    /**
      对每个端点生成初始和结束状态的空间坐标，其中x轴位置和当前端点所处线条位置比例相关
      逻辑是根据端点个数平均分段给定基准位置，然后在基准位置基础上随机向右偏移，最多向右偏移取值范围的一半
      最终呈现效果是线条整体保持向右方向展开的趋势
    */
    for (let i = 0; i <= lineMaterial.defines.SEGMENT; i++) {
      const initPos = this.randomPos(i / lineMaterial.defines.SEGMENT - .5, 100)
      const targetPos = this.randomPos(i / lineMaterial.defines.SEGMENT - .5, 100)

      // 设定端点初始位置
      lineMaterial.uniforms.points.value[i].copy(initPos)

      // 设定端点结束位置
      gsap.TweenMax.to(
        lineMaterial.uniforms.points.value[i],
        duration,
        {
          overwrite: true,
          ease: gsap.Linear.easeNone,
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z
        }
      )
    }

    // 星座渐现效果
    gsap.TweenMax.fromTo(
      lineMaterial.uniforms.opacity,
      duration,
      {
        value: 0
      },
      {
        overwrite: true,
        ease: gsap.Linear.easeNone,
        value: 1
      }
    )

    // 星座位移效果，结束后放入池子并隐藏，等待复用
    gsap.TweenMax.fromTo(
      obj3D.position,
      duration,
      {
        x: position.x,
        y: position.y,
        z: position.z
      },
      {
        ease: gsap.Linear.easeNone,
        overwrite: true,
        z: position.z + 150,
        y: position.y + 100,
        onComplete: () => {
          this.pool.push(obj3D)
          obj3D.visible = false
        }
      }
    )

    // 返回星座3d物体
    return obj3D
  }
}

// 星座池子
Constellation.pool = []

export { Constellation }