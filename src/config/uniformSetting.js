import * as THREE from 'three'

const conf = {
  fps: {
    value: 1
  },
  delta: {
    value: .016
  },
  time: {
    value: 0
  },
  resolution: {
    value: new THREE.Vector2(1, 1)
  },
  mouse: {
    value: new THREE.Vector2()
  },
  offset: {
    value: new THREE.Vector2()
  },
  mouseDelta: {
    value: new THREE.Vector2(0, 0)
  },
  progress: {
    value: 0
  },
  ending: {
    value: 0
  }
}

export default conf