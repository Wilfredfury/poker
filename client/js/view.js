/**
 * Created by balicekt on 13/03/14.
 */
var view = function(app){
    //pole pro zobrazovani specificke zpravy pouze jednou podle textu ? pridat generaci IDzpravy ?
    this.showing = [];
};

view.prototype.login = function (app){
    app.contentEl.append("<p id='login-info'>logged in as <b>"+
                          app.user.name+"</b> in team <b>"+
                          app.user.team+"</b><br></p><p id='vote-wait'> please wait for vote to start...</p>");  
};
// nahrada za alerty
view.prototype.flashMsg = function ( elID, text, type, hide) {
    var aShow = this.showing;
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

view.prototype.USListRemove = function(){
    $('#vote-wait').remove();
    $('#smUSList-btn').remove();
    $('#USList').remove();
};

view.prototype.USList = function(us, app){
    this.USListRemove();
    $('#content').append('<button id="smUSList-btn">request userStories</button>');
    $('#smUSList-btn').click(function(){
        app.io.emit("smUSList-request",app.user);
    });
    $('#content').append('<table id="USList" align="center" border="0"><tr><th>user story #</th><th>title</th><th>type</th><th>description</th><tr></table>');
    for (var key in us){
        // desc promenna pro zlepseni citelnosti vyrazu
        var desc = us[key].description;
        $('#USList').append('<tr><td>'+us[key].titleID+
                            '</td><td>'+us[key].title+
                            '</td><td>'+us[key].type+
                            '</td><td>'+desc.substr(0,Math.min(desc.length,100))+
                            '</td><td><button class="USbtn" value="'+us[key].titleID+'">select</button></td></tr>');
    }
};
// vycet pro jistotu spravneho vyberu typu hlasky
view.messageTypes = {
		info: 'info',
		warning: 'warning',
		error: 'error',
		success:'success'
};

view.prototype.allUS = function(us){
    // vypise userStories do tabulky s tacitkem na vyber
    // v us prijde objekt se vsemi us, ktere ma sm v teamu
    // vyberUS bude button <button id='neco' value'id us'>Nazev us
    // --------------------------------------------------
    // nazev userStories        vyberUS
    // --------------------------------
    // nazev userStories        vyberUS
    // --------------------------------
    // nazev userStories        vyberUS
    // --------------------------------
    // nazev userStories        vyberUS
};


