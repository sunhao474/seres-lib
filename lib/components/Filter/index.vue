<template>
  <div class="search-form">
    <el-form
      ref="refForm"
      :inline="true"
      :model="formParams"
      :rules="formRules"
      :label-width="`${labelWidth}px`">
      <el-form-item
        v-for="item in filterOpts"
        :key="item.key"
        :label="item.label ? `${item.label}` : ''"
        :prop="item.key"
        :style="{width: item.singleSelectWidth + 'px'}"
        :class="[`${item.className || ''}`]"
        :label-width="`${item.labelWidth || labelWidth}px`">
        <!-- 文本输入框 -->
        <el-input
          v-if="item.type === 'input'"
          v-model.trim="formParams[item.key]"
          :placeholder="item.placeholder || '请输入'"
          clearable>
        </el-input>
        <!-- 选择框 -->
        <el-select
          v-if="item.type === 'select'"
          :no-data-text="item.noDataText || '暂无数据'"
          v-model="formParams[item.key]"
          :placeholder="item.placeholder || '请选择'"
          :clearable="item.clearable == null || item.clearable"
          @change="handleSelectChange(formParams[item.key], item.refers, item.handleFunc)"
          :filterable="item.filterable">
          <el-option v-for="(item, key) in item.options" :key="key" :label="item" :value="key"></el-option>
        </el-select>

        <!-- 选择框文本输入 -->
        <template v-if="item.type === 'select-input'">
          <el-input
            v-model.trim="formParams[`${item.key}_input`]"
            :placeholder="`请输入${item.options[formParams[item.key]]}`">
            <template #prepend>
              <el-select
                :style="{width: (item.selectWidth || 100) + 'px'}"
                v-model="formParams[item.key]">
                <el-option v-for="(item, key) in item.options" :key="key" :label="item" :value="key"></el-option>
              </el-select>
            </template>
          </el-input>
        </template>

        <!-- 日期选择器 -->
        <el-tooltip
          v-if="item.type === 'datetimerange'"
          effect="dark"
          :content="item.placeholder"
          placement="top-start">
          <section>
            <el-date-picker
              v-model="formParams[item.key]"
              type="datetimerange"
              :clearable="true"
              :default-time="DEFAULT_TIME"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </section>
        </el-tooltip>

        <!-- 日期时间选择器 -->
        <el-tooltip
          v-if="item.type === 'daterange'"
          effect="dark"
          :content="item.placeholder"
          placement="top-start" >
          <section>
            <el-date-picker
              v-model="formParams[item.key]"
              type="daterange"
              :clearable="true"
              :default-time="DEFAULT_TIME"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </section>
        </el-tooltip>

        <!-- cascader -->
        <el-cascader
          v-if="item.type === 'cascader'"
          clearable
          :placeholder="item.placeholder || '请选择'"
          v-model="formParams[item.key]"
          :options="item.options"
          :props="item.props" />

        <!-- 树形选择框 -->
        <el-tree-select
          v-if="item.type === 'treeSelect'"
          v-model="formParams[item.key]"
          :data="item.treeSelectOptions.data"
          clearable
          check-strictly
          :filterable="item.filterable"
          :node-key="item.treeSelectOptions.nodeKey"
          :props="{ label: item.treeSelectOptions.nameKey, children: item.treeSelectOptions.children || 'children' }"
          :placeholder="item.placeholder || '请选择'"
          :render-after-expand="false" />
      </el-form-item>
    </el-form>
    <div class="operate-btn">
      <el-button type="primary" @click="handleClick" :icon="Search" class="buttonDiv">{{ searchBtnText }}</el-button>
      <el-button type="info" @click="handleClear" :icon="RefreshRight" class="refreshBut">{{ clearBtnText }}</el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, onMounted, toRefs, ref } from 'vue'
import { Search, RefreshRight } from '@element-plus/icons-vue'
import { filter_null } from 'lib/utils'

