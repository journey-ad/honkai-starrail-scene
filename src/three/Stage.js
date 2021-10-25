import * as THREE from 'three'
import shaderSetting from "@/config/shaderSetting";

class MainStage {
  constructor() {
    let item, newCamera, scene, mesh

    item = shaderSetting.BASIC.clone()
    item.defines.USE_TEXTURE = true
    item.uniforms.diffuse = {
      value: null
    };

    newCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    scene = new THREE.Scene()
    mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), item);

    scene.add(mesh)
    scene.autoUpdate = false

    this.render = function (renderer, camera, target, clear = true) {
      item.uniforms.diffuse.value = camera.texture
      renderer.render(scene, newCamera, target, clear)
    }
  }
}

class LoadingStage {
  constructor(renderer, target) {
    this.progress = {
      value: 0
    }

    const material = new THREE.ShaderMaterial({
      vertexShader: require('@/assets/shader/LOADING.vert'),
      fragmentShader: require('@/assets/shader/LOADING.frag'),
      uniforms: {
        diffuse: {
          value: target.texture,
          type: "t"
        },
        resolution: {
          value: new THREE.Vector2(1, 1)
        },
        highlight: {
          value: new THREE.Color(0x2375da)
        },
        center: {
          value: new THREE.Vector2(.5, .5)
        },
        scale: {
          value: new THREE.Vector2(.5, 1)
        },
        progress: this.progress
      }
    }),
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
      scene = new THREE.Scene(),
      meshu = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), material);

    scene.add(meshu)
    scene.autoUpdate = false

    this.setResolution = function (x, y) {
      material.uniforms.resolution.value.set(x, y)
    }

    this.render = function (target, clear) {
      renderer.render(scene, camera, target, clear)
    }
  }
}

export { MainStage, LoadingStage }