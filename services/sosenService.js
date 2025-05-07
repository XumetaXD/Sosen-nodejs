const axios = require('axios');

// URL base oficial de la API SOSEN
const SOSEN_API_BASE_URL = 'http://openapi.inteless.com';

// Tus credenciales (las debes tener en .env)
const SOSEN_USERNAME = process.env.SOSEN_USERNAME;
const SOSEN_PASSWORD = process.env.SOSEN_PASSWORD;

let tokenCache = { token: null, expiresAt: 0 };

async function getAccessToken() {
  const now = Date.now();

  // Si el token aún es válido, reutilízalo
  if (tokenCache.token && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  try {
    const body = {
      username: SOSEN_USERNAME,
      password: SOSEN_PASSWORD,
      grant_type: 'password',
      client_id: 'csp-web'
    };

    const res = await axios.post(`${SOSEN_API_BASE_URL}/oauth/token`, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      transformRequest: [(data) =>
        Object.entries(data)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&')
      ]
    });

    const { access_token, expires_in } = res.data;

    tokenCache.token = access_token;
    tokenCache.expiresAt = now + (expires_in * 1000) - 10000; // 10s margen

    return access_token;

  } catch (err) {
    console.error('Error al obtener token:', err.response?.data || err.message);
    throw err;
  }
}

async function getFirstDeviceId(token) {
  const res = await axios.get(`${SOSEN_API_BASE_URL}/csp/device/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.data?.data || res.data.data.length === 0) {
    throw new Error('No hay dispositivos registrados en la cuenta SOSEN');
  }

  return res.data.data[0].deviceId;
}

async function getRealtimeData() {
  try {
    const token = await getAccessToken();
    const deviceId = await getFirstDeviceId(token);

    const res = await axios.get(`${SOSEN_API_BASE_URL}/csp/device/data/realtime?deviceId=${deviceId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.data.data;
  } catch (err) {
    //console.log(token)
    //console.error('Error al obtener datos de SOSEN:', err.response?.data || err.message);
    console.error(token)
    throw err;
  }
}

module.exports = { getRealtimeData };
