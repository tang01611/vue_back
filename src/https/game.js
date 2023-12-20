/**
 * 游戏相关模块请求封装
 */
// "/api/games"
// 获取游戏列表
// 删除游戏
// 新增游戏
// 获取游戏详情 getById
import request from './request'

// 获取游戏列表
// 无参数，返回游戏列表数据

// export function getGames () {
//   return request({
//     method: 'GET',
//     url: '/api/games/list'
//   })
// }
export function getGames () {
  return request.get('/api/games')
}
// 删除游戏
// 参数：id
export function deleteGame (gameId) {
  return request({
    method: 'DELETE',
    url: `/api/games/${gameId}`
  })
}

// 新增游戏
// 参数：game
export function addGame (game) {
  return request({
    method: 'POST',
    url: '/api/games/create',
    // params: {
    //   draft
    // },
    data: game
  })
}

// 获取编辑的游戏
export function getGame (gameId) {
  return request({
    method: 'GET',
    url: `/api/games/${gameId}`
  })
}

// 更新游戏
export function updateGame (gameId, gameObj) {
  return request({
    method: 'PUT',
    url: `/api/games/${gameId}`,
    // params: {
    //   draft
    // },
    data: gameObj
  })
}
