<!--游戏发布-->
<template>
  <el-card class="screen">
    <!-- 面包屑导航 -->
    <div slot="header" class="clearfix">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ articleId ? '保存' : '发布' }}文章</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- /面包屑导航 -->
    <el-form ref="form" :model="form" :rules="rules" label-width="60px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="名称" prop="gameName">
            <el-input v-model="form.gameName"></el-input>
          </el-form-item>
          <el-form-item label="标签" prop="tags">
            <el-input v-model="tagsString"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="价格" prop="price">
            <el-input v-model="form.price"></el-input>
          </el-form-item>
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
<!--            <el-image :src="imageAction" v-show="flag"/>-->
            <div v-if="form.imageUrlList && form.imageUrlList.length > 0">
              <el-image
                  v-for="image in form.imageUrlList"
                  :key="image.id"
                  :src="image.imageUrl"
                  class="image-item"
                  fit="cover"/>
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
            <el-button @click="handleOnPublish(true)" v-if="!articleId">存入草稿</el-button>
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
// import { uploadRichImage } from 'https/images'
import { addGame, getGame, getGames, updateGame } from '@/https/game'
import { Message } from 'element-ui'
import { ref } from 'vue'

export default {
  name: 'PublishIndex',
  data () {
    return {
      form: ref({
        id: null,
        gameName: '',
        tags: [],
        price: '',
        content: '',
        imageUrlList: [],
        comments: [],
        commentNumber: 0,
        likes: 0
      }),
      // 添加表单验证规则
      rules: {
        gameName: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 5, max: 30, message: '长度在 5 到 30 个字符', trigger: 'blur' }
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
      tagsString: '',
      GamesListLength: 0,
      imageNum: 0,
      imageid: 0
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
      getGames().then(res => {
        const { data, status } = res
        if (status === 200) {
          this.GamesListLength = data.length
          this.picAction = `http://localhost:8080/images/test/game${this.GamesListLength * 5 + this.imageNum + this.imageid + 1}.png`
        }
      })
    },
    // 发布文章
    handleOnPublish (draft) {
      this.form.tags = this.tagsString.split(',').map(tag => tag.trim())
      this.form.price = '￥' + this.form.price
      this.$refs.form.validate(valid => {
        if (!valid) {
          // 表单验证未通过
          return
        }
        // 表单验证通过
        if (this.articleId) {
          // 编辑/更新文章
          updateGame(this.articleId, this.form).then(res => {
            const { status } = res
            Message({
              message: status,
              type: 'success'
            })
            if (status === 201) {
              this.baseMethod()
            }
          })
        } else {
          // 新增文章
          addGame(this.form).then(res => {
            const { status } = res
            Message({
              message: '发布!',
              type: 'success'
            })
            if (status === 201) {
              this.baseMethod()
            }
          })
        }
      })
    },
    // 编辑文章-对文章进行赋值
    editData () {
      getGame(this.articleId).then(res => {
        const { data, status } = res
        if (status === 200) {
          // this.form = Object.assign({}, { content, cover, id: id.toString(), title, price })
          // this.form.gameName = data.gameName
          // this.form.tags = data.tags
          // this.form.price = data.price
          // this.form.content = data.content
          this.form = data
          this.tagsString = data.tags.join(',')
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
      this.$router.push('/article')
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
      this.imageAction = `http://localhost:8080/images?path=/test/game${this.GamesListLength * 5 + this.imageNum + this.imageid + 1}.png`
      const img = {
        imageUrl: this.imageAction,
        id: this.fileName
      }
      this.form.imageUrlList.push(img)
      this.imageid++
      this.picAction = `http://localhost:8080/images/test/game${this.GamesListLength * 5 + this.imageNum + this.imageid + 1}.png`
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
    },
    beforeUpload (file) {
      this.fileName = file.name
      this.picAction = `http://localhost:8080/images/test/${file.name}`
    }
  }
}
</script>

<style lang="less" scoped>
  // .el-form {
  //   /deep/ .el-form-item__content {
  //     width: 400px;
  //   }
  // }
  .cover-wrap {
    display: flex;
    align-items: center;
    width: 600px;
  }
</style>
