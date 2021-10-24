import * as THREE from 'three'
import shaderSetting from "@/config/shaderSetting";

let iteme, cameran, scener, mesha

class MainStage {
  constructor() {
    iteme = shaderSetting.BASIC.clone()
    iteme.defines.USE_TEXTURE = true
    iteme.uniforms.diffuse = {
      value: null
    };

    cameran = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    scener = new THREE.Scene()
    mesha = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), iteme);

    scener.add(mesha)
    scener.autoUpdate = false
  }

  render(renderer, camera, target, clear = true) {
    iteme.uniforms.diffuse.value = camera.texture
    renderer.render(scener, cameran, target, clear)
  }
}

export default MainStage