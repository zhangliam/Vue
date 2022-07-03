<!-- 前置知识 -->

<!-- v-model语法糖实现 -->
<!-- 单个标签 -->
<input v-model="searchText">
<!-- 等价于 -->
<input 
  :value="searchText"
  @input="searchText = $event.target.value"
>

<!-- 组件 -->
<custom-input v-model="searchText"></custom-input>
<!-- 等价于 -->
<custom-input
  :value="searchText"
  @input="searchText = $event"
></custom-input>


<!-- 为了custom-input组件正常工作组件<input>必须:
1. 将其value attribute绑定到一个名叫value的prop上
2. 在其input 事件被触发时, 将新值通过自定义input事件抛出 -->
Vue.component('custom-input', {
  props: ['value'],
  template: `
    <input
  :value="value"  
  @input="$emit('input', $event.target.value)"
    />
  `
})




<!-- 核心思想
1. 主要以父组件传递数据给子组件来实现一些功能，子组件定义固定的展示样式，将具体要实现的业务逻辑抛出来给父组件处理
2. 尽量保持 element-ui 组件原有的方法（可以使用 v-bind="$attrs" 和 v-on="$listeners"）,如果确实要做更改也尽量让相似的方法方法名不变 -->


<!-- OptionPlus select 组件用在有较多选项时，但是有些选项的长度难免比较长，就会把选项框整个给撑大 -->
<!-- 子组件 -->
<template>
    <el-option :style="`width: ${width}px`"
      v-bind="$attrs"
      v-on="$listeners">
    <slot />
    </el-option>
</template>

<script>
  export default {
      props: {
        width: {
            type: Number,
        },
      },
  };
</script>

<style lang="scss" scoped>
  .el-select-dropdown__item {
      min-height: 35px;
      height: auto;
      white-space: initial;
      overflow: hidden;
      text-overflow: initial;
      line-height: 25px;
      padding: 5px 20px;
  }
</style>


<!-- 父组件 -->
<template>
  <el-select v-model="value" placeholder="请选择">
      <OptionPlus 
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :width="200"
      >
      </OptionPlus>
  </el-select>
</template>

<script>
  import OptionPlus from './OptionPlus';
  export default {
      components: {
          OptionPlus,
      },
      data () {
        return {
            value: null,
            options: [{
                  value: '选项1',
                  label: '黄金糕',
              }, {
                  value: '选项2',
                  label: '双皮奶特别好吃，以顺德的最出名，推荐尝试',
              }, {
                  value: '选项3',
                  label: '蚵仔煎',
              }, {
                  value: '选项4',
                  label: '龙须面',
              }, {
                  value: '选项5',
                  label: '北京烤鸭',
              }],
          };
      },
  };
</script>



<!-- FormPlus
后台系统肯定会有查找功能，搜索条件大部分都是这三种，输入框、下拉框和日期选择。所以可以整合这三个常用的元素，将它们封装成一个易于使用的组件
这三个组件是用来过滤条件的，因此一般与查询和重置按钮在一起 -->

<!-- 子组件FormPlus.vue -->
<template>
  <div id="FormPlus">
      <el-form ref="ruleForm"
               :rules="rules"
               :inline="inline"
               :model="ruleForm"
               class="ruleForm"
               :label-width="labelWidth"
               :style="formStyle">
          <template v-for="(item, index) in list">
              <template v-if="!item.type || item.type === 'input'">
                  <el-form-item :key="index"
                                :label="item.label"
                                :prop="item.model"
                                :required="item.required">
                      <el-input v-model.trim="ruleForm[item.model]"
                                :clearable="item.clearable === undefined || item.clearable"
                                filterable
                                :placeholder="item.placeholder" />
                  </el-form-item>
              </template>
              <template v-if="item.type === 'select'">
                  <el-form-item :key="index"
                                :label="item.label"
                                :prop="item.model"
                                :required="item.required">
                      <el-select :style="`width: ${formItemContentWidth}`"
                                 v-model.trim="ruleForm[item.model]"
                                 :clearable="item.clearable === undefined || item.clearable"
                                 filterable
                                 :placeholder="item.placeholder || ''">
                          <!-- 使用上文提到的 OptionPlus 组件 -->
                          <OptionPlus v-for="(i, key) in item.options"
                                      :key="i[item.optionsKey] || key"
                                      :label="i[item.optionsLabel] || i.label"
                                      :value="i[item.optionsValue] || i.value"
                                      :width="formItemContentWidth" />
                      </el-select>
                  </el-form-item>
              </template>
              <template v-if="item.type === 'date-picker'">
                  <el-form-item :key="index"
                                :prop="item.model"
                                :label="item.label"
                                :required="item.required">
                      <el-date-picker 
                        v-model.trim="ruleForm[item.model]"
                        :clearable="item.clearable === undefined || item.clearable"
                        :type="item.pickerType"
                        :placeholder="item.placeholder"
                        :format="item.format"
                        :value-format="item.valueFormat"
                        :picker-options="item.pickerOptions" />
                  </el-form-item>
              </template>
          </template>
          <slot />
      </el-form>
      <el-row>
          <el-col class="btn-container">
              <el-button class="el-icon-search"
                         type="primary"
                         @click="submitForm">查询</el-button>
              <el-button class="el-icon-refresh"
                         @click="resetForm">重置</el-button>
          </el-col>
      </el-row>
  </div>
