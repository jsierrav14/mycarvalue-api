import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    jest.setTimeout(60000);

    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('Can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('Create a new user with salted and hashed password', async () => {
    const user = await service.signup('jws@www.com', 'werr');
    expect(user.password).not.toEqual('werr');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('Throws an error if user signs up with email that is in use', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'a', password: 'w' } as User]);
    await expect(service.signup('asd@asd.com', 'asdf')).rejects.toThrow();
  });

  it('Throws if signin is called with an unused email', async () => {
    await expect(service.signin('asdmds', 'asdf')).rejects.toThrow();
  });

  it('Throws if an invalid password is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        { id: 1, email: 'jesv@gmail.com', password: 'wwewe' } as User,
      ]);

    await expect(
      service.signin('jesv@gmail.com', 'password'),
    ).rejects.toThrow();
  });

  it('Return an user if a correct password is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        {
          id: 1,
          email: 'jesv@gmail.com',
          password:
            '10fa25e9f1d6df99.423be366e95c0e4fa4cba9b7bce2f4a7176c05fe6b2faa6fc9f10120530a67d5',
        } as User,
      ]);
    const user = await service.signin('jesv@gmail.com', 'password');
    expect(user).toBeDefined();
  });
});
