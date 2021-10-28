<template>
  <div class="effect-wrap">
    <canvas id="webglCanvas" ref="webglCanvas"></canvas>
  </div>
</template>

<script>
// 引入threejs和gsap
import * as THREE from "three";
import * as gsap from "gsap/all";

/**
 * 动画相关配置
 * 定义了加载、页面状态切换和场景物体触发等事件需要播放的动画和提供的播放方法
 */
import animationSetting from "@/config/animationSetting";

/**
 * 着色器材质配置
 * 配置了使用自定义shader渲染的材质列表
 */
import shaderSetting from "@/config/shaderSetting";

/**
 * 全局状态
 * uniform名字应该是来源于three和glsl编程的概念
 */
import uniformSetting from "@/config/uniformSetting";

/**
 * 场景配置文件，推测是由3d建模软件插件导出，包含了几何体和场景的配置
 * 如 id(3js中Object Name用到)、类型、生命周期事件、位置、透明度、着色器、渲染顺序等
 */
import sceneSetting from "@/config/sceneSetting.json";

/**
 * 资源加载清单
 * 根据场景和类型做了分类，可加载的包括材质图、spine动画(本demo未用到)等
 */
import MANIFEST from "@/config/MANIFEST.js";

/**
 * loading舞台和main舞台类
 * 包含了舞台的初始化、相机设置、渲染方法等
 */
import { LoadingStage, MainStage } from "@/three/Stage.js";

/**
 * 加载管理器
 * 负责整个渲染流程的管理，包括资源加载、几何体初始化、事件派发、动画管理、全局状态更新等
 */
import { LoaderManager } from "@/utils/loaderManager";

// 自定义物体类型处理插件，在加载管理器的initObject方法中被调用
import { OP100, OP101, OP102, OP200 } from "@/three/plugins/object.js";

// 性能监控插件
import Stats from "stats.js";

let __DPR = Math.max(1.5, Math.min(2.5, window.devicePixelRatio)), // 屏幕dpr
  lm = undefined, // 加载管理器实例
  renderer = undefined, // Threejs 渲染器
  loadingStage = undefined, // loading舞台实例
  mainStage = new MainStage(), // main舞台实例
  fileLoader = LoaderManager.getLoader(), // 文件加载器
  sceneIndex = undefined, // main场景
  sceneLoading = undefined, // loading场景
  camera = new THREE.PerspectiveCamera(32, 1, 1, 1e5); // 主相机

// 设置相机位置居中，距离1500
camera.position.set(0, 0, 1500);

// 创建缓冲，用于在绘制前添加特效
const target = new THREE.WebGLRenderTarget(1, 1, {
  format: THREE.RGBFormat,
});

// 背景缓冲，疑似是特效图层
const BG_BUFFER = new THREE.WebGLRenderTarget(1, 1, {
  format: THREE.RGBFormat,
});

