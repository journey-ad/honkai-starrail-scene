import * as THREE from 'three'

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

export default LoadingStage