export default defineComponent({
  props: {
    labelWidth: {
      type: Number,
      default: 80
    },
    isShowClearBtn: {
      type: Boolean,
      default: true
    },
    clearBtnText: {
      type: String,
      default: '重置'
    },
    searchBtnText: {
      type: String,
      default: '查询'
    },
    currentPage: {
      type: Number,
      required: true
    },
    defaultTime: {
      type: Array,
      default: () => [
        new Date(2000, 1, 1, 0, 0, 0),
        new Date(2000, 2, 1, 23, 59, 59)
      ]
    },
    filterOpts: {
      type: Array,
      required: true,
      default () {
        return [
          {
            type: 'input', // 可选类型：input select select-input datetimerange daterange treeSelect
            key: '', // 参数key
            label: '', // 参数名称
            labelWidth: null, // 单个输入框设置
            singleSelectWidth: null, // 表单宽度,适用于单个select
            selectWidth: null, // type=select-input select宽度
            initialValue: null, // 初始值
            initialInputValue: null, // input初始值
            validator: [ // 表单校验
              { max: 20, message: '请输入 20 个以内字符', trigger: ['blur', 'change'] }
            ],
            dateFormat: 'yyyy-MM-dd', // type=daterange 格式化日期
            dateParams: ['start', 'end'], // type=daterange 开始和结束日期字段拆解
            options: [], // type=select 时传入
            treeSelectOptions: { // type=treeSelect 时传入
              nodeKey: '',
              nameKey: '',
              children: '',
              data: []
            },
            filterable: false, // 是否可搜索
            clearable: true, // 是否可清空
            refers: [], // 级联select key
            handleFunc: 'handleFunc', // 级联select change回调
            noDataText: '暂无数据' // 选项为空时显示的文字
          }
        ]
      }
    }
  },
  setup (props, { emit }) {
    const refForm = ref()
    const DEFAULT_TIME = props.defaultTime

    const data = reactive({
      formParams: {},
      formRules: {}
    })

    onMounted(() => {
      props.filterOpts.forEach((item) => {
        const key = item.key
        data.formParams[key] = item.initialValue || ''
        if (item.type === 'select-input') {
          data.formParams[`${key}_input`] = item.initialInputValue || ''
        }
        if (item.validator) {
          data.formRules[key] = item.validator
        }
      })
    })

    /**
     * select change时，可以清空已选择的refers级联数据
     * @param handleFunc
     * @param value
     * @param refers
     */
    function handleSelectChange (value, refers, handleFunc = 'handleFunc') {
      emit(handleFunc, value)
      if (refers && refers.length) {
        refers.forEach(item => {
          data.formParams[item] = ''
        })
      }
    }

    /**
     * 查询
     */
    function handleClick () {
      refForm.value.validate((valid) => {
        if (valid) {
          // 调用父组件获取数据函数
          updateForm()
        }
      })
    }

    /**
     * 重置表单
     */
    function handleClear () {
      refForm.value.resetFields()

      // 清空级联选择数据
      props.filterOpts.forEach((item) => {
        if (item.handleFunc) {
          emit(item.handleFunc, '')
        }

        // select-input 重置
        if (item.type === 'select-input') {
          data.formParams[item.key] = item.initialValue || ''
          data.formParams[`${item.key}_input`] = ''
        }
      })

      // 调用父组件获取数据函数
      updateForm()
    }

    /**
     * 查询条件更新到父级,获取表格数据
     */
    function updateForm () {
      const formParams = {}

      props.filterOpts.forEach((item) => {
        const key = item.key
        if ((item.type === 'datetimerange' || item.type === 'daterange') && item.dateParams.length === 2) {
          if (data.formParams[key]?.length === 2) {
            formParams[item.dateParams[0]] = new Date(data.formParams[key][0]).getTime()
            formParams[item.dateParams[1]] = new Date(data.formParams[key][1]).getTime()
          }

          // 重置表单时清空: resetFields() bug
          if (data.formParams[key]?.length < 2) {
            data.formParams[key] = []
          }
        } else if (item.type === 'select-input') {
          formParams[data.formParams[key]] = data.formParams[`${key}_input`] || ''
        } else {
          formParams[key] = data.formParams[key] || ''
        }
      })
      // 查询时重置currentPage为1
      emit('update:currentPage', 1)
      // 表单查询
      emit('getTableData', filter_null(formParams))
    }

    return {
      refForm,
      Search,
      RefreshRight,
      DEFAULT_TIME,
      ...toRefs(data),
      handleSelectChange,
      handleClick,
      handleClear
    }
  }
})
</script>
