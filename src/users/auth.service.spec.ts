import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';


describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    jest.setTimeout(60000);

    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
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
    await service.signup('asd@asd.com', 'asdf');
    await expect(service.signup('asd@asd.com', 'asdf')).rejects.toThrow(BadRequestException);
  });

  it('Throws if signin is called with an unused email', async () => {
    await expect(service.signin('asdmds', 'asdf')).rejects.toThrow(NotFoundException);
  });

  it('Throws if an invalid password is provided', async () => {
    await service.signup('jesv@gmail.com', 'password1');
    await expect(
      service.signin('jesv@gmail.com', 'password'),
    ).rejects.toThrow(BadRequestException);
  });

  it('Return an user if a correct password is provided', async () => {
    await service.signup('jesv@gmail.com', 'password')
    const user = await service.signin('jesv@gmail.com', 'password');
    expect(user).toBeDefined();
  });
});
