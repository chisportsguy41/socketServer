let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

var numPlayers = null;
var disconnects = 0;
var names = [];
var botNames = ['Trish', 'Kandis', 'Glinda', 'Val', 'Romelia', 'Almeta',
  'Deloise', 'Joanie', 'Ayana', 'Jerrell', 'Heidi', 'Julian', 'Aisha', 
  'Curt', 'Merlyn', 'Johnny', 'Lorretta', 'Mirella', 'Ann', 'Wendi'];
 
io.on('connection', (socket) => {
  
  socket.on('disconnect', function(){
    if (!io['names_' + socket.name]) {
      console.log('Nothing happened');
    } else {
      for(var i = 0; i < io['names_' + socket.name].length; i++){
        if (io['names_' + socket.name][i] === socket.nickname) {
          io['names_' + socket.name].splice(i, 1);
          if (io['numPlayers_' + socket.name]) {
            if (!io['disconnects_' + socket.name]) {
              io['disconnects_' + socket.name] = 1;
            } else {
              io['disconnects_' + socket.name]++;
            }
            if (io['numPlayers_' + socket.name] == io['disconnects_' + socket.name]) {
              io['numPlayers_' + socket.name] = null;
              io['disconnects_' + socket.name] = 0;
              io['names_' + socket.name] = [];
            }
          }
          break;
        }
      }
    }
    console.log(io['names_' + socket.name]);
    socket.leave(socket.name);
    socket.to(socket.name).emit('users-changed', {user: socket.nickname, event: 'left'});   
  });
 
  socket.on('set-nickname', (message) => {
    console.log(message.id);
    socket.name = message.id;
    socket.join(message.id);
    socket.nickname = message.name;
    if (!io['names_' + message.id]) {
      io['names_' + message.id] = [];
      io['names_' + message.id].push(message.name)
    } else {
      io['names_' + message.id].push(message.name);
    }
    //this['names_' + message.id] = ['this', 'is a test'];
    console.log(io['names_' + message.id]);
    socket.in(message.id).emit('users-changed', {user: message.name, event: 'joined'});    
  });
  
  socket.on('add-message', (message) => {
    socket.to(message.id).emit('message', {text: message.text, name: message.name});
  });

  socket.on('start-game', (message) => {
    io['numPlayers_' + message.id] = io['names_' + message.id].length;
    if (io['names_' + message.id].length < message.number) {
      for (var i = io['names_' + message.id].length; i < message.number; i++) {
        let rand = Math.floor(Math.random()*botNames.length);
        io['names_' + message.id].push(botNames[rand]);
      }
    }
    console.log(io['numPlayers_' + message.id]);
    console.log(io['names_' + message.id]);
    socket.to(message.id).emit('status-changed', 
      {event: 'started', user: socket.nickname, text: 'started the game'});
    io.in(message.id).emit('status-changed', 
      {event: 'set-players', list: io['names_' + message.id], deck: message.deck, num: io['numPlayers_' + message.id]});
  });

  socket.on('reset', (message) => {
    var reset = io['numPlayers_' + message.id] - io['disconnects_' + message.id];
    if (io['names_' + message.id].length < message.number) {
      for (var i = io['names_' + message.id].length; i < message.number; i++) {
        let rand = Math.floor(Math.random()*botNames.length);
        io['names_' + message.id].push(botNames[rand]);
      }
    }
    console.log(io['names_' + message.id]);
    io.in(message.id).emit('status-changed', 
      {event: 'reset', user: socket.nickname, text: 'reset the game'});
    io.in(message.id).emit('status-changed', 
      {event: 'set-players', list: io['names_' + message.id], deck: message.deck, num: reset});
  });
});
 
var port = process.env.PORT || 3001;
 
http.listen(port, function(){
   console.log('listening in http://localhost:' + port);
});