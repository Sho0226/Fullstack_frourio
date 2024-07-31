import type { UserDto } from 'common/types/user'; //ユーザーのデータ型を定義
import { Loading } from 'components/loading/Loading'; //ローディングコンポーネントをインポート
import { useLoading } from 'components/loading/useLoading';
import { AuthedWebSocket } from 'features/ws/AuthedWebSocket';
import { useAlert } from 'hooks/useAlert'; //ローディング、アラート、確認ダイアログを管理するカスタムフックをインポート
import { useConfirm } from 'hooks/useConfirm'; //認証されたWebSocket接続を管理するコンポーネント
import { useUser } from 'hooks/useUser'; //ユーザー情報を管理するカスタムフック
import { BasicHeader } from 'layouts/basicHeader/BasicHeader'; //基本的なヘッダーコンポーネント
import { useRouter } from 'next/router'; //ルーターを使用するためのフック
import React from 'react';
import { pagesPath } from 'utils/$path'; //ページパスのユーティリティ

export const Layout = (props: { render: (user: UserDto) => React.ReactNode }) => {
  const router = useRouter();
  const { user } = useUser();
  const { loadingElm } = useLoading();
  const { alertElm } = useAlert();
  const { confirmElm } = useConfirm();

  if (!user.inited) {
    return <Loading visible />;
  } else if (user.data === null) {
    void router.replace(pagesPath.login.$url());

    return <Loading visible />;
  }

  return (
    <div>
      <AuthedWebSocket />
      <BasicHeader user={user.data} />
      {props.render(user.data)}
      {loadingElm}
      {alertElm}
      {confirmElm}
    </div>
  );
};
