/**
 * Created by balicekt on 13/03/14.
 */
var view = function(){
	
};
// nahrada za alerty udelat css
view.prototype.flashMsg = function ( elID, text, type, hide) {
	var msg = $('<div class="'+ view.messageTypes.type +' message"><h3>'+ text +'</h3></div>');
	$('#'+elID).append(msg);
	if (hide != null){
		setTimeout(function(){
			msg.remove();
		},hide);
	}
};

view.messageTypes = {
		info: 'info',
		warning: 'warning',
		error: 'error',
		success:'success'
};