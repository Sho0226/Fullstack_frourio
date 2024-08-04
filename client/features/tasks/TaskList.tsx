import useAspidaSWR from '@aspida/swr'; // aspidaとSWRを使用してデータフェッチを簡単にするフックをインポート
import type { TaskDto } from 'common/types/task'; // タスクのデータ型を定義
import { labelValidator } from 'common/validators/task'; // タスクのラベルを検証するためのバリデータをインポート
import { Loading } from 'components/loading/Loading'; // ローディングコンポーネントをインポート
import { usePickedLastMsg } from 'features/ws/AuthedWebSocket'; // WebSocketからの最新メッセージを取得するフックをインポート
import { useAlert } from 'hooks/useAlert'; // アラートを表示するためのカスタムフックをインポート
import type { FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiClient } from 'utils/apiClient'; // APIクライアントをインポート
import { catchApiErr } from 'utils/catchApiErr'; // APIエラーを処理するユーティリティをインポート
import styles from './taskList.module.css'; // スタイルをインポート

// タスクを作成する関数
export const TaskList = () => {
  const { setAlert } = useAlert(); // アラート表示を管理するためのフック
  const { data: tasks, mutate: mutateTasks } = useAspidaSWR(apiClient.private.tasks); // タスクデータをフェッチするためのフック
  const { lastMsg } = usePickedLastMsg(['taskCreated', 'taskUpdated', 'taskDeleted']); // 特定のタイプのWebSocketメッセージを取得するフック
  const fileRef = useRef<HTMLInputElement | null>(null); // ファイル入力の参照を管理するためのフック
  const [label, setLabel] = useState(''); // タスクのラベルの状態を管理
  const [image, setImage] = useState<File>(); // タスクの画像の状態を管理
  const previewImageUrl = useMemo(() => image && URL.createObjectURL(image), [image]); // 画像のプレビューURLを生成

  const createTask = async (e: FormEvent) => {
    e.preventDefault(); // フォームのデフォルトの送信動作を防止

    const parsedLabel = labelValidator.safeParse(label); // ラベルの検証を実行

    if (parsedLabel.error) {
      // 検証に失敗した場合
      await setAlert(parsedLabel.error.issues[0].message); // アラートを設定
      return;
    }
    // APIを使用してタスクを作成し、タスクリストを更新
    await apiClient.private.tasks
      .$post({ body: { label: parsedLabel.data, image } })
      .then((task) => mutateTasks((tasks) => [task, ...(tasks ?? [])]))
      .catch(catchApiErr);
    setLabel(''); // ラベルの状態をリセット
    setImage(undefined); // 画像の状態をリセット

    if (fileRef.current) fileRef.current.value = ''; // ファイル入力の値をリセット
  };
  // タスクの完了状態を切り替える関数
  const toggleDone = async (task: TaskDto) => {
    await apiClient.private.tasks
      ._taskId(task.id)
      .$patch({ body: { done: !task.done } })
      .then((task) => mutateTasks((tasks) => tasks?.map((t) => (t.id === task.id ? task : t))))
      .catch(catchApiErr);
  };
  // タスクを削除する関数
  const deleteTask = async (task: TaskDto) => {
    await apiClient.private.tasks
      ._taskId(task.id)
      .$delete()
      .then((task) => mutateTasks((tasks) => tasks?.filter((t) => t.id !== task.id)))
      .catch(catchApiErr);
  };
  // WebSocketからの最新メッセージを処理
  useEffect(() => {
    if (lastMsg === undefined) return;

    switch (lastMsg.type) {
      case 'taskCreated':
        mutateTasks(
          (tasks) => [lastMsg.task, ...(tasks?.filter((t) => t.id !== lastMsg.task.id) ?? [])],
          { revalidate: false },
        );
        return;
      case 'taskUpdated':
        mutateTasks((tasks) => tasks?.map((t) => (t.id === lastMsg.task.id ? lastMsg.task : t)), {
          revalidate: false,
        });
        return;
      case 'taskDeleted':
        mutateTasks((tasks) => tasks?.filter((t) => t.id !== lastMsg.taskId), {
          revalidate: false,
        });
        return;
      /* v8 ignore next 2 */
      default:
        throw new Error(lastMsg satisfies never);
    }
  }, [lastMsg]);
  // 画像のプレビューURLをクリーンアップ
  useEffect(() => {
    if (!previewImageUrl) return;

    return () => URL.revokeObjectURL(previewImageUrl);
  }, [previewImageUrl]);
  // タスクがロードされていない場合、ローディングコンポーネントを表示
  if (!tasks) return <Loading visible />;

  return (
    <div className={styles.main}>
      <div className={styles.card}>
        {previewImageUrl && <img src={previewImageUrl} className={styles.taskImage} />}
        <form className={styles.form} onSubmit={createTask}>
          <input
            value={label}
            className={styles.textInput}
            type="text"
            placeholder="Todo task"
            onChange={(e) => setLabel(e.target.value)}
          />
          <div className={styles.controls}>
            <input
              type="file"
              ref={fileRef}
              accept=".png,.jpg,.jpeg,.gif,.webp,.svg"
              onChange={(e) => setImage(e.target.files?.[0])}
            />
            <input className={styles.btn} disabled={label === ''} type="submit" value="ADD" />
          </div>
        </form>
      </div>
      {tasks.map((task) => (
        <div key={task.id} className={styles.card}>
          {task.image && <img src={task.image.url} alt={task.label} className={styles.taskImage} />}
          <div className={styles.form}>
            <div className={styles.controls}>
              <input type="checkbox" checked={task.done} onChange={() => toggleDone(task)} />
              <span>{task.label}</span>
              <input
                type="button"
                value="DELETE"
                className={styles.btn}
                onClick={() => deleteTask(task)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
