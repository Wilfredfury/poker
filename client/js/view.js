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
  this.panelEl = $('#panel'); // hlavni prvek pro login
};

traineeApp.View.messageTypes = {
  warning : 'warning',
  success : 'success',
  error : 'error',
  info : 'info'
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
 * zobrazeni prihlaseni uzivatele
 */
traineeApp.View.prototype.login = function() {
  this.formEl.hide();
  this.panelEl.append("<div id='login-info'>Logged in as <span class='bold'>" + app.user.name + "</span> in team <span class='bold'>" + app.user.team + " </span><button class='buttonSmall' id='logoutBtn'>logout</button></div>");
};

/**
 * zobrazeni login formu po odhlaseni
 */
traineeApp.View.prototype.logout = function() {
  this.formEl.show();
  $('#login-info').remove();
  $('#logoutBtn').remove();
  this.contentEl.empty();
};

/**
 * zobrazeni vyzvy k cekani
 */
traineeApp.View.prototype.wait = function() {
  this.contentEl.empty();
  this.contentEl.append("<div id='vote-wait'><h3>Please wait for vote to start...</h3></div>");
};

/**
 * vytvoreni listu pro vyber US
 * 
 * @param us - user stories k vyberu
 */
traineeApp.View.prototype.usList = function(us) {
  this.contentEl.empty();
  this.contentEl.append('<button class="button" id="USListBtn">request&nbsp;us</button>' + '<table id="USList" class="table"><thead><tr><th>user&nbsp;story</th><th>title</th><th>type</th><th>description</th><th></th></tr></thead></table>');
  for ( var key in us) {
    var desc = us[key].description; // zkraceni vyrazu
    $('#USList').append('<tr><td>' + us[key].titleID + '</td><td>' + us[key].title + '</td><td>' + us[key].type + '</td><td>' + desc.substr(0, Math.min(desc.length, 100)) + '</td><td><button class="USbtn" value="' + us[key].titleID + '">select</button></td></tr>');
  }
};

/**
 * zahajeni hlasovani pro programatory
 * 
 * @param us - vybrana user story
 */
traineeApp.View.prototype.startVote = function(us) {
  var number = ["1", "2", "3", "5", "8", "13", "21", "34", "?" ];
  var content = '';
  var i = 0; // 
  var inRow = 3; // po kolika kartach novy radek
  this.contentEl.empty();
  if (app.user.role == traineeApp.User.roleTypes.sm) { // SM
    this.contentEl.append('<button id="voteEndBtn" class="button">end vote</button>');
  }
  this.contentEl.append('<div id="vote-info"><h3><span class="vote-info-header">' + us.titleID + ' ' + us.title + '</span><br /><span class="vote-info-body">' + us.description + '</span></h3></div><div id="cards-wrapper"></div>');
  while (i < number.length) {
      content += '<div class="cards" data-value="' + number[i] + '">' + number[i] + '</div>';
     i++;
  }
  $('#cards-wrapper').append(content);
};

/**
 * zobrazeni vysledku pro scrummastera
 * 
 * @param votes - {'jmeno' : 'hodnota'}
 */
traineeApp.View.prototype.valueVote = function(votes) {
  var med = 0; // suma, po vypoctu prumer
  var num = 0; // pocet hlasu
  var dunno = '?'; // znak nahrazujici neohodnocene hlasovani us
  var content = '<thead><tr><th>user</th><th>voted</th></tr></thead><tbody>';
  $('#voteTable').remove();
  this.contentEl.append('<table id="voteTable" class="table"></table>');
  for ( var key in votes) {
    var nan = isNaN(votes[key]);
    if (!nan) { // do prumeru jdou jen cisla
      num++;
      med += votes[key];
    } // zobrazeni obsahu promenne dunno misto NaN
    content += '<tr><td>' + key + '</td><td>' + ((nan) ? dunno : votes[key]) + '</td></tr>';
  }
  med = med / num; // zobrazeni promenne dunno misto NaN, cela cisla bez setin
  $('#voteTable').append(content + '</tbody><tfoot><tr><td colspan="2">' + ((isNaN(med)) ? dunno : ((Math.round(med) == med) ? med : med.toFixed(2))) + '</td></tr></tfoot>');
};
