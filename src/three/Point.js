import * as THREE from 'three'
import * as gsap from 'gsap/all'

class Plugin1 {
  static create(segments, material) {
    const geometry = (new THREE.InstancedBufferGeometry).copy(new THREE.PlaneBufferGeometry(4, 4)),
      idArr = new Float32Array(segments + 1)

    for (let i = 0; i <= segments; i++) {
      idArr[i] = i / segments;
    }

    geometry.addAttribute("id", new THREE.InstancedBufferAttribute(idArr, 1, true));

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false

    return mesh
  }
}

class Point {
  static create(segments, material) {
    const geometry = new THREE.CylinderBufferGeometry(1, 1, 1, 3, segments, true),
      mesh = new THREE.Mesh(geometry, material);

    mesh.frustumCulled = false
    return mesh
  }

  static randomPoint(ttt, num = 200) {
    return new THREE.Vector3(
      (ttt * num) + (Math.random() * num / 2),
      (Math.random() * num) - (num / 2),
      (Math.random() * num / 2) - (num / 4)
    )
  }

  static emit(obj, option) {
    let {
      position = new THREE.Vector3,
      scale,
      duration = 10,
      obj3D,
      material
    } = option || {}

    if (Point.pool.length > 10) {
      obj3D = this.splice(Math.floor(Math.random() * Point.pool.length), 1)[0]
      material = obj3D.children[0].material;
    } else {
      obj3D = new THREE.Object3D;

      const segments = 2 + Math.round(2 * Math.random());

      material = obj.getMaterial({
        shader: "LINE",
        time: 1,
        noise: "noise?wrapS=1000&wrapT=1000"
      })
      material.defines.SEGMENT = segments;

      const points = {
        value: []
      }

      for (let i = 0; i <= material.defines.SEGMENT; i++) {
        points.value[i] = new THREE.Vector3;
      }

      material.uniforms.points = points;

      const mesh = this.create(segments, material);
      mesh.renderOrder = 1000;

      const material2 = obj.getMaterial({
        shader: "PARTICLE",
        time: 1,
        noise: "noise?wrapS=1000&wrapT=1000"
      }),
        mesh1 = Plugin1.create(segments, material2);

      material2.uniforms.points = material.uniforms.points
      material2.uniforms.opacity = material.uniforms.opacity
      material2.defines.SEGMENT = segments

      mesh1.renderOrder = 1001
      obj3D.add(mesh)
      obj3D.add(mesh1)
    }

    obj3D.visible = true
    obj3D.rotation.z = 6.28 * Math.random()
    material.uniforms.seed.value = Math.random()

    for (let i = 0; i <= material.defines.SEGMENT; i++) {
      material.uniforms.points.value[i].copy(this.randomPoint(i / material.defines.SEGMENT - .5, 100))

      const point = this.randomPoint(i / material.defines.SEGMENT - .5, 100)
      gsap.TweenMax.to(
        material.uniforms.points.value[i],
        duration,
        {
          overwrite: true,
          ease: gsap.Linear.easeNone,
          x: point.x,
          y: point.y,
          z: point.z
        }
      )
    }

    gsap.TweenMax.fromTo(
      material.uniforms.opacity,
      duration,
      {
        value: 0
      },
      {
        overwrite: true,
        ease: gsap.Linear.easeNone,
        value: 1
      }
    )

    gsap.TweenMax.fromTo(
      obj3D.position,
      duration,
      {
        x: position.x,
        y: position.y,
        z: position.z
      },
      {
        ease: gsap.Linear.easeNone,
        overwrite: true,
        z: position.z + 150,
        y: position.y + 100,
        onComplete: () => {
          this.pool.push(obj3D)
          obj3D.visible = false
        }
      }
    )

    return obj3D
  }
}

Point.pool = []

export { Point }