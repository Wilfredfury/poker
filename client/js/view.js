/**
 * Funkce pro zobrazeni
 */
var traineeApp = traineeApp || {};

traineeApp.View = function() {
  this.formEl = null; // hlavni prvek formu pro prihlaseni
  this.emailEl = null; // textove pole pro mail
  this.submitEl = null; // tlacitko pro odeslani mailu
  this.contentEl = $('#content'); // hlavni prvek pro obsah
  this.panelEl = $('#panel'); // hlavni prvek pro login
};

traineeApp.View.messageTypes = {
  warning : 'warning',
  success : 'success',
  error : 'error',
  info : 'info'
};

traineeApp.View.numbers = ["1", "2", "3", "5", "8", "13", "21", "34", "?" ]; // hodnoty pro karty na hlasovani, posledni musi byt znak pro hodnotu 'nic'

traineeApp.View.maximalDescriptionShowLength = 100; // nejdelsi povoleny komentar pro zobrazeni do tabulky vyberu us scrummasterem

/**
 * zobrazeni informativni hlasky uzivateli
 * 
 * @param elID - prvek, na ktery se ma zprava napojit
 * @param text - zobrazovana hlaska
 * @param type - typ okna viz messageTypes
 * @param hide - doba v ms za kterou hlaska zmizi
 */
traineeApp.View.prototype.flashMsg = function(elID, text, type, hide) {
  var msg = $('<div class="' + type + ' message"><h3>' + text + '</h3></div>');
  $('#' + elID).append(msg);
  if (hide != null) {
    setTimeout(function() {
      msg.remove();
    }, hide);
  }
};

/**
 * zobrazeni formu na prihlaseni
 */
traineeApp.View.prototype.showLoginForm = function() {
  this.contentEl.append('<div class="login-form-wrapper">' +
                          '<form name="login-form" id="login-form">' +
                            '<input placeholder="Email login" type="email" id="login-email" required> <br/>' +
                            '<input type="submit" value="submit" id="login-submit" class="button">' +
                          '</form>' +
                        '</div>');

  this.formEl = $('#login-form'); // hlavni prvek formu pro prihlaseni
  this.emailEl = $('#login-email'); // textove pole pro mail
  this.submitEl = $('#login-submit'); // tlacitko pro odeslani mailu
};

/**
 * zobrazeni prihlaseni uzivatele
 */
traineeApp.View.prototype.login = function() {
  this.panelEl.append("<div id='login-info'><span class='bold'>" + app.user.name + "</span> in team <span class='bold'>" + app.user.team + " </span><button class='buttonSmall' id='logoutBtn'>&rarr;</button></div>");
};

/**
 * vyprazdneni obsahu okna pro dalsi prihlaseni
 */
traineeApp.View.prototype.logout = function() {
  this.panelEl.empty();
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
  var maxShowLength = traineeApp.View.maximalDescriptionShowLength;
  this.contentEl.empty();
  this.contentEl.append('<button class="button" id="USListBtn">request&nbsp;us</button><button class="button" id="UpdateUsers">update&nbsp;users</button>' + '<table id="USList" class="table"><thead><tr><th>user&nbsp;story</th><th>title</th><th>type</th><th>description</th><th></th></tr></thead></table>');
  for ( var key in us) {
    var desc = us[key].description; // predzpracovani popisu
    if (desc.length > maxShowLength){
      desc = desc.substr(0, maxShowLength - 3) + '...'; // -3 za '...'
    }
    $('#USList').append('<tr><td>' + us[key].titleID + '</td><td>' + us[key].title + '</td><td>' + us[key].type + '</td><td>' + desc + '</td><td><button class="USbtn" value="' + us[key].titleID + '">select</button></td></tr>');
  }
};


/**
 * zahajeni hlasovani pro programatory
 * 
 * @param us - vybrana user story
 */
traineeApp.View.prototype.startVote = function(us) {
  var number = traineeApp.View.numbers; // jednotlive hodnoty pro karty
  var content = '';
  var i = 0; // index prochazeni pole

  this.contentEl.empty();
  if (app.user.role == traineeApp.User.roleTypes.sm) { // scrummaster
    this.contentEl.append('<button id="voteEndBtn" class="button">end vote</button>');
  }
  this.contentEl.append('<br /><div id="cards-wrapper"></div>');
  while (i < number.length) {
      content += '<div class="cards" data-value="' + number[i] + '">' + number[i] + '</div>';
     i++;
  }
  $('#cards-wrapper').append(content);
  this.contentEl.append('<div id="vote-info"><h3><span class="vote-info-header">' + us.titleID + ' ' + us.title + '</span><br /><span class="vote-info-body">' + us.description + '</span></h3></div>');
};

/**
 * zobrazeni vysledku pro scrummastera
 * 
 * @param votes - {'jmeno' : 'hodnota'}
 */
traineeApp.View.prototype.valueVote = function(votes) {
  var med = 0; // suma, po vypoctu prumer
  var num = 0; // pocet hlasu
  var dunno = traineeApp.View.numbers[traineeApp.View.numbers.length - 1]; // znak nahrazujici neohodnocene hlasovani us (posledni v numbers)
  var content = '<thead><tr><th>user</th><th>voted</th></tr></thead><tbody>'; // odradkovani udelano v main.css
  $('#voteTable').remove(); // remove a append aby nemusel byt hlidan content.clear() voteTableEl nema smysl stejne probehne dvakrat
  this.contentEl.append('<table id="voteTable" class="table"></table>');
  for ( var key in votes) {
    var votesKey = dunno; // pro vyhodnocovani NaN pouze jednou
    if (!isNaN(votes[key])) { // do prumeru jdou jen cisla
      num++;
      med += votes[key];
      votesKey = votes[key];
    } // zobrazeni obsahu promenne dunno misto NaN
    content += '<tr><td>' + key + '</td><td>' + votesKey + '</td></tr>';
  }
  if (num){
    med = med / num;
    med = parseInt(med.toFixed(2));    
  } else {
    med = dunno;
  }
  $('#voteTable').append(content + '</tbody><tfoot><tr><td colspan="2">&#8709;&nbsp;' + med + '</td></tr></tfoot>');
};

/**
 * zobrazeni ajax loader
 */
traineeApp.View.prototype.loaderShow = function(){
  $("#ajax-loader").show();
};

/**
 * skryti ajax loader
 */
traineeApp.View.prototype.loaderHide = function(){
  $("#ajax-loader").hide();
};

