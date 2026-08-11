import Image from 'next/image';
import styles from './Loader.module.css';

const Loader = ({ fullScreen = false }) => {
  return (
    <div className={`${styles.loaderContainer} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.rippleWrapper}>
        <div className={styles.ripple}></div>
        <div className={styles.ripple}></div>
        <div className={styles.ripple}></div>
        <div className={styles.logoContainer}>
          <Image
            src="/faa_logo.png"
            alt="Faa Nuts & Dates"
            width={70}
            height={70}
            className={styles.logo}
          />
        </div>
      </div>
    </div>
  );
};

export default Loader;
