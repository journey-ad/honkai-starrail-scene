import * as THREE from 'three'

const geometryPlugin1 = {
  process(paramt, parame) {
    if (parame.subuvs) {
      parame.subuvs.forEach((item, i) => {
        paramt.addAttribute(`uv${(i + 2)}`, new THREE.BufferAttribute(new Float32Array(item), 2))
      })
    }

    return paramt
  }
}

export default geometryPlugin1