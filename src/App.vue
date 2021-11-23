<template>
  <div id="app" @scroll="handleScroll">
    <reservation-effect
      :type="effectType"
      :width="viewportSize.width"
      :height="viewportSize.height"
      :y="scrollV"
    ></reservation-effect>
    <div class="content"></div>
  </div>
</template>

<script>
import reservationEffect from "./components/main.vue";

export default {
  name: "App",
  data() {
    return {
      effectType: "index",
      scrollV: 0,
      // 视口尺寸
      viewportSize: {
        width: undefined,
        height: undefined,
      },
    };
  },
  methods: {
    onResize() {
      this.viewportSize.height = window.innerHeight;
      this.viewportSize.width = window.innerWidth;
    },
    handleScroll(evt) {
      const { scrollTop = 0 } = evt.target;
      if (scrollTop >= 0) {
        if (scrollTop > 0.75 * this.viewportSize.height) {
          this.effectType = "inner";
        } else {
          this.effectType = "index";
          this.scrollV = parseInt("-" + scrollTop, 10);
        }
      }
    },
  },
  created() {
    // 页面打开时监听resize事件并设置视口尺寸
    window.addEventListener("resize", this.onResize);
    this.onResize();
  },
  components: {
    reservationEffect,
  },
};
</script>

<style lang="less">
html,
body {
  background-color: #000;
  margin: 0;
  padding: 0;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  height: 100%;
  overflow: hidden !important;
}

#app {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
}

.content {
  position: relative;
  height: 200vh;
  z-index: 10;
}
</style>
