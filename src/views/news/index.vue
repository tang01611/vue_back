<template>
  <div class="news-container">
    <!-- 筛选区域 -->
    <el-card class="screen">
      <!-- 面包屑导航 -->
      <div slot="header" class="clearfix">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>新闻管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- /面包屑导航 -->
<!--      <el-form :inline="true" :model="form" size="small" class="demo-form-inline">-->
<!--        <el-form-item label="状态">-->
<!--          <el-select clearable v-model="form.status" placeholder="状态">-->
<!--            <el-option label="全部" :value="null" />-->
<!--            <el-option v-for="item in newsStatus" :key="item.status" :label="item.text" :value="item.status" />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="频道">-->
<!--          <el-select clearable v-model="form.channel" placeholder="频道">-->
<!--            <el-option v-for="item in channels" :key="item.id" :label="item.name" :value="item.id" />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="日期" class="picker-time">-->
<!--          <el-date-picker-->
<!--            v-model="form.date"-->
<!--            type="datetimerange"-->
<!--            range-separator="至"-->
<!--            start-placeholder="开始日期"-->
<!--            end-placeholder="结束日期"-->
<!--            format="yyyy-MM-dd"-->
<!--            value-format="yyyy-MM-dd"-->
<!--            :picker-options="setDisabled" />-->
<!--        </el-form-item>-->
<!--        <el-form-item>-->
<!--          <el-button type="primary" :disabled="isLoading" @click="handleQuery">查询</el-button>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
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
            <h2 class="expanded-row_title">详细信息</h2>
            <div class="expanded-row">
              <div class="expanded-row__item">
                <span class="expanded-row__label">新闻 ID: </span>
                <span class="expanded-row__value">{{ props.row.id }}</span>
              </div>
              <div class="expanded-row__item">
                <span class="expanded-row__label">作者: </span>
                <span class="expanded-row__value"><el-tag>{{ props.row.author }}</el-tag></span>
              </div>
              <div class="expanded-row__item">
                <span class="expanded-row__label">名称: </span>
                <span class="expanded-row__value">{{ props.row.newsName }}</span>
              </div>
<!--              <div class="expanded-row__item">-->
<!--                <span class="expanded-row__label">类型:</span>-->
<!--                <span class="expanded-row__value">-->
<!--                  <el-tag v-for="tag in props.row.notes" :key="tag">{{ tag }}</el-tag>-->
<!--                </span>-->
<!--              </div>-->
<!--              <div class="expanded-row__item">-->
<!--                <span class="expanded-row__label">价格:</span>-->
<!--                <span class="expanded-row__value"><el-tag>{{ props.row.price }}</el-tag></span>-->
<!--              </div>-->
              <div class="expanded-row__item expanded-row__item--full">
                <span class="expanded-row__label">内容简介: </span>
                <div class="expanded-row__value">{{ props.row.content }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="封面">
          <template slot-scope="scope">
            <el-image
              class="item-image"
              style="width: 100px;"
              :src="scope.row.newsImg.imageUrl"
              fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="newsName" label="标题" />
        <el-table-column prop="notes" label="类型" />
        <el-table-column prop="data" label="介绍" />
<!--        <el-table-column label="状态">-->
          <!-- <template slot-scope="scope">
            <el-tag type="info" v-if="scope.row.status === 0">草稿</el-tag>
            <el-tag v-else-if="scope.row.status === 1">待审核</el-tag>
            <el-tag type="success" v-else-if="scope.row.status === 2">审核通过</el-tag>
            <el-tag type="warning" v-else-if="scope.row.status === 3">审核失败</el-tag>
            <el-tag type="danger" v-else-if="scope.row.status === 4">已删除</el-tag>
          </template> -->
<!--          <template slot-scope="scope">-->
<!--            <el-tag :type="newsStatus[scope.row.status].type">{{ newsStatus[scope.row.status].text }}</el-tag>-->
<!--          </template>-->
<!--        </el-table-column>-->
        <el-table-column prop="data" label="发布时间" />
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
import { delectArticle, getArticles } from '@/https/article'
import { ref } from 'vue'

export default {
  name: 'NewsIndex',
  data () {
    return {
      newsStatus: [{
        status: 0,
        text: '草稿',
        type: 'info'
      },
      {
        status: 1,
        text: '待审核',
        type: ''
      },
      {
        status: 2,
        text: '审核通过',
        type: 'success'
      },
      {
        status: 3,
        text: '审核失败',
        type: 'warning'
      },
      {
        status: 4,
        text: '已删除',
        type: 'danger'
      }],
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
    // 获取当前用户文章列表
    loadArticles (page = 1) {
      // const { channel, date, status } = this.form
      // TODO 这里之后要修改
      this.isLoading = true
      getArticles().then(res => {
        const { data, status } = res
        if (status === 200) {
          this.newsData = data
          this.totalCount = data.length
          this.isLoading = false
        }
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
    // 编辑文章
    handleEdit (event) {
      this.$router.push('/news_publish?articleId=' + event.toString())
    },
    // 删除文章
    handleItemClick (id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delectArticle(id.toString()).then(res => {
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

<style scoped>
  .news-container {
    .screen {
      margin-bottom: 30px;
    }
    .article-table {
      /*.el-table__row {*/
        .item-image {
          width: 100px;
          height: 100PX;
        }
      /*}*/
    }
  }
  .expanded-row__item {
    display: inline-block;
    margin-right: 18px;
  }
  .expanded-row__item{
    font-size: 15px;
    margin-left: 10px;
  }
  .expanded-row_title{
    margin-left: 10px;
  }
  .expanded-row__label {
    font-weight: bold;
  }
  .expanded-row__item--full {
    display: block;
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .expanded-row__item--full .expanded-row__value{
    margin-top: 10px;
    line-height: 2;
  }
  /*.expanded-row__item {*/
  /*  flex: 0 0 33%; !* 每行显示两个项目 *!*/
  /*  padding: 5px 10px;*/
  /*  box-sizing: border-box;*/
  /*  font-size: 15px;*/
  /*}*/
  /*.expanded-row__item--full {*/
  /*  flex: 1 0 100%; !* 单独占一行并且占据整个宽度 *!*/
  /*}*/
</style>
