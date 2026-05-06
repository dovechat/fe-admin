import { NavLink, useNavigate, Outlet } from 'react-router-dom'


const NAV = [
  { to: '/',          label: 'Dashboard',  icon: '▪' },
  { to: '/users',     label: 'Users',      icon: '▪' },
  { to: '/lines',     label: 'Lines',      icon: '▪' },
  { to: '/instances', label: 'Instances',  icon: '▪' },
  { to: '/billing',   label: 'Billing',    icon: '▪' },
  { to: '/audit',     label: 'Audit Log',  icon: '▪' },
  { to: '/tariffs',   label: 'Тарифы',     icon: '▪' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_refresh_token')
    navigate('/login')
  }

  return (
    /* ── App shell ── */
    <div style={{ display: 'flex', height: '100%' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 'var(--sidebar-w)',
        minWidth: 'var(--sidebar-w)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
      }}>

        {/* ── Logo ── */}
        <div style={{
          padding: '0 20px 20px',
          borderBottom: '1px solid var(--border)',
          marginBottom: 12,
        }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}>
            DoveChat
          </div>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text)',
            marginTop: 2,
          }}>
            Admin
          </div>
        </div>
        {/* ── /Logo ── */}

        {/* ── Nav ── */}
        <nav style={{ flex: 1, padding: '0 8px' }}>
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'block',
                padding: '8px 12px',
                borderRadius: 6,
                fontFamily: 'var(--mono)',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                background: isActive ? 'rgba(79,142,247,.1)' : 'transparent',
                textDecoration: 'none',
                marginBottom: 2,
                transition: 'background .12s, color .12s',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        {/* ── /Nav ── */}

        {/* ── Logout ── */}
        <div style={{ padding: '12px 8px 0', borderTop: '1px solid var(--border)' }}>
          <button
            className="btn btn-sm"
            onClick={handleLogout}
            style={{ width: '100%', justifyContent: 'center', color: 'var(--text2)' }}
          >
            Выйти
          </button>
        </div>
        {/* ── /Logout ── */}

      </aside>
      {/* ── /Sidebar ── */}

      {/* ── Main content ── */}
      <main style={{
        flex: 1,
        overflow: 'auto',
        padding: '28px 32px',
        background: 'var(--bg)',
      }}>
        <Outlet /> 
      </main>
      {/* ── /Main content ── */}

    </div>
    /* ── /App shell ── */
  )
}