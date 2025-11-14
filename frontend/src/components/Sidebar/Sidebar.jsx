import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { isAdmin } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    {
      path: '/',
      label: 'Home',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: '/ecommerce',
      label: 'E-commerce',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      path: '/loja-fisica',
      label: 'Loja Física',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      path: '/picos-queda',
      label: 'Picos de Vendas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-6 4 4 4-8 4 10M4 19h16" />
        </svg>
      )
    },
    {
      path: '/sugestao-compras',
      label: 'Sugestão de Compras',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M9 7h6m-9 4h9m-9 4h6m-9 4h9" />
        </svg>
      )
    }
  ];

  // Menu admin (apenas para administradores)
  const adminMenuItems = [
    {
      path: '/usuarios',
      label: 'Usuários',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Botão toggle mobile */}
      <button
        className={`${styles.toggleButton} ${isOpen ? styles.toggleButtonOpen : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg
              className={styles.logoIcon}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className={styles.logoText}>Joalheria</h1>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <h2 className={styles.navTitle}>Menu Principal</h2>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Menu Admin (apenas para administradores) */}
          {isAdmin() && (
            <div className={styles.navSection}>
              <h2 className={styles.navTitle}>Administração</h2>
              {adminMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                  onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              ))}
            </div>
          )}

          <div className={styles.navSection}>
            <h2 className={styles.navTitle}>Informações</h2>
            <div className={styles.infoCard}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Total Produtos:</span>
                <span className={styles.infoValue}>2.347+</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Bancos Ativos:</span>
                <span className={styles.infoValue}>2</span>
              </div>
            </div>
          </div>
        </nav>

        <div className={styles.footer}>
          <UserInfo />
          <p className={styles.footerText}>Catálogo de Produtos</p>
          <p className={styles.footerVersion}>v1.0.0</p>
        </div>
      </aside>
    </>
  );
};

// Componente de informações do usuário
const UserInfo = () => {
  const { user, logout } = useAuth();

  return (
    <div className={styles.userInfo}>
      <div className={styles.userAvatar}>
        {user?.nome?.charAt(0).toUpperCase()}
      </div>
      <div className={styles.userDetails}>
        <p className={styles.userName}>{user?.nome}</p>
        <p className={styles.userEmail}>{user?.email}</p>
      </div>
      <button
        onClick={logout}
        className={styles.logoutButton}
        title="Sair"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
};

export default Sidebar;
