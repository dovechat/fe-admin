import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_ADMIN_URL })

/* ── Auth ── */
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('admin_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/panel/login'
    }
    return Promise.reject(err)
  }
)

export async function login(username, password) {
  const fd = new FormData()
  fd.append('username', username.trim())
  fd.append('password', password)
  const res = await fetch(
    `${import.meta.env.VITE_AUTH_URL}/auth/login`,
    { method: 'POST', body: fd }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail?.message || data.message || `Ошибка ${res.status}`)
  return data
}

/* ── Dashboard ── */
export const getStats = () => api.get('/stats').then(r => r.data)
export const getAudit = (params) => api.get('/audit', { params }).then(r => r.data)

/* ── Users ── */
export const getUsers = (params) => api.get('/users', { params }).then(r => r.data)
export const getUser = (id) => api.get(`/users/${id}`).then(r => r.data)
export const setUserStatus = (id, status) =>
  api.patch(`/users/${id}/status`, { status }).then(r => r.data)
export const resetPassword = (id, new_password) =>
  api.post(`/users/${id}/reset-password`, { new_password }).then(r => r.data)

/* ── Lines ── */
export const getLines = (params) => api.get('/lines', { params }).then(r => r.data)
export const getLine = (id) => api.get(`/lines/${id}`).then(r => r.data)
export const setLineStatus = (id, status) =>
  api.patch(`/lines/${id}/status`, { status }).then(r => r.data)
export const extendLine = (id, days) =>
  api.post(`/lines/${id}/extend`, { days }).then(r => r.data)

/* ── Instances ── */
export const getInstances = (params) => api.get('/instances', { params }).then(r => r.data)
export const getInstance = (id) => api.get(`/instances/${id}`).then(r => r.data)
export const createInstance = (data) => api.post('/instances', data).then(r => r.data)
export const deleteInstance = (id) => api.delete(`/instances/${id}`).then(r => r.data)
export const cleanInstance = (id) => api.post(`/instances/${id}/clean`).then(r => r.data)
export const bulkCleanInstances = (ids) =>
  api.post('/instances/bulk-clean', { instance_ids: ids }).then(r => r.data)

/* ── Billing ── */
export const getLedger = (params) => api.get('/billing/ledger', { params }).then(r => r.data)
export const getTenantBalance = (tid) =>
  api.get(`/billing/balance/${tid}`).then(r => r.data)
export const createAdjustment = (tid, data) =>
  api.post(`/billing/adjustment/${tid}`, data).then(r => r.data)
export const getAdminTenants = () => api.get('/billing/tenants').then(r => r.data)


