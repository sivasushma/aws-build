import bcrypt from 'bcryptjs';
import RandExp from 'randexp';

export default class PasswordService {
  generatePassword() {
    return new Promise((resolve, reject) => {
      resolve(new RandExp(/(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])([#!@$%&])([A-Z])([a-z])([0-9])([#!@$%&]).{6}$/).gen());
    });
  }

  bcrypt_password(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  static compare_password(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
}

