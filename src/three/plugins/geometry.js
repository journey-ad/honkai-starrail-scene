import * as THREE from 'three'

class geometryPlugin1 {
  static process(buffer, item) {
    if (item.subuvs) {
      item.subuvs.forEach((item, i) => {
        buffer.addAttribute(
          `uv${(i + 2)}`,
          new THREE.BufferAttribute(new Float32Array(item), 2)
        )
      })
    }

    return buffer
  }
}

class geometryPlugin2 {
  static process(buffer, item) {
    if (item.color && Array.isArray(item.color)) {
      item.color.forEach((item, i) => {
        buffer.addAttribute(
          `color${(i + 1)}`,
          new THREE.BufferAttribute(new Float32Array(item.map(num => num / 255)), 3)
        )
      })
    }

    return buffer
  }
}

export { geometryPlugin1, geometryPlugin2 }