import type { Prisma, User } from '@prisma/client';
import { brandedId } from 'service/brandedId';
import type { UserEntity } from '../model/userType';
//Prisma: Prisma クライアントの型定義です。
//User: Prisma クライアントが生成する User モデルの型定義です。
//brandedId: ブランディングされた ID を管理するサービスです。
//UserEntity: ドメインモデルとしての UserEntity の型定義です。

const toUserEntity = (prismaUser: User): UserEntity => ({
  //prismaUser - Prisma クライアントから取得した User オブジェクト
  id: brandedId.user.entity.parse(prismaUser.id),
  email: prismaUser.email,
  signInName: prismaUser.signInName,
  createdTime: prismaUser.createdAt.getTime(),
});

export const userQuery = {
  findById: (tx: Prisma.TransactionClient, id: string): Promise<UserEntity> =>
    tx.user.findUniqueOrThrow({ where: { id } }).then(toUserEntity),
  //Prisma クライアントの findUniqueOrThrow メソッドを使用して、
  //指定された ID のユーザーをデータベースから取得します。
  //ユーザーが見つからない場合は例外をスロー
};

//このコードは、Prisma クライアントを使用してデータベースからユーザー情報を取得し、
//それを UserEntity 型に変換する処理を提供します。findById メソッドはトランザクションを使用して特定のユーザーを検索し、
//見つかったユーザーを UserEntity に変換して返します。このようにすることで、データベースのモデルとアプリケーションの
//ドメインモデルを明確に分離し、コードの可読性と保守性を向上
