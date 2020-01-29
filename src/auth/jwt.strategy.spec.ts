import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UnauthorizedException } from '@nestjs/common';

const mockUserFactory = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserRepository,
          useFactory: mockUserFactory,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('validate', () => {
    it('Validates and returns the user object', async () => {
      const user = new User();
      user.username = 'testuser';
      userRepository.findOne.mockResolvedValue(user);
      const result = await jwtStrategy.validate({ username: 'testuser' });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: user.username,
      });
      expect(result).toEqual(user);
    });

    it('Throws UnauthorizedException if user cannot be found', async () => {
      const user = new User();
      user.username = 'testuser';
      userRepository.findOne.mockResolvedValue(null);
      expect(jwtStrategy.validate({ username: 'testuser' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
