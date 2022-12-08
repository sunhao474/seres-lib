<template>
    <div class="table-container clearfix" :class="{'has-pagination': tableOpts.pagination}">
      <el-table
        ref="table"
        :data="tableOpts.dynamic ? tableOpts.data : tableOpts.data.slice((tableOpts.currentPage-1)*tableOpts.pageSize, tableOpts.currentPage*tableOpts.pageSize)"
        :border="tableOpts.hideBorder"
        :span-method="tableOpts.spanMethod"
        :row-key="tableOpts.rowKey"
        :max-height="tableData.maxHeight"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        @selection-change="handleSelectionChange"
        style="width: 100%">
        <el-table-column v-if="tableOpts.multipleTableId" type="selection" class-name="multiple-column" width="45"> </el-table-column>
        <el-table-column v-if="tableOpts.radioCheckId" width="80" class-name="radio">
          <template v-slot="scope">
            <el-radio v-model="tableOpts.radioCheckValue" :label="scope.row[tableOpts.radioCheckId]" @change="handleRadioChange(scope.row)">{{ '' }}</el-radio>
          </template>
        </el-table-column>
        <el-table-column
          v-if="tableOpts.indexes"
          type="index"
          :index="index=>{return (tableOpts.currentPage - 1) * tableOpts.pageSize + (index + 1)}"
          :label="tableOpts.indexes[0]"
          class-name="serial-number"
          :width="tableOpts.indexes[1] || 60">
        </el-table-column>
        <template v-for="(item, index) in tableOpts.column">
          <el-table-column
            :key="index"
            v-if="typeof item.hidden === 'function' ? !item.hidden() : !item.hidden"
            :label="item.label"
            :prop="item.prop"
            :class-name="item.className || ''"
            :width="item.width || ''"
            :min-width="item.minWidth || ''">
            <template v-slot:header="scope" >
              <template v-if="item.useHeaderSlot">
                <slot :name="item.prop + 'Header'" :data="scope" :column="item"></slot>
              </template>
              <template v-else>
                {{item.label}}
              </template>
            </template>
            <template v-slot="scope">
              <template v-if="item.useSlot">
                <slot
                  :name="item.prop"
                  :data="scope.row"
                  :index="scope.$index"
                  :value="scope.row[item.prop]"
                  :column="item"></slot>
              </template>
              <template v-else-if="item.render">
                <div v-html="item.render(scope.row[item.prop], scope.$index, scope.row)"></div>
              </template>
              <span v-else-if="item.filter">{{ item.filter(scope.row[item.prop], scope.$index, scope.row) }}</span>
              <template
                v-else-if="item.showPopoverNumber && scope.row[item.prop] && scope.row[item.prop].length > item.showPopoverNumber">
                <el-popover
                  placement="bottom-start"
                  width="200"
                  trigger="hover"
                  :content="scope.row[item.prop]">
                  <template #reference>
                    <div class="text-hidden">{{ scope.row[item.prop] }} </div>
                  </template>
                </el-popover>
              </template>
              <template v-else-if="item.switch">
                <el-switch
                  v-permission="item.switch.permission || 'not_check'"
                  v-if="item.switch.isShow ? item.switch.isShow(scope.row) : true"
                  v-model="scope.row.status"
                  inline-prompt
                  :inactive-value="item.switch.inactiveValue"
                  :active-value="item.switch.activeValue"
                  :active-text="item.switch.activeText"
                  :inactive-text="item.switch.inactiveText"
                  @change="$emit(item.switch.emitFunc, scope.row)"/>
              </template>
              <span v-else>{{ scope.row[item.prop] }}</span>
            </template>
          </el-table-column>
        </template>
        <el-table-column
          v-if="tableOpts.hasOperation"
          fixed="right"
          :label="tableOpts.operation.label"
          :width="tableOpts.operation.width || ''"
          :min-width="tableOpts.operation.minWidth || ''"
          :class-name="tableOpts.operation.className || 'operaters'">
          <template v-slot="scope">
            <template v-for="item in tableOpts.operation.data" :key="item.id">
              <el-tooltip
                v-if="item.isShow ? item.isShow(scope.row, scope.$index) : true"
                :disabled="!item.tooltipMsg || !(item.isDisabled ? item.isDisabled(scope.row) : false)"
                effect="dark"
                :content="item.tooltipMsg"
                placement="top-start">
                <span class="button-wrapper">
                  <el-button
                    v-permission="item.permission || 'not_check'"
                    :type="item.type || 'primary'"
                    link
                    :size="item.size || 'default'"
                    :class="item.className || 'default'"
                    :disabled="item.isDisabled ? item.isDisabled(scope.row) : false"
                    @click="handleOperation(item.handleFunc, scope.row, scope.$index)">
                    {{ typeof item.label === 'function' ? item.label(scope.row) : item.label }}
                  </el-button>
                </span>
              </el-tooltip>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="tableOpts.pagination" class="page-container clearfix">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :page-sizes="tableOpts.pageList || [10, 30, 50, 100]"
          :page-size="tableOpts.pageSize"
          :current-page="tableOpts.currentPage"
          layout="total, sizes, prev, pager, next"
          :total="parseInt(tableOpts.total)"
          v-show="tableOpts.total">
        </el-pagination>
      </div>
    </div>
  </template>
  <script>
  import { ElTable, ElTableColumn, ElPagination, ElRadio, ElButton, ElCascader, ElPopover, ElSwitch, ElTooltip } from 'element-plus'
  export default {
    name: 'TablePagination',
    components: {
      ElTable, ElTableColumn, ElPagination, ElRadio, ElButton, ElCascader, ElPopover, ElSwitch, ElTooltip
    },
    props: {
      tableData: {
        type: Object,
        default () {
          return {
            currentPage: 1, // 当前页
            pageSize: 10, // 每页显示条数
            total: 0, // 总条数
            data: [], // 数据源
            maxHeight: null, //
            column: [ // 列填充
              {
                hidden: false, // 是否显示该列, 可以传递函数或者布尔值
                label: '', // 表头文字
                prop: '', // 属性名
                width: '', // 列宽
                minWidth: '', // 最小列表宽
                className: '', // 自定义class
                filter: (value, index, row) => {}, // 过滤器
                render: (value, index, row) => {}, // 自定义
                showPopoverNumber: 20, // 文本内容过多时显示Popover(超过20个字符)
                emptyText: '', // 字段为 null 或者 undefined 时的展示内容
                useSlot: false, // 使用 slot 渲染内容, slot name 由 prop 指定
                useHeaderSlot: false, // 使用 slot 渲染表头, slot name 由 prop + 'Header' 指定
                switch: { // 是否使用switch开关
                  permission: '', // 权限标识
                  emitFunc: 'handleStatus', // 回调函数
                  inactiveValue: '',
                  activeValue: '',
                  activeText: '是',
                  inactiveText: '否',
                  isShow: (item) => item.status === 'show' // 按条件展示
                }
              }
            ],
            indexes: ['编号', 60], // 是否显示编号，第一个值：编号名称，第二个值：自定义列宽
            hasOperation: false, // 有无操作功能
            dynamic: true, // 是否为动态分页，即重新调用接口请求
            pagination: true, // 有无分页功能
            pageList: null, // 分页选择
            pageHandleFunc: '', // 分页操作执行回调函数
            multipleTableId: 'id', // 表格可选择，传入数据唯一标识
            multipleSelection: '', // 选择数据数据唯一标识 list
            radioCheckId: 'id', // 表格单选框，选中项目ID
            radioCheckValue: 'id', // 表格单选框，默认值
            radioCheckItem: null, // 表格单选框，选中项item
            rowKey: '', // row-key, treeProps树形展示时必传
            hideBorder: false,
            spanMethod: () => [1, 1], // 合并行或列的计算方法
            operation: { // 操作功能
              label: '操作', // 操作列的行首文字
              width: '200', // 操作列的宽度
              minWidth: '', // 操作列最小宽度
              className: 'show', // 操作列的class名
              data: [ // 操作列数据
                {
                  label: '通过', // 按钮文字，可以传字符串或者函数
                  handleFunc: 'handleSubmit', // 点击按钮后触发的父组件事件
                  permission: '', // 权限标识
                  size: 'mini', // 按钮大小
                  className: 'show', // 按钮的类名
                  type: 'primary', // 按钮类型
                  isShow: (item) => item.status === 'show', // 按条件展示
                  isDisabled: (item) => item.status === 'disabled', // 是否禁用
                  tooltipMsg: '' // 禁用时提示信息
                }
              ]
            }
          }
        }
      }
    },
    activated () {
      this.doLayout()
    },
    computed: {
      tableOpts () {
        return this.tableData
      }
    },
    methods: {
      doLayout () {
        this.$refs.table.doLayout()
      },
      /**
       * 每页显示条数切换
       * @param pageSize
       */
      handleSizeChange (pageSize) {
        this.tableOpts.pageSize = pageSize
        this.handleCurrentChange(1)
      },
      /**
       * 翻页切换
       * @param currentPage
       */
      handleCurrentChange (currentPage) {
        this.tableOpts.currentPage = currentPage
        if (this.tableOpts.pageHandleFunc) {
          this.$emit(this.tableOpts.pageHandleFunc)
        }
      },
      /**
       * 按钮操作：权限判断
       * @param handleName
       * @param row
       * @param subscript
       */
      handleOperation (handleName, row, subscript) {
        this.$emit(handleName, row, subscript)
      },
      /**
       * 复选操作
       * @param val
       */
      handleSelectionChange (val) {
        this.$emit('getSelectList', val)
        const multipleId = val.map((item) => {
          return item[this.tableOpts.multipleTableId]
        })
        this.tableOpts.multipleSelection = multipleId.join(',')
      },
      /**
       * 单选框
       * @param val
       */
      handleRadioChange (val) {
        this.tableOpts.radioCheckItem = val
      }
    }
  }
  </script>
  