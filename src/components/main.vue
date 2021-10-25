<template>
  <div class="effect-wrap">
    <canvas id="webglCanvas" ref="webglCanvas"></canvas>
  </div>
</template>

<script>
import * as THREE from "three";
import * as gsap from "gsap/all";

import animationSetting from "@/config/animationSetting";
import shaderSetting from "@/config/shaderSetting";
import uniformSetting from "@/config/uniformSetting";
import sceneSetting from "@/config/sceneSetting.json";

import MANIFEST from "@/assets/MANIFEST.js";

import { LoadingStage, MainStage } from "@/three/Stage.js";

import { LoaderManager } from "@/utils/loaderManager";

import { OP100, OP101, OP102, OP200 } from "@/three/plugins/object.js";

import Stats from "stats.js";

let __DPR = Math.max(1.5, Math.min(2.5, window.devicePixelRatio)), // 屏幕dpr
  lm = undefined, // loader加载器实例？
  renderer = undefined, // renderer  w  3js渲染器？
  loadingStage = undefined, //x  加载舞台？
  mainStage = new MainStage(), //S  主舞台？
  fileLoader = LoaderManager.getLoader(), //loader  A  加载器？
  sceneIndex = undefined, //scene  M  主场景？
  sceneLoading = undefined, // scene E  加载场景？
  camera = new THREE.PerspectiveCamera(32, 1, 1, 1e5); //camera  T

camera.position.set(0, 0, 1500);

const target = new THREE.WebGLRenderTarget(1, 1, {
  format: THREE.RGBFormat,
});

const BG_BUFFER = new THREE.WebGLRenderTarget(1, 1, {
  format: THREE.RGBFormat,
});

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.domElement);

