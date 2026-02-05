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