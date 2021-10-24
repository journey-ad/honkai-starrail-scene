import * as THREE from 'three'

let materialo, cameraa, scenes, meshu

class LoadingStage {
  constructor(renderer, target) {
    this.progress = {
      value: 0
    }

    materialo = new THREE.ShaderMaterial({
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
    })

    cameraa = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    scenes = new THREE.Scene
    meshu = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), materialo);

    scenes.add(meshu)
    scenes.autoUpdate = false
  }

  setResolution(x, y) {
    materialo.uniforms.resolution.value.set(x, y)
  }

  render(t, n) {
    // e.render(scenes, cameraa, t, n)
  }
}

export default LoadingStage