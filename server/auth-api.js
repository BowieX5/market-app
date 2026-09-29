import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scrypt = promisify(scryptCallback)
const dataDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', 'data')
const usersFile = join(dataDirectory, 'users.json')
const marketFile = join(dataDirectory, 'market.json')
const sessions = new Map()
const sessionDuration = 24 * 60 * 60 * 1000
let mutationQueue = Promise.resolve()

async function readUsers() {
  try {
    const contents = await readFile(usersFile, 'utf8')
    return JSON.parse(contents).users
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    await mkdir(dirname(usersFile), { recursive: true })
    await writeFile(usersFile, JSON.stringify({ users: [] }, null, 2))
    return []
  }
}

async function writeUsers(users) {
  const temporaryFile = `${usersFile}.tmp`
  await writeFile(temporaryFile, JSON.stringify({ users }, null, 2))
  await rename(temporaryFile, usersFile)
}

async function readMarketData() {
  try {
    return JSON.parse(await readFile(marketFile, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

async function writeMarketData(data) {
  const temporaryFile = `${marketFile}.tmp`
  await mkdir(dataDirectory, { recursive: true })
  await writeFile(temporaryFile, JSON.stringify(data, null, 2))
  await rename(temporaryFile, marketFile)
}

function serializeMutation(operation) {
  const result = mutationQueue.then(operation)
  mutationQueue = result.catch(() => {})
  return result
}

function publicUser(user) {
  return { id: user.id, fullName: user.fullName, phone: user.phone, email: user.email ?? '', role: user.role }
}

function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers })
  response.end(JSON.stringify(body))
}

async function readBody(request, maxBytes = 16_384) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > maxBytes) throw Object.assign(new Error('คำขอมีขนาดใหญ่เกินไป'), { status: 413 })
  }
  try {
    return JSON.parse(body)
  } catch {
    throw Object.assign(new Error('รูปแบบข้อมูลไม่ถูกต้อง'), { status: 400 })
  }
}

function sessionCookie(sessionId, maxAge = 86400) {
  return `market_session=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`
}

function getSessionId(request) {
  const cookie = request.headers.cookie?.split(';').map((item) => item.trim()).find((item) => item.startsWith('market_session='))
  return cookie?.slice('market_session='.length)
}