</template>  

<script>
  import OptionPlus from './OptionPlus';
  export default {
      components: { OptionPlus },
      props: {
          list: {
              type: Array,
              default: () => [],
          },
          inline: {
              type: Boolean,
              default: true,
          },
          labelWidth: {
              type: String,
              default: '100px',
          },
          formItemWidth: {
              type: String,
              default: '400px',
          },
          formItemContentWidth: {
              type: String,
              default: '250px',
          },
          rules: {
              type: Object,
              default: () => { },
          },
      },
      data () {
          return {
              ruleForm: {},
          };
      },
      computed: {
          formStyle () {
              return {
                  '--formItemWidth': this.formItemWidth,
                  '--formItemContentWidth': this.formItemContentWidth,
              };
          },
      },
      watch: {
          list: {
              handler (list) {
                  this.handleList(list);
              },
              immediate: true,
              deep: true,
          },
      },
      methods: {
          // 所填写数据
          submitForm () {
              this.$refs['ruleForm'].validate((valid) => {
                  if (valid) {
                      const exportData = { ...this.ruleForm };
                      this.$emit('submitForm', exportData);
                  } else {
                      return false;
                  }
              });
          },
          // 默认清空所填写数据
          resetForm () {
              this.$refs.ruleForm.resetFields();
              this.handleList(this.list);
              this.$emit('resetForm');
          },
          handleList (list) {
              for (let i = 0; i < list.length; i++) {
                  const formitem = list[i];
                  const { model } = formitem;
                  this.$set(this.ruleForm, model, '');
              }
          },
      },
  };
</script>

<style lang="scss" scoped>
#FormPlus {
    .ruleForm {
        width: 100%;
        ::v-deep.el-form-item {
            width: var(--formItemWidth);
        }
        ::v-deep.el-form-item__content {
            width: var(--formItemContentWidth);
        }
        ::v-deep.el-form-item__content .el-date-editor,
        .el-input {
            width: var(--formItemContentWidth);
        }
    }
    .btn-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 10px;
    }
}
</style>


<!-- 父组件 -->
<template>
    <FormPlus :list="formList"
        @submitForm="searchPage"
        @resetForm="resetForm" />
</template>

<script>
import FormPlus from './FormPlus';
export default {
    components: {
        FormPlus,
    },
    data () {
      return {
          formList: [
            { label: '编号', model: 'applyNumber', placeholder: '请输入编号' },
            { label: '名称', model: 'name', placeholder: '请输入名称' },
            { type: 'date-picker', label: '开始时间', model: 'startTime', valueFormat: 'yyyy-MM-dd HH:mm:ss', placeholder: '请选择开始时间' },
            { type: 'select', label: '状态', model: 'status', placeholder: '请选择状态', options: [] },
           ],
      };
    },
    methods: {
        // 可以取到子组件传递过来的数据
        searchPage (ruleForm) {
            console.log(ruleForm, 'ruleForm');
        },
        resetForm () {

        },
    },
};
</script>





<!-- DrawerPlus
抽屉组件可以提供更深一级的操作，往往内容会比较多比较长。因此可以封装一个组件，让操作按钮固定在 drawer 底部，以实现较好的交互 -->

<!-- 子组件 DrawerPlus.vue -->
<template>
    <div id="drawerPlus">
        <el-drawer v-bind="$attrs"
                   v-on="$listeners">
            <el-scrollbar class="scrollbar">
                <slot />
                <div class="seat"></div>
                <div class="footer">
                    <slot name="footer" />
                </div>
            </el-scrollbar>
        </el-drawer>
    </div>
</template>

<style lang="scss" scoped>
  $height: 100px;
  #drawerPlus {
    .scrollbar {
        height: 100%;
        position: relative;
        .seat {
            height: $height;
        }
        .footer {
            z-index: 9;
            box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.08);
            width: 100%;
            position: absolute;
            bottom: 0px;
            height: $height;
            background-color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
  }
</style>

<!-- 父组件 -->
<template>
    <DrawerPlus title="编辑"
                :visible.sync="drawerVisible"
                direction="rtl"
                size="45%">
        <template slot="footer">
            <el-button @click="drawerVisible = false">取消</el-button>
            <el-button type="primary"
                       @click="drawerVisible = false">确定</el-button>
        </template>
    </DrawerPlus>
</template>

<script>
import DrawerPlus from './DrawerPlus';
export default {
    components: {
        DrawerPlus,
    },
    data () {
      return {
          drawerVisible: false,
      };
    },
};
</script>



https://segmentfault.com/a/1190000041757434

vue中的$attrs和$listeners:
https://segmentfault.com/a/1190000022708579




















