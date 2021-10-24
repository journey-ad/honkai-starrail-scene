import * as THREE from 'three'

class OP100 {
  constructor(isPC) {
    this.isPC = isPC
  }

  process(scene, material) {
    if (scene.type === 100) {
      const geometry = this.create(this.isPC ? 1500 : 200);
      return new THREE.Mesh(geometry, material)
    }
    return null
  }

  create(size) {
    let geometry = (new THREE.InstancedBufferGeometry).copy(new THREE.PlaneBufferGeometry(15, 15)),
      offsetArr = new Float32Array(2 * size),
      rndArr = new Float32Array(3 * size)

    for (let i = 0; i < size; i++) {
      offsetArr[2 * i] = Math.random() - .5
      offsetArr[2 * i + 1] = Math.random() - .5
      rndArr[3 * i] = .05 * Math.random() + .01
      rndArr[3 * i + 1] = Math.random()
      rndArr[3 * i + 2] = .5 * Math.random() + .5
    }
    geometry.addAttribute("offset", new THREE.InstancedBufferAttribute(offsetArr, 2))
    geometry.addAttribute("rnd", new THREE.InstancedBufferAttribute(rndArr, 3))
    return geometry
  }
}

class OP101 {
  process(scene, material) {
    if (scene.type === 101) {
      let geometry = new THREE.BufferGeometry, posArr = new Float32Array(3000)
      for (let i = 0; i < 1000; i++) {
        posArr[3 * i] = 1000 * Math.random() + 300
        posArr[3 * i + 1] = 6.28 * Math.random()
        posArr[3 * i + 2] = .005 * Math.random()
      }
      geometry.addAttribute("position", new THREE.BufferAttribute(posArr, 3))
      return new THREE.Points(geometry, material)
    }
    return null
  }
}

class OP102 {
  process(scene, material) {
    if (scene.type === 102) {
      const geometry = this.create(scene.back ? 50 : 300);
      return new THREE.Mesh(geometry, material)
    }

    return null
  }

  create(size) {
    let geometry = (new THREE.InstancedBufferGeometry).copy(new THREE.PlaneBufferGeometry(17, 17)),
      startArr = new Float32Array(3 * size),
      ctrlArr = new Float32Array(3 * size),
      endArr = new Float32Array(3 * size),
      rndArr = new Float32Array(3 * size)

    for (let i = 0; i < size; i++) {
      startArr[3 * i] = 5 * (2 * Math.random() - 1) + 50
      startArr[3 * i + 1] = 15 * (2 * Math.random() - 1) + 25
      startArr[3 * i + 2] = 30 * (2 * Math.random() - 1)

      ctrlArr[3 * i] = 100 * -(2 * Math.random() - 1) - 700
      ctrlArr[3 * i + 1] = 30 * (2 * Math.random() - 1) + 100
      ctrlArr[3 * i + 2] = 350 * (2 * Math.random() - 1) - 250

      endArr[3 * i] = 300 * -(2 * Math.random() - 1) - 900
      endArr[3 * i + 1] = 100 * (2 * Math.random() - 1) + 20
      endArr[3 * i + 2] = 150 * (2 * Math.random() - 1) - 200

      rndArr[3 * i] = .15 * Math.random() + .02
      rndArr[3 * i + 1] = Math.random()
      rndArr[3 * i + 2] = .8 * Math.random() + .2
    }
    geometry.addAttribute("start", new THREE.InstancedBufferAttribute(startArr, 3))
    geometry.addAttribute("ctrl", new THREE.InstancedBufferAttribute(ctrlArr, 3))
    geometry.addAttribute("end", new THREE.InstancedBufferAttribute(endArr, 3))
    geometry.addAttribute("rnd", new THREE.InstancedBufferAttribute(rndArr, 3))

    return geometry
  }
}

class OP200 {
  process(scene, material) {
    if (scene.type === 200) {
      const geometry = this.create(500, scene.dir),
        mesh = new THREE.Mesh(geometry, material);

      material.uniforms.bezierPos = {
        value: [
          new THREE.Vector3(1200 * scene.dir, 0, 0),
          new THREE.Vector3(700 * scene.dir, 0, 0),
          new THREE.Vector3(500 * scene.dir, 0, 0),
          new THREE.Vector3(250 * scene.dir, 0, 0),
          new THREE.Vector3(150 * scene.dir, 150 * scene.dir, 0),
          new THREE.Vector3(0, 200 * scene.dir, 0),
          new THREE.Vector3(-150 * scene.dir, 150 * scene.dir, 0),
          new THREE.Vector3(-200 * scene.dir, 0, 0),
          new THREE.Vector3(-200 * scene.dir, 0, 0)
        ]
      }
      material.defines.NUM_SEGMENT = material.uniforms.bezierPos.value.length

      return mesh
    }
    return null
  }

  create(size, dir) {
    let geometry = (new THREE.InstancedBufferGeometry).copy(new THREE.PlaneBufferGeometry(10, 10)),
      startArr = new Float32Array(3 * size),
      endArr = (new Float32Array(3 * size), new Float32Array(3 * size)),
      rndArr = new Float32Array(3 * size)

    for (let i = 0; i < size; i++) {
      startArr[3 * i] = 100 * Math.random() - 50
      startArr[3 * i + 1] = 50 * Math.random() - 25
      startArr[3 * i + 2] = 50 * Math.random() - 25

      endArr[3 * i] = 100 * Math.random() - 50
      endArr[3 * i + 1] = 50 * Math.random() - 25
      endArr[3 * i + 2] = 50 * Math.random() - 25

      rndArr[3 * i] = .15 * Math.random() + .1
      rndArr[3 * i + 1] = Math.random()
      rndArr[3 * i + 2] = .6 * Math.random() + .4
    }

    geometry.addAttribute("start", new THREE.InstancedBufferAttribute(startArr, 3))
    geometry.addAttribute("end", new THREE.InstancedBufferAttribute(endArr, 3))
    geometry.addAttribute("rnd", new THREE.InstancedBufferAttribute(rndArr, 3))

    return geometry
  }
}

export {
  OP100,
  OP101,
  OP102,
  OP200
}