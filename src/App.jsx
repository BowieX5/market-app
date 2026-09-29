import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowRight, ArrowUpRight, Banknote, BarChart3, Bell, Building2,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, CircleAlert,
  CircleDollarSign, Clock3, CreditCard, Download, FileClock, FileSpreadsheet,
  Eye, EyeOff, FileText, KeyRound, LayoutDashboard, LockKeyhole, LogOut, Mail, MapPin, Menu, Phone, Plus, Printer,
  Receipt, Search, Settings, ShieldCheck, Smartphone, Store, Upload, UserRound,
  Users, Wallet, X,
} from 'lucide-react'
import './App.css'

const startingPayments = [
  { id: 'PM-240918', tenant: 'กมลวรรณ ใจดี', stall: 'A-12', detail: 'ค่าเช่ารายสัปดาห์ · 16–22 ก.ย.', amount: 1200, date: '18 ก.ย. 2567', dateISO: '2024-09-18', status: 'ชำระแล้ว' },
  { id: 'PM-240917', tenant: 'ธนกร แซ่ลิ้ม', stall: 'B-08', detail: 'ค่าเช่ารายเดือน · ก.ย.', amount: 4800, date: '18 ก.ย. 2567', dateISO: '2024-09-18', status: 'รอตรวจสอบ' },
  { id: 'PM-240916', tenant: 'สุดารัตน์ พูลผล', stall: 'C-21', detail: 'ค่าเช่ารายวัน · 18 ก.ย.', amount: 250, date: '17 ก.ย. 2567', dateISO: '2024-09-17', status: 'ค้างชำระ' },
  { id: 'PM-240915', tenant: 'ปรีชา มีสุข', stall: 'A-04', detail: 'ค่าเช่ารายสัปดาห์ · 16–22 ก.ย.', amount: 950, date: '17 ก.ย. 2567', dateISO: '2024-09-17', status: 'รอตรวจสอบ' },
  { id: 'PM-240914', tenant: 'วราภรณ์ ศรีทอง', stall: 'D-03', detail: 'ค่าเช่ารายเดือน · ก.ย.', amount: 5200, date: '16 ก.ย. 2567', dateISO: '2024-09-16', status: 'ชำระแล้ว' },
  { id: 'PM-240913', tenant: 'กมลวรรณ ใจดี', stall: 'A-12', detail: 'ค่าเช่ารายสัปดาห์ · 9–15 ก.ย.', amount: 1200, date: '15 ก.ย. 2567', dateISO: '2024-09-15', status: 'ชำระแล้ว' },
]

const startingStalls = [
  { number: 'A-01', zone: 'โซนอาหาร', tenant: 'นภาพร พรหมมา', rate: 350, period: 'รายวัน', status: 'มีผู้เช่า' },
  { number: 'A-04', zone: 'โซนอาหาร', tenant: 'ปรีชา มีสุข', rate: 950, period: 'รายสัปดาห์', status: 'มีผู้เช่า' },
  { number: 'A-12', zone: 'โซนอาหาร', tenant: 'กมลวรรณ ใจดี', rate: 1200, period: 'รายสัปดาห์', status: 'มีผู้เช่า' },
  { number: 'B-08', zone: 'โซนของสด', tenant: 'ธนกร แซ่ลิ้ม', rate: 4800, period: 'รายเดือน', status: 'มีผู้เช่า' },
  { number: 'B-11', zone: 'โซนของสด', tenant: '', rate: 300, period: 'รายวัน', status: 'ว่าง' },
  { number: 'C-21', zone: 'โซนแฟชั่น', tenant: 'สุดารัตน์ พูลผล', rate: 250, period: 'รายวัน', status: 'มีผู้เช่า' },
  { number: 'C-24', zone: 'โซนแฟชั่น', tenant: '', rate: 1100, period: 'รายสัปดาห์', status: 'ว่าง' },
  { number: 'D-03', zone: 'โซนทั่วไป', tenant: 'วราภรณ์ ศรีทอง', rate: 5200, period: 'รายเดือน', status: 'มีผู้เช่า' },
]

const startingLeases = [
  { id: 'CT-067', tenant: 'กมลวรรณ ใจดี', stall: 'A-12', period: 'รายสัปดาห์', rate: 1200, start: '01 ม.ค. 2567', end: '30 ก.ย. 2567', status: 'ใกล้หมดอายุ' },
  { id: 'CT-064', tenant: 'ธนกร แซ่ลิ้ม', stall: 'B-08', period: 'รายเดือน', rate: 4800, start: '01 มี.ค. 2567', end: '28 ก.พ. 2568', status: 'ใช้งานอยู่' },
  { id: 'CT-061', tenant: 'ปรีชา มีสุข', stall: 'A-04', period: 'รายสัปดาห์', rate: 950, start: '15 มิ.ย. 2567', end: '15 ธ.ค. 2567', status: 'ใช้งานอยู่' },
  { id: 'CT-055', tenant: 'วราภรณ์ ศรีทอง', stall: 'D-03', period: 'รายเดือน', rate: 5200, start: '01 ก.ค. 2567', end: '30 มิ.ย. 2568', status: 'ใช้งานอยู่' },
]

const roles = {
  owner: { label: 'ผู้บริหาร / เจ้าของ', name: 'คุณอรทัย', initials: 'อร' },
  staff: { label: 'เจ้าหน้าที่ตลาด', name: 'คุณสมชาย', initials: 'สช' },
  tenant: { label: 'ผู้เช่า', name: 'คุณกมลวรรณ', initials: 'กม' },
}

const menus = {
  owner: [
    ['overview', 'ภาพรวมตลาด', LayoutDashboard], ['stalls', 'พื้นที่ / แผง', Store],
    ['leases', 'สัญญาเช่า', FileText], ['payments', 'รายการชำระเงิน', Receipt, '2'],
    ['tenants', 'ผู้ใช้งาน', Users], ['reports', 'รายงานบัญชี', BarChart3],
  ],
  staff: [
    ['overview', 'ภาพรวมตลาด', LayoutDashboard], ['stalls', 'พื้นที่ / แผง', Store],
    ['leases', 'สัญญาเช่า', FileText], ['payments', 'ตรวจสอบชำระเงิน', Receipt, '2'],
    ['tenants', 'ผู้เช่า', Users],
  ],
  tenant: [
    ['overview', 'หน้าหลัก', LayoutDashboard], ['leases', 'แผงและสัญญา', Store],
    ['payments', 'ค่าเช่าและชำระเงิน', Receipt], ['profile', 'ข้อมูลส่วนตัว', UserRound],
  ],
}

const money = (amount) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount)

async function encodeFile(file) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return `data:${file.type || 'application/octet-stream'};base64,${btoa(binary)}`
}

