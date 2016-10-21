<template>
  <div class="counter">
    <slot></slot>
    <span class="counter-content">
      <button @click='increment'>+</button>
      <input type="text" :value='innerNum' maxlength="6" readonly>
      <button @click='decrement'>-</button>
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
      button,
      input {
        font-size: 14px;
        text-align: center;
        outline: none;
      }
      input {
        border: 1px solid #bbb;
        border-left: none;
        border-right: none;
        width: 5rem;
        vertical-align: top;
      }
      button {
        border: 1px solid #bbb;
        background: none;
        vertical-align: top;
        &:active{
          background: #333;
          color: #fff;
        }
      }
    }
  }
</style>