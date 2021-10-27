<template>
  <div id="app">
    <reservation-effect
      :width="viewportSize.width"
      :height="viewportSize.height"
    ></reservation-effect>
  </div>
</template>

<script>
import reservationEffect from "./components/main.vue";

export default {
  name: "App",
  data() {
    return {
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
</style>
