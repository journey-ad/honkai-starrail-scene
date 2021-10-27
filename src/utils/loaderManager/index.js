/**
 * @file 加载管理器
 * 负责整个渲染流程的管理，包括资源加载、几何体初始化、事件派发、动画管理、全局状态更新等
 */

import * as THREE from 'three'
import * as gsap from 'gsap/all'

import { geometryPlugin1, geometryPlugin2 } from '@/three/plugins/geometry.js'
import FileLoader from './fileLoader.js';

const loader = FileLoader.loader
const createLoader = FileLoader.createLoader

class LoaderManager {
  constructor(option) {
    const {
      renderer = null,
      animationSetting = {},
      shaderSetting = {},
      bufferSetting = {},
      spineSetting = {},
      fontSetting = {},
      uniformSetting = {
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
          value: new THREE.Vector3(1, 1, 1)
        },
        mouse: {
          value: new THREE.Vector2
        },
        offset: {
          value: new THREE.Vector2
        },
        mouseDelta: {
          value: new THREE.Vector2(0, 0)
        }
      },
    } = option || {}

    this.renderer = renderer

    this.animationSetting = animationSetting
    this.shaderSetting = shaderSetting
    this.spineSetting = spineSetting
    this.bufferSetting = bufferSetting
    this.uniformSetting = uniformSetting
    this.fontSetting = fontSetting
    this.clock = new THREE.Clock

