/**
 * funkce pro zobrazeni
 * Created by balicekt on 13/03/14.
 */
var traineeApp = traineeApp || {};

traineeApp.view = function() {
  this.showing = []; // pole pro zobrazovani specificke zpravy pouze jednou
                      // podle textu ? pridat generaci IDzpravy ?
};

/**
 * vycet typu hlasek viz main.css
 */
traineeApp.view.messageTypes = {
  info : 'info',
  warning : 'warning',
  error : 'error',
  success : 'success'
};

/**
 * zobrazeni prihlasovacich udaju a vyzvu k cekani na hlasovani
 * @param app - scope jadra aplikace pro pristup k informacim o uzivateli
 */
traineeApp.view.prototype.login = function() {
  $('#content')
      .append(
          "<p id='login-info'>logged in as <b>"
              + app.user.name
              + "</b> in team <b>"
              + app.user.team
              + "</b><br></p><p id='vote-wait'> please wait for vote to start...</p>");
};

/**
 * zobrazeni hlasky uzivateli na urcitou dobu
 * @param elID - prvek, na ktery se ma zprava napojit
 * @param text - zobrazovana hlaska
 * @param type - typ okna viz messageTypes
 * @param hide - doba v ms za kterou hlaska zmizi
 */
traineeApp.view.prototype.flashMsg = function(elID, text, type, hide) {
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
 * odstraneni vsech prvku user stories vyberu
 */

traineeApp.view.prototype.USListRemove = function() {
  $('#vote-wait').remove();
  $('#smUSList-btn').remove();
  $('#USList').remove();
};

/**
 * vytvoreni listu pro vyber US
 * 
 * @param us
 *          user stories k vyberu
 * @param app
 *          scope jadra aplikace pro odesilani zprav na server
 */
traineeApp.view.prototype.USList = function(us, appio, appteam){
    this.USListRemove();
    $('#content').append('<button id="smUSList-btn">request userStories</button>');
    $('#smUSList-btn').click(function(){
        appio.emit("smUSList-request",appteam);
    });

};

traineeApp.view.prototype.startVote = function(us) {
  $('#vote-wait').remove();
  $('#content').append(
      '<p id="usVoteInfo">' + us.title + ' ' + us.description + '</p>');
};


traineeApp.view.prototype.getCards = function(){
  var number = ["1","2","3","5","8","13","21","34"];
  var i = 0;
  $('#content').append('<ul>');
  while(i < number.length){
    for(var y = i; y < (i+3); y++){
      $('#content').append('<li class="cards" data-value="'+number[y]+'">'+number[y]+'</li>');
      if(y === (number.length-1)) break;
    }
    i += 3;
  }
  $('#content').append('<li class="cards" value="?">?</li>');
  $('#content').append('</ul>');
}
