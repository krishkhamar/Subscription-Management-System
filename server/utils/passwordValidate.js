// Spec: password length > 8, plus upper, lower, special
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-={}[\]|;:'",.<>?/`~]).{9,}$/;

function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { ok: false, message: 'Password is required' };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return {
      ok: false,
      message:
        'Password must be more than 8 characters and include uppercase, lowercase, and a special character'
    };
  }
  return { ok: true };
}

module.exports = { validatePasswordStrength, PASSWORD_REGEX };
