/**
 * Created by balicekt on 13/03/14.
 */
var view = function(){
    //pole pro zobrazovani specificke zpravy pouze jednou podle textu ? pridat generaci IDzpravy ?
    this.showing = [];
};
// nahrada za alerty udelat css
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
// vycet pro jistotu spravneho vyberu typu hlasky
view.messageTypes = {
		info: 'info',
		warning: 'warning',
		error: 'error',
		success:'success'
};