import signalR from '@aspnet/signalr/dist/browser/signalr.js';

export function id() {
    return Math.random().toString(36).substring(2);
}

export function getOpts() {
    const opts = window.location.hash.substr(1).split('-');

    return opts.length !== 2
        ? null
        : { bo: +opts[0], sid: opts[1] };
}

export function setOpts(obj) {
    if (!obj.bo || !obj.sid)
        return;

    window.location.hash = `${obj.bo}-${obj.sid}`;
}

export function uid(msg) {
    return `${msg.sid}-${msg.sender}`;
}

export const apiUrl = 'https://duel-pig.azurewebsites.net/api';
// export const apiUrl = 'http://localhost:7071/api';

export function post(endpoint, msg) {
    return fetch(
        `${apiUrl}/${endpoint}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-uid': uid(msg) },
            body: JSON.stringify(msg)
        }
    )
    .catch(console.error);
}

export function establishConnection(msg, onJoin, onMsg, onDone) {
    return post('negotiate', msg)
        .then(resp => resp.json())
        .then(info => {
            const connection = new signalR.HubConnectionBuilder()
                .withUrl(info.url, { accessTokenFactory: () => info.accessToken })
                .configureLogging(signalR.LogLevel.Information)
                .build();

            connection.on('msg', onMsg);
            connection.on('join', onJoin);
            connection.onclose(() => post('leave', msg));

            // console.log('connecting...');
            return connection.start()
        })
        .then(() => {
            // console.log('joining', msg.sid);
            return post('join', msg);
        })
        .catch(console.error);
}
