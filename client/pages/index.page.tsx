import { TaskList } from 'features/tasks/TaskList';
import styles from './index.module.css';

const Home = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Hello </div>
      <TaskList />
    </div>
  );
};

export default Home;