    const context = renderer.context
    this.defaultAnimationSetting = {
      SKIN: () => {
        if (this.scene.autoUpdate) { this.userData.animationMixer.update(this.uniformSetting.delta.value) }
      },
      SPINE: () => {
        if (this.scene && this.scene.autoUpdate) {
          this.update(this.uniformSetting.delta.value)
        }
      },
      DRAW_MASK: () => {
        context.clearStencil(0)
        context.clear(context.STENCIL_BUFFER_BIT)
        context.stencilFunc(context.ALWAYS, 1, 1)
        context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE)
        context.colorMask(false, false, false, false)
        context.enable(context.STENCIL_TEST)
      },
      BEGIN_INVERT_MASK: () => {
        context.stencilFunc(context.NOTEQUAL, 1, 1)
        context.stencilOp(context.KEEP, context.KEEP, context.KEEP)
        context.colorMask(true, true, true, true)
      },
      BEGIN_MASK: () => {
        context.stencilFunc(context.EQUAL, 1, 1)
        context.stencilOp(context.KEEP, context.KEEP, context.KEEP)
        context.colorMask(true, true, true, true)
      },
      STOP_MASK: () => {
        context.disable(context.STENCIL_TEST)
      }
    }
    this.textures = {}
    this.geometrys = {}
    this.skinnings = {}
    this.spines = {}
    this.fonts = {}
    this.materialPlugins = []
    this.geometryPlugins = [geometryPlugin1, geometryPlugin2]
    this.objectPlugins = []
    this.mouseDisabled = false
    this.mouseMoved = false
    this.mouseEnabled = true
    this.mouseDown = false
    this.mouseNeedsRefresh = false
    this.mouseEnableMoveCheck = false
    this.mouseCheckScene = null
    this.mouseCheckCamera = null
  }

  getEventDispatcher() {
    return THREE.EventDispatcher
  }

  static getLoader() {
    return loader
  }

  createLoader() {
    return createLoader()
  }

  checkGL(ctx, opt) {
    if (!window.WebGLRenderingContext) return false;

    return ctx.getContext("webgl", opt) || ctx.getContext("experimental-webgl", opt)
  }

  tick() {
    this.uniformSetting.delta.value = Math.min(this.clock.getDelta(), .03)
    this.uniformSetting.fps.value = Math.min(3, this.uniformSetting.delta.value / .0167)
    this.uniformSetting.time.value = this.clock.getElapsedTime() % 1e4
  }

  compile(sceneOrigin, camera, target) {
    var shaderList = [], scene = new THREE.Scene;

    sceneOrigin.traverse(item => {
      if (item.material && item.userData.initPos) {
        item.position.set(0, 0, 0)
        item.rotation.set(0, 0, 0)
        item.scale.set(1, 1, 1)
        item.userData.parent = item.parent
        item.userData.visible = item.visible
        item.visible = true
        shaderList.push(item)
      }
    })

    shaderList.forEach(item => {
      scene.add(item)
    })

    this.renderer.render(scene, camera, target, true)

    shaderList.forEach(item => {
      item.position.copy(item.userData.initPos)
      item.quaternion.copy(item.userData.initRot)
      item.scale.copy(item.userData.initScl)
      item.visible = item.userData.visible
      item.userData.parent.add(item)
    })

    shaderList.length = 0
  }

  disableMouse() {
    this.mouseDisabled = true
    this.mouseEnabled = false
  }

  enableMouse() {
    this.mouseDisabled = false,
      this.mouseEnabled = true
  }

  lockMouse() {
    this.mouseEnabled = false
  }

  freeMouse() {
    this.mouseDisabled || (this.mouseEnabled = true)
  }

  getFont() {

  }

  createText() {

  }

  getSpineData() {

  }

  createSpine() {

  }

  getSkinning() {

  }
  initSkinning() {

  }

  initGeometry(data) {
    data.forEach(item => {
      if (!this.geometrys[item.id]) {
        let buffer = new THREE.BufferGeometry;

        buffer.addAttribute("position", new THREE.BufferAttribute(new Float32Array(item.vertices), 3))

        if (item.uvs) buffer.addAttribute("uv", new THREE.BufferAttribute(new Float32Array(item.uvs), 2))

        buffer.setIndex(new THREE.BufferAttribute(new (item.vertices.length > 196605 ? Uint32Array : Uint16Array)(item.indexs), 1))
        buffer.computeVertexNormals()
        buffer.name = item.id
        buffer.count = 0

        if (item.groups) buffer.groups = item.groups

        if (item.skinWeights) {
          let weightsArr = [],
            indicesArr = [],
            step = item.influencesPerVertex

          for (let index = 0; index < item.skinWeights.length; index += step) {
            weightsArr.push(item.skinWeights[index])
            weightsArr.push(step > 1 ? item.skinWeights[index + 1] : 0)
            weightsArr.push(step > 2 ? item.skinWeights[index + 2] : 0)
            weightsArr.push(step > 3 ? item.skinWeights[index + 3] : 0)

            indicesArr.push(item.skinIndices[index])
            indicesArr.push(step > 1 ? item.skinIndices[index + 1] : 0)
            indicesArr.push(step > 2 ? item.skinIndices[index + 2] : 0)
            indicesArr.push(step > 3 ? item.skinIndices[index + 3] : 0)
          }
          buffer.addAttribute("skinIndex", new THREE.Uint16BufferAttribute(indicesArr, 4))
          buffer.addAttribute("skinWeight", new THREE.Float32BufferAttribute(weightsArr, 4))
        }

        if (item.morph) {
          item.morph.forEach((item, i) => {
            buffer.addAttribute("morphTarget" + i, new THREE.BufferAttribute(new Float32Array(item), 3))
          })
        }

        this.geometryPlugins.forEach(plugin => {
          buffer = plugin.process(buffer, item, this)
        })

        this.geometrys[item.id] = buffer
      }
    })
  }

  initInstancedGeometry() {

  }

  initModelGeometry() {

  }

  getUniform(item) {
    switch (item.type) {
      case "f":
        return {
          value: item.value,
          type: "f"
        };
      case "i":
        return {
          value: item.value,
          type: "i"
        };
      case "v2":
        return {
          value: (new THREE.Vector2).fromArray(item.value)
        };
      case "v3":
        return {
          value: (new THREE.Vector3).fromArray(item.value)
        };
      case "v4":
        return {
          value: (new THREE.Vector4).fromArray(item.value)
        };
      case "c":
        return {
          value: new THREE.Color(item.value)
        };
      case "t":
        return {
          value: this.getTexture(item.value),
          src: item.value,
          type: "t"
        };
      case "w":
        return {
          value: t.getTextTexture(item.value),
          type: "t"
        };
      case "b":
        return {
          value: this.getBuffer(item.value).texture,
          type: "t"
        };
      case "u":
        return this.uniformSetting[item.value];
      default:
        return {
          value: item.value
        }
    }
  }

  getMaterial(item) {
    if (!this.shaderSetting[item.shader]) {
      console.error("no shader:", item.shader)
      return null
    }

    const shader = this.shaderSetting[item.shader].clone();
    shader.defines = {}

    if (!isNaN(item.color)) {
      shader.uniforms.color = {
        value: new THREE.Color(item.color),
        type: "c"
      }
    }

    if (item.time) shader.uniforms.time = this.uniformSetting.time

    if (!isNaN(item.opacity)) {
      shader.transparent = true
      shader.uniforms.opacity.value = item.opacity
    }

    if (item.surface) {
      shader.defines.USE_SURFACEMAP = 1
      shader.uniforms.surfaceMap = {
        value: this.getTexture(item.surface),
        src: item.value,
        type: "t"
      }
    }

    if (item.env) {
      shader.defines.USE_ENVMAP = 1
      shader.uniforms.envMap = {
        value: this.getTexture(item.env),
        src: item.value,
        type: "t"
      }
    }

    if (item.lightMap) {
      shader.defines.USE_LIGHTMAP = 1
      shader.uniforms.lightMap = {
        value: this.getTexture(item.lightMap),
        src: item.value,
        type: "t"
      }
    }

    if (item.shadowMap) {
      shader.defines.USE_SHADOWMAP = 1
      shader.uniforms.shadowMap = {
        value: this.getTexture(item.shadowMap),
        src: item.value,
        type: "t"
      }
    }

    if (item.normal) {
      shader.extensions.derivatives = true
      shader.defines.USE_NORMALMAP = 1
      shader.uniforms.normalMap = {
        value: this.getTexture(item.normal),
        src: item.value,
        type: "t"
      }
      shader.uniforms.normalScale = {
        value: new THREE.Vector2(1, 1),
        type: "v2"
      }
    }

    if (item.metalness) {
      shader.uniforms.metalness = {
        value: item.metalness,
        type: "f"
      }
    }

    if (item.roughness) {
      shader.uniforms.roughness = {
        value: item.roughness,
        type: "f"
      }
    }

    if (item.fog) shader.defines.USE_FOG = 1

    if (item.buffer) {
      shader.defines.USE_TEXTURE = 1
      shader.uniforms.diffuse = {
        value: this.getBuffer(item.buffer).texture,
        type: "t"
      }
    }

    if (item.image) {
      shader.defines.USE_TEXTURE = 1
      shader.uniforms.diffuse = {
        value: this.getTexture(item.image),
        src: item.value,
        type: "t"
      }
    }

    if (item.noise) {
      shader.uniforms.noise = {
        value: this.getTexture(item.noise),
        src: item.value,
        type: "t"
      }
    }

    if (item.blending) shader.blending = item.blending

    if (item.side) shader.side = item.side

    if (item.nodw) {
      shader.depthWrite = item.nodw === 3
      shader.depthTest = item.nodw === 2
    }

    if (item.at) shader.defines.ALPHA_TEST = 1

    if (item.text) {
      shader.defines.USE_TEXTURE = 1
      shader.uniforms.diffuse = {
        value: t.getTextTexture(item.text),
        type: "t"
      }
    }

    if (item.uniforms) {
      Object.keys(item.uniforms)
        .forEach(uniform => {
          shader.uniforms[uniform] = this.getUniform(item.uniforms[uniform])
        }
        )
    }

    if (item.defines) {
      Object.keys(item.defines)
        .forEach(define => {
          shader.defines[define] = item.defines[define]
        }
        )
    }

    this.materialPlugins.forEach(plugin => {
      plugin.process(shader, item, this)
    }
    )

    return shader
  }

  getGeometry(id) {
    if (this.geometrys[id]) {
      this.geometrys[id].count += 1
      return this.geometrys[id]

    } else {
      console.error("no geometry:" + id)
      return null
    }
  }

  removeGeometry(id) {
    if (id.indexOf("S_") !== 0 && this.geometrys[id]) {
      this.geometrys[id].count -= 1

      if (this.geometrys[id].count <= 0) {
        this.geometrys[id].dispose()
        delete this.geometrys[id]
      }
    }
  }

  removeTexture(id) {
    if (this.textures[id]) {
      this.textures[id].dispose()
      delete this.textures[id]
    }
  }

  refreshTexture() {

  }

  initTexture() {

  }

  getTexture(id) {
    var nameArr = id.split("?"),
      name = nameArr[0],
      param = nameArr[1],
      needsUpdate = false;

    if (!this.textures[name]) {
      const texture = FileLoader.loader.getResult(name);
      if (!texture) {
        console.error("no texture:" + name)
        return null
      }
      this.textures[name] = new THREE.Texture(texture)
      this.textures[name].name = name
      this.textures[name].minFilter = THREE.LinearFilter
      needsUpdate = true
    }

    const texture = this.textures[name];
    if (param) {
      this.setParameter(texture, param, "wrapS")
      this.setParameter(texture, param, "wrapT")
      this.setParameter(texture, param, "minFilter")

      needsUpdate = true
    }

    texture.needsUpdate = needsUpdate

    return texture
  }

  initBuffer(id, data) {
    this.bufferSetting[id] = data
  }

  getBuffer(id) {
    return this.bufferSetting[id]
  }

  addMotion(obj3D, sceneConf) {
    sceneConf.motion.forEach(motion => {
      const cues = [];

      motion.cue.forEach(item => {
        cues.push({
          frame: item.frame,
          fired: false,
          method: this.animationSetting[item.method].bind(LoaderManager)
        })
      })

      obj3D.userData.motions[motion.id] = {
        id: motion.id,
        frame: motion.frame,
        cues
      }
    })
  }

  initMotion(obj3D, sceneConf) {
    if (sceneConf.motion) {
      obj3D.userData.currentFrame = 0
      obj3D.userData.motions = {}
      this.addMotion(obj3D, sceneConf)
      obj3D.playAnimation = LoaderManager.playAnimation.bind(obj3D)
      obj3D.stopAnimation = LoaderManager.stopAnimation.bind(obj3D)
      obj3D.resetCue = LoaderManager.resetCue.bind(obj3D)
      obj3D.setKeyFrame = LoaderManager.setKeyFrame.bind(obj3D)
      obj3D.renderKeyFrame = LoaderManager.renderKeyFrame.bind(obj3D)
    }
  }

  getSkinningMesh() { }

  initCamera() { }

  initObject(sceneConf, scenee, scenen) {
    let obj3D = undefined,
      materialList = undefined,
      depthMaterialList = undefined;

    if (sceneConf.shader) {
      materialList = []
      sceneConf.shader.forEach(item => {
        const material = this.getMaterial(item);
        if (sceneConf.type === 2) {
          material.defines.USE_INSTANCE = 1
        } else if (sceneConf.type === 3) {
          material.skinning = true
        }
        materialList.push(material)
      })

      if (materialList.length === 1) materialList = materialList[0]
    }

    if (sceneConf.depthShader) {
      depthMaterialList = []
      sceneConf.depthShader.forEach(item => {
        var material = this.getMaterial(item);
        if (sceneConf.type === 2) {
          material.defines.USE_INSTANCE = 1
        } else if (sceneConf.type === 3) {
          material.skinning = true
        }
        depthMaterialList.push(material)
      })

      if (depthMaterialList.length === 1) depthMaterialList = depthMaterialList[0]
    }

    switch (sceneConf.type) {
      case 0:
        obj3D = new THREE.Object3D;
        break;
      case 1:
        obj3D = new THREE.Mesh(this.getGeometry(sceneConf.geometry), materialList);
        break;
      case 2:
        obj3D = new THREE.Mesh(this.getGeometry(sceneConf.geometry), materialList)
        obj3D.frustumCulled = false;
        break;
      case 3:
        obj3D = this.getSkinningMesh(sceneConf.geometry, sceneConf.skin, materialList);
        break;
      case 4:
        obj3D = this.createSpine(sceneConf, materialList);
        break;
      case 5:
        obj3D = this.createText(sceneConf.text, materialList);
        break;
      default:
        this.objectPlugins.forEach(item => {
          const obj = item.process(sceneConf, materialList, this);
          if (obj) obj3D = obj
        })
    }
    if (depthMaterialList) {
      obj3D.userData.depthMat = depthMaterialList
    }

    if (materialList) {
      obj3D.userData.colorMat = materialList
    }

    if (sceneConf.props) {
      sceneConf.props.forEach(item => {
        obj3D.userData[item] = sceneConf[item]
      })
    }

    obj3D.position.fromArray(sceneConf.position)
    obj3D.quaternion.fromArray(sceneConf.quaternion)
    obj3D.scale.fromArray(sceneConf.scale)

    obj3D.castShadow = sceneConf.castShadow === 1
    obj3D.receiveShadow = sceneConf.receiveShadow === 1
    obj3D.matrixAutoUpdate = sceneConf.move === 1

    obj3D.updateMatrix()

    obj3D.name = sceneConf.id
    obj3D.scene = scenen
    obj3D.userData.initPos = obj3D.position.clone()
    obj3D.userData.initRot = obj3D.quaternion.clone()
    obj3D.userData.initScl = obj3D.scale.clone()

    if (sceneConf.noCull === 1) {
      obj3D.frustumCulled = false
    }
    if (sceneConf.animation) {
      obj3D.userData.speed = .2 * Math.random() + .8
      obj3D.userData.delay = 100 * Math.random()
      obj3D.userData.range = Math.random()
      obj3D.onBeforeRender = this.animationSetting[sceneConf.animation].bind(obj3D)
    }

    if (sceneConf.mask === 1) {
      obj3D.onBeforeRender = this.defaultAnimationSetting.DRAW_MASK
      obj3D.onAfterRender = this.defaultAnimationSetting.BEGIN_MASK
    } else if (sceneConf.mask === 2) {
      obj3D.onBeforeRender = this.defaultAnimationSetting.DRAW_MASK
      obj3D.onAfterRender = this.defaultAnimationSetting.BEGIN_INVERT_MASK
    } else if (sceneConf.mask === 3) {
      obj3D.onAfterRender = this.defaultAnimationSetting.STOP_MASK
    }

    if (sceneConf.hide) obj3D.visible = false

    if (sceneConf.click) {
      obj3D.userData.mouseEnabled = true

      if (this.animationSetting[sceneConf.click]) {
        obj3D.userData.onClick = this.animationSetting[sceneConf.click].bind(obj3D)
      } else {
        console.error("no animation:", sceneConf.click)
      }

      if (!scenen.clicks) scenen.clicks = []

      if (scenen.clicks.indexOf(obj3D) === -1) scenen.clicks.push(obj3D)
    }

    if (sceneConf.mousedown) {
      obj3D.userData.mouseEnabled = true

      if (this.animationSetting[sceneConf.mousedown]) {
        obj3D.userData.onMouseDown = this.animationSetting[sceneConf.mousedown].bind(obj3D)
      } else {
        console.error("no animation:", sceneConf.mousedown)
      }

      if (!scenen.clicks) scenen.clicks = []
      if (scenen.clicks.indexOf(obj3D) === -1) scenen.clicks.push(obj3D)
    }

    if (sceneConf.mousemove) {
      obj3D.userData.mouseEnabled = true

      if (this.animationSetting[sceneConf.mousemove]) {
        obj3D.userData.onMouseMove = this.animationSetting[sceneConf.mousemove].bind(obj3D)
      } else {
        console.error("no animation:", sceneConf.mousemove)
      }

      if (!scenen.clicks) scenen.clicks = []
      if (scenen.clicks.indexOf(obj3D) === -1) scenen.clicks.push(obj3D)
    }

    if (sceneConf.mouseup) {
      obj3D.userData.mouseEnabled = true

      if (this.animationSetting[sceneConf.mouseup]) {
        obj3D.userData.onMouseUp = this.animationSetting[sceneConf.mouseup].bind(obj3D)
      } else {
        console.error("no animation:", sceneConf.mouseup)
      }

      if (!scenen.clicks) scenen.clicks = []
      if (scenen.clicks.indexOf(obj3D) === -1) scenen.clicks.push(obj3D)
    }


    if (sceneConf.mousewheel) {
      obj3D.userData.mouseEnabled = true

      if (this.animationSetting[sceneConf.mousewheel]) {
        obj3D.userData.onMouseWheel = this.animationSetting[sceneConf.mousewheel].bind(obj3D)
      } else {
        console.error("no animation:", sceneConf.mousewheel)
      }

      if (!scenen.clicks) scenen.clicks = []
      if (scenen.clicks.indexOf(obj3D) === -1) scenen.clicks.push(obj3D)
    }

    sceneConf.event && sceneConf.event.forEach(item => {
      if (this.animationSetting[item.method]) {
        // c.addEventListener(item.event, this.animationSetting[item.method].bind(obj3D))
      } else {
        console.log(sceneConf.id + " " + item.event + " " + item.method + " not found")
      }
    })


    this.initMotion(obj3D, sceneConf)
    if (!sceneConf.skip) scenee.add(obj3D)

    if (sceneConf.renderOrder) {
      obj3D.renderOrder = sceneConf.renderOrder
    }

    sceneConf.children.forEach(item => {
      this.initObject(item, obj3D, scenen)
    })

    if (sceneConf.init) {
      this.animationSetting[sceneConf.init].apply(obj3D, [sceneConf, this])
    }
  }

  initShader(data) {
    this.shaderSetting = data
  }

  initAnimation(data) {
    this.animationSetting = data
  }

  initSpine(data) {
    this.spineSetting = data
  }

  changeTouch(scene, camera) {
    this.mouseCheckScene = scene
    this.mouseCheckCamera = camera
  }

  initTouch() { }
  disableTouch() { }
  onDomMouseWheel() { }
  onDomMouseMove() { }
  onDomMouseDown() { }
  onDomMouseUp() { }
  onDomMouseClick() { }
  onDomTouchEnd() { }
  onDomTouchMove() { }
  onDomTouchStart() { }
  checkSceneClick() { }

  get isMouseFree() {
    return this.mouseEnabled
  }

  get uniforms() {
    return this.uniformSetting
  }

  updateTextTexture() { }

  copyGeometry() { }

  getParameter(obj, key) {
    var result = obj.match(new RegExp("(^|&)" + key + "=([^&]*)(&|$)"));
    return result ? result[2] : null
  }

  setParameter(target, obj, key) {
    const current = this.getParameter(obj, key);
    if (current) {
      const val = target[key];
      target[key] = isNaN(current) ? current : parseInt(current)
      return val !== target[key]
    }
    return false
  }

  static resetCue(data) {
    data.cues.forEach(item => {
      item.fired = false
    })
  }

  static renderKeyFrame() {
    if (this.userData.currentMotion) {
      const curFrame = Math.floor(this.userData.currentFrame),
        nextFrame = Math.ceil(this.userData.currentFrame),
        frameOffset = this.userData.currentFrame - curFrame;

      if (curFrame < this.userData.previousFrame) this.resetCue(this.userData.currentMotion)

      const curFrameData = this.userData.currentMotion.frame[curFrame]
      const nextFrameData = this.userData.currentMotion.frame[nextFrame]

      if (nextFrameData.pos) {
        const cur = (new THREE.Vector3).fromArray(curFrameData.pos),
          next = (new THREE.Vector3).fromArray(nextFrameData.pos);

        this.position.copy(cur.lerp(next, frameOffset))
      }

      if (nextFrameData.rotq) {
        const cur = (new THREE.Quaternion).fromArray(curFrameData.rotq),
          next = (new THREE.Quaternion).fromArray(nextFrameData.rotq);

        this.quaternion.copy(cur.slerp(next, frameOffset))
      }

      if (nextFrameData.scl) {
        const cur = (new THREE.Vector3).fromArray(curFrameData.scl),
          next = (new THREE.Vector3).fromArray(nextFrameData.scl);

        this.scale.copy(cur.lerp(next, frameOffset))
      }

      if (nextFrameData.morph) {
        this.material.uniforms.morphTargetInfluences.value.forEach((_, i) => {
          this.material.uniforms.morphTargetInfluences.value[i] =
            curFrameData.morph[i] + (nextFrameData.morph[i] - curFrameData.morph[i]) * frameOffset
        })
      }

      this.userData.currentMotion.cues.forEach(item => {
        if (item.frame <= curFrame && !item.fired) {
          item.fired = true
          item.method()
        }
      })

      this.updateMatrix()
      this.userData.previousFrame = curFrame
    }
  }

  static setKeyFrame(motion, frame) {
    this.userData.currentFrame = frame
    this.userData.currentMotion = this.userData.motions[motion]

    if (this.userData.currentMotion.frame[frame].pos) this.position.fromArray(this.userData.currentMotion.frame[frame].pos)
    if (this.userData.currentMotion.frame[frame].rotq) this.quaternion.fromArray(this.userData.currentMotion.frame[frame].rotq)
    if (this.userData.currentMotion.frame[frame].scl) this.scale.fromArray(this.userData.currentMotion.frame[frame].scl)

    this.updateMatrix()
  }

  static playAnimation(key, options) {
    const {
      speed = 1,
      repeat = 0,
      delay = 0,
      ease = gsap.Linear.easeNone,
      reverse,
      start,
      end,
      fps = 40,
      onComplete = null,
      onUpdate = null
    } = options || {}

    this.stopAnimation()
    this.userData.currentMotion = this.userData.motions[key]
    this.resetCue(this.userData.currentMotion);

    const startFrame = isNaN(start) ? 0 : start,
      endFrame = isNaN(end) ? this.userData.currentMotion.frame.length - 1 : end;

    this.userData.currentFrame = startFrame
    this.renderKeyFrame();

    const duration = Math.abs(endFrame - this.userData.currentFrame) / fps / speed;
    this.userData.tween = gsap.TweenMax.fromTo(
      this.userData,
      duration,
      {
        currentFrame: reverse ? endFrame : startFrame
      },
      {
        ease,
        overwrite: 1,
        currentFrame: reverse ? startFrame : endFrame,
        delay,
        repeat,
        onUpdate: onUpdate ? () => {
          onUpdate()
          this.renderKeyFrame()
        } : () => {
          this.renderKeyFrame()
        },
        onComplete
      }
    )

    return this.userData.tween
  }

  static stopAnimation() {
    if (this.userData.tween) {
      this.userData.tween.kill()
      this.userData.tween = null
    }
  }

  preventMouseEvent(evt) {
    evt.preventDefault()
  }

  sceneHitTest(coords, mouseCheck, camera, fnKey) {
    const raycaster = new THREE.Raycaster;

    raycaster.setFromCamera(coords, camera);

    let arr = [];
    if (mouseCheck.clicks) {
      for (let i = mouseCheck.clicks.length - 1; i > -1; i--) {
        if (!mouseCheck.clicks[i].visible) {
          mouseCheck.clicks[i].updateMatrixWorld()
          mouseCheck.clicks[i].raycast(raycaster, arr)
        }

        if (
          mouseCheck.clicks[i].userData.mouseEnabled &&
          mouseCheck.clicks[i].userData[fnKey] &&
          arr.length > 0
        ) {
          return mouseCheck.clicks[i].userData[fnKey](arr[0])
        }
      }
    }
  }
}

export { LoaderManager }