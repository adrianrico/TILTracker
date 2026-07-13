import api from './api'

export const monitorService = {
  getByKey: (key) => api.get('/maneuvers/monitor/', { params: { client_man_key: key } }),
}
