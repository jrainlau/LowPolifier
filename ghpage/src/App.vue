<template>
  <div id="app">
    <div class="head">
      <h1>
        Low-Poly
        <img src="./assets/logo.png" alt="">
      </h1>
      <div class="output">
        <img v-show='src' :src='src' alt="Select a picture" @click='upload'>
        <button v-show='!src' class="uploader" @click='upload'>Select a picture</button>
        <input type="file" capture="camera" accept="image/*" id="upload-btn" @change='getFile' hidden>
      </div>
    </div>
    <Counter type='ddv' order='5'>
      <span class="counter-name">Edge detact value:</span>
    </Counter>
    <Counter type='pr' order='0.005'>
      <span class="counter-name">Point rate:</span>
    </Counter>
    <Counter type='pmn' order='100'>
      <span class="counter-name">Point max number:</span>
    </Counter>
    <Counter type='bs' order='1'>
      <span class="counter-name">Blur size:</span>
    </Counter>
    <Counter type='es' order='1'>
      <span class="counter-name">Edge size:</span>
    </Counter>
    <Counter type='pl' order='1000'>
      <span class="counter-name">Pixel limit:</span>
    </Counter>
    <button class="generate-btn" @click='styling'>
      <span v-show='working' class="spinner">―</span>
      <span v-show='!working'>Generate</span>
    </button>
  </div>
</template>

<script>
  import LowPoly from 'lowpoly'
  import Counter from './components/counter.vue'
  export default {
    name: 'app',
    data () {
      return {
        src: '',
        working: false
      }
    },
    components: {
      Counter
    },
    methods: {
      upload () {
        document.querySelector('#upload-btn').click()
      },
      getFile (e) {
        let reader = new FileReader()
        let file = e.target
        reader.onload = () => {
          this.src = reader.result
        }
        reader.readAsDataURL(file.files[0])
      },
      styling () {
        this.working = true
        let options = this.$store.state.options
        let lowpoly = new LowPoly(this.src, {
          EDGE_DETECT_VALUE: options.ddv,
          POINT_RATE: options.pr,
          POINT_MAX_NUM: options.pmn,
          BLUR_SIZE: options.bs,
          EDGE_SIZE: options.es,
          PIXEL_LIMIT: options.pl
        })
        .init()
        .then((data) => {
          this.src = data
          this.working = false
        })
      }
    }
  }
</script>

<style lang="less">
  html,
  body {
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
    font-size: 14px;
    font-family: Microsoft Yahei, "PingHei", "Helvetica Neue", "Helvetica", "STHeitiSC-Light", "Arial", sans-serif;
    color: #333;
  }
  #app {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    .head {
      width: 100%;
      h1 {
        font-size: 0;
        border-bottom: 1px solid #aaa;
        text-align: center;
        width: 100%;
        img {
          max-width: 20%;
          max-height: 60px;
          padding: 5px 0;
        }
      }
      .output {
        background: #fff;
        border-bottom: 1px solid #aaa;
        width: 100%;
        height: 40rem;
        text-align: center;
        margin-bottom: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        .uploader {
          width: 40%;
          height: 20%;
          background: none;
          border: 1px solid #aaa;
          outline: none;
          &:active{
            background: #333;
            color: #fff;
          }
        }
        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          cursor: pointer;
        }
        @media (max-width: 738px) {
          height: 20rem;
        }
      }
    }
    .generate-btn {
      width: 95%;
      height: 4rem;
      margin-bottom: 10px;
      background: none;
      border: 1px solid #aaa;
      font-size: 18px;
      outline: none;
      &:active{
        background: #333;
        color: #fff;
      }
      .spinner {
        display: inline-block;
        width: 1.2rem;
        height: 1.2rem;
        line-height: 1.2rem;
        font-size: 1.2rem;
        animation: spin 1.2s infinite;
      }
    }
    @keyframes spin {
      from {
        transform: rotate(0);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }
</style>


