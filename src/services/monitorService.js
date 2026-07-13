import api from './api'

export const monitorService = {
  getByKey: (key) => api.get('/maneuvers/monitor/', { params: { key } }),
}
