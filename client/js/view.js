/**
 * Funkce pro zobrazeni
 */
var traineeApp = traineeApp || {};

traineeApp.View = function() {
  this.showing = []; // pole pro zobrazovani specificke zpravy pouze jednou
  this.formEl = $('#login-form'); // hlavni prvek formu pro prihlaseni
  this.emailEl = $('#login-email'); // textove pole pro mail
  this.submitEl = $('#login-submit'); // tlacitko pro odeslani mailu
  this.contentEl = $('#content'); // hlavni prvek pro obsah
  this.panelEl = $('#panel'); // hlavni prvek pro pro login
  this.usListEl = $('#USList'); // list user stories pro hlasovani
  this.voteTable = $('#voteTable'); // tabulka vysledku z klientu
  this.cardsEl = $('.cards'); // tlacitka karet pro hlasovani
};

/**
 * vycet typu zprav
 */
traineeApp.View.messageTypes = {
warning : 'warning',
success : 'success',
error : 'error',
info : 'info'
};

/**
 * zobrazeni prihlaseni uzivatele
 */
traineeApp.View.prototype.login = function() {
  this.formEl.hide();
  this.panelEl.append("<div id='login-info'>logged in as <span class='bold'>" + app.user.name + "</span> in team <span class='bold'>" + app.user.team + "</span></p></div>");
};

/**
 * zobrazeni vyzvy k cekani
 */
traineeApp.View.prototype.wait = function() {
  this.contentEl.empty();
  this.contentEl.append("<p id='vote-wait'> please wait for vote to start...</p>");
};

/**
 * zobrazeni informativni hlasky uzivateli
 * 
 * @param elID - prvek, na ktery se ma zprava napojit
 * @param text - zobrazovana hlaska
 * @param type - typ okna viz messageTypes
 * @param hide - doba v ms za kterou hlaska zmizi
 */
traineeApp.View.prototype.flashMsg = function(elID, text, type, hide) {
  var aShow = this.showing; // pole zobrazenych hlasek
  if (!(aShow.indexOf(text) > -1)) {
    aShow.push(text);
    var msg = $('<div class="' + type + ' message"><h3>' + text + '</h3></div>');
    $('#' + elID).append(msg);
    if (hide != null) {
      setTimeout(function() {
        aShow.splice(aShow.indexOf(text), 1);
        msg.remove();
      }, hide);
    }
  }
};

/**
 * vytvoreni listu pro vyber US
 * 
 * @param us - user stories k vyberu
 * @param app - scope jadra aplikace pro odesilani zprav na server
 */
traineeApp.View.prototype.usList = function(us) {
  this.contentEl.empty();
  this.contentEl.append('<button class="button" id="smUSList-btn">request userStories</button><table id="USList" class="table"><thead><tr><th>user story #</th><th>title</th><th>type</th><th>description</th><th></th></tr></thead></table>');
  for ( var key in us) {
    var desc = us[key].description; // kvuli citelnosti nadchazejiciho vyrazu
    this.usListEl.append('<tr><td>' + us[key].titleID + '</td><td>' + us[key].title + '</td><td>' + us[key].type + '</td><td>' + desc.substr(0, Math.min(desc.length, 100)) + '</td><td><button class="USbtn" value="' + us[key].titleID + '">select</button></td></tr>');
  }
};

/**
 * zahajeni hlasovani pro programatory
 * 
 * @param us - vybrana user story
 */
traineeApp.View.prototype.startVote = function(us) {
  var number = ["1", "2", "3", "5", "8", "13", "21", "34", "?" ];
  var content = '<p id="usVoteInfo">' + us.title + ' ' + us.description + '</p><ul>';
  this.contentEl.empty();
  for ( var i in number) {
    content += '<li class="cards" data-value="' + number[i] + '">' + number[i] + '</li>';
  }
  this.contentEl.append(content + '</ul>');
};

/**
 * zobrazovani vysledku pro scrummastera
 * 
 * @param votes - dosavadni vysledky
 */
traineeApp.view.prototype.USList = function(us, appio, appteam){
    this.USListRemove();
    $('#content').append('<button id="smUSList-btn">request userStories</button>');
    $('#smUSList-btn').click(function(){
        appio.emit("smUSList-request",appteam);
    });

};

traineeApp.view.prototype.startVote = function(us) {
  this.clear();
  $('#content').append('<p id="usVoteInfo">' + us.title + ' ' + us.description + '</p>');
};

traineeApp.view.prototype.valueVote = function(votes) {
  this.clear();
  var med = 0;
  var num = 0;
  var content = '<thead><tr><th>user</th><th>value</th></tr></thead><tbody>';
  this.contentEl.empty();
  this.contentEl.append('<table id="voteTable" class="table"></table>');
  for ( var key in votes) {
    num++;
    med += votes[key];
    content += '<tr><td>' + key + '<td></td><td>' + votes[key] + '</td></tr>';
  }
  med = med / num;
  this.voteTableEl.append(content + '</tbody><tfoot><tr><td colspan="2">' + ((Math.round(med) == med) ? med : med.toFixed(2)) + '</td></tr></tfoot>');
};
