const authService = require('../services/authService');

function isLocalRequest(req) {
  const host = (req.hostname || req.get('host') || '').split(':')[0];
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function shouldUseSecureCookie(req) {
  if (process.env.COOKIE_SECURE !== undefined) {
    return process.env.COOKIE_SECURE === 'true';
  }

  return process.env.NODE_ENV === 'production' && !isLocalRequest(req);
}

function cookieOptions(req) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookie(req),
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  };
}

async function register(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await authService.registerUser(username, password);

    res.cookie('token', result.token, cookieOptions(req));
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await authService.loginUser(username, password);

    res.cookie('token', result.token, cookieOptions(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: shouldUseSecureCookie(req),
      sameSite: 'strict'
    });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };
