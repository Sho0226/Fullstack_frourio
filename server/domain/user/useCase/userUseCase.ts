import type { UserDto } from 'common/types/user';
import { prismaClient, transaction } from 'service/prismaClient';
import type { JwtUser } from 'service/types';
import { userMethod } from '../model/userMethod';
import { userCommand } from '../repository/userCommand';
import { userQuery } from '../repository/userQuery';
import { toUserDto } from '../service/toUserDto';

export const userUseCase = {
  findOrCreateUser: (jwtUser: JwtUser): Promise<UserDto> =>
    //JWT 認証で取得されたユーザー情報を含むオブジェクト
    //ユーザー情報を含む UserDto 型の Promise
    transaction('RepeatableRead', async (tx) => {
      //トランザクションを開始
      //RepeatableRead はトランザクションの分離レベルを指定
      //tx: トランザクションのコンテキストオブジェクト
      const user = await userQuery.findById(prismaClient, jwtUser.sub).catch(() => null);
      //userQuery.findById を使ってデータベースからユーザーを検索します。見つからなかった場合は null を返します

      if (user !== null) return toUserDto(user);
      //ユーザーが存在する場合は、ユーザーオブジェクトを UserDto に変換して返します

      const newUser = userMethod.create(jwtUser);
      //userMethod.create を使って jwtUser から新しいユーザーオブジェクトを作成
      await userCommand.save(tx, newUser);
      //userCommand.save を使って、新しいユーザーをトランザクション内でデータベースに保存

      return toUserDto(newUser);
    }),
};
