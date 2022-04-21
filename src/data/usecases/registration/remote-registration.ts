import {HttpPostClient} from '@/data/protocols/http/http-post-client';
import {HttpStatusCode} from '@/data/protocols/http/http-response';
import {InvalidCredentialsError} from '@/domain/errors/InvalidCredentialsError';
import {UnexpectedError} from '@/domain/errors/UnexpectedError';
import {AccountModel} from '@/domain/models/account-model';
import {Registration, RegistrationParams} from '@/domain/usecases/registration';

export class RemoteRegistration implements Registration {
  constructor(
    private readonly url: string,
    private readonly httpClient: HttpPostClient<
      RegistrationParams,
      AccountModel
    >,
  ) {}
  async register(body: RegistrationParams): Promise<AccountModel | undefined> {
    const response = await this.httpClient.post({
      url: this.url,
      body,
    });

    switch (response.statusCode) {
      case HttpStatusCode.success:
        return response.body;
      case HttpStatusCode.unauthorized:
        throw new InvalidCredentialsError();
      default:
        throw new UnexpectedError();
    }
  }
}