async function handleAuth(request, response) {
  const url = new URL(request.url, 'http://localhost')
  if (url.pathname === '/api/tenants' || url.pathname === '/api/users') {
    const session = sessions.get(getSessionId(request))
    if (!session || session.expiresAt < Date.now()) {
      sendJson(response, 401, { error: 'กรุณาเข้าสู่ระบบใหม่' })
      return true
    }
    const users = await readUsers()
    const currentUser = users.find((user) => user.id === session.userId)
    if (request.method === 'GET' && url.pathname === '/api/tenants') {
      if (!currentUser || !['owner', 'staff'].includes(currentUser.role)) {
        sendJson(response, 403, { error: 'ไม่มีสิทธิ์ดูบัญชีผู้ใช้งาน' })
        return true
      }
      const visibleUsers = currentUser.role === 'owner' ? users : users.filter((user) => user.role === 'tenant')
      sendJson(response, 200, { tenants: visibleUsers.map(publicUser) })
      return true
    }
    if (request.method !== 'POST' || url.pathname !== '/api/users') {
      sendJson(response, 405, { error: 'ไม่รองรับคำขอนี้' }, { Allow: 'GET, POST' })
      return true
    }
    if (currentUser?.role !== 'owner') {
      sendJson(response, 403, { error: 'เฉพาะเจ้าของตลาดเท่านั้นที่เพิ่มเจ้าหน้าที่ได้' })
      return true
    }
    const body = await readBody(request)
    const fullName = String(body.fullName ?? '').trim()
    const phone = String(body.phone ?? '').trim()
    const password = String(body.password ?? '')
    const role = String(body.role ?? '')
    if (!['staff', 'tenant'].includes(role) || fullName.length < 2 || fullName.length > 100 || !/^0[0-9]{9}$/.test(phone) || password.length < 8 || password.length > 128) {
      sendJson(response, 400, { error: 'กรุณาตรวจสอบชื่อ เบอร์โทรศัพท์ และรหัสผ่านอย่างน้อย 8 ตัวอักษร' })
      return true
    }
    let newUser
    try {
      newUser = await serializeMutation(async () => {
        const latestUsers = await readUsers()
        if (latestUsers.some((user) => user.phone === phone)) {
          throw Object.assign(new Error('หมายเลขโทรศัพท์นี้มีบัญชีอยู่แล้ว'), { status: 409 })
        }
        const salt = randomBytes(16).toString('hex')
        const passwordHash = (await scrypt(password, salt, 64)).toString('hex')
        const createdUser = { id: randomUUID(), fullName, phone, role, salt, passwordHash, createdAt: new Date().toISOString() }
        await writeUsers([...latestUsers, createdUser])
        return createdUser
      })
    } catch (error) {
      sendJson(response, error.status ?? 500, { error: error.status ? error.message : 'สร้างบัญชีผู้ใช้ไม่สำเร็จ' })
      return true
    }
    sendJson(response, 201, { user: publicUser(newUser) })
    return true
  }
  if (url.pathname === '/api/market-data') {
    try {
      if (request.method === 'GET') {
        sendJson(response, 200, { data: await readMarketData() })
        return true
      }
      if (request.method === 'PUT') {
        const data = await readBody(request, 1_048_576)
        if (!['payments', 'stalls', 'leases'].every((key) => Array.isArray(data[key]))) {
          sendJson(response, 400, { error: 'รูปแบบข้อมูลตลาดไม่ถูกต้อง' })
          return true
        }
        await serializeMutation(() => writeMarketData({ payments: data.payments, stalls: data.stalls, leases: data.leases }))
        sendJson(response, 200, { ok: true })
        return true
      }
      sendJson(response, 405, { error: 'ไม่รองรับคำขอนี้' }, { Allow: 'GET, PUT' })
      return true
    } catch {
      sendJson(response, 500, { error: 'ไม่สามารถบันทึกข้อมูลตลาดได้' })
      return true
    }
  }
  if (!url.pathname.startsWith('/api/auth/')) return false

  try {
    if (request.method === 'GET' && url.pathname === '/api/auth/session') {
      const sessionId = getSessionId(request)
      const session = sessions.get(sessionId)
      if (!session || session.expiresAt < Date.now()) {
        sessions.delete(sessionId)
        sendJson(response, 200, { user: null })
        return true
      }
      const user = (await readUsers()).find((item) => item.id === session.userId)
      sendJson(response, 200, { user: user ? publicUser(user) : null })
      return true
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
      sessions.delete(getSessionId(request))
      sendJson(response, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) })
      return true
    }

    if (request.method === 'PUT' && ['/api/auth/profile', '/api/auth/password'].includes(url.pathname)) {
      const session = sessions.get(getSessionId(request))
      if (!session || session.expiresAt < Date.now()) {
        sendJson(response, 401, { error: 'กรุณาเข้าสู่ระบบใหม่' })
        return true
      }
      const body = await readBody(request)
      const result = await serializeMutation(async () => {
        const users = await readUsers()
        const index = users.findIndex((item) => item.id === session.userId)
        if (index < 0) throw Object.assign(new Error('ไม่พบบัญชีผู้ใช้'), { status: 404 })
        const user = users[index]

        if (url.pathname === '/api/auth/profile') {
          const fullName = String(body.fullName ?? '').trim()
          const phone = String(body.phone ?? '').trim()
          const email = String(body.email ?? '').trim()
          if (fullName.length < 2 || fullName.length > 100 || !/^0[0-9]{9}$/.test(phone)) {
            throw Object.assign(new Error('กรุณาตรวจสอบชื่อและหมายเลขโทรศัพท์'), { status: 400 })
          }
          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw Object.assign(new Error('รูปแบบอีเมลไม่ถูกต้อง'), { status: 400 })
          }
          if (users.some((item) => item.phone === phone && item.id !== user.id)) {
            throw Object.assign(new Error('หมายเลขโทรศัพท์นี้มีบัญชีอยู่แล้ว'), { status: 409 })
          }
          users[index] = { ...user, fullName, phone, email }
        } else {
          const currentHash = await scrypt(String(body.currentPassword ?? ''), user.salt, 64)
          if (!timingSafeEqual(currentHash, Buffer.from(user.passwordHash, 'hex'))) {
            throw Object.assign(new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง'), { status: 401 })
          }
          const newPassword = String(body.newPassword ?? '')
          if (newPassword.length < 8 || newPassword.length > 128) {
            throw Object.assign(new Error('รหัสผ่านใหม่ต้องมีความยาว 8 ถึง 128 ตัวอักษร'), { status: 400 })
          }
          const salt = randomBytes(16).toString('hex')
          users[index] = { ...user, salt, passwordHash: (await scrypt(newPassword, salt, 64)).toString('hex') }
        }

        await writeUsers(users)
        return users[index]
      })
      sendJson(response, 200, { user: publicUser(result) })
      return true
    }

    if (request.method !== 'POST') {
      sendJson(response, 405, { error: 'ไม่รองรับคำขอนี้' }, { Allow: 'GET, POST' })
      return true
    }

    const body = await readBody(request)
    if (url.pathname === '/api/auth/register') {
      const fullName = String(body.fullName ?? '').trim()
      const phone = String(body.phone ?? '').trim()
      const password = String(body.password ?? '')
      if (fullName.length < 2 || fullName.length > 100) {
        sendJson(response, 400, { error: 'กรุณากรอกชื่อ-นามสกุล 2 ถึง 100 ตัวอักษร' })
        return true
      }
      if (!/^0[0-9]{9}$/.test(phone)) {
        sendJson(response, 400, { error: 'กรุณากรอกหมายเลขโทรศัพท์มือถือ 10 หลัก' })
        return true
      }
      if (password.length < 8 || password.length > 128) {
        sendJson(response, 400, { error: 'รหัสผ่านต้องมีความยาว 8 ถึง 128 ตัวอักษร' })
        return true
      }

      const user = await serializeMutation(async () => {
        const users = await readUsers()
        if (users.some((item) => item.phone === phone)) {
          const error = new Error('หมายเลขโทรศัพท์นี้มีบัญชีอยู่แล้ว')
          error.status = 409
          throw error
        }
        const salt = randomBytes(16).toString('hex')
        const passwordHash = (await scrypt(password, salt, 64)).toString('hex')
        const newUser = { id: randomUUID(), fullName, phone, role: 'tenant', salt, passwordHash, createdAt: new Date().toISOString() }
        await writeUsers([...users, newUser])
        return newUser
      })
      const sessionId = randomBytes(32).toString('hex')
      sessions.set(sessionId, { userId: user.id, expiresAt: Date.now() + sessionDuration })
      sendJson(response, 201, { user: publicUser(user) }, { 'Set-Cookie': sessionCookie(sessionId) })
      return true
    }

    if (url.pathname === '/api/auth/login') {
      const phone = String(body.phone ?? '').trim()
      const password = String(body.password ?? '')
      const user = (await readUsers()).find((item) => item.phone === phone)
      const candidate = user ? await scrypt(password, user.salt, 64) : Buffer.alloc(64)
      const valid = user && timingSafeEqual(candidate, Buffer.from(user.passwordHash, 'hex'))
      if (!valid) {
        sendJson(response, 401, { error: 'หมายเลขโทรศัพท์หรือรหัสผ่านไม่ถูกต้อง' })
        return true
      }
      const sessionId = randomBytes(32).toString('hex')
      sessions.set(sessionId, { userId: user.id, expiresAt: Date.now() + sessionDuration })
      sendJson(response, 200, { user: publicUser(user) }, { 'Set-Cookie': sessionCookie(sessionId) })
      return true
    }

    sendJson(response, 404, { error: 'ไม่พบปลายทางนี้' })
    return true
  } catch (error) {
    sendJson(response, error.status ?? 500, { error: error.status ? error.message : 'เกิดข้อผิดพลาดภายในระบบ' })
    return true
  }
}

export function authApiPlugin() {
  const middleware = (request, response, next) => {
    handleAuth(request, response).then((handled) => {
      if (!handled) next()
    }).catch(() => sendJson(response, 500, { error: 'เกิดข้อผิดพลาดภายในระบบ' }))
  }

  return {
    name: 'market-json-auth-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}