import IO from 'koa-socket';

import { log, d, g, b, gr, r, y, yb, yellowRed, blackWhite } from '../util/logging';

let usernames = [];
let messages = [];

const io = new IO();

const socketConnection = ctx => {
  const ip = ctx.socket.handshake.headers['x-forwarded-for'] ||
    ctx.socket.handshake.address.address;
  log(
    d() + b(' Connection: ') + yellowRed('New user connected'),
    blackWhite(ctx.socket.id),
    blackWhite(ip),
  );
};

const socketDisconnect = ctx => {
  const { username } = ctx.socket;
  if (username) {
    log(`${[d()]} [server] disconnected: ${username}`);
    usernames = usernames.filter(u => u !== username);
  }
};

const socketLogin = (ctx, { username }) => {
  log(`${[d()]} [server] received ${g('login')} event for: ${username}`);
  usernames.push(username);
  ctx.socket.username = username;
  ctx.socket.usernames = usernames;

  io.broadcast('users.login', { username, usernames });
};

const socketLogout = ctx => {
  const { username } = ctx.socket;
  if (username) {
    log(`${[d()]} [server] logout: ${username}`);
    usernames = usernames.filter(u => u !== username);
    delete ctx.socket['username'];

    io.broadcast('users.logout', { username });
  }
};

const broadcastMessage = (ctx, { text }) => {
  // log(`${[d()]} [server] broadcasting message: ${text}`);
  const message = {
    id: messages.length,
    text,
    username: ctx.socket.username,
  };
  messages.push(message);
  log(`${[d()]} [server] Received new message from client, ${g('broadcasting')} message to all users`);
  io.broadcast('messages.new', { message });
};

export {
  io,
  socketConnection,
  socketDisconnect,
  socketLogin,
  socketLogout,
  broadcastMessage
};
