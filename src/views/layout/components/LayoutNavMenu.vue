<template>
  <el-menu
    router
    :default-active="$route.path"
    :collapse="isCollapse"
    background-color="#002033"
    text-color="#fff"
    active-text-color="#ffd04b">
    <el-menu-item index="/">
      <i class="el-icon-s-home"></i>
      <span slot="title">首页</span>
    </el-menu-item>
    <el-menu-item index="/article">
      <i class="el-icon-document"></i>
      <span slot="title">游戏管理</span>
    </el-menu-item>
    <el-menu-item index="/news">
      <i class="el-icon-document"></i>
      <span slot="title">新闻管理</span>
    </el-menu-item>
<!--    <el-menu-item index="/material">-->
<!--      <i class="el-icon-picture"></i>-->
<!--      <span slot="title">素材管理</span>-->
<!--    </el-menu-item>-->
    <el-menu-item index="/publish">
      <i class="el-icon-s-promotion"></i>
      <span slot="title">发布游戏</span>
    </el-menu-item>
    <el-menu-item index="/news_publish">
      <i class="el-icon-s-promotion"></i>
      <span slot="title">发布新闻</span>
    </el-menu-item>
<!--    <el-menu-item index="/fans">-->
<!--      <i class="el-icon-present"></i>-->
<!--      <span slot="title">粉丝管理</span>-->
<!--    </el-menu-item>-->
    <el-menu-item index="/setting">
      <i class="el-icon-setting"></i>
      <span slot="title">个人设置</span>
    </el-menu-item>
  </el-menu>
</template>

<script>

export default {
  name: 'LayoutNavMenu',
  props: {
    isCollapse: {
      type: Boolean,
      default: false,
      required: true
    }
  }
}
</script>
