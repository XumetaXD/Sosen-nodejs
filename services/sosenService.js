const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const querystring = require('querystring');

const SOSEN_API_BASE_URL = 'http://openapi.inteless.com';

const SOSEN_USERNAME = process.env.SOSEN_USERNAME;
const SOSEN_PASSWORD = process.env.SOSEN_PASSWORD;
const SOSEN_APP_ID = process.env.SOSEN_APP_ID;
const SOSEN_APP_SECRET = process.env.SOSEN_APP_SECRET;

let tokenCache = { token: null, expiresAt: 0 };

function createHeadersAndSignature({ method, url, headers = {}, data = '' }) {
    const nonce = uuidv4();
    const contentType = headers['content-type'] || 'application/json';
    const accept = headers['accept'] || 'application/json';

    let contentMd5 = '';
    const isForm = contentType.startsWith('application/x-www-form-urlencoded');
    if (data && !isForm) {
        const md5 = crypto.createHash('md5').update(typeof data === 'string' ? data : JSON.stringify(data)).digest('base64');
        contentMd5 = md5;
    }

    const xCaHeaders = {
        'x-ca-key': SOSEN_APP_ID,
        'x-ca-nonce': nonce,
    };

    const headersToSign = {};
    for (const [key, value] of Object.entries({ ...headers, ...xCaHeaders })) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.startsWith('x-ca-') && !['x-ca-signature', 'x-ca-signature-headers', 'x-ca-stage'].includes(lowerKey)) {
            headersToSign[lowerKey] = value;
        }
    }

    const sortedHeaderKeys = Object.keys(headersToSign).sort();
    const signatureHeaders = sortedHeaderKeys.join(',');

    let textToSign = `${method.toUpperCase()}\n${accept}\n${contentMd5}\n${contentType}\n\n`;
    sortedHeaderKeys.forEach(header => {
        textToSign += `${header}:${headersToSign[header]}\n`;
    });

    textToSign += getUrlToSign(url, data, contentType);

    const hmac = crypto.createHmac('sha256', SOSEN_APP_SECRET);
    hmac.update(textToSign);
    const signature = hmac.digest('base64');

    return {
        ...xCaHeaders,
        'X-Ca-Signature': signature,
        'X-Ca-Signature-Headers': signatureHeaders,
        'Content-MD5': contentMd5,
        'Accept': accept,
        'Content-Type': contentType,
    };
}

function getUrlToSign(url, data, contentType) {
    const [baseUrl, queryString] = url.split('?');
    const params = new URLSearchParams(queryString || '');

    if (contentType.startsWith('application/x-www-form-urlencoded') && typeof data === 'string') {
        const formParams = querystring.parse(data);
        Object.entries(formParams).forEach(([key, value]) => {
            params.append(key, value);
        });
    }

    const sortedParams = [...params.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const finalQuery = sortedParams.map(([k, v]) => `${k}=${v}`).join('&');

    const relativeUrl = baseUrl.replace(SOSEN_API_BASE_URL, '');
    return finalQuery ? `${relativeUrl}?${finalQuery}` : relativeUrl;
}

async function getAccessToken() {
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt > now) {
        return tokenCache.token;
    }

    const requestOptions = {
        method: 'POST',
        url: '/oauth/token',
        headers: { 'content-type': 'application/json' },
        data: {
            username: SOSEN_USERNAME,
            password: SOSEN_PASSWORD,
            grant_type: 'password',
            client_id: 'csp-web'
        }
    };

    const signedHeaders = createHeadersAndSignature(requestOptions);

    const response = await axios({
        baseURL: SOSEN_API_BASE_URL,
        method: requestOptions.method,
        url: requestOptions.url,
        headers: {
            ...requestOptions.headers,
            ...signedHeaders,
        },
        data: requestOptions.data
    });

    const { access_token, expires_in } = response.data.data;
    tokenCache.token = access_token;
    tokenCache.expiresAt = now + (expires_in * 1000) - 10000;
    return access_token;
}

async function getFirstDeviceId(token) {
    const requestOptions = {
        method: 'GET',
        url: '/v1/inverters?page=1&limit=1&type=-1',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const signedHeaders = createHeadersAndSignature(requestOptions);

    const response = await axios({
        baseURL: SOSEN_API_BASE_URL,
        method: requestOptions.method,
        url: requestOptions.url,
        headers: {
            ...requestOptions.headers,
            ...signedHeaders,
        },
    });

    const { data } = response.data;
    if (!data || data.length === 0) {
        throw new Error('No hay dispositivos registrados en la cuenta SOSEN');
    }
    return data.infos[0].sn;
}

async function getRealtimeData() {
    try {
        const token = await getAccessToken();
        
        const deviceId = await getFirstDeviceId(token);

        const requestOptions = {
            method: 'GET',
            url: `/v1/inverter/${deviceId}/realtime/input`,
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const signedHeaders = createHeadersAndSignature(requestOptions);

        const response = await axios({
            baseURL: SOSEN_API_BASE_URL,
            method: requestOptions.method,
            url: requestOptions.url,
            headers: {
                ...requestOptions.headers,
                ...signedHeaders,
            },
        });

        const { data } = response.data;
        if (!data || Object.keys(data).length === 0) {
            throw new Error('No hay datos disponibles para el dispositivo');
        }
        data['pvIV'][0]['deviceId'] = deviceId;
        return data['pvIV'][0];
    } catch (err) {
        console.error('Error en getRealtimeData:', err.message);
        throw new Error('Error al obtener datos en tiempo real del inversor SOSEN');
      }
}

module.exports = { getRealtimeData };
