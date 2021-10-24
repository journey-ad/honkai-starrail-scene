import * as THREE from 'three'

const geometryPlugin2 = {
  process(paramt, parame) {
    if (parame.color && Array.isArray(parame.color)) {
      parame.color.forEach((item, i) => {
        paramt.addAttribute(
          `color${(i + 1)}`,
          new THREE.BufferAttribute(new Float32Array(item.map(num => num / 255)), 3)
        )
      })
    }

    return paramt
  }
}

export default geometryPlugin2