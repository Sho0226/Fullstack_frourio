import type { Prisma } from '@prisma/client';
import type { UserEntity } from '../model/userType';

export const userCommand = {
  save: async (tx: Prisma.TransactionClient, user: UserEntity): Promise<void> => {
    //tx: Prisma.TransactionClient - トランザクションクライアントオブジェクトです。
    //これにより、トランザクション内でのデータベース操作が可能
    await tx.user.upsert({
      //upsert メソッドは、指定した条件（ここでは id）でデータベースにレコードが存在するかどうかをチェックし、
      //存在すれば更新、存在しなければ新規作成
      where: { id: user.id },
      update: { email: user.email, signInName: user.signInName },
      create: {
        id: user.id,
        email: user.email,
        signInName: user.signInName,
        createdAt: new Date(user.createdTime),
      },
    });
  },
};
