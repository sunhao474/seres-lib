<script>
import { defineComponent, reactive, toRefs } from 'vue'
import { Filter, TablePagination } from 'lib/components'

export default defineComponent({
  components: {
    Filter,
    TablePagination
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
          type: 'select',
          options: [
            '充电', '放电'
          ]
        },
      ],
      tableData: {
        currentPage: 1,
        pageSize: 10,
        total: 20,
        data: [
          {
            name: 's',
            age: 1
          },
          {
            name: 's2',
            age: 12
          },
        ],
        column: [
          {
            label: '年龄',
            prop: 'age'
          },
          {
            label: '名字',
            prop: 'name'
          }
        ]
      }
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
  <TablePagination
    :tableData="tableData"
  />
  <button @click="handleClickButton">点我一刀999</button>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
