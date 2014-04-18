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
modelInstance.load();
// 1. prihlaseni a predani info o uzivateli zpatky
app.io.route('login-request', function(req) { // hlidani requestu z clienta
  req.session = req.session || {}; // pokud nema spojeni definovanou session, ulozit object do req.session
  if (!req.session.user) { // prvni komunikace pres spojeni => prirazeni uzivatele
    req.session.user = req.data.mail;
  }
  var registered = modelInstance.getUser(req.session.user);
  if (registered) {
    server.addUser(req);
    req.io.emit('login-response', registered); // vraceni odpovedi na clienta
    console.log(server.getUserList()); // vypis online uzivatelu    
  }
});
//2. poslani dosavadniho hlasovani SM
app.io.route('votes-request', function(req) {
  var userInfo = server.getUser(req.data);
  var data = null;
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
  var userInfo = server.getUser(req.data);
  if (userInfo) {
    var usInfoID = server.getUS(userInfo.team);
    if (usInfoID) {
      modelInstance.getUS(usInfoID, function(usInfo) {
        if (usInfo) {
          req.io.emit('startVote-response', usInfo);
          if (userInfo.role == model.model.roleTypes.sm) {
            var votes = server.getVotes(userInfo.team);
            if (votes && votes != {}) { // pokud nemame co zobrazit, tak nebudeme
              for ( var key in votes) { // zopakovani prvniho hlasovani v tabulce pro zobrazeni hlasovani
                req.io.emit('valueVote-response', {
                  voted : votes[key],
                  votedName : key
                });
                break;
              }
            }
          }
        }
      });
    }
  }
});
// (2-6). odhlaseni uzivatele odebranim ze seznamu
app.io.route('logout-request', function(req) {
  var userInfo = server.getUser(req.data);
  if (userInfo) {
    server.removeUser(userInfo.team, userInfo.email);
    req.io.emit('logout-response');
  }
});
//(2-6). pozadavek obnoveni uzivatelu od SM
app.io.route('updateusers-request', function(req){
  modelInstance.load(users, teamUsers);
});
//3. poslani seznamu us sm
app.io.route('usList-request', function(req) {
  var userInfo = server.getUser(req.data);
  if (userInfo) {
    modelInstance.getUSList(userInfo.team, function(usList){
      req.io.emit('usList-response', usList);      
    });
  }
});
// 4. SM zvolil us, poslani informaci o dane us vsem z tymu
app.io.route('startVote-request', function(req) {
  var userInfo = server.getUser(req.data.email);
  if (userInfo) {
    modelInstance.getUS(req.data.usid, function(usInfo) {
      if (usInfo) {
        server.addUS(userInfo.team, usInfo.titleID);
        var teamList = server.getUsers(userInfo.team);
        for ( var key in teamList) {
          var usReq = server.getUserSocket(userInfo.team, key);
          if (usReq) {
            usReq.io.emit('startVote-response', usInfo);
          }
        }
        console.log(server.getUSList()); // vypis aktivnich hlasovani
      }
    });
  }
});
// 5. developeri posilaji sve hlasovani sm
app.io.route('valueVote-request', function(req) {
  var userInfo = server.getUser(req.data.email);
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
//(5-6). SM konci hlasovani
app.io.route('endVote-request', function(req) {
  var userInfo = server.getUser(req.data.email);
  var response = null;
  if (userInfo) {
    if (req.data.value) { // spravne ukonceni, odesilame vysledek
      modelInstance.sendVoteTP(server.getUS(userInfo.team), req.data.value);
    }
    server.removeUS(userInfo.team);

    var teamList = server.getUsers(userInfo.team);
    for ( var key in teamList) {
      var usReq = server.getUserSocket(userInfo.team, key);
      if (usReq) {
        usReq.io.emit('endVote-response', req.data.value);
      }
    }
    req.io.emit('usList-response', modelInstance.getUSList(userInfo.team));
  }
});

console.log('listening at localhost:4987');
app.listen(4987, "0.0.0.0"); // spusteni aplikace na portu 4987
