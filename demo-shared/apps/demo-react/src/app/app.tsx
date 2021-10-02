import styles from './app.module.css';

export function App() {
  return (
    <div className={styles.app}>
      <demo-library-element title={"React"} />
    </div>
  );
}

export default App;
