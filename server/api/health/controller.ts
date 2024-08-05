import { CustomError } from 'service/customAssert'; //カスタムエラーハンドリングを行うためのクラス。
import { prismaClient } from 'service/prismaClient'; //データベースとの接続を行うためのPrismaクライアント。
import { s3 } from 'service/s3Client'; //S3（Amazon Simple Storage Service）との接続を行うためのクライアント。
import { defineController } from './$relay'; //コントローラーを定義するための関数。

const throwCustomError = (label: string) => (e: Error) => {
  /* v8 ignore next 2 */
  throw new CustomError(`${label} ${e.message}`);
};

export default defineController(() => ({
  get: async () => ({
    status: 200,
    body: {
      server: 'ok',
      db: await prismaClient.$queryRaw`SELECT CURRENT_TIMESTAMP;`
        .then(() => 'ok' as const)
        .catch(throwCustomError('DB')),
      s3: await s3
        .health()
        .then(() => 'ok' as const)
        .catch(throwCustomError('S3')),
    },
  }),
}));
