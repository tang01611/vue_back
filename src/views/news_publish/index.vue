<template>
  <el-card class="screen">
    <!-- 面包屑导航 -->
    <div slot="header" class="clearfix">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ articleId ? '编辑' : '发布' }}文章</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- /面包屑导航 -->
    <el-form ref="form" :model="form" :rules="rules" label-width="60px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="标题" prop="newsName">
            <el-input v-model="form.newsName"></el-input>
          </el-form-item>
          <el-form-item label="类别" prop="notes">
            <el-input v-model="form.notes"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="作者" prop="author">
            <el-input v-model="form.author"></el-input>
          </el-form-item>
          <el-form-item label="日期" class="picker-time">
            <el-date-picker
              v-model="form.data"
              type="date"
              placeholder="选择日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
               />
          </el-form-item>

          <!--          <el-form-item label="频道" prop="channel_id">-->
<!--            <el-select v-model="form.channel_id" placeholder="请选择频道">-->
<!--              <el-option v-for="item in channels" :key="item.id" :label="item.name" :value="item.id" />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="内容" prop="content">
            <el-input type="textarea" v-model="form.content" :autosize="{ minRows: 10, maxRows: 20 }"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item>
            <el-upload
              :action="picAction"
              :limit="10"
              list-type="picture-card"
              accept=".png, .jpg"
              :on-success="sucessUpload"
              :on-error="errorUpload"
              :before-upload="beforeUpload"
            >
              <el-button size="small" type="primary"> 点击上传 </el-button>
            </el-upload>
            <div v-if="form.newsImg && form.newsImg.imageUrl" class="image-container">
              <el-image :src="this.form.newsImg.imageUrl"/>
              <el-button
                  type="danger"
                  icon="el-icon-delete"
                  class="delete-image-button"
                  @click="removeImage()"
              >删除</el-button>
            </div>
            <div v-else>
              暂无图片，快去上传图片吧
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item>
            <el-button type="primary" @click="handleOnPublish(false)">{{ articleId ? '编辑' : '发布' }}</el-button>
<!--            <el-button @click="handleOnPublish(true)" v-if="!articleId">存入草稿</el-button>-->
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-card>
</template>

<script>

// import element-tiptap 样式
import 'element-tiptap/lib/index.css'
// import UploadCover from './components/UploadCover'

// import { getChannels, addArticle, getArticle, updateArticle } from 'https/article'

import { ref } from 'vue'
import { addArticle, getArticle, getArticles, updateArticle } from '@/https/article'
import { Message } from 'element-ui'
export default {
  name: 'News_publishIndex',
  data () {
    return {
      form: ref({
        id: null,
        author: '',
        newsImg: {
          id: null,
          imageUrl: ''
        },
        newsName: '',
        notes: '',
        evaluate: '',
        views: '',
        data: '',
        content: '',
        comments: []
      }),
      // 添加表单验证规则
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 5, max: 30, message: '长度在 5 到 30 个字符', trigger: 'blur' }
        ],
        channel_id: [
          { required: true, message: '请选择频道', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入内容', trigger: 'blur' }, // 防止在第一次未输入时直接提交
          // 输入内容后再次清空时content内容会变成'<p></p>'
          {
            validator: (rule, value, callback) => {
              if (value === '<p></p>') {
                callback(new Error('请输入内容'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      channels: [],
      articleId: '', // 编辑时存储当前文章的id
      // 编辑器的 extensions(它们将会按照你声明的顺序被添加到菜单栏和气泡菜单中)
      picAction: ref(''),
      imageAction: ref(''),
      flag: ref(false),
      fileName: '',
      NewsListLength: 0
    }
  },
  created () {
    // this.loadChannels()
    const { articleId } = this.$route.query
    if (articleId) {
      this.articleId = articleId
      // 获取编辑的数据
      this.editData()
    }
    this.loadLength()
  },
  methods: {
    loadLength () {
      getArticles().then(res => {
        const { data, status } = res
        if (status === 200) {
          this.NewsListLength = data.length
          this.picAction = `http://localhost:8080/images/test/news${this.NewsListLength + 1}.jpg`
        }
      })
    },
    // 发布文章
    handleOnPublish (draft) {
      this.$refs.form.validate(valid => {
        if (!valid) {
          // 表单验证未通过
          return
        }
        // 表单验证通过
        if (this.articleId) {
          // 编辑/更新文章
          updateArticle(this.articleId, this.form).then(res => {
            const { status } = res
            if (status === 200) {
              this.baseMethod()
            }
          })
        } else {
          // 新增文章
          addArticle(this.form).then(res => {
            const { status } = res
            if (status === 201) {
              this.baseMethod()
            }
          })
        }
      })
    },
    // 编辑文章-对文章进行赋值
    editData () {
      getArticle(this.articleId).then(res => {
        const { data, status } = res
        if (status === 200) {
          this.form = data
        }
      })
    },
    // 抽取公共提示和跳转代码
    baseMethod () {
      this.$message({
        message: this.articleId ? '编辑成功' : '发布成功',
        type: 'success',
        center: true
      })
      // 添加完成后跳转到文章页面
      this.$router.push('/news')
    },
    // 接收子组件传递过来的参数
    handleEmitUrl (event, index) {
      // 父组件接受返回的图片路径参数
      this.form.cover.images[index] = event
    },
    sucessUpload () {
      this.$message({
        message: '上传成功',
        type: 'success'
      })
      this.flag = true
      this.imageAction = `http://localhost:8080/images?path=/test/news${this.NewsListLength + 1}.jpg`
      const img = {
        imageUrl: this.imageAction,
        id: this.fileName
      }
      this.form.newsImg = img
      console.log(this.form.imageUrlList)
      Message({
        message: img.id,
        type: 'success'
      })
    },
    errorUpload () {
      this.$message({
        message: this.picAction,
        type: 'error'
      })
      console.log('ERR pic:' + this.picAction)
      console.log('ERR image:' + this.imageAction)
    },
    beforeUpload (file) {
      this.fileName = file.name
      this.picAction = `http://localhost:8080/images/test/${file.name}`
      console.log('pic:' + this.picAction)
      console.log('image:' + this.imageAction)
    },
    removeImage (imageId) {
      this.form.newsImg.id = null
      this.form.newsImg.imageUrl = ''
    }
  }
}
</script>

<style scoped>
.image-container {
  position: relative;
  display: inline-block; /* 或者 flex, 根据你的布局需求 */
  margin: 10px;
}
.delete-image-button {
  position: absolute;
  top: 0;
  right: 0;
  /* 其他样式，根据需要调整 */
}
</style>
