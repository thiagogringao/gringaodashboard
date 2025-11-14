import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.logoContainer}>
          <svg
            className={styles.logo}
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
          <h1 className={styles.title}>Catálogo de Produtos</h1>
          <p className={styles.subtitle}>Joalheria</p>
        </div>

        <div className={styles.cards}>
          <Link to="/ecommerce" className={styles.card}>
            <div className={styles.cardIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className={styles.cardTitle}>E-commerce</h2>
            <p className={styles.cardDescription}>
              Visualize o catálogo completo da loja online com preços e margens
            </p>
          </Link>

          <Link to="/loja-fisica" className={styles.card}>
            <div className={styles.cardIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className={styles.cardTitle}>Loja Física</h2>
            <p className={styles.cardDescription}>
              Acesse o inventário da loja física com códigos e estoque
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
