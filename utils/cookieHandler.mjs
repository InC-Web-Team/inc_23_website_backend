const options = {
    httpOnly: true,
    maxAge: process.env.TOKEN_EXPIRY || 3600000,
    path: '/',
    secure: true,
    signed: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
    partitioned: true,
}

// function sendCookie(res, cookies, path) {
//     for (const key in cookies) {
//         res.cookie(key, cookies[key], { ...options, path: path ? process.env.FRONTEND_URL + path : '/' })
//     }
//     return res
// }

function sendCookie(res, cookies, path) {
    for (const key in cookies) {
        const cookieOptions = {
            ...options,
            path: path ? process.env.FRONTEND_URL + path : '/',
            partitioned: true,
        };

        let cookieStr = `${key}=${cookies[key]}; HttpOnly; Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}; Secure; SameSite=${cookieOptions.sameSite}`;
        
        if (cookieOptions.partitioned) {
            cookieStr += '; Partitioned';
        }

        res.setHeader('Set-Cookie', cookieStr);
    }
    return res;
}


function clearCookie(res, key, path) {
    res.cookie(key, "", { ...options, maxAge: 0, expires: new Date(0), path })
    return res
}

export {
    sendCookie,
    clearCookie
}