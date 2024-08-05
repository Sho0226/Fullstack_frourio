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
    status: 200, //HTTPステータスコード200（成功）を返します。
    body: {
      //レスポンスの本文として以下の情報を含むオブジェクト
      server: 'ok', //サーバーの状態が正常であることを示します
      db: await prismaClient.$queryRaw`SELECT CURRENT_TIMESTAMP;`
        .then(() => 'ok' as const)
        .catch(throwCustomError('DB')),
      //Prismaクライアントを使ってデータベースに対してクエリを実行し、正常であれば 'ok' を返し、エラーが発生した場合はカスタムエラーをスロー
      s3: await s3
        .health()
        .then(() => 'ok' as const)
        .catch(throwCustomError('S3')),
      // S3クライアントのヘルスチェックを行い、正常であれば 'ok' を返し、エラーが発生した場合はカスタムエラーをスローします。
    },
  }),
}));
