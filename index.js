/**
 * Jadro serveru s nastavenim poslechovych cest
 */
// express.io umoznujici komunikaci pres sockety
express = require('express.io');
server = require('./server/server.js');
model = require('./server/model.js');

modelInstance = new model.model();

app = express();
app.http().io();
app.use(express.static('client')); // pouziti adresare s obsahem pro clienta
// 1. prihlaseni a predani info o uzivateli zpatky
app.io.route('login-request', function(req) { // hlidani requestu z clienta
  req.session = req.session || {}; // pokud nema spojeni definovanou session, ulozit object do req.session
  if (!req.session.user) { // prvni komunikace pres spojeni => prirazeni uzivatele
    req.session.user = req.data.mail;
  }
  var registered = modelInstance.isRegistered(req.session.user);
  if (registered.success) {
    server.addUser(req);
  }
  req.io.emit('login-response', modelInstance.isRegistered(req.session.user)); // vraceni odpovedi na clienta
  console.log(server.getUserList()); // vypis online uzivatelu
});
//2. poslani dosavadniho hlasovani SM
app.io.route('votes-request', function(req) {
  var userInfo = modelInstance.isRegistered(req.data).user;
  var data = undefined;
  if (userInfo) {
    var usInfo = server.getUS(userInfo.team);
    if (usInfo) {
      data = server.getVotes(userInfo.team);
    }
  }
  req.io.emit('votes-response', data);
});
// (2). kontrola aktivniho hlasovani po prihlaseni
app.io.route('loginVote-request', function(req) {
  var userInfo = modelInstance.getUser(req.data);
  if (userInfo) {
    var usInfo = server.getUS(userInfo.team);
    if (usInfo) {
      req.io.emit('startVote-response', modelInstance.getUS(userInfo.team, usInfo));
      if (userInfo.role == model.model.roleTypes.sm) {
        var votes = server.getVotes(userInfo.team);
        if (votes && votes != {}) { // pokud nemame co zobrazit, tak nebudeme
          for ( var key in votes) { // zopakovani prvniho hlasovani v tabulce pro zobrazeni hlasovani
            req.io.emit('valueVote-response', {
              voted : votes[key],
              votedName : key
              }
            );
            break;
          }
        }
      }
    }
  }
});
//3. poslani seznamu us sm
app.io.route('usList-request', function(req) {
  var userInfo = modelInstance.getUser(req.data);
  if (userInfo) {
    req.io.emit('usList-response', modelInstance.getUSList(userInfo.team));
  }
});
// (2-5). odhlaseni uzivatele odebranim ze seznamu
app.io.route('logout-request', function(req) {
  var userInfo = modelInstance.getUser(req.data);
  if (userInfo) {
    server.removeUser(userInfo.team, userInfo.email);
    req.io.emit('logout-response');
  }
});
// 3. us zvolil us, poslani informaci o dane us vsem z tymu
app.io.route('startVote-request', function(req) {
  var userInfo = modelInstance.getUser(req.data.email);
  if (userInfo) {
    var usInfo = modelInstance.getUS(userInfo.team, req.data.usid);
    if (usInfo) {
      server.addUS(userInfo.team, usInfo.titleID);
      var teamList = server.getUsers(userInfo.team);
      for ( var key in teamList) {
        var usReq = server.getUserSocket(userInfo.team, key);
        if (usReq) {
          usReq.io.emit('startVote-response', modelInstance.getUS(userInfo.team, usInfo.titleID));
        }
      }
      console.log(server.getUSList()); // vypis aktivnich hlasovani
    }
  }
});
// 4. developeri posilaji sve hlasovani sm
app.io.route('valueVote-request', function(req) {
  var userInfo = modelInstance.getUser(req.data.email);
  if (userInfo) {
    server.addVote(userInfo.team, userInfo.name, req.data.value);
    var smSocket = server.getSmSocket(userInfo.team);
    if (smSocket) {
      smSocket.io.emit('valueVote-response', {
          voted : req.data.value,
          votedName : userInfo.name
        }
      );
    }
  }
});
// (4-5). SM konci hlasovani
app.io.route('endVote-request', function(req) {
  var userInfo = modelInstance.getUser(req.data.email);
  if (userInfo) {
    var listener = 'endVoteError-response';
    var value = 'SM ended it.';
    if (req.data.value) { // spravne ukonceni, odesilame vysledek
      listener = 'endVote-response';
      value = req.data.value;
      server.sendVoteTP(server.getUS(userInfo.team), req.data.value);
    }
    server.removeUS(userInfo.team);

    var teamList = server.getUsers(userInfo.team);
    for ( var key in teamList) {
      var usReq = server.getUserSocket(userInfo.team, key);
      if (usReq) {
        usReq.io.emit(listener, value);
      }
    }
    req.io.emit('usList-response', modelInstance.getUSList(userInfo.team));
  }
});

console.log('listening at localhost:4987');
app.listen(4987); // spusteni aplikace na portu 4987
