<!--游戏管理-->
<template>
  <div class="news-container">
    <!-- 筛选区域 -->
    <el-card class="screen">
      <!-- 面包屑导航 -->
      <div slot="header" class="clearfix">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>游戏管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- /面包屑导航 -->
      <el-form :inline="true" :model="form" size="small" class="demo-form-inline">
        <el-form-item label="状态">
          <el-select clearable v-model="form.status" placeholder="状态">
            <el-option label="全部" :value="null" />
            <el-option v-for="item in articleStatus" :key="item.status" :label="item.text" :value="item.status" />
          </el-select>
        </el-form-item>
        <el-form-item label="频道">
          <el-select clearable v-model="form.channel" placeholder="频道">
            <el-option v-for="item in channels" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" class="picker-time">
          <el-date-picker
            v-model="form.date"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            :picker-options="setDisabled" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :disabled="isLoading" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- /筛选区域 -->
    <!-- table表格 -->
    <el-card class="article-table">
      <div slot="header" class="clearfix">根据筛选条件共查询到{{ totalCount }}条结果:</div>
      <el-table
        style="width: 100%"
        border
        size="small"
        :header-cell-style="{'text-align':'center'}"
        :cell-style="{'text-align':'center'}"
        v-loading="isLoading"
        :data="newsData">
        <el-table-column type="expand">
          <template slot-scope="props">
            <div class="expanded-row">
              <div class="expanded-row__item">
                <span class="expanded-row__label">商品 ID:</span>
                <span class="expanded-row__value">{{ props.row.id }}</span>
              </div>
              <div class="expanded-row__item">
                <span class="expanded-row__label">likes:</span>
                <span class="expanded-row__value">{{ props.row.likes }}</span>
              </div>
              <div class="expanded-row__item">
                <span class="expanded-row__label">名称:</span>
                <span class="expanded-row__value">{{ props.row.gameName }}</span>
              </div>
              <div class="expanded-row__item">
                <span class="expanded-row__label">类型:</span>
                <span class="expanded-row__value">{{ props.row.tags }}</span>
              </div>
              <div class="expanded-row__item">
                <span class="expanded-row__label">价格:</span>
                <span class="expanded-row__value">{{ props.row.price }}</span>
              </div>
              <div class="expanded-row__item expanded-row__item--full">
                <span class="expanded-row__label">内容简介:</span>
                <span class="expanded-row__value">{{ props.row.content }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="封面">
          <template slot-scope="scope">
            <el-image
              class="item-image"
              style="width: 100px;"
              :src="scope.row.imageUrlList && scope.row.imageUrlList.length > 0 ? scope.row.imageUrlList[0].imageUrl : 'https://img.yzcdn.cn/vant/cat.jpeg'"
              fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="gameName" label="名称" />
        <el-table-column prop="price" label="价格" />
<!--        <el-table-column prop="content" label="介绍" />-->
        <!--        <el-table-column label="状态">-->
        <!--          <template slot-scope="scope">-->
        <!--            <el-tag :type="articleStatus[scope.row.tags[0]].type">{{ articleStatus[scope.row.status].text }}</el-tag>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" circle @click="handleEdit(scope.row.id)"></el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" circle @click="handleItemClick(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        class="pagination"
        background
        layout="prev, pager, next"
        :disabled="isLoading"
        :page-size="pageSize"
        :total="totalCount"
        :current-page.sync="page"
        @current-change="handleCurrentChange" />
      <!-- /分页 -->
    </el-card>
    <!-- /table表格 -->
  </div>
</template>

<script>

import { articleStatus } from 'utils/constant'
import { deleteGame, getGames } from '@/https/game'
// import {ref} from "vue";
import { ref } from 'vue'

export default {
  name: 'ArticleIndex',
  data () {
    return {
      articleStatus,
      form: {
        status: null,
        channel: null,
        date: null
      },
      setDisabled: {
        disabledDate (time) {
          return time.getTime() > Date.now() // 可选历史天、可选当前天、不可选未来天
        }
      },

      newsData: ref([]),
      page: 1, // 当前页码
      pageSize: 20, // 每页请求条数
      totalCount: 1, // 总条数
      isLoading: false, // 每次请求时loading状态
      channels: [] // 全部频道列表数据
    }
  },
  created () {
    this.loadArticles()
    // this.loadChannels()
  },
  methods: {
    // 获取游戏列表
    // {
    //   id: ObjectId('65819aecea34195fe7474c58'),
    //   gameName: '大嫖客',
    //   price: '9.9',
    //   imageUrlList: [ '图片URL1', '图片URL2' ],
    //   content: '游戏内容',
    //   likes: 0,
    //   comments: [ 'junk game' ],
    //   tags: [ '标签1', '标签2' ],
    //   commentNumber: 0,
    //   class: 'gameCommunity.entity.Game'
    // }
    loadArticles (page = 1) {
      // const { date, status } = this.form
      // TODO 这里之后要修改
      this.isLoading = true
      getGames().then(res => {
        const { data, status } = res
        console.log(data)
        if (status === 200) {
          this.newsData = data
          this.totalCount = data.length
        }
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        this.isLoading = false
      })
    },
    // 分页
    handleCurrentChange (page) {
      this.loadArticles(page)
    },
    // 查询
    handleQuery () {
      this.loadArticles(1)
    },
    // 编辑文章  参数是文章id
    // 跳转到文章发布页面进行编辑
    handleEdit (event) {
      this.$router.push('/publish?articleId=' + event.toString())
    },
    // 删除文章
    handleItemClick (id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteGame(id.toString()).then(res => {
          const { status } = res
          if (status === 204) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            // 删除成功，更新当前页的文章数据列表
            this.loadArticles(this.page)
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.news-container {
  .screen {
    margin-bottom: 30px;
  }
  .article-table {
    .el-table__row {
      .item-image {
        width: 100px;
        height: 100PX;
      }
    }
  }
}
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #409EFF;
  margin-left: 10%;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
//后面是展开的布局
.expanded-row {
  display: flex;
  flex-wrap: wrap;
}

.expanded-row__item {
  flex: 0 0 50%; /* 每行显示两个项目 */
  padding: 5px 10px;
  box-sizing: border-box;
}

.expanded-row__item--full {
  flex: 1 0 100%; /* 单独占一行并且占据整个宽度 */
}

.expanded-row__label {
  font-weight: bold;
}

.expanded-row__value {
  margin-left: 5px;
}
</style>
