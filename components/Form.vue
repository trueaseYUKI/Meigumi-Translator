<script lang="ts">
import { langOptions } from '../assets/languages'
import { defineComponent, ref, reactive } from 'vue'
import { FormData } from '../types/lang'
import { models } from '../assets/llm'
import { saveInfo, getInfo, removeInfo } from '../utils/storage'
import type { FormInstance, FormRules } from 'element-plus'


export default defineComponent({
  name: 'Form',
  setup() {
    const formData = ref<FormData>({
      fromLanguage: 'auto',
      toLanguage: 'zh',
      type: 'baidu',
      baiduApiKey: null,
      baiduSecretKey: null,
      LLMType: 'ds',
      LLMApiKey: null,
    })

    const formRef = ref<FormInstance>()

    // 测试语句
    const testELLang = 'Я хочу быть твоей главной героиней.'
    const testJpLang = '君のヒロインになりたい'

    // 检测百度属性
    const checkBaiduApiKey = (rule: any, value: any, callback: any) => {
      if (formData.value.type === 'llm') {
        callback()
        return
      }
      if (!value || value.trim() === '') {
        return callback(new Error('请输入Api Key'))
      }
      callback()
    }

    const checkBaiduSecretKey = (rule: any, value: any, callback: any) => {
      if (formData.value.type === 'llm') {
        callback()
        return
      }
      if (!value || value.trim() === '') {
        return callback(new Error('请输入密钥'))
      }
      callback()
    }

    // 检测LLM属性
    const checkLLMApiKey = (rule: any, value: any, callback: any) => {
      if (formData.value.type === 'baidu') {
        callback()
        return
      }
      if (!value || value.trim() === '') {
        return callback(new Error('请输入密钥'))
      }
      callback()
    }


    const rules = ref<FormRules<typeof formData>>({
      baiduApiKey: [{ validator: checkBaiduApiKey, trigger: 'blur' }],
      baiduSecretKey: [{ validator: checkBaiduSecretKey, trigger: 'blur' }],
      LLMApiKey: [{ validator: checkLLMApiKey, trigger: 'blur' }]
    })

    // 保存
    const save = (form: FormInstance | undefined) => {

      if (!form) return

      form.validate((valid) => {
        if (valid) {
          console.log('[form]保存')
          saveInfo(formData.value)
        } else {
          console.log('[form]保存失败')
        }
      })
    }

    const resetInfoData = () => {
      formData.value = {
        fromLanguage: 'auto',
        toLanguage: 'zh',
        type: 'baidu',
        baiduApiKey: null,
        baiduSecretKey: null,
        LLMType: 'ds',
        LLMApiKey: null,
      }
    }
    // 取消
    const cancel = () => {
      removeInfo()
      // 重置数据
      resetInfoData()
      formRef.value?.resetFields()
    }

    const loadStorage = () => {
      getInfo().then(info => {
        if (info && info.type) {
          formData.value = info
        } else {
          resetInfoData()
        }
      })
    }

    loadStorage()

    return {
      formData,
      langOptions,
      models,
      rules,
      save,
      cancel,
      formRef
    }
  }
})
</script>

<template>
  <div class="form-container">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <!-- 选中语言 → 目标语言 -->
      <el-form-item label="语言">
        <div class="select-group">
          <el-select :teleported="false" filterable v-model="formData.fromLanguage" placeholder="源语言">
            <el-option v-for="item in langOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-space>→</el-space>
          <el-select :teleported="false" filterable v-model="formData.toLanguage" placeholder="目标语言">
            <el-option v-for="item in langOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
      </el-form-item>
      <!-- 翻译的方式 -->
      <el-form-item label="翻译方式">
        <el-radio-group v-model="formData.type">
          <el-radio value="baidu">百度</el-radio>
          <el-radio value="llm">大模型</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 填写Baidu必要参数 -->
      <el-form-item v-if="formData.type === 'baidu'" label="Api key" prop="baiduApiKey">
        <el-input v-model="formData.baiduApiKey" placeholder="Baidu Api Key" />
      </el-form-item>
      <el-form-item v-if="formData.type === 'baidu'" label="密钥" prop="baiduSecretKey">
        <el-input type="password" v-model="formData.baiduSecretKey" placeholder="Secrected Key" />
      </el-form-item>

      <!-- 填写LLM必要参数 -->
      <el-form-item v-if="formData.type === 'llm'" label="模型类型">
        <el-select :teleported="false" filterable v-model="formData.LLMType" placeholder="大模型">
          <el-option v-for="item in models" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.type === 'llm'" label="Api Key" prop="LLMApiKey">
        <el-input type="password" v-model="formData.LLMApiKey" placeholder="sk-xxxxxxxxxxxxxxxxxx" />
      </el-form-item>
    </el-form>
    <div class="btn-group">
      <el-button type="primary" @click="save(formRef)" plain>保存</el-button>
      <el-button plain @click="cancel">取消</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-container {
  width: 100%;
  max-width: 400px;
  min-width: 380px;
  height: 300px;
  padding: 15px;


  .select-group {
    display: flex;
    justify-content: space-between;
  }

  .btn-group {
    display: flex;
    height: 60px;
    align-items: center;
    justify-content: center;
    margin: 0 10px;
  }


}


// 让两个select平分宽度
::v-deep .select-group {
  flex: 1;
}

::v-deep .el-select {
  margin: 0 5px;
}
</style>
