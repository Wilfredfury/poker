/**
 * funkce pro zobrazeni
 * Created by balicekt on 13/03/14.
 */
var traineeApp = traineeApp || {};

traineeApp.view = function(){
    this.showing = []; //pole pro zobrazovani specificke zpravy pouze jednou podle textu ? pridat generaci IDzpravy ?
};

/**
 * vycet typu hlasek viz main.css
 */
traineeApp.view.messageTypes = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    success:'success'
};

/**
 * zobrazeni prihlasovacich udaju a vyzvu k cekani na hlasovani
 * @param app - scope jadra aplikace pro pristup k informacim o uzivateli
 */
traineeApp.view.prototype.login = function(){
    $('#content').append("<p id='login-info'>logged in as <b>"+
                          app.user.name+"</b> in team <b>"+
                          app.user.team+"</b><br></p><p id='vote-wait'> please wait for vote to start...</p>");  
};

/**
 * zobrazeni hlasky uzivateli na urcitou dobu
 * @param elID - prvek, na ktery se ma zprava napojit
 * @param text - zobrazovana hlaska
 * @param type - typ okna viz messageTypes
 * @param hide - doba v ms za kterou hlaska zmizi
 */
traineeApp.view.prototype.flashMsg = function(elID, text, type, hide){
    var aShow = this.showing; // pole zobrazenych hlasek
    if (!(aShow.indexOf(text) > -1)){
        aShow.push(text);    
    	var msg = $('<div class="'+ type +' message"><h3>'+ text +'</h3></div>');
    	$('#'+elID).append(msg);
    	if (hide != null){
    		setTimeout(function(){
    		    aShow.splice(aShow.indexOf(text),1);
    			msg.remove();
    		},hide);
    	}
    }
};

/**
 * odstraneni vsech prvku user stories vyberu
 */

traineeApp.view.prototype.USListRemove = function(){
    $('#vote-wait').remove();
    $('#smUSList-btn').remove();
    $('#USList').remove();
};

/**
 * vytvoreni listu pro vyber US
 * @param us user stories k vyberu
 * @param app scope jadra aplikace pro odesilani zprav na server
 */
traineeApp.view.prototype.USList = function(us, appio, appteam){
    this.USListRemove();
    $('#content').append('<button id="smUSList-btn">request userStories</button>');
    $('#smUSList-btn').click(function(){
        appio.emit("smUSList-request",appteam);
    });
    $('#content').append('<table id="USList" align="center" border="0"><tr><th>user story #</th><th>title</th><th>type</th><th>description</th><tr></table>');
    for (var key in us){
        var desc = us[key].description; // kvuli citelnosti nadchazejiciho vyrazu 
        $('#USList').append('<tr><td>'+us[key].titleID+
                            '</td><td>'+us[key].title+
                            '</td><td>'+us[key].type+
                            '</td><td>'+desc.substr(0,Math.min(desc.length,100))+
                            '</td><td><button class="USbtn" value="'+us[key].titleID+'">select</button></td></tr>');
    }
    $('.USbtn').click(function(){
        appio.emit('startVote-request', {team: appteam, usid: $(this).val()});
    });
};
