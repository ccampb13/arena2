'use strict';

var Cookies = require('cookies');
var traceur = require('traceur');
var User;
var users = {};

exports.connection = function(socket){
  if(global.nss){
    User = traceur.require(__dirname + '/../models/user.js');
    addUserToSocket(socket);

    socket.on('send-message', sendMessage);
  }
};

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

function sendMessage(data){
  var socket = this;

  data.email = socket.nss.user.email;
  socket.broadcast.emit('receive-message', data);
  socket.emit('receive-message', data);
}

function addUserToSocket(socket){
  var cookies = new Cookies(socket.handshake, {}, ['SEC123', '321CES']);
  var encoded = cookies.get('express:sess');
  var decoded;

  if(encoded){
    decoded = decode(encoded);
  }

  User.findById(decoded.userId, user=>{
    users[decoded.userId] = user;
    socket.nss = {};
    socket.nss.user = user;
    socket.emit('online', users);
    socket.broadcast.emit('online', users);
  });
}

function decode(string) {
  var body = new Buffer(string, 'base64').toString('utf8');
  return JSON.parse(body);
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
