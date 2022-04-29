import faker from '@faker-js/faker';
import {mockAccountModel, mockRegistration} from '@/domain/test';
import {HttpPostClientSpy} from '@/data/test';
import {HttpStatusCode} from '@/data/protocols/http';
import {UnexpectedError, EmailInUseError} from '@/domain/errors';
import {AccountModel} from '@/domain/models/account-model';
import {RemoteRegistration} from './remote-registration';

type SutTypes = {
  sut: RemoteRegistration;
  httpPostClient: HttpPostClientSpy<AccountModel>;
};

const makeSut = (url: string = faker.internet.url()): SutTypes => {
  const httpPostClient = new HttpPostClientSpy<AccountModel>();
  const sut = new RemoteRegistration(url, httpPostClient);
  return {
    sut,
    httpPostClient,
  };
};

describe('RemoteRegistration', () => {
  test('should call HHttpClient with correct url', async () => {
    const url = faker.internet.url();
    const {sut, httpPostClient} = makeSut(url);
    sut.execute(mockRegistration());
    expect(httpPostClient.url).toBe(url);
  });

  test('should call HHttpClient with correct body', async () => {
    const {sut, httpPostClient} = makeSut();
    const registrationParams = mockRegistration();
    sut.execute(registrationParams);
    expect(httpPostClient.body).toEqual(registrationParams);
  });

  test('should throw EmailInUseError if HttpPostClient returns 403', async () => {
    const {sut, httpPostClient} = makeSut();
    httpPostClient.response = {
      statusCode: HttpStatusCode.forbidden,
    };
    const promise = sut.execute(mockRegistration());
    expect(promise).rejects.toThrow(new EmailInUseError());
  });

  test('should throw UnexpectedError if HttpPostClient returns 400', async () => {
    const {sut, httpPostClient} = makeSut();
    httpPostClient.response = {
      statusCode: HttpStatusCode.badRequest,
    };
    const promise = sut.execute(mockRegistration());
    expect(promise).rejects.toThrow(new UnexpectedError());
  });

  test('should throw UnexpectedError if HttpPostClient returns 500', async () => {
    const {sut, httpPostClient} = makeSut();
    httpPostClient.response = {
      statusCode: HttpStatusCode.internalError,
    };
    const promise = sut.execute(mockRegistration());
    expect(promise).rejects.toThrow(new UnexpectedError());
  });

  test('should throw UnexpectedError if HttpPostClient returns 404', async () => {
    const {sut, httpPostClient} = makeSut();
    httpPostClient.response = {
      statusCode: HttpStatusCode.notFound,
    };
    const promise = sut.execute(mockRegistration());
    expect(promise).rejects.toThrow(new UnexpectedError());
  });

  test('should return an AccountModel if HttpPostClient returns 200', async () => {
    const {sut, httpPostClient} = makeSut();
    const httpResult = mockAccountModel();
    httpPostClient.response = {
      statusCode: HttpStatusCode.success,
      body: httpResult,
    };
    const account = await sut.execute(mockRegistration());
    expect(account).toEqual(httpResult);
  });
});
