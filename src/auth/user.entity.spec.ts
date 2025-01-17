import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserEntity', () => {
  describe('validatePassword', () => {
    let user: User;

    beforeEach(() => {
      user = new User();
      user.password = 'testPassword';
      user.salt = 'testSalt';
      bcrypt.hash = jest.fn();
    });

    it('returns true if password is valid', async () => {
      bcrypt.hash.mockReturnValue('testPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('12345678');
      expect(bcrypt.hash).toHaveBeenCalledWith('12345678', 'testSalt');
      expect(result).toEqual(true);
    });

    it('returns false if password is invalid', async () => {
      bcrypt.hash.mockReturnValue('wrongPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('12345678');
      expect(bcrypt.hash).toHaveBeenCalledWith('12345678', 'testSalt');
      expect(result).toEqual(false);
    });
  });
});
