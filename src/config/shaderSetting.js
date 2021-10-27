
/**
 * @file 着色器材质配置
 * 配置了使用自定义shader渲染的材质列表
 * docs: https://threejs.org/docs/#api/zh/materials/ShaderMaterial
 */

import * as THREE from 'three'

const conf = {
  BASIC: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/BASIC.vert'),
    fragmentShader: require('@/assets/shader/BASIC.frag'),
    uniforms: {
      opacity: {
        value: 1
      },
      color: {
        value: new THREE.Color(0x0)
      }
    }
  }),
  LINE: new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    vertexShader: require('@/assets/shader/LINE.vert'),
    fragmentShader: require('@/assets/shader/LINE.frag'),
    uniforms: {
      seed: {
        value: 1
      },
      speed: {
        value: .3
      },
      opacity: {
        value: 1
      },
      colorDark: {
        value: new THREE.Color(0x6499ff)
      },
      colorLight: {
        value: new THREE.Color(0xd1e7ff)
      }
    }
  }),
  PARTICLE: new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    vertexShader: require('@/assets/shader/PARTICLE.vert'),
    fragmentShader: require('@/assets/shader/PARTICLE.frag'),
    uniforms: {
      speed: {
        value: .3
      },
      opacity: {
        value: 1
      },
      colorDark: {
        value: new THREE.Color(0x6499ff)
      },
      colorLight: {
        value: new THREE.Color(0xd1e7ff)
      }
    }
  }),
  STAR: new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    vertexShader: require('@/assets/shader/STAR.vert'),
    fragmentShader: require('@/assets/shader/STAR.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  STAR_SKY: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/STAR_SKY.vert'),
    fragmentShader: require('@/assets/shader/STAR_SKY.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  STAR_MASK: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/STAR_MASK.vert'),
    fragmentShader: require('@/assets/shader/BASIC.frag'),
    uniforms: {
      opacity: {
        value: 1
      },
      color: {
        value: new THREE.Color(0x0)
      }
    }
  }),
  TRAIN_PARTICLE: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/TRAIN_PARTICLE.vert'),
    fragmentShader: require('@/assets/shader/TRAIN_PARTICLE.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  LOADING_PARTICLE: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/LOADING_PARTICLE.vert'),
    fragmentShader: require('@/assets/shader/LOADING_PARTICLE.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  TRAIN: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/TRAIN.vert'),
    fragmentShader: require('@/assets/shader/TRAIN.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  PLANET: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/BASIC.vert'),
    fragmentShader: require('@/assets/shader/PLANET.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  PLANET_BG: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/PLANET_BG.vert'),
    fragmentShader: require('@/assets/shader/PLANET_BG.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  PLANET_RING: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/BASIC.vert'),
    fragmentShader: require('@/assets/shader/PLANET_RING.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  SKY_BG: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/BASIC.vert'),
    fragmentShader: require('@/assets/shader/SKY_BG.frag')
  }),
  STAR_BG: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/BASIC.vert'),
    fragmentShader: require('@/assets/shader/STAR_BG.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  BLEND_SCREEN: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/BASIC.vert'),
    fragmentShader: require('@/assets/shader/BLEND_SCREEN.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  SUN: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/BASIC.vert'),
    fragmentShader: require('@/assets/shader/SUN.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  SMOKE: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/BASIC.vert'),
    fragmentShader: require('@/assets/shader/SMOKE.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  SMOKE2: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/BASIC.vert'),
    fragmentShader: require('@/assets/shader/SMOKE2.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  }),
  LIGHT: new THREE.ShaderMaterial({
    vertexShader: require('@/assets/shader/BASIC.vert'),
    fragmentShader: require('@/assets/shader/LIGHT.frag'),
    uniforms: {
      opacity: {
        value: 1
      }
    }
  })
}

export default conf