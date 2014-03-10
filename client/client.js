var traineeApp = {};

traineeApp.Core = (function() {
	function Core() {
    		this.buttonEl = $('#call-backend');
		this.responseEl = $('#response-wrapper');
		this.io = io.connect();
		this.nick = 'user' + Math.floor((Math.random()*1000)+1).toString();	
    	};
    
	Core.prototype.initListeners = function(){
		var _this = this;
		this.buttonEl.click( function(){
			_this.io.emit('first_request', {mail: _this.nick});
		});
		this.io.on('first_response', function(data) {
			_this.responseEl.append( data.div );
		});
	};
	return Core;
})();

