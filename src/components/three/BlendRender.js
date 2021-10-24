import * as THREE from 'three'
import shaderSetting from "@/config/shaderSetting";

const shader = shaderSetting.BASIC.clone()

shader.defines.USE_TEXTURE = true
shader.uniforms.diffuse = {
  value: null
}

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
  scene = new THREE.Scene(),
  mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), shader);

scene.add(mesh)
scene.autoUpdate = false

class BlendRender {
  static render(renderer, iii, ooo, visible = true) {
    shader.uniforms.diffuse.value = iii.texture
    renderer.render(scene, camera, ooo, visible)
  }
}

export default BlendRender