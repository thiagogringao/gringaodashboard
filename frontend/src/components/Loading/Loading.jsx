import styles from './Loading.module.css';

const Loading = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>Carregando produtos...</p>
    </div>
  );
};

export default Loading;