function Status({ value }) {
  const type = ['ชำระแล้ว', 'ใช้งานอยู่', 'มีผู้เช่า'].includes(value) ? 'good' : ['รอตรวจสอบ', 'ใกล้หมดอายุ'].includes(value) ? 'pending' : value === 'ว่าง' ? 'empty' : 'late'
  return <span className={`status-pill status-${type}`}><i />{value}</span>
}

function App() {
  const [role, setRole] = useState('tenant')
  const [currentUser, setCurrentUser] = useState(null)
  const [page, setPage] = useState('overview')
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('เดือนนี้')
  const [activeLeasesOnly, setActiveLeasesOnly] = useState(false)
  const [reportStart, setReportStart] = useState('')
  const [reportEnd, setReportEnd] = useState('')
  const [appliedReportRange, setAppliedReportRange] = useState({ from: '', to: '' })
  const [modal, setModal] = useState('')
  const [toast, setToast] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [payments, setPayments] = useState(startingPayments)
  const [stalls, setStalls] = useState(startingStalls)
  const [leases, setLeases] = useState(startingLeases)
  const [tenants, setTenants] = useState([])
  const [userGroup, setUserGroup] = useState('tenant')
  const [marketDataLoaded, setMarketDataLoaded] = useState(false)
  const [authView, setAuthView] = useState('login')

  useEffect(() => {
    fetch('/api/auth/session')
      .then((response) => response.json())
      .then(({ user }) => {
        if (user) {
          setCurrentUser(user)
          setRole(user.role)
          setAuthView('')
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/market-data')
      .then((response) => response.json())
      .then(({ data }) => {
        if (data) {
          setPayments(data.payments)
          setStalls(data.stalls)
          setLeases(data.leases)
        }
        setMarketDataLoaded(true)
      })
      .catch(() => setMarketDataLoaded(true))
  }, [])

  useEffect(() => {
    if (!currentUser) {
      setTenants([])
      return undefined
    }
    let cancelled = false
    fetch('/api/tenants')
      .then((response) => response.json())
      .then(({ tenants: storedTenants }) => {
        if (!cancelled) setTenants(storedTenants)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [currentUser])

  useEffect(() => {
    if (!marketDataLoaded) return
    fetch('/api/market-data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payments, stalls, leases }),
    }).then((response) => {
      if (!response.ok) throw new Error('market data save failed')
    }).catch(() => setToast('บันทึกข้อมูลตลาดไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ'))
  }, [marketDataLoaded, payments, stalls, leases])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const activeRole = role === 'tenant' && currentUser
    ? { ...roles.tenant, name: currentUser.fullName, initials: currentUser.fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('') }
    : roles[role]
  const navigation = menus[role]
  const title = navigation.find(([id]) => id === page)?.[1] ?? 'ข้อมูลส่วนตัว'
  const tenantLease = leases.find((item) => item.tenant === currentUser?.fullName)
  const tenantStall = tenantLease?.stall ?? 'A-12'
  const outstandingPayments = payments.filter((item) => item.status === 'ค้างชำระ')
  const paidPayments = payments.filter((item) => item.status === 'ชำระแล้ว')
  const paidTotal = paidPayments.reduce((total, item) => total + Number(item.amount || 0), 0)
  const pendingPayments = payments.filter((item) => item.status === 'รอตรวจสอบ')
  const pendingTotal = pendingPayments.reduce((total, item) => total + Number(item.amount || 0), 0)
  const outstandingTotal = outstandingPayments.reduce((total, item) => total + Number(item.amount || 0), 0)
  const tenantDuePayment = payments.find((item) => item.stall === tenantStall && item.status === 'ค้างชำระ')
  const occupiedCount = stalls.filter((item) => item.status === 'มีผู้เช่า').length
  const occupancyRate = stalls.length ? Math.round((occupiedCount / stalls.length) * 100) : 0
  const payRows = useMemo(() => payments.filter((item) => `${item.tenant} ${item.stall} ${item.id} ${item.status}`.toLowerCase().includes(search.toLowerCase())), [payments, search])
  const reportRows = useMemo(() => payments.filter((item) => (!appliedReportRange.from || item.dateISO >= appliedReportRange.from) && (!appliedReportRange.to || item.dateISO <= appliedReportRange.to)), [payments, appliedReportRange])
  const stallRows = useMemo(() => stalls.filter((item) => `${item.number} ${item.zone} ${item.tenant} ${item.status}`.toLowerCase().includes(search.toLowerCase())), [stalls, search])
  const leaseRows = useMemo(() => leases.filter((item) => (!activeLeasesOnly || item.status === 'ใช้งานอยู่') && `${item.id} ${item.tenant} ${item.stall} ${item.status}`.toLowerCase().includes(search.toLowerCase())), [leases, search, activeLeasesOnly])

  function changeRole(value) {
    setRole(value)
    setPage('overview')
    setSearch('')
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setCurrentUser(null)
    setRole('tenant')
    setPage('overview')
    setAuthView('login')
  }

  function verify(id) {
    setPayments((current) => current.map((item) => item.id === id ? { ...item, status: 'ชำระแล้ว' } : item))
    setToast('ตรวจสอบการชำระเงินแล้ว และบันทึกสถานะลง JSON')
  }

  async function submitForm(event) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    if (modal === 'payment') {
      const proof = values.get('proof')
      if (proof.size > 10 * 1024 * 1024) {
        setToast('ไฟล์หลักฐานต้องมีขนาดไม่เกิน 10 MB')
        return
      }
      const proofData = await encodeFile(proof)
      setPayments((current) => [{ id: `PM-${Date.now().toString().slice(-6)}`, tenant: currentUser?.fullName ?? 'ผู้เช่า', stall: tenantStall, detail: 'ส่งหลักฐานการชำระเงิน', amount: Number(values.get('amount')) || 1200, date: new Date().toLocaleDateString('th-TH'), dateISO: new Date().toISOString().slice(0, 10), status: 'รอตรวจสอบ', proofName: proof.name, proofData }, ...current])
      setToast('ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว')
    } else if (modal === 'stall') {
      const number = String(values.get('number')).toUpperCase()
      if (stalls.some((item) => item.number === number)) {
        setToast('หมายเลขแผงนี้มีอยู่แล้ว')
        return
      }
      setStalls((current) => [...current, { number, zone: values.get('zone'), tenant: '', rate: Number(values.get('rate')), period: values.get('period'), status: 'ว่าง' }])
      setToast(`เพิ่มแผง ${number} แล้ว`)
    } else if (modal === 'lease') {
      const stallNumber = values.get('stall')
      setLeases((current) => [{ id: `CT-${String(Date.now()).slice(-3)}`, tenant: values.get('tenant'), stall: stallNumber, period: values.get('period'), rate: Number(values.get('rate')), start: values.get('start'), end: values.get('end'), status: 'ใช้งานอยู่' }, ...current])
      setStalls((current) => current.map((item) => item.number === stallNumber ? { ...item, tenant: values.get('tenant'), status: 'มีผู้เช่า' } : item))
      setToast('บันทึกสัญญาเช่าเรียบร้อยแล้ว')
    } else if (modal === 'profile') {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: values.get('name'), phone: values.get('phone'), email: values.get('email') }),
      })
      const result = await response.json()
      if (!response.ok) {
        setToast(result.error ?? 'บันทึกข้อมูลส่วนตัวไม่สำเร็จ')
        return
      }
      setCurrentUser(result.user)
      setToast('บันทึกข้อมูลส่วนตัวลง JSON แล้ว')
    } else if (modal === 'password') {
      const newPassword = String(values.get('newPassword') ?? '')
      if (newPassword !== values.get('confirmPassword')) {
        setToast('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน')
        return
      }
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: values.get('currentPassword'), newPassword }),
      })
      const result = await response.json()
      if (!response.ok) {
        setToast(result.error ?? 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
        return
      }
      setToast('เปลี่ยนรหัสผ่านและบันทึกลง JSON แล้ว')
    } else if (modal === 'user') {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: values.get('fullName'), phone: values.get('phone'), password: values.get('password'), role: values.get('role') }),
      })
      const result = await response.json()
      if (!response.ok) {
        setToast(result.error ?? 'สร้างบัญชีผู้ใช้ไม่สำเร็จ')
        return
      }
      setTenants((current) => [...current, result.user])
      setToast(`เพิ่มบัญชี${result.user.role === 'tenant' ? 'ผู้เช่า' : 'เจ้าหน้าที่ตลาด'} ${result.user.fullName} แล้ว`)
    }
    setModal('')
  }

  async function exportExcel(rows = payments) {
    const ExcelJS = (await import('exceljs')).default
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('รายการรับชำระ')
    sheet.columns = [
      { header: 'เลขที่รายการ', key: 'id', width: 18 },
      { header: 'ผู้เช่า', key: 'tenant', width: 24 },
      { header: 'หมายเลขแผง', key: 'stall', width: 16 },
      { header: 'รายละเอียด', key: 'detail', width: 34 },
      { header: 'จำนวนเงิน (บาท)', key: 'amount', width: 20 },
      { header: 'วันที่ชำระ', key: 'date', width: 18 },
      { header: 'สถานะ', key: 'status', width: 18 },
    ]
    sheet.addRows(rows)
    sheet.getRow(1).font = { bold: true }
    const fileContent = await workbook.xlsx.writeBuffer()
    const downloadUrl = URL.createObjectURL(new Blob([fileContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const downloadLink = document.createElement('a')
    downloadLink.href = downloadUrl
    downloadLink.download = 'รายงานรับชำระตลาด.xlsx'
    downloadLink.click()
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    setToast('ดาวน์โหลดรายงาน Excel แล้ว')
  }

  function dashboard() {
    const tenant = role === 'tenant'
    const cards = tenant ? [
      ['แผงที่เช่า', tenantLease?.stall ?? 'ยังไม่มี', tenantLease ? 'พื้นที่เช่าปัจจุบัน' : 'ยังไม่มีสัญญาที่ผูกกับบัญชีนี้', Store, 'mint'],
      ['สถานะสัญญา', tenantLease?.status ?? 'ไม่มีสัญญา', tenantLease?.end ? `สิ้นสุด ${tenantLease.end}` : 'สร้างสัญญาจากเมนูจัดการ', FileText, 'blue'],
      ['ค่าเช่ารอบถัดไป', money(payments.find((item) => item.stall === tenantStall && item.status === 'ค้างชำระ')?.amount ?? 0), 'อ้างอิงรายการค้างชำระ', CalendarDays, 'yellow'],
      ['ยอดชำระแล้ว', money(paidTotal), `${paidPayments.length} รายการ`, Wallet, 'coral'],
    ] : [
      ['พื้นที่ทั้งหมด', String(stalls.length).padStart(2, '0'), 'ทุกโซนในตลาด', Store, 'mint'],
      ['มีผู้เช่า', String(occupiedCount).padStart(2, '0'), `อัตราเช่า ${occupancyRate}%`, Building2, 'blue'],
      ['สัญญาใช้งานอยู่', String(leases.length).padStart(2, '0'), '2 สัญญาใกล้หมดอายุ', FileText, 'yellow'],
      ['รายรับที่ชำระแล้ว', money(paidTotal), `${paidPayments.length} รายการ`, Banknote, 'coral'],
    ]
    const bars = period === 'สัปดาห์นี้' ? [['จ.', 56], ['อ.', 72], ['พ.', 48], ['พฤ.', 85], ['ศ.', 66], ['ส.', 92], ['อา.', 74]] : [['สัปดาห์ 1', 52], ['สัปดาห์ 2', 72], ['สัปดาห์ 3', 63], ['สัปดาห์ 4', 88]]
    return <>
      <section className="welcome-band"><div><span className="eyebrow">ภาพรวมข้อมูลตลาด</span><h2>{tenant ? `สวัสดี, ${currentUser?.fullName ?? 'ผู้เช่า'}` : `สวัสดี, ${activeRole.name}`}</h2><p>{tenant ? 'นี่คือข้อมูลพื้นที่เช่าของคุณ' : 'ตลาดให้เช่า · ภาพรวมการจัดการวันนี้'}</p></div><span className="welcome-aside"><i />ข้อมูลบันทึกใน JSON</span><Store className="welcome-art" size={64} strokeWidth={1.1} /></section>
      <section className="stats-grid">{cards.map(([label, value, note, Icon, tone]) => <article className="stat-card" key={label}><span className={`stat-icon ${tone}`}><Icon size={19} /></span><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><small>{note}</small></article>)}</section>
      <div className="dashboard-grid"><section className="panel revenue-panel"><div className="panel-heading"><div><span className="eyebrow">รายรับ</span><h3>{tenant ? 'รายการชำระย้อนหลัง' : 'แนวโน้มรายรับ'}</h3></div><select aria-label="เลือกช่วงรายรับ" value={period} onChange={(event) => setPeriod(event.target.value)}><option>เดือนนี้</option><option>สัปดาห์นี้</option></select></div>
        {tenant ? <div className="tenant-history">{payments.filter((item) => item.stall === tenantStall).slice(0, 3).map((item) => <div className="history-row" key={item.id}><CalendarDays size={15} /><span>{item.date} · {item.detail}</span><strong>{money(item.amount)}</strong><Status value={item.status} /></div>)}</div> : <><div className="revenue-total"><strong>{money(paidTotal)}</strong><span className="trend-chip"><ArrowUpRight size={13} />{paidPayments.length}</span><small>รายการที่ชำระแล้ว</small></div><div className="chart"><div className="chart-y-axis"><span>40k</span><span>30k</span><span>20k</span><span>10k</span><span>0</span></div><div className="chart-plot"><div className="chart-guides"><i /><i /><i /><i /><i /></div><div className="bar-set">{bars.map(([label, value], index) => <div className="bar-column" key={label}><div className={`bar ${index === bars.length - 1 ? 'bar-active' : ''}`} style={{ height: `${value}%` }}><span>{index === bars.length - 1 ? money(paidTotal) : ''}</span></div><small>{label}</small></div>)}</div></div></div></>}
      </section><section className="panel occupancy-panel"><div className="panel-heading"><div><span className="eyebrow">สถานะพื้นที่</span><h3>ภาพรวมแผง</h3></div><button className="icon-button" onClick={() => setPage('stalls')} aria-label="ดูพื้นที่ทั้งหมด"><ArrowRight size={17} /></button></div><div className="occupancy-content"><div className="donut" style={{ background: `conic-gradient(#43866a 0 ${occupancyRate}%, #dfeae0 ${occupancyRate}% 100%)` }}><div><strong>{occupancyRate}%</strong><span>อัตราเช่า</span></div></div><div className="occupancy-legend"><div><i className="legend-dot occupied" />มีผู้เช่า <strong>{occupiedCount}</strong></div><div><i className="legend-dot vacant" />ว่าง <strong>{stalls.filter((item) => item.status === 'ว่าง').length}</strong></div><div><i className="legend-dot reserve" />ปิดปรับปรุง <strong>{stalls.filter((item) => item.status === 'ปิดปรับปรุง').length}</strong></div></div></div><button className="text-link" onClick={() => setPage('stalls')}>จัดการพื้นที่ทั้งหมด <ChevronRight size={15} /></button></section></div>
      {tenant ? <section className="panel tenant-next"><span className="next-icon"><CreditCard size={21} /></span><div><span className="eyebrow">รายการค้างชำระ</span><h3>{tenantDuePayment ? money(tenantDuePayment.amount) : 'ไม่มียอดค้างชำระ'}</h3><p>แผง {tenantStall} · {tenantDuePayment?.detail ?? 'ตรวจสอบประวัติการชำระเงิน'}</p></div><button className="button-primary" onClick={() => setModal('payment')}><Upload size={16} />ส่งหลักฐานการโอน</button></section> : <div className="lower-grid"><section className="panel payments-panel"><div className="panel-heading"><div><span className="eyebrow">รายการล่าสุด</span><h3>การชำระเงิน</h3></div><button className="text-link" onClick={() => setPage('payments')}>ดูทั้งหมด <ChevronRight size={15} /></button></div><PaymentTable payments={payments.slice(0, 4)} role={role} onVerify={verify} compact /></section><section className="panel expiry-panel"><div className="panel-heading"><div><span className="eyebrow">ติดตามสัญญา</span><h3>ใกล้หมดอายุ</h3></div><span className="count-badge">{leases.filter((item) => item.status === 'ใกล้หมดอายุ').length} รายการ</span></div><div className="expiry-list">{leases.filter((item) => item.status === 'ใกล้หมดอายุ').slice(0, 2).map((item) => <Expiry key={item.id} name={item.tenant} detail={`แผง ${item.stall} · สัญญา ${item.id}`} date={item.end} days={item.status} initials={item.tenant.slice(0, 2)} />)}</div><button className="text-link" onClick={() => setPage('leases')}>ดูสัญญาเช่าทั้งหมด <ChevronRight size={15} /></button></section></div>}
    </>
  }

  function stallsPage() {
    return <><PageIntro eyebrow="จัดการพื้นที่ตลาด" title="พื้นที่ / แผง" subtitle="ดูสถานะและอัตราค่าเช่าของทุกพื้นที่ในตลาด" action={role !== 'tenant' && <button className="button-primary" onClick={() => setModal('stall')}><Plus size={17} />เพิ่มแผง</button>} /><section className="panel"><div className="panel-toolbar"><span>พื้นที่ทั้งหมด <strong>{stallRows.length}</strong></span><span className="toolbar-note"><i className="legend-dot occupied" />มีผู้เช่า <i className="legend-dot vacant" />ว่าง</span></div><div className="stall-grid">{stallRows.map((stall) => <article className={`stall-card ${stall.status === 'ว่าง' ? 'stall-vacant' : ''}`} key={stall.number}><div className="stall-card-head"><strong>{stall.number}</strong><Status value={stall.status} /></div><span className="stall-zone"><MapPin size={13} />{stall.zone}</span><div className="stall-tenant">{stall.tenant || 'ยังไม่มีผู้เช่า'}</div><div className="stall-card-foot"><span>{stall.period}</span><strong>{money(stall.rate)}<small> / {stall.period === 'รายวัน' ? 'วัน' : stall.period === 'รายสัปดาห์' ? 'สัปดาห์' : 'เดือน'}</small></strong></div></article>)}</div></section></>
  }

  function leasesPage() {
    if (role === 'tenant') {
      const leasedStall = stalls.find((item) => item.number === tenantLease?.stall)
      if (!tenantLease) return <><PageIntro eyebrow="พื้นที่เช่าของฉัน" title="แผงและสัญญา" subtitle="ข้อมูลพื้นที่และเงื่อนไขสัญญาเช่าปัจจุบัน" /><section className="panel empty-state">บัญชีนี้ยังไม่มีสัญญาเช่า</section></>
      return <><PageIntro eyebrow="พื้นที่เช่าของฉัน" title="แผงและสัญญา" subtitle="ข้อมูลพื้นที่และเงื่อนไขสัญญาเช่าปัจจุบัน" /><section className="panel tenant-lease-card"><div className="tenant-lease-top"><span className="large-stall-icon"><Store size={27} /></span><div><span className="eyebrow">หมายเลขพื้นที่</span><h3>{tenantLease.stall}</h3><p>{leasedStall?.zone ?? 'ตลาดให้เช่า'}</p></div><Status value={tenantLease.status} /></div><div className="lease-detail-grid"><div><span>รูปแบบค่าเช่า</span><strong>{tenantLease.period}</strong></div><div><span>อัตราค่าเช่า</span><strong>{money(tenantLease.rate)} / {tenantLease.period}</strong></div><div><span>วันเริ่มสัญญา</span><strong>{tenantLease.start}</strong></div><div><span>วันสิ้นสุดสัญญา</span><strong>{tenantLease.end}</strong></div><div><span>เลขที่สัญญา</span><strong>{tenantLease.id}</strong></div><div><span>สถานะ</span><strong>{tenantLease.status}</strong></div></div><button className="button-secondary" onClick={() => downloadJson(`${tenantLease.id}.json`, tenantLease)}><Download size={16} />ดาวน์โหลดข้อมูลสัญญา</button></section></>
    }
    return <><PageIntro eyebrow="จัดการข้อตกลงเช่า" title="สัญญาเช่า" subtitle="กำหนดระยะเวลา รูปแบบ และอัตราค่าเช่าของผู้เช่า" action={<button className="button-primary" onClick={() => setModal('lease')}><Plus size={17} />สร้างสัญญา</button>} /><section className="panel table-panel"><div className="panel-toolbar">สัญญาทั้งหมด <strong>{leaseRows.length}</strong><button className="button-secondary compact-button" onClick={() => setToast('แสดงสัญญาที่ใช้งานอยู่')}><FileClock size={15} />สัญญาที่ใช้งานอยู่</button></div><div className="table-scroll"><table><thead><tr><th>เลขที่สัญญา</th><th>ผู้เช่า</th><th>หมายเลขแผง</th><th>รูปแบบ / อัตรา</th><th>ระยะเวลาสัญญา</th><th>สถานะ</th></tr></thead><tbody>{leaseRows.map((item) => <tr key={item.id}><td className="cell-id">{item.id}</td><td className="cell-name">{item.tenant}</td><td>{item.stall}</td><td>{item.period} · {money(item.rate)}</td><td>{item.start} – {item.end}</td><td><Status value={item.status} /></td></tr>)}</tbody></table></div></section></>
  }

  function paymentsPage() {
    if (role === 'tenant') return <><PageIntro eyebrow="ค่าเช่าและประวัติ" title="รายการชำระเงิน" subtitle="ตรวจสอบยอดที่ต้องชำระและสถานะการชำระเงิน" /><section className="bill-banner"><span className="bill-icon"><CircleDollarSign size={24} /></span><div className="bill-copy"><span>ยอดค้างชำระ</span><strong>{money(tenantDuePayment?.amount ?? 0)}</strong><small>{tenantDuePayment?.detail ?? `ไม่มีรายการค้างชำระ · แผง ${tenantStall}`}</small></div><button className="button-primary" onClick={() => setModal('payment')}><Upload size={16} />ชำระเงิน / ส่งหลักฐาน</button></section><section className="panel table-panel"><div className="panel-heading"><div><span className="eyebrow">ย้อนหลัง</span><h3>ประวัติการชำระเงิน</h3></div><button className="button-secondary compact-button" onClick={() => downloadJson('ประวัติการชำระเงิน.json', payments.filter((item) => item.stall === tenantStall))}><Download size={15} />ดาวน์โหลด JSON</button></div><PaymentTable payments={payments.filter((item) => item.stall === tenantStall)} role={role} onVerify={verify} /></section></>
    return <><PageIntro eyebrow="รับชำระและตรวจสอบ" title={role === 'staff' ? 'ตรวจสอบการชำระเงิน' : 'รายการชำระเงิน'} subtitle="ติดตามยอดรับชำระและสถานะรายการทั้งหมด" /><div className="payment-summary"><Summary icon={CheckCircle2} tone="good" label="ชำระแล้ว" value={`${paidPayments.length} รายการ`} /><Summary icon={Clock3} tone="pending" label="รอตรวจสอบ" value={`${pendingPayments.length} รายการ · ${money(pendingTotal)}`} /><Summary icon={CircleAlert} tone="late" label="ค้างชำระ" value={`${outstandingPayments.length} รายการ · ${money(outstandingTotal)}`} /><Summary icon={Wallet} tone="money" label="ยอดรับชำระ" value={money(paidTotal)} /></div><section className="panel table-panel"><div className="panel-toolbar">รายการทั้งหมด <strong>{payRows.length}</strong></div><PaymentTable payments={payRows} role={role} onVerify={verify} /></section></>
  }

  function tenantsPage() {
    const groups = role === 'owner'
      ? [['tenant', 'ผู้เช่า'], ['staff', 'เจ้าหน้าที่ตลาด'], ['owner', 'เจ้าของตลาด']]
      : [['tenant', 'ผู้เช่า']]
    const activeGroup = groups.some(([id]) => id === userGroup) ? userGroup : 'tenant'
    const groupUsers = tenants.filter((tenant) => tenant.role === activeGroup)
    const rows = groupUsers.map((tenant) => {
      const lease = tenant.role === 'tenant' ? leases.find((item) => item.tenant === tenant.fullName) : null
      const overdue = tenant.role === 'tenant' ? payments.filter((item) => item.tenant === tenant.fullName && item.status === 'ค้างชำระ') : []
      const amountDue = overdue.reduce((total, item) => total + Number(item.amount || 0), 0)
      const roleLabel = { owner: 'เจ้าของตลาด', staff: 'เจ้าหน้าที่ตลาด', tenant: 'ผู้เช่า' }[tenant.role] ?? 'ผู้ใช้'
      return [tenant.fullName, roleLabel, tenant.phone, lease?.stall ?? '—', lease?.status ?? '—', money(amountDue), tenant.email]
    }).filter((row) => row.join(' ').toLowerCase().includes(search.toLowerCase()))
    return <><PageIntro eyebrow="จัดการบัญชี" title={role === 'owner' ? 'ผู้ใช้งาน' : 'ผู้เช่า'} subtitle="ดูบัญชีผู้ใช้และกำหนดสิทธิ์การเข้าใช้งานตลาด" action={role === 'owner' && <button className="button-primary" onClick={() => setModal('user')}><Plus size={17} />เพิ่มผู้ใช้งาน</button>} /><div className="user-tabs" role="tablist" aria-label="กลุ่มผู้ใช้งาน">{groups.map(([id, label]) => <button className={`user-tab ${activeGroup === id ? 'user-tab-active' : ''}`} key={id} id={`user-tab-${id}`} type="button" role="tab" aria-selected={activeGroup === id} aria-controls="user-accounts-panel" onClick={() => setUserGroup(id)}>{label}<span>{tenants.filter((tenant) => tenant.role === id).length}</span></button>)}</div><section className="panel table-panel" id="user-accounts-panel" role="tabpanel" aria-labelledby={`user-tab-${activeGroup}`}><div className="panel-toolbar">{groups.find(([id]) => id === activeGroup)?.[1]} <strong>{rows.length}</strong></div><div className="table-scroll"><table><thead><tr><th>ชื่อผู้ใช้งาน</th><th>บทบาท</th><th>เบอร์โทรศัพท์</th><th>หมายเลขแผง</th><th>สถานะสัญญา</th><th>ยอดค้างชำระ</th><th>ข้อมูล</th></tr></thead><tbody>{rows.map(([name, roleLabel, phone, stall, status, due, email]) => <tr key={phone}><td className="cell-name">{name}</td><td>{roleLabel}</td><td>{phone}</td><td>{stall}</td><td>{status}</td><td className={due !== money(0) ? 'warning-text' : ''}>{due}</td><td><button className="icon-button small-icon" aria-label={`ดูข้อมูล ${name}`} onClick={() => setToast(`ข้อมูลผู้ใช้: ${name} · ${phone}${email ? ` · ${email}` : ''}`)}><ChevronRight size={16} /></button></td></tr>)}</tbody></table>{rows.length === 0 && <div className="empty-state">ไม่พบบัญชีในกลุ่มนี้</div>}</div></section></>
  }

  function reportsPage() {
    const paidRows = reportRows.filter((item) => item.status === 'ชำระแล้ว')
    const pendingRows = reportRows.filter((item) => item.status === 'รอตรวจสอบ')
    const overdueRows = reportRows.filter((item) => item.status === 'ค้างชำระ')
    const sum = (rows) => rows.reduce((total, item) => total + Number(item.amount || 0), 0)
    const total = sum(reportRows)
    return <><PageIntro eyebrow="สรุปทางบัญชี" title="รายงานรายรับ" subtitle="ดูรายรับตามรายการที่บันทึกในระบบ" action={<div className="report-actions"><button className="button-secondary" onClick={() => window.print()}><Printer size={16} />ส่งออก PDF</button><button className="button-primary" onClick={() => exportExcel(reportRows)}><FileSpreadsheet size={16} />ส่งออก Excel</button></div>} /><section className="report-filters panel"><label>ช่วงเวลา<select value={period} onChange={(event) => setPeriod(event.target.value)}><option>เดือนนี้</option><option>สัปดาห์นี้</option><option>เดือนก่อน</option></select></label><label>ตั้งแต่<input type="date" value={reportStart} onChange={(event) => setReportStart(event.target.value)} /></label><label>ถึง<input type="date" value={reportEnd} onChange={(event) => setReportEnd(event.target.value)} /></label><button className="button-secondary" onClick={() => setAppliedReportRange({ from: reportStart, to: reportEnd })}><CalendarDays size={15} />แสดงรายงาน</button></section><div className="report-kpis"><ReportStat label="ยอดรายการทั้งหมด" amount={money(total)} note={`${reportRows.length} รายการ`} /><ReportStat label="รับชำระแล้ว" amount={money(sum(paidRows))} note={`${paidRows.length} รายการ`} /><ReportStat label="รอตรวจสอบ" amount={money(sum(pendingRows))} note={`${pendingRows.length} รายการ`} /><ReportStat label="ค้างชำระ" amount={money(sum(overdueRows))} note={`${overdueRows.length} รายการ`} /></div><section className="panel table-panel"><div className="panel-heading"><div><span className="eyebrow">รายละเอียดรายการ</span><h3>รับชำระล่าสุด</h3></div><button className="button-secondary compact-button" onClick={() => downloadJson('ข้อมูลตลาด.json', { payments: reportRows, stalls, leases })}><Download size={15} />ส่งออก JSON</button></div><PaymentTable payments={reportRows} role={role} onVerify={verify} /></section></>
  }

  function profilePage() {
    const initials = currentUser?.fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('') ?? 'ผ'
    return <><PageIntro eyebrow="บัญชีผู้ใช้งาน" title="ข้อมูลส่วนตัว" subtitle="ตรวจสอบและแก้ไขข้อมูลติดต่อของคุณ" /><section className="panel profile-panel"><span className="profile-large-avatar">{initials}</span><div className="profile-heading"><h3>{currentUser?.fullName}</h3><span>ผู้เช่า · สมาชิกระบบตลาด</span></div><button className="button-secondary" onClick={() => setModal('profile')}><UserRound size={16} />แก้ไขข้อมูล</button><div className="profile-details"><div><Smartphone size={17} /><span>หมายเลขโทรศัพท์</span><strong>{currentUser?.phone}</strong></div><div><Mail size={17} /><span>อีเมล</span><strong>{currentUser?.email || 'ยังไม่ได้ระบุ'}</strong></div><div><MapPin size={17} /><span>พื้นที่เช่า</span><strong>{stalls.find((item) => item.tenant === currentUser?.fullName)?.number ?? 'ยังไม่มีพื้นที่เช่า'}</strong></div></div><button className="button-secondary" onClick={() => setModal('password')}><ShieldCheck size={16} />เปลี่ยนรหัสผ่าน</button></section></>
  }

  const content = page === 'overview' ? dashboard() : page === 'stalls' ? stallsPage() : page === 'leases' ? leasesPage() : page === 'payments' ? paymentsPage() : page === 'tenants' ? tenantsPage() : page === 'reports' ? reportsPage() : profilePage()

  if (authView) return <AuthScreen key={authView} view={authView} onChangeView={setAuthView} onLogin={(user) => { setCurrentUser(user); setRole(user.role); setPage('overview'); setAuthView(''); setToast('เข้าสู่ระบบสำเร็จ') }} />

  return <div className="app-shell"><aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
    <div className="brand"><span className="brand-mark"><Store size={20} /></span><span className="brand-name">ตลาดให้เช่า<small>MARKET OFFICE</small></span><button className="mobile-close" aria-label="ปิดเมนู" onClick={() => setMenuOpen(false)}><X size={19} /></button></div>
    <div className="market-select"><span className="market-icon"><Building2 size={16} /></span><span><strong>ตลาดให้เช่า</strong><small>ตลาดหลัก · กรุงเทพฯ</small></span><ChevronDown size={14} /></div>
    <div className="nav-caption">เมนูหลัก</div><nav className="side-nav" aria-label="เมนูหลัก">{navigation.map(([id, label, Icon, badge]) => <button className={`nav-item ${page === id ? 'nav-active' : ''}`} key={id} onClick={() => { setPage(id); setSearch(''); setMenuOpen(false) }}><Icon size={18} /><span>{label}</span>{badge && <b className="nav-badge">{badge}</b>}</button>)}</nav>
    <div className="sidebar-bottom"><div className="api-status"><i /><span><strong>ระบบพร้อมใช้งาน</strong><small>บัญชีผู้ใช้จัดเก็บใน JSON</small></span></div><button className="nav-item" onClick={() => setToast('ตั้งค่าระบบ')}><Settings size={18} /><span>ตั้งค่าระบบ</span></button><button className="nav-item" onClick={() => setToast('ศูนย์ช่วยเหลือตลาดให้เช่า')}><CircleAlert size={18} /><span>ช่วยเหลือ</span></button><div className="sidebar-user"><span className="user-avatar">{activeRole.initials}</span><span><strong>{activeRole.name}</strong><small>{activeRole.label}</small></span><button aria-label="ออกจากระบบ" onClick={() => { setToast(''); logout() }}><LogOut size={17} /></button></div></div>
  </aside>{menuOpen && <button className="mobile-scrim" aria-label="ปิดเมนู" onClick={() => setMenuOpen(false)} />}
  <main className="main-area"><header className="topbar"><div className="topbar-title"><button className="mobile-menu" aria-label="เปิดเมนู" onClick={() => setMenuOpen(true)}><Menu size={21} /></button><span>ตลาดให้เช่า</span><ChevronRight size={13} /><strong>{title}</strong></div><div className="topbar-actions"><label className="global-search"><Search size={16} /><input aria-label="ค้นหา" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาผู้เช่า, แผง..." /><kbd>⌘ K</kbd></label><button className="top-icon" aria-label="การแจ้งเตือน" onClick={() => setToast('ไม่มีการแจ้งเตือนใหม่')}><Bell size={18} /><i /></button><span className="top-divider" /><label className="role-select-label"><span className="role-avatar">{activeRole.initials}</span><select aria-label="เลือกบทบาทผู้ใช้งาน" value={role} onChange={(event) => changeRole(event.target.value)}><option value="owner">ผู้บริหาร / เจ้าของ</option><option value="staff">เจ้าหน้าที่ตลาด</option><option value="tenant">ผู้เช่า</option></select><ChevronDown size={14} /></label></div></header>
    <div className="content-wrap"><div className="content-head"><div className="mobile-page-title"><h1>{title}</h1><p>ตลาดสด</p></div><div className="breadcrumb"><span>จัดการตลาด</span><ChevronRight size={13} /><strong>{title}</strong></div></div>{content}<footer className="app-footer"><span>© 2567 ตลาดให้เช่า</span><span><Activity size={13} />ระบบบริหารจัดการตลาด <b>v1.0</b></span></footer></div>
  </main>{modal && <Dialog type={modal} user={currentUser} onClose={() => setModal('')} onSubmit={submitForm} stalls={stalls} onForgot={() => { setModal(''); setAuthView('forgot') }} />} {toast && <div className="toast"><Check size={16} />{toast}<button aria-label="ปิดข้อความ" onClick={() => setToast('')}><X size={15} /></button></div>}</div>
}

function AuthScreen({ view, onChangeView, onLogin }) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const register = view === 'register'
  const recovery = view === 'forgot'

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    const values = new FormData(event.currentTarget)
    const phone = String(values.get('phone') ?? '').trim()
    if (!/^0[0-9]{9}$/.test(phone)) {
      setError('กรุณากรอกหมายเลขโทรศัพท์มือถือ 10 หลัก')
      return
    }
    if (recovery) {
      setSuccess('การตั้งรหัสผ่านใหม่ยังไม่เปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ')
      return
    }
    const password = String(values.get('password') ?? '')
    if (password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
      return
    }
    if (register) {
      if (password !== values.get('confirmPassword')) {
        setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน')
        return
      }
    }
    setSubmitting(true)
    try {
      const response = await fetch(`/api/auth/${register ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, ...(register ? { fullName: values.get('fullName') } : {}) }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'ไม่สามารถยืนยันตัวตนได้')
      onLogin(result.user)
    } catch (requestError) {
      setError(requestError.message || 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  const heading = register ? 'สร้างบัญชีผู้เช่า' : recovery ? 'ตั้งรหัสผ่านใหม่' : 'ยินดีต้อนรับ'
  const description = register ? 'กรอกข้อมูลเพื่อสมัครสมาชิกตลาดให้เช่า' : recovery ? 'ระบุหมายเลขโทรศัพท์ที่ใช้สมัครสมาชิก' : 'เข้าสู่ระบบเพื่อจัดการพื้นที่เช่าและค่าเช่า'

  return <main className="auth-screen">
    <section className="auth-story"><a className="auth-brand" href="#login" onClick={(event) => event.preventDefault()}><span className="brand-mark"><Store size={20} /></span><span>ตลาดให้เช่า<small>MARKET OFFICE</small></span></a><div className="auth-story-copy"><span className="eyebrow">ตลาดให้เช่า</span><h1>จัดการพื้นที่เช่า<br />ได้ในที่เดียว</h1><p>ข้อมูลแผง สัญญา และค่าเช่าของคุณ พร้อมใช้งานทุกวัน</p><div className="auth-story-meta"><span><Store size={15} />จัดการแผงเช่า</span><span><Receipt size={15} />ติดตามค่าเช่า</span></div></div><div className="auth-story-footer">ระบบบริหารจัดการตลาด · 2567</div></section>
    <section className="auth-content"><div className="auth-card"><div className="auth-mobile-brand"><span className="brand-mark"><Store size={19} /></span><strong>ตลาดให้เช่า</strong></div><span className="auth-step">{register ? 'สมัครสมาชิก' : recovery ? 'บัญชีผู้ใช้งาน' : 'บัญชีผู้เช่า'}</span><h2>{heading}</h2><p className="auth-description">{description}</p>
      {success ? <div className="auth-success"><CheckCircle2 size={21} /><p>{success}</p><button className="button-primary auth-submit" onClick={() => onChangeView('login')}>กลับไปเข้าสู่ระบบ <ArrowRight size={16} /></button></div> : <form className="auth-form" onSubmit={submit}>
        {register && <label className="auth-field">ชื่อ-นามสกุล<div className="auth-input"><UserRound size={17} /><input name="fullName" autoComplete="name" placeholder="ชื่อและนามสกุล" required /></div></label>}
        <label className="auth-field">หมายเลขโทรศัพท์มือถือ<div className="auth-input"><Phone size={17} /><input name="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="08X-XXX-XXXX" pattern="0[0-9]{9}" maxLength={10} title="กรอกหมายเลขโทรศัพท์ 10 หลักที่ขึ้นต้นด้วย 0" required /></div></label>
        {!recovery && <><label className="auth-field">รหัสผ่าน<div className="auth-input"><LockKeyhole size={17} /><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} minLength={8} placeholder="อย่างน้อย 8 ตัวอักษร" required /><button type="button" className="password-toggle" aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
          {register && <label className="auth-field">ยืนยันรหัสผ่าน<div className="auth-input"><KeyRound size={17} /><input name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} placeholder="กรอกรหัสผ่านอีกครั้ง" required /></div></label>}
        </>}
        {!recovery && !register && <button type="button" className="auth-forgot" onClick={() => onChangeView('forgot')}>ลืมรหัสผ่าน?</button>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="button-primary auth-submit" type="submit" disabled={submitting}>{submitting ? 'กำลังตรวจสอบ...' : register ? 'สมัครสมาชิก' : recovery ? 'ส่งคำขอรีเซ็ตรหัสผ่าน' : 'เข้าสู่ระบบ'} {!submitting && <ArrowRight size={16} />}</button>
      </form>}
      <div className="auth-switch">{recovery ? <>จำรหัสผ่านได้แล้ว? <button onClick={() => onChangeView('login')}>กลับไปเข้าสู่ระบบ</button></> : register ? <>มีบัญชีอยู่แล้ว? <button onClick={() => onChangeView('login')}>เข้าสู่ระบบ</button></> : <>ยังไม่มีบัญชี? <button onClick={() => onChangeView('register')}>สมัครสมาชิก</button></>}</div>
      <div className="auth-demo-note"><CircleAlert size={14} />บัญชีผู้ใช้และรหัสผ่านแบบเข้ารหัสจะบันทึกใน data/users.json บนเครื่องนี้</div>
    </div></section>
  </main>
}

function PageIntro({ eyebrow, title, subtitle, action }) {
  return <div className="page-intro"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>
}

function Expiry({ name, detail, date, days, initials }) {
  return <div className="expiry-item"><span className="expiry-avatar">{initials}</span><span className="expiry-info"><strong>{name}</strong><small>{detail}</small></span><span className="expiry-date"><strong>{date}</strong><small>{days}</small></span></div>
}

function Summary({ icon: Icon, tone, label, value }) {
  return <div><span className={`summary-icon ${tone}`}><Icon size={17} /></span><span>{label}</span><strong>{value}</strong></div>
}

function ReportStat({ label, amount, note }) {
  return <article className="panel"><span>{label}</span><strong>{amount}</strong><small>{note}</small></article>
}

function PaymentTable({ payments, role, onVerify, compact = false }) {
  const manager = role !== 'tenant'
  return <div className={`table-scroll ${compact ? 'compact-scroll' : ''}`}><table><thead><tr><th>รายการ</th><th>ผู้เช่า / แผง</th><th>วันที่</th><th>จำนวนเงิน</th><th>สถานะ</th>{manager && <th>จัดการ</th>}</tr></thead><tbody>{payments.map((item) => <tr key={item.id}><td><span className="cell-id">{item.id}</span><small className="table-subtitle">{item.detail}</small></td><td><span className="cell-name">{item.tenant}</span><small className="table-subtitle">แผง {item.stall}</small></td><td>{item.date}</td><td className="amount-cell">{money(item.amount)}</td><td><Status value={item.status} /></td>{manager && <td>{item.status === 'รอตรวจสอบ' ? <button className="review-button" onClick={() => onVerify(item.id)}><ShieldCheck size={14} />ตรวจสอบ</button> : <button className="icon-button small-icon" aria-label={`ดูรายการ ${item.id}`}><ChevronRight size={16} /></button>}</td>}</tr>)}</tbody></table>{payments.length === 0 && <div className="empty-state">ไม่พบรายการที่ตรงกับการค้นหา</div>}</div>
}

function Dialog({ type, user, onClose, onSubmit, stalls, onForgot }) {
  const title = type === 'payment' ? 'ส่งหลักฐานการชำระเงิน' : type === 'stall' ? 'เพิ่มพื้นที่ / แผง' : type === 'lease' ? 'สร้างสัญญาเช่า' : type === 'password' ? 'เปลี่ยนรหัสผ่าน' : type === 'user' ? 'เพิ่มผู้ใช้งาน' : 'แก้ไขข้อมูลส่วนตัว'
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="modal-head"><div><span className="eyebrow">ตลาดให้เช่า</span><h2 id="dialog-title">{title}</h2></div><button className="icon-button" aria-label="ปิด" onClick={onClose}><X size={19} /></button></div><form onSubmit={onSubmit}>
    {type === 'payment' && <><div className="modal-note"><CircleDollarSign size={19} /><span><small>ค่าเช่ารายสัปดาห์ · แผง A-12</small><strong>ยอดที่ต้องชำระ ฿1,200</strong></span></div><label className="field-label">จำนวนเงิน<input name="amount" type="number" min="1" defaultValue="1200" required /></label><label className="field-label">หลักฐานการโอน<div className="upload-field"><Upload size={18} /><span>เลือกรูปภาพหรือ PDF</span><small>PNG, JPG หรือ PDF · ไม่เกิน 10 MB</small><input name="proof" type="file" accept="image/*,.pdf" required /></div></label><p className="form-footnote">ระบบจะเปลี่ยนสถานะเป็น “รอตรวจสอบ” หลังส่งหลักฐาน</p></>}
    {type === 'stall' && <><label className="field-label">หมายเลขแผง<input name="number" placeholder="เช่น A-15" required /></label><label className="field-label">โซน<select name="zone"><option>โซนอาหาร</option><option>โซนของสด</option><option>โซนแฟชั่น</option><option>โซนทั่วไป</option></select></label><div className="field-row"><label className="field-label">รูปแบบค่าเช่า<select name="period"><option>รายวัน</option><option>รายสัปดาห์</option><option>รายเดือน</option></select></label><label className="field-label">อัตราค่าเช่า<input name="rate" type="number" min="0" placeholder="เช่น 350" required /></label></div></>}
    {type === 'lease' && <><label className="field-label">ชื่อผู้เช่า<input name="tenant" placeholder="ชื่อ-นามสกุล" required /></label><div className="field-row"><label className="field-label">หมายเลขแผง<select name="stall" required>{stalls.filter((item) => item.status === 'ว่าง').map((item) => <option key={item.number}>{item.number}</option>)}{stalls.every((item) => item.status !== 'ว่าง') && <option>A-15</option>}</select></label><label className="field-label">รูปแบบค่าเช่า<select name="period"><option>รายวัน</option><option>รายสัปดาห์</option><option>รายเดือน</option></select></label></div><label className="field-label">อัตราค่าเช่า<input name="rate" type="number" min="0" required /></label><div className="field-row"><label className="field-label">วันเริ่มต้น<input name="start" type="date" required /></label><label className="field-label">วันสิ้นสุด<input name="end" type="date" required /></label></div></>}
    {type === 'profile' && <><label className="field-label">ชื่อ-นามสกุล<input name="name" defaultValue={user?.fullName ?? ''} required /></label><label className="field-label">หมายเลขโทรศัพท์<input name="phone" type="tel" defaultValue={user?.phone ?? ''} pattern="0[0-9]{9}" maxLength={10} required /></label><label className="field-label">อีเมล<input name="email" type="email" defaultValue={user?.email ?? ''} /></label></>}
    {type === 'password' && <><label className="field-label">รหัสผ่านปัจจุบัน<input name="currentPassword" type="password" autoComplete="current-password" required /></label><label className="field-label">รหัสผ่านใหม่<input name="newPassword" type="password" autoComplete="new-password" minLength={8} required /></label><label className="field-label">ยืนยันรหัสผ่านใหม่<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></label></>}
    {type === 'user' && <><label className="field-label">ชื่อ-นามสกุล<input name="fullName" autoComplete="name" required /></label><label className="field-label">บทบาท<select name="role" defaultValue="tenant" required><option value="tenant">ผู้เช่า</option><option value="staff">เจ้าหน้าที่ตลาด</option></select></label><label className="field-label">หมายเลขโทรศัพท์มือถือ<input name="phone" type="tel" inputMode="numeric" pattern="0[0-9]{9}" maxLength={10} required /></label><label className="field-label">รหัสผ่านเริ่มต้น<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label></>}
    <div className="modal-actions"><button type="button" className="button-secondary" onClick={onClose}>ยกเลิก</button><button className="button-primary" type="submit">{type === 'payment' ? <Upload size={16} /> : <Check size={16} />}{type === 'payment' ? 'ส่งหลักฐาน' : 'บันทึกข้อมูล'}</button></div></form></section></div>
}

export default App