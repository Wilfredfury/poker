/**
 * Created by balicekt on 13/03/14.
 */


var view = function(){
	
};

view.prototype.flashMsg = function ( elID, text, type, hide) {
    var msg = $("<div class=\""+type+" message\"><h3>"+text+"</h3></div>");
	$('#'+elID).append(msg);
	if (hide != null){
		setTimeout(function(){
			msg.remove();
		},hide);
	}
};

/*
view.messageTypes = {
		info: 'info',
		warning: 'warning',
		error: 'error',
		success:'success'
};
*/

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


