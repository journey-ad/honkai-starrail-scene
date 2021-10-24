import * as THREE from 'three'
import * as gsap from 'gsap/all'
import uniformSetting from "@/config/uniformSetting";

import Point from '@/components/three/Point'
import BlendRender from '@/components/three/BlendRender'

const animationSetting = {
  onLoadingInit() {
    let LOGO = this.getObjectByName("LOGO"),
      PARTICLES = this.getObjectByName("PARTICLES");

    this.scene.intro = () => {
      gsap.TweenMax.fromTo(LOGO.material.uniforms.opacity, .5, {
        value: 0
      }, {
        overwrite: true,
        value: 1
      })

      gsap.TweenMax.fromTo(LOGO.rotation, 1, {
        y: 1,
        x: 1
      }, {
        overwrite: true,
        x: 0,
        y: 0,
        ease: gsap.Back.easeOut
      })

      gsap.TweenMax.fromTo(LOGO.position, .5, {
        z: -500
      }, {
        overwrite: true,
        z: 0,
        ease: gsap.Back.easeOut
      })
    }

    this.scene.outro = () => {
      gsap.TweenMax.fromTo(uniformSetting.ending, 1, {
        value: 0
      }, {
        overwrite: true,
        value: 1.3,
        ease: gsap.Power2.easeOut,
        onComplete: () => {
          this.scene.visible = false
        }
      })

      gsap.TweenMax.to(uniformSetting.progress, 1, {
        overwrite: true,
        value: 1
      })

      gsap.TweenMax.to(PARTICLES.scale, .5, {
        overwrite: true,
        x: .2,
        y: .2,
        ease: gsap.Back.easeIn
      })

      gsap.TweenMax.to(PARTICLES.rotation, .7, {
        overwrite: true,
        z: 1.5,
        ease: gsap.Power2.easeInOut
      })

      gsap.TweenMax.to(LOGO.material.uniforms.opacity, .5, {
        overwrite: true,
        value: 0,
        delay: .1
      })

      gsap.TweenMax.to(LOGO.position, .5, {
        overwrite: true,
        z: -500,
        delay: .1,
        ease: gsap.Back.easeIn
      })
    }
  },
  onBlendRender(renderer) {
    const target = renderer.getRenderTarget();
    BlendRender.render(renderer, target, this.scene.bgBuffer)
    renderer.setRenderTarget(target)
  },
  onRockRotate() {
    this.rotation.y = .05 * uniformSetting.time.value * this.userData.speed + this.userData.delay
    this.position.x = this.userData.initPos.x + Math.sin(.5 * uniformSetting.time.value * this.userData.speed + this.userData.delay) * this.userData.range * 15
    this.position.z = this.userData.initPos.z + Math.cos(.2 * uniformSetting.time.value * this.userData.speed + this.userData.delay) * Math.sin(uniformSetting.time.value * this.userData.speed + this.userData.delay) * this.userData.range * 15
  },
  onIndexInit() {
    const obj_ALL = this.getObjectByName("ALL"),
      obj_SUN1 = this.getObjectByName("SUN1"),
      obj_INDEX_ALL = this.getObjectByName("INDEX_ALL"),
      obj_STAR_INNER = this.getObjectByName("STAR_INNER"),
      curPos = new THREE.Vector2(.5, .5),
      movePos = new THREE.Vector2(.5, .5);

    // 重设列车位置
    const obj_TRAIN_MAIN = this.getObjectByName("TRAIN_MAIN")
    obj_TRAIN_MAIN.position.set(-950.03125, -862.64984, 150.34436)

    this.scene.move = (x, y) => {
      movePos.set(x, y)
    }

    const obj_LIGHT1 = this.getObjectByName("LIGHT1");
    this.scene.resize = () => {
      obj_LIGHT1.position.x = 600
      obj_LIGHT1.updateMatrix()
    }

    const obj_BODY = this.getObjectByName("BODY");
    this.scene.intro = (onComplete) => {
      this.getObjectByName("TRAIN").playAnimation("INTRO")
      this.getObjectByName("INDEX").playAnimation("INTRO")
      this.scene.visible = true

      gsap.TweenMax.to(obj_BODY.material.uniforms.opacity, .6, {
        delay: .4,
        value: 0,
        onComplete
      })
    }

    this.scene.onBeforeRender = () => {
      curPos.x += .02 * (movePos.x - curPos.x)
      curPos.y += .02 * (movePos.y - curPos.y)
      obj_ALL.rotation.x = Math.max(-.02, Math.min(.02, (.5 - curPos.y) / 35)) + Math.PI / 2
      obj_ALL.rotation.z = Math.max(-.01, Math.min(.01, (.5 - curPos.x) / 35))
    }

    this.scene.scroll = function (t) {
      gsap.TweenMax.to(obj_SUN1.position, 0, {
        y: obj_SUN1.userData.initPos.y - 7 * t / 50,
        overwrite: true,
        ease: gsap.Linear.easeNone
      }),
        gsap.TweenMax.to(obj_INDEX_ALL.position, 0, {
          z: t,
          overwrite: true,
          ease: gsap.Linear.easeNone
        })
    }

    this.scene.change = function (type, y, duration = .3) {
      if (type === "index") {
        obj_INDEX_ALL.visible = true

        gsap.TweenMax.to(obj_SUN1.position, duration, {
          y: obj_SUN1.userData.initPos.y - 7 * y / 50,
          overwrite: true,
          ease: gsap.Power2.easeInOut
        })

        gsap.TweenMax.to(obj_INDEX_ALL.position, duration, {
          z: y,
          overwrite: true,
          ease: gsap.Power2.easeInOut
        })

        gsap.TweenMax.fromTo(obj_STAR_INNER.position, duration,
          {
            y: obj_STAR_INNER.userData.initPos.y
          },
          {
            y: obj_STAR_INNER.userData.initPos.y - 1000,
            overwrite: true,
            ease: gsap.Power2.easeInOut,
            onComplete: () => {
              obj_STAR_INNER.visible = false
            }
          }
        )
      } else {
        obj_STAR_INNER.visible = true
        gsap.TweenMax.fromTo(obj_STAR_INNER.position, duration, {
          y: obj_STAR_INNER.userData.initPos.y - 1000
        }, {
          y: obj_STAR_INNER.userData.initPos.y,
          overwrite: true,
          ease: gsap.Power2.easeInOut
        })
        gsap.TweenMax.to(obj_SUN1.position, duration, {
          y: obj_SUN1.userData.initPos.y + 700,
          overwrite: true,
          ease: gsap.Power2.easeInOut
        })
        gsap.TweenMax.to(obj_INDEX_ALL.position, duration, {
          z: -5000,
          overwrite: true,
          ease: gsap.Power2.easeInOut,
          onComplete: () => {
            obj_INDEX_ALL.visible = false
          }
        })
      }
    }
  },
  onInnerLineInit: function (t, evt) {
    this.frame = 0
    this.count = 0
    this.onBeforeRender = () => {
      if (this.frame++ % 250 == 0) {
        const item = Point.emit(evt, {
          duration: 5 * Math.random() + 15,
          position: new THREE.Vector3(1200 * Math.random() - 650, -50 * Math.random() - 200, 0)
        });
        this.add(item)
      }
    }
  }
}

export default animationSetting