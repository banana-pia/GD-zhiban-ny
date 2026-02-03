import  request from '@/utils/request'

/**
 * 保存和修改值班信息
 * @param {Object} data - 值班信息数据
 * @returns {Promise} 请求结果
 */
export const saveDuty = (data) => {
  return request({
    url: '/duty/save',
    method: 'post',
    data
  })
}