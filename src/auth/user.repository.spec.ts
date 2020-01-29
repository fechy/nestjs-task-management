import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

const mockAuthCredentialsDto = {
  username: 'tester-00',
  password: 'TestPassword',
};

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;
    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('Successfully signs up the user', () => {
      save.mockResolvedValue(undefined);
      expect(
        userRepository.signUp(mockAuthCredentialsDto),
      ).resolves.not.toThrow();
    });

    it('Throws a conflict exception if user already exists', () => {
      save.mockRejectedValue({ code: '23505' });
      expect(userRepository.signUp(mockAuthCredentialsDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('Throws a InternalServerErrorException and error happens', () => {
      save.mockRejectedValue({ code: '500' });
      expect(userRepository.signUp(mockAuthCredentialsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validateUserPassword', () => {
    let user;
    beforeEach(() => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = 'tester';
      user.validatePassword = jest.fn();
    });

    it('returns username as validation is successful', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);

      const result = await userRepository.validateUserPassword(
        mockAuthCredentialsDto,
      );
      expect(result).toEqual(user.username);
    });

    it('returns null as user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userRepository.validateUserPassword(
        mockAuthCredentialsDto,
      );
      expect(result).toBeNull();
      expect(user.validatePassword).not.toHaveBeenCalled();
    });

    it('returns null as password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);
      const result = await userRepository.validateUserPassword(
        mockAuthCredentialsDto,
      );
      expect(result).toBeNull();
      expect(user.validatePassword).toHaveBeenCalled();
    });

    describe('hashPassword', () => {
      it('calls bcrypt hash to generate hash', async () => {
        bcrypt.hash = jest.fn().mockResolvedValue('testHash');
        expect(bcrypt.hash).not.toHaveBeenCalled();
        const result = await userRepository.hashPassword('test', 'testSalt');
        expect(result).toEqual('testHash');
      });
    });
  });
});
