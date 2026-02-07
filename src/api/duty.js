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

export const saveMilitia = (data) => {
  return request({
    url: '/militia/save',
    method: 'post',
    data
  })
}

export const queryMilitia = (data) => {
  return request({
    url: '/militia/query',
    method: 'post',
    data
  })
}

export const deleteMilitia = (entityId) => {
  return request({
    url: '/militia/removeById.do',
    method: 'delete',
    params: {
      entityID: entityId
    }
  })
}

export const saveDutyLog = (formData) => {
  return request({
    url: '/dutylog/save',
    method: 'post',
    data: formData, // 必须是 FormData 实例
    headers: {
      'Content-Type': 'multipart/form-data' // 显式指定，避免自动设置为 application/json
    }
  })
}

export const queryDutyLog = (data) => {
  return request({
    url: '/dutylog/query',
    method: 'post',
    data
  })
}

export const deleteDutyLog = (entityId) => {
  return request({
    url: '/dutylog/removeById.do',
    method: 'delete',
    params: {
      entityID: entityId
    }
  })
}

export const downloadDutyLog = (path) => {
  return request({
    url: '/dutylog/download',
    method: 'get',
    params: {
      path
    },
    responseType: 'blob' // 关键：返回二进制数据
  })
}