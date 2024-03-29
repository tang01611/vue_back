<template>
  <div class="setting-container">
    <el-card>
      <!-- 面包屑导航 -->
      <div slot="header" class="clearfix">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>个人设置</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- /面包屑导航 -->
      <!-- 表单 -->
      <el-row :gutter="10">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="编号">{{ form.id }}</el-form-item>
            <el-form-item label="手机号">{{ form.mobile }}</el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input placeholder="请输入邮箱地址" v-model="form.email"></el-input>
            </el-form-item>
            <el-form-item label="媒体名称" prop="name">
              <el-input placeholder="请输入媒体名称" v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="媒体介绍" prop="intro">
              <el-input type="textarea" placeholder="请输入媒体介绍" v-model="form.intro" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="updateInfoLoading" @click="handleUpdateUserInfo">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4" :offset="3" class="row-avatar">
          <label for="upload">
            <el-avatar shape="square" :size="200" :src="form.photo"></el-avatar>
            <p>修改头像</p>
          </label>
          <input ref="file" type="file" id="upload" hidden @change="handleFileChange">
        </el-col>
      </el-row>
      <!-- /表单 -->
    </el-card>
    <!-- dialog对话框 -->
    <el-dialog
      class="preview-dialog"
      title="修改头像"
      :visible="dialogVisible"
      append-to-body
      @opened="handleDialogOpened"
      @closed="handleDialogClosed">
      <div class="preview-image-wrap">
        <img ref="previewImage" class="preview-image" style="width: 200px;" :src="previewImage" fit="cover" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleDialogCancel">取消</el-button>
        <el-button type="primary" :loading="cropperLoading" @click="handleDialogCropper">裁切</el-button>
      </span>
    </el-dialog>
    <!-- /dialog对话框 -->
  </div>
</template>

<script>
// 引入图片裁切工具
import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'

import { getUserInfo } from 'https/user'
import { updatePhote, updateUserInfo } from 'https/setting'

export default {
  name: 'SettingIndex',
  data () {
    return {
      form: {
        email: '1234@qq.com',
        id: '123',
        intro: '这是一个开心的尝试',
        mobile: '12345678',
        name: 'hello传媒',
        photo: 'https://img.yzcdn.cn/vant/cat.jpeg'
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        intro: [
          { required: true, message: '请输入媒体名称', trigger: 'blur' },
          { min: 5, max: 300, message: '长度在 5 到 300 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入媒体名称', trigger: 'blur' },
          { min: 1, max: 7, message: '长度在 1 到 7 个字符', trigger: 'blur' }
        ]
      },
      previewImage: '', // 预览图片地址
      dialogVisible: false,
      cropper: null,
      cropperLoading: false,
      updateInfoLoading: false
    }
  },
  created () {
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo () {
      getUserInfo().then(res => {
        const { data: { data }, status } = res
        if (status === 200) {
          this.form = data
        }
      })
    },
    // 更新用户资料
    handleUpdateUserInfo () {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return false
        }
        this.updateInfoLoading = true
        const { email, intro, name } = this.form
        const info = Object.assign({}, { email, intro, name })
        updateUserInfo(info).then(res => {
          const { status } = res
          if (status === 201) {
            // 更新顶部导航栏头像和昵称信息
            this.$eventBus.$emit('updateUser', this.form)

            this.$message({
              message: '保存个人信息成功',
              type: 'success',
              center: true
            })
            this.updateInfoLoading = false
          }
        })
      })
    },
    // 选择图片
    handleFileChange () {
      this.dialogVisible = true
      const file = this.$refs.file
      const blobData = window.URL.createObjectURL(file.files[0])
      this.previewImage = blobData

      // 解决选择相同文件不触发 change 事件的bug
      this.$refs.file.value = ''
    },
    // 对话框完全打开时
    handleDialogOpened () {
      /**
       * 图片裁切器必须基于 img 进行初始化。注意：img 必须是可见状态才能正常初始化 cropper (也就是说必须现有 img 然后再基于 img 创建 cropper)
       */
      if (this.cropper) {
        this.cropper.replace(this.previewImage) // 方式一
        return
      }
      const image = this.$refs.previewImage // 获取 DOM 节点
      this.cropper = new Cropper(image, { // 初始化裁切器
        aspectRatio: 1, // 定义裁剪框的固定纵横比 1 : 1
        cropBoxResizable: false, // 不允许改变裁切框的大小
        // cropBoxMovable: false // 不允许拖动裁切框
        dragMode: 'none', // 不允许裁切器自动变化 / 不允许移动图片
        viewMode: 1 //  限制裁剪框不超过画布的大小
      })
    },
    // 对话框完全关闭时-重置图片裁切(如果选择相同的图片那么图片裁切器不会触发)
    handleDialogClosed () {
      /**
       * 第1次初始化好以后，如果预览裁切的图片发生了变化，裁切器默认不会跟新。所以我们需要在对话框关闭后手动初始化一下 cropper 裁切器
       * 手动初始化裁切器方式一： 执行 cropper.replace(图片地址) 方法
       * 手动初始化裁切器方式二： 执行 this.cropper.destroy() (销毁 cropper，重新初始化 cropper。该方法会消耗性能)
       */
      // this.cropper.destroy() // 方式二
    },
    // 取消对话框
    handleDialogCancel () {
      this.dialogVisible = false
    },
    // 确定裁切
    handleDialogCropper () {
      this.cropperLoading = true
      this.cropper.getCroppedCanvas().toBlob(blob => {
        const fd = new FormData()
        fd.append('photo', blob)
        updatePhote(fd).then(res => {
          const { data: { data: { photo } }, status } = res
          if (status === 201) {
            this.$message({
              message: '头像修改成功',
              type: 'success',
              center: true
            })
            this.form.photo = photo
            // this.form.photo = window.URL.createObjectURL(blob) // 使用这个能够更快的渲染到页面中，因为拿到photo是需要发送网络请求的，而这个方法不需要进行网络请求，是直接H5中的API获取的转blob格式后的地址
            this.dialogVisible = false
            this.cropperLoading = false
            // 更新顶部导航栏头像和昵称信息
            this.$eventBus.$emit('updateUser', this.form)
          }
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .row-avatar {
    label {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      p {
        text-align: center;
        font-size: 18px;
        color: #000;
        line-height: 20px;
      }
    }
  }
  .preview-dialog {
    /deep/ .el-dialog {
      min-width: 400px;
      max-width: 600px;
      .preview-image-wrap {
        .preview-image {
          display: block;
          max-width: 100%;
          height: 300px;
        }
      }
    }
  }
</style>
