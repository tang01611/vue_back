/**
 * 文章相关模块请求封装
 */
// "/api/news"
// 获取新闻列表
// 删除新闻
// 新增新闻
// 获取新闻详情 getById
import request from './request'

// 获取新闻列表
// 无参数，返回文章列表数据
export function getArticles () {
  return request({
    method: 'GET',
    url: '/api/news/list'
  })
}

// 删除新闻
// 参数：id
export function delectArticle (articleId) {
  return request({
    method: 'DELETE',
    url: `/api/news/${articleId}`
  })
}

// 新增文章
// 参数：article
export function addArticle (article) {
  return request({
    method: 'POST',
    url: '/api/news/create',
    // params: {
    //   draft
    // },
    data: article
  })
}

// 获取编辑的文章
export function getArticle (articleId) {
  return request({
    method: 'GET',
    url: `/api/news/${articleId}`
  })
}

// // 获取全部频道列表
// export function getChannels () {
//   return request({
//     method: 'GET',
//     url: '/mp/v1_0/channels'
//   })
// }

// 更新文章
export function updateArticle (articleId, articleObj) {
  return request({
    method: 'PUT',
    url: `/api/news/${articleId}`,
    // params: {
    //   draft
    // },
    data: articleObj
  })
}
