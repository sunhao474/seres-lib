<script>
import { defineComponent, reactive, toRefs } from 'vue'
import { Filter } from 'lib/components'

export default defineComponent({
  components: {
    Filter
  },
  props: {
    msg: String
  },
  setup() {
    const state = reactive({
      formParams: {},
      filterOpts: [
        {
          label: '测试',
          key: 'inputNum',
          placeholder: '你好世界',
          clearable: true,
          type: 'input'
        },
        {
          label: '测试',
          key: 'inputNum2',
          placeholder: '你好世界',
          clearable: true,
          type: 'input'
        },
      ]
    })

    function handleClickButton() {
      console.log(state.formParams.inputNum)
    }

    return {
      ...toRefs(state),
      handleClickButton
    }
  }
})
</script>

<template>
  <Filter msg="123321" :inline="true" :formParams="formParams" :filterOpts="filterOpts"/>
  <button @click="handleClickButton">点我一刀999</button>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