export default {
  name: "reservationEffect",
  created() {
    this.renderRequestID = -1;
    this.inited = false;
    this.progress = 0;
    this.loaded = false;
    this.played = false;
  },
  beforeDestroy() {
    window.cancelAnimationFrame(this.renderRequestID);
    window.removeEventListener("mousemove", this.onMouseMove);
    fileLoader.removeEventListener("loadProgress", this.onLoadProgress);
    fileLoader.removeEventListener("error", this.onLoadError);
    fileLoader.removeEventListener("complete", this.onLoadComplete);
    // fileLoader.removeAll();
    try {
      renderer && renderer.forceContextLoss();
    } catch (err) {
      console.log(err);
    }
  },
  props: {
    width: {
      type: Number,
      default: undefined,
    },
    height: {
      type: Number,
      default: undefined,
    },
    type: {
      type: String,
      default: "index",
    },
    display: {
      type: Boolean,
      default: true,
    },
    isPC: {
      type: Boolean,
      default: true,
    },
    loadingLogo: {
      type: String,
      default: require("@/assets/textures/loadingLogo.png"),
    },
    y: {
      type: Number,
      default: 0,
    },
  },
  watch: {
    type() {
      sceneIndex && sceneIndex.change && sceneIndex.change(this.type, this.y);
    },
    width() {
      this.needResize = true;
    },
    height() {
      this.needResize = true;
    },
    y() {
      sceneIndex && sceneIndex.scroll && sceneIndex.scroll(this.y);
    },
    isWebGLSupport() {
      if (!this.isWebGLSupport) {
        setTimeout(() => {
          this.$emit("introComplete");
        });
      }
    },
  },
  computed: {
    staticBG() {
      return "index" === this.type ? this.indexBG : this.innerBG;
    },
  },
  mounted() {
    this.prepareLoadingManifest();
  },
  data() {
    return {
      needResize: false,
      isWebGLSupport: true,
      indexBG: require("@/assets/textures/indexStatic.jpg"),
      innerBG: require("@/assets/textures/innerStatic.jpg"),
    };
  },
  methods: {
    addLoadListeners() {
      fileLoader.addEventListener("progress", this.onLoadProgress);
      fileLoader.addEventListener("error", this.onLoadError);
      fileLoader.addEventListener("complete", this.onLoadComplete);
    },
    clearLoadListeners() {
      fileLoader.removeEventListener("progress", this.onLoadProgress);
      fileLoader.removeEventListener("error", this.onLoadError);
      fileLoader.removeEventListener("complete", this.onLoadComplete);
      fileLoader.removeEventListener("complete", this.onPrepareComplete);
    },
    onLoadProgress(evt) {
      this.progress = evt.progress / 100;
      this.$emit("loadProgress", evt.progress);
    },
    onLoadError() {
      this.clearLoadListeners();
      this.isWebGLSupport = false;
      this.$emit("loadComplete");
    },
    onLoadComplete() {
      this.clearLoadListeners();
      this.build3D();
      this.$emit("loadComplete");
      this.loaded = true;
    },
    onPrepareComplete(evt) {
      this.clearLoadListeners();
      this.initRenderPlayer();
      this.prepareMainManifest();
      evt && this.buildLoading();
      this.onResize();
      this.render3D();
    },
    prepareLoadingManifest() {
      fileLoader.addEventListener("error", this.onLoadError);
      fileLoader.addEventListener("complete", this.onPrepareComplete);
      fileLoader.loadManifest([
        {
          src: this.loadingLogo,
          id: "loadingLogo",
          type: "image",
        },
        ...MANIFEST.LOADING_MANIFEST,
      ]);
    },
    prepareMainManifest() {
      this.clearLoadListeners();
      this.addLoadListeners();
      fileLoader.loadManifest(MANIFEST.INDEX_MANIFEST);
    },
    build3D() {
      lm.initObject(sceneSetting.sceneIndexPC, sceneIndex, sceneIndex);
      this.isPC || sceneIndex.resize();
      sceneIndex.change(this.type, this.y, 0);
      sceneIndex.scroll(this.y);
      lm.compile(sceneIndex, camera, target);
    },
    buildLoading() {
      lm.initObject(sceneSetting.sceneLoading, sceneLoading, sceneLoading);
      sceneLoading.intro();
    },
    initRenderPlayer() {
      try {
        renderer = new THREE.WebGLRenderer({
          canvas: this.$refs.webglCanvas,
        });

        renderer.setPixelRatio(__DPR);
        renderer.autoClear = false;
        renderer.setClearColor(0, 0);
      } catch (err) {
        console.log(err);
        this.isWebGLSupport = false;
        return;
      }

      lm = new LoaderManager({
        renderer: renderer,
        animationSetting: animationSetting,
        uniformSetting: uniformSetting,
        shaderSetting: shaderSetting,
        spineSetting: MANIFEST.SPINE_MANIFEST,
      });

      lm.objectPlugins.push(new OP100(this.isPC));
      lm.objectPlugins.push(OP101);
      lm.objectPlugins.push(OP102);
      lm.objectPlugins.push(OP200);
      loadingStage = new LoadingStage(renderer, target);
      lm.initGeometry(sceneSetting.geometry);
      lm.initBuffer("BG_BUFFER", BG_BUFFER);
      sceneLoading = new THREE.Scene();

      sceneIndex = new THREE.Scene();

      sceneIndex.visible = "index" !== this.type;
      sceneIndex.bgBuffer = BG_BUFFER;

      sceneLoading.position.z = this.isPC ? -300 : -600;
      sceneIndex.position.z = this.isPC ? 0 : -80;

      this.isPC && window.addEventListener("mousemove", this.onMouseMove);
    },
    onMouseMove(evt) {
      if (sceneIndex && sceneIndex.move) {
        sceneIndex.move(evt.clientX / this.width, evt.clientY / this.height);
      }
    },
    onResize() {
      if (renderer) {
        const scaleFix = Math.min(1, window.devicePixelRatio),
          w = scaleFix * (this.width || window.innerWidth),
          h = scaleFix * (this.height || window.innerHeight);

        camera.aspect = w / h;
        camera.zoom = Math.max(1, w / h / (16 / 9));
        camera.updateProjectionMatrix();

        renderer.setSize(w, h);
        loadingStage.setResolution(w * __DPR, h * __DPR);
        target.setSize(w * __DPR, h * __DPR);
        BG_BUFFER.setSize(w * __DPR, h * __DPR);
        uniformSetting.resolution.value.set(w * __DPR, h * __DPR, __DPR);
      }
    },
    render3D() {
      stats.begin();

      if (this.needResize) {
        this.onResize();
        this.needResize = false;
      }

      lm.tick();

      if (this.display) {
        if (!this.played) {
          uniformSetting.progress.value +=
            0.03 * (0.8 * this.progress - uniformSetting.progress.value);
        }

        if (
          uniformSetting.progress.value > 0.75 &&
          this.loaded &&
          !this.played
        ) {
          this.played = true;
          sceneLoading.outro();
          sceneIndex.intro(() => {
            this.$emit("introComplete");
          });

          gsap.TweenMax.to(loadingStage.progress, 1.5, {
            value: 1.2,
            delay: 0.3,
          });
        }

        if (sceneIndex.visible) {
          renderer.render(sceneIndex, camera, target, true);

          if (loadingStage.progress.value === 1.2) {
            mainStage.render(renderer, target, null, true);
          } else {
            loadingStage.render(null, true);
          }
        }

        if (sceneLoading.visible)
          renderer.render(sceneLoading, camera, null, !sceneIndex.visible);
      }

      stats.end();

      this.renderRequestID = window.requestAnimationFrame(this.render3D);
    },
  },
};
</script>

<style lang="less">
.effect-wrap {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;

  width: 100% !important;
  height: 100% !important;

  canvas {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    height: 100% !important;
  }
}
</style>