// 根据debug开关控制是否显示性能监控
const DEBUG = location.search.indexOf("debug=1") > -1;
let stats = null;
if (DEBUG) {
  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);
}

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
    // 销毁前的清理工作
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
    // 视口宽高
    width: {
      type: Number,
      default: undefined,
    },
    height: {
      type: Number,
      default: undefined,
    },

    // 页面类型 原始项目中会切换页面，渲染上会有所区别
    type: {
      type: String,
      default: "index",
    },

    // 是否显示3d图层 原始项目会有翻页，可能需要隐藏3d图层
    display: {
      type: Boolean,
      default: true,
    },

    // 是否为PC 需要针对不同设备做出区分 如摄影机和粒子数量等
    isPC: {
      type: Boolean,
      default: true,
    },

    // 加载logo 原始项目会有多语言需求，需要加载不同语言的logo
    loadingLogo: {
      type: String,
      default: require("@/assets/textures/loadingLogo.png"),
    },

    // 猜测为纵向滚动条位置，用于实现视差效果等
    y: {
      type: Number,
      default: 0,
    },
  },
  watch: {
    // 根据页面类型执行切页过渡效果
    type() {
      sceneIndex && sceneIndex.change && sceneIndex.change(this.type, this.y);
    },

    // 宽高发生变化后标记需要resize
    width() {
      this.needResize = true;
    },
    height() {
      this.needResize = true;
    },

    // 滚动条变化时需要绘制视差效果
    y() {
      sceneIndex && sceneIndex.scroll && sceneIndex.scroll(this.y);
    },

    // 猜测为fallback，当前页不支持webgl仍回报加载完成
    isWebGLSupport() {
      if (!this.isWebGLSupport) {
        setTimeout(() => {
          this.$emit("introComplete");
        });
      }
    },
  },
  computed: {
    // 原始项目海外版包含内页，猜测为海外版需要区分背景图
    staticBG() {
      return "index" === this.type ? this.indexBG : this.innerBG;
    },
  },
  mounted() {
    console.log(0, "mounted", "组件挂载 ");
    // 组件挂载后开始初始化资源加载清单
    this.prepareLoadingManifest();
  },
  data() {
    return {
      needResize: false, // 是否需要resize
      isWebGLSupport: true, // 是否支持webgl
      indexBG: require("@/assets/textures/indexStatic.jpg"), // 首页背景
      innerBG: require("@/assets/textures/innerStatic.jpg"), // 内页背景
    };
  },
  methods: {
    // 添加文件加载器事件监听
    addLoadListeners() {
      fileLoader.addEventListener("progress", this.onLoadProgress);
      fileLoader.addEventListener("error", this.onLoadError);
      fileLoader.addEventListener("complete", this.onLoadComplete);
    },
    // 清除文件加载器事件监听
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
    // main场景资源加载完成
    onLoadComplete() {
      console.log(6, "onLoadComplete", "main场景资源加载完成");
      this.clearLoadListeners(); // 加载完成后移除事件监听
      this.build3D(); // 构建场景
      this.$emit("loadComplete");
      this.loaded = true; // 标记文件加载完成
    },
    // loading场景资源加载完成
    onPrepareComplete(evt) {
      console.log(2, "onPrepareComplete", "loading场景资源加载完成");
      this.clearLoadListeners();
      this.initRenderPlayer();
      this.prepareMainManifest();
      evt && this.buildLoading();
      this.onResize();
      this.render3D();
    },
    // 准备loading场景资源清单
    prepareLoadingManifest() {
      console.log(1, "prepareLoadingManifest", "准备loading场景资源清单");
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
    // 准备main场景资源清单
    prepareMainManifest() {
      console.log(4, "prepareMainManifest", "准备main场景资源清单");
      this.clearLoadListeners();
      this.addLoadListeners();
      fileLoader.loadManifest(MANIFEST.INDEX_MANIFEST);
    },
    // 构建main场景
    build3D() {
      console.log(7, "build3D", "构建main场景");
      // 加载管理器初始化main场景物体
      lm.initObject(sceneSetting.sceneIndexPC, sceneIndex, sceneIndex);
      // 如果为移动设备重设一次尺寸
      if (!this.isPC) sceneIndex.resize();
      // 重设视差和滚动效果
      sceneIndex.change(this.type, this.y, 0);
      sceneIndex.scroll(this.y);
      // 编译特效
      lm.compile(sceneIndex, camera, target);
    },
    // 构建loading场景
    buildLoading() {
      console.log(5, "buildLoading", "构建loading场景");
      // 加载管理器初始化loading场景物体
      lm.initObject(sceneSetting.sceneLoading, sceneLoading, sceneLoading);
      // 播放loading场景入场动画(logo)
      sceneLoading.intro();
    },
    // 初始化渲染器
    initRenderPlayer() {
      console.log(3, "initRenderPlayer", "初始化渲染器");
      try {
        // 初始化webgl渲染器
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

      // 初始化加载管理器，传入相关配置
      lm = new LoaderManager({
        renderer: renderer,
        animationSetting: animationSetting,
        uniformSetting: uniformSetting,
        shaderSetting: shaderSetting,
        spineSetting: MANIFEST.SPINE_MANIFEST,
      });

      // 传入自定义物体类型处理插件
      lm.objectPlugins.push(new OP100(this.isPC));
      lm.objectPlugins.push(OP101);
      lm.objectPlugins.push(OP102);
      lm.objectPlugins.push(OP200);

      // 初始化loading舞台
      loadingStage = new LoadingStage(renderer, target);

      // 初始化几何体
      lm.initGeometry(sceneSetting.geometry);
      // 初始化背景缓冲
      lm.initBuffer("BG_BUFFER", BG_BUFFER);

      // 初始化loading场景
      sceneLoading = new THREE.Scene();
      // 初始化main场景
      sceneIndex = new THREE.Scene();

      // 当前为首页时默认隐藏main场景，作用未知
      sceneIndex.visible = this.type !== "index";
      // BG_BUFFER挂载到main场景对象上
      sceneIndex.bgBuffer = BG_BUFFER;

      // 根据设备设置场景z轴距离
      sceneLoading.position.z = this.isPC ? -300 : -600;
      sceneIndex.position.z = this.isPC ? 0 : -80;

      // PC端监听鼠标移动
      if (this.isPC) {
        window.addEventListener("mousemove", this.onMouseMove);
      }
    },
    // 鼠标移动处理
    onMouseMove(evt) {
      // 根据鼠标相对于窗口尺寸的比例计算视角偏移 实现视差效果
      if (sceneIndex && sceneIndex.move) {
        sceneIndex.move(evt.clientX / this.width, evt.clientY / this.height);
      }
    },
    // 窗口尺寸变化处理
    onResize() {
      if (renderer) {
        // 计算当前窗口宽高，修正浏览器缩放的影响
        const scaleFix = Math.min(1, window.devicePixelRatio),
          w = scaleFix * (this.width || window.innerWidth),
          h = scaleFix * (this.height || window.innerHeight);

        camera.aspect = w / h; // 设置视锥体长宽比
        camera.zoom = Math.max(1, w / h / (16 / 9)); // 设置缩放比例
        camera.updateProjectionMatrix(); // 更新投影矩阵，应用调整

        renderer.setSize(w, h); // 设置渲染器尺寸
        loadingStage.setResolution(w * __DPR, h * __DPR); // 设置loading舞台尺寸
        target.setSize(w * __DPR, h * __DPR); // 设置缓冲尺寸
        BG_BUFFER.setSize(w * __DPR, h * __DPR); // 设置背景缓冲尺寸
        uniformSetting.resolution.value.set(w * __DPR, h * __DPR, __DPR); // 设置全局变量里的分辨率
      }
    },
    // 每帧被执行的渲染方法
    render3D() {
      stats && stats.begin(); // 开始记录性能数据

      // 需要重设尺寸时进行相应操作
      if (this.needResize) {
        this.onResize();
        this.needResize = false;
      }

      lm.tick(); // 执行加载管理器的tick 更新帧生成时间 fps 程序运行时间

      if (this.display) {
        // 未开始播放时根据当前实例的进度设置进度变量
        if (!this.played) {
          uniformSetting.progress.value +=
            0.03 * (0.8 * this.progress - uniformSetting.progress.value);
        }

        // 进度大于0.75且已加载未播放
        if (
          uniformSetting.progress.value > 0.75 &&
          this.loaded &&
          !this.played
        ) {
          this.played = true; // 设置播放状态为true
          sceneLoading.outro(); // loading场景出场
          // main场景进场 回调中回报加载完成
          sceneIndex.intro(() => {
            this.$emit("introComplete");
          });

          // 延迟0.3s，在1.5s内设置loadingStage.progress为1.2 进入正常渲染循环
          gsap.TweenMax.to(loadingStage.progress, 1.5, {
            value: 1.2,
            delay: 0.3,
          });
        }

        // main场景可见时
        if (sceneIndex.visible) {
          // 把main场景绘制到缓冲区
          renderer.render(sceneIndex, camera, target, true);

          if (loadingStage.progress.value === 1.2) {
            /* 
             当loadingStage.progress为1.2时(正常渲染循环)
             在每次帧循环中渲染main场景
            */
            mainStage.render(renderer, target, null, true);
          } else {
            // 即将进入正常渲染循环时清空loading舞台
            loadingStage.render(null, true);
          }
        }

        // loadind场景可见时
        if (sceneLoading.visible) {
          renderer.render(sceneLoading, camera, null, !sceneIndex.visible);
        }
      }

      stats && stats.end(); // 结束记录性能数据

      // 重新请求帧执行，完成一次帧循环
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