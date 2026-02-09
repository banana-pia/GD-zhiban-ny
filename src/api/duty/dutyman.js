import request from '@/utils/request'

// 查询值班
export function dutyList(query) {
  return request({
    url: '/duty/dutyTable',
    method: 'POST',
    data: query
  })
}

// 值班兵力统计表
export function dutyStatistics(query) {
  return request({
    url: '/duty/soldierStat',
    method: 'POST',
    data: query
  })
}

// 值班兵力描述
export function dutyStatDesc(query) {
  return request({
    url: '/duty/dutyStatDesc',
    method: 'POST',
    data: query
  })
}

//获取值班日志
export function dutyLog(query) {
  return request({
    url: '/dutylog/query',
    method: 'POST',
    data: query
  })
}
//预览值班日志
export function previewDutyLog(query) {
  return request({
    url: `/dutylog/download?path=${query}`,
    method: 'get',
    // params: query,
    responseType: 'blob'
  })
}
