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

export const queryDuty = (data) => {
  return request({
    url: '/duty/query',
    method: 'post',
    data
  })
}

export const deleteDuty = (entityId) => {
  return request({
    url: '/duty/removeById.do',
    method: 'delete',
    params: {
      entityID: entityId
    }
  })
}

export const listGdPerson = () => {
  return request({
    url: '/GdPerson/list',
    method: 'get'
  })
}