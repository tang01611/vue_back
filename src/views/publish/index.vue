<!--游戏发布-->
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
          <el-form-item label="名称" prop="gameName">
            <el-input v-model="form.gameName"></el-input>
          </el-form-item>
          <el-form-item label="标签" prop="tags">
            <el-input v-model="form.tags"></el-input>
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
            <el-tiptap placeholder="请输入内容" :width="1400" :height="400" lang="zh" v-model="form.content" :extensions="extensions" />
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
            <el-image :src="imageAction" v-show="flag"/>
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
import {
  ElementTiptap,
  Doc,
  Text,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Strike,
  Underline,
  Image,
  CodeBlock,
  Blockquote,
  ListItem,
  BulletList,
  OrderedList,
  TodoItem,
  TodoList,
  TextAlign,
  Indent,
  LineHeight,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TextColor,
  Preview,
  Fullscreen,
  FontSize
} from 'element-tiptap'
// import element-tiptap 样式
import 'element-tiptap/lib/index.css'
// import UploadCover from './components/UploadCover'

// import { getChannels, addArticle, getArticle, updateArticle } from 'https/article'
import { uploadRichImage } from 'https/images'
import { addGame, getGame, updateGame } from '@/https/game'
import { Message } from 'element-ui'
import { ref } from 'vue'

export default {
  name: 'PublishIndex',
  data () {
    return {
      form: {},
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
      extensions: [
        new Doc(),
        new Text(),
        new Paragraph(),
        new Heading({ level: 5 }), // 标题
        new Bold({ bubble: true }), // 粗体
        new Italic(), // 斜体
        new Strike(), // 删除线
        new Underline({ bubble: true, menubar: false }), // 在气泡菜单而不在菜单栏中渲染菜单按钮
        new Image({
          uploadRequest (file) {
            /**
             * 一般文件上传的接口都要求把请求头中的 Content-Type 设置为 multipart/form-data，但是我们使用 axios 上传文件的话不需要手动设置，你只要给 data 一个 new FormData() 对象即可。
             */
            const fd = new FormData()
            fd.append('image', file)
            return uploadRichImage(fd).then(res => {
              const { data: { data: { url } }, status } = res
              if (status === 201) {
                return url
              }
            })
          }
        }), // 插入图片
        new CodeBlock(), // 代码块
        new Blockquote(), // 引用
        new ListItem(),
        new BulletList(), // 无序列表
        new OrderedList(), // 有序列表
        new TodoItem(),
        new TodoList(), // 类似TodoList
        new TextAlign(),
        new Indent(),
        new LineHeight(),
        new Table(),
        new TableHeader(),
        new TableCell(),
        new TableRow(),
        new TextColor(), // 字体颜色
        new FontSize(), // 字号
        new Preview(), // 预览
        new Fullscreen() // 全屏
      ],
      picAction: ref(''),
      imageAction: ref(''),
      flag: ref(false),
      fileName: ''
    }
  },
  components: {
    'el-tiptap': ElementTiptap
    // UploadCover
  },
  created () {
    // this.loadChannels()
    const { articleId } = this.$route.query
    if (articleId) {
      this.articleId = articleId
      // 获取编辑的数据
      this.editData()
    }
  },
  methods: {
    // // 获取频道列表
    // loadChannels () {
    //   getChannels().then(res => {
    //     const { data: { data: { channels } }, status } = res
    //     if (status === 200) {
    //       this.channels = channels
    //     }
    //   })
    // },
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
      this.flag.value = true
      this.imageAction = `http://localhost:8080/images/test/${this.fileName}`
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
