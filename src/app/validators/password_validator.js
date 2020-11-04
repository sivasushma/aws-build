export default class PasswordValidator {
  static validate(v) {
    return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{1,}$/.test(v);
  }
}
