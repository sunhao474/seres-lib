<script>
import { defineComponent } from 'vue'
import { ElForm, ElOption, ElSelect, ElInput, ElFormItem, ElSelectV2 } from 'element-plus'

export default defineComponent({
  components: {
    ElForm, ElOption, ElSelect, ElInput, ElFormItem, ElSelectV2
  },
  props: {
    msg: String,
    inline: {
      type: Boolean,
      default: false
    },
    formParams: Object,
    formRules: Object,
    filterOpts: {
      type: Array,
      default: () => []
    },
    formStyle: {
      type: Object,
      default: () => {
        return {
          labelWidth: 100,
          singleSelectWidth: 240
        }
      }
    }
  },
  setup(props) {
  },
})
</script>

<template>
  <div class="main-container">
    <el-form class="search-form" ref="refForm" :inline="inline" :model="formParams" :rules="formRules">
      <el-form-item v-for="item in filterOpts" :key="item.key" :label="item.label || ''" :prop="item.key"
        :label-width="`${item.labelWidth || 120}px`"
        :style="{ width: (item.singleSelectWidth ? item.singleSelectWidth : (formStyle.singleSelectWidth + Number(item.labelWidth || formStyle.labelWidth))) + 'px' }"
      >
        <!-- 输入框 -->
        <el-input v-if="item.type === 'input'" v-bind="item" v-model="formParams[item.key]" />
        <!-- 城市级联选择 -->
        <el-select-v2
          v-else-if="item.type === 'region'"
          v-bind="item"
          style="width: 100%"
          v-model="formParams[item.key]"
          :options="item.options"
          :props="{ checkStrictly: true, value: 'id', label: 'regionName' }"
        />
        <!-- 插槽 -->
        <slot v-else-if="item.type === 'slot'" :name="item.name" :data="formParams"></slot>
      </el-form-item>
    </el-form>
  </div>
</template>
<style lang="less" scoped>
.main-container {
  display: flex;
  justify-content: space-between;
  padding-bottom: 4px;
}

// 查询表单
.search-form {
  .el-form-item__content {
    width: 280px;

    .el-select {
      width: 100%;

      .el-select__tags>span {
        display: flex;
      }

      .el-select__tags-text {
        justify-content: start;
      }
    }
  }

  .el-form-item {
    margin: 0 8px 16px 0 !important;

    .el-form-item__label {
      padding: 0;
      color: #4E5969;
    }
  }

  .search-btn-list {
    float: right;
    margin: 0 0 25px !important;

    .el-button--default {
      width: 88px;
      margin: 0 0 0 18px;
    }
  }
}
</style>