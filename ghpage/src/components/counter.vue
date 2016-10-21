<template>
  <div class="counter">
    <slot></slot>
    <span class="counter-content">
      <span class='btn' @click='increment'>+</span>
      <span class='input'>{{ innerNum }}</span>
      <span class='btn' @click='decrement'>-</span>
    </span>
  </div>
</template>

<script>
  export default {
    props: ['type', 'order'],
    computed: {
      innerNum () {
        return this.$store.state.options[this.type]
      },
    },
    methods: {
      increment () {
        let obj = {
          type: this.type,
          order: this.order,
          option: 'increment'
        }
        this.$store.dispatch('updateOptions', obj)
      },
      decrement () {
        let obj = {
          type: this.type,
          order: this.order,
          option: 'decrement'
        }
        this.$store.dispatch('updateOptions', obj)
      }
    }
  }
</script>

<style scoped lang="less">
  .counter {
    margin-bottom: 5px;
    .counter-name {
      font-size: 12px;
      display: inline-block;
      width: 11rem;
      text-align: right;
      padding-right: 1.5rem;
      box-sizing: border-box;
    }
    .counter-content {
      font-size: 0;
      .btn,
      .input {
        display: inline-block;
        font-size: 14px;
        text-align: center;
        outline: none;
      }
      .input {
        border: 1px solid #bbb;
        border-left: none;
        border-right: none;
        width: 5rem;
        vertical-align: top;
      }
      .btn {
        padding: 0 1rem;
        border: 1px solid #bbb;
        background: none;
        vertical-align: top;
        cursor: pointer;
        &:active{
          background: #333;
          color: #fff;
        }
      }
    }
  }
</style>