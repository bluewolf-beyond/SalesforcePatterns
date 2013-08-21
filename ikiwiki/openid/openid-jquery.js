/*
Simple OpenID Plugin
http://code.google.com/p/openid-selector/

This code is licenced under the New BSD License.
*/

var providers_large = {
    google: {
        name: 'Google',
	icon: 'http://google.com/favicon.ico',
        url: 'https://www.google.com/accounts/o8/id'
    },
    yahoo: {
        name: 'Yahoo',      
	icon: 'http://yahoo.com/favicon.ico',
        url: 'http://me.yahoo.com/'
    },    
    openid: {
        name: 'OpenID',     
	icon: 'wikiicons/openidlogin-bg.gif',
        label: 'Enter your OpenID:',
        url: null
    }
};
var providers_small = {
    livejournal: {
        name: 'LiveJournal',
	icon: 'http://livejournal.com/favicon.ico',
        label: 'Enter your Livejournal username:',
        url: 'http://{username}.livejournal.com/'
    },
    flickr: {
	name: 'Flickr',        
	icon: 'http://flickr.com/favicon.ico',
	label: 'Enter your Flickr username:',
	url: 'http://flickr.com/photos/{username}/'
    },
    wordpress: {
        name: 'Wordpress',
	icon: 'https://s2.wp.com/i/favicon.ico',
        label: 'Enter your Wordpress.com username:',
        url: 'http://{username}.wordpress.com/'
    },
    myopenid: {
        name: 'MyOpenID',
	icon: 'http://myopenid.com/favicon.ico',
        label: 'Enter your MyOpenID username:',
        url: 'http://{username}.myopenid.com/'
    },
    claimid: {
        name: 'ClaimID',
	icon: 'http://claimid.com/favicon.ico',
        label: 'Enter your ClaimID username:',
        url: 'http://claimid.com/{username}'
    },
    aol: {
        name: 'AOL',     
	icon: 'http://aol.com/favicon.ico',
        label: 'Enter your AOL username:',
        url: 'http://openid.aol.com/{username}'
    },
    verisign: {
        name: 'Verisign',
	icon: 'http://verisign.com/favicon.ico',
        label: 'Enter your Verisign username:',
        url: 'http://{username}.pip.verisignlabs.com/'
    }
};
var providers = $.extend({}, providers_large, providers_small);

var openid = {

	demo: false,
	ajaxHandler: null,
	cookie_expires: 6*30,	// 6 months.
	cookie_name: 'openid_provider',
	cookie_path: '/',
	
	img_path: 'images/',
	
	input_id: null,
	provider_url: null,
	provider_id: null,
	localsignin_id: null,
	
    init: function(input_id, localsignin_id) {
        
        var openid_btns = $('#openid_btns');
        
        this.input_id = input_id;
        
        $('#openid_choice').show();
        $('#openid_input_area').empty();
        
        // add box for each provider
        for (id in providers_large) {
           	openid_btns.append(this.getBoxHTML(providers_large[id], 'large'));
        }

        if (providers_small) {
        	openid_btns.append('<br/>');
        	
	        for (id in providers_small) {
	        
	           	openid_btns.append(this.getBoxHTML(providers_small[id], 'small'));
	        }
        }
	if (localsignin_id != "") {
		this.localsignin_id=localsignin_id;
           	openid_btns.append(
        		'<a href="javascript: openid.signin(\'localsignin\');"' +
        		' style="background: #FFF" ' +
        		'class="localsignin openid_small_btn">' +
			'<img alt="" width="16" height="16" src="favicon.ico" />' +
			' other' +
			'</a>'
		);
		$('#'+this.localsignin_id).hide();
	}
        
        $('#openid_form').submit(this.submit);
        
        var box_id = this.readCookie();
        if (box_id) {
        	this.signin(box_id, true);
        }
    },
    getBoxHTML: function(provider, box_size) {
	var label="";
	var title=""
	if (box_size == 'large') {
		label=' ' + provider["name"];
	}
	else {
		title=' title="'+provider["name"]+'"';
	}
        var box_id = provider["name"].toLowerCase();
        return '<a' + title +' href="javascript: openid.signin(\''+ box_id +'\');"' +
        		' style="background: #FFF" ' + 
        		'class="' + box_id + ' openid_' + box_size + '_btn">' +
			'<img alt="" width="16" height="16" src="' + provider["icon"] + '" />' +
			label +
			'</a>';
    
    },
    /* Provider image click */
    signin: function(box_id, onload) {

	if (box_id == 'localsignin') {
	    	this.highlight(box_id);
		$('#openid_input_area').empty();
		$('#'+this.localsignin_id).show();
		this.setCookie(box_id);
		return;
	}
	else {
		if (this.localsignin_id) {
			$('#'+this.localsignin_id).hide();
		}
	}

    	var provider = providers[box_id];
  		if (! provider) {
  			return;
  		}
		
		this.highlight(box_id);
		
		this.provider_id = box_id;
		this.provider_url = provider['url'];
		
		// prompt user for input?
		if (provider['label']) {
			this.setCookie(box_id);
			this.useInputBox(provider);
		} else {
			this.setCookie('');
			$('#openid_input_area').empty();
			if (! onload) {
				$('#openid_form').submit();
			}
		}
    },
    /* Sign-in button click */
    submit: function() {
        
    	var url = openid.provider_url; 
    	if (url) {
    		url = url.replace('{username}', $('#openid_username').val());
    		openid.setOpenIdUrl(url);
    	}
    	if(openid.ajaxHandler) {
    		openid.ajaxHandler(openid.provider_id, document.getElementById(openid.input_id).value);
    		return false;
    	}
    	if(openid.demo) {
    		alert("In client demo mode. Normally would have submitted OpenID:\r\n" + document.getElementById(openid.input_id).value);
    		return false;
    	}
    	return true;
    },
    setOpenIdUrl: function (url) {
    
	var hidden = $('#'+this.input_id);
	if (hidden.length > 0) {
		hidden.value = url;
    	} else {
		$('#openid_form').append('<input style="display:none" id="' + this.input_id + '" name="' + this.input_id + '" value="'+url+'"/>');
    	}
    },
    highlight: function (box_id) {
    	
    	// remove previous highlight.
    	var highlight = $('#openid_highlight');
    	if (highlight) {
    		highlight.replaceWith($('#openid_highlight a')[0]);
    	}
    	// add new highlight.
    	$('.'+box_id).wrap('<div id="openid_highlight"></div>');
    },
    setCookie: function (value) {
    
		var date = new Date();
		date.setTime(date.getTime()+(this.cookie_expires*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
		
		document.cookie = this.cookie_name+"="+value+expires+"; path=" + this.cookie_path;
    },
    readCookie: function () {
		var nameEQ = this.cookie_name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
    },
    useInputBox: function (provider) {
   	
		var input_area = $('#openid_input_area');
		
		var html = '';
		var id = 'openid_username';
		var value = '';
		var label = provider['label'];
		var style = '';
		
		if (provider['name'] == 'OpenID') {
			id = this.input_id;
			value = '';
			style = 'background:#FFF url(wikiicons/openidlogin-bg.gif) no-repeat scroll 0 50%; padding-left:18px;';
		}
		if (label) {
			html = '<label for="'+ id +'" class="block">' + label + '</label>';
		}
		html += '<input id="'+id+'" type="text" style="'+style+'" name="'+id+'" value="'+value+'" />' + 
					'<input id="openid_submit" type="submit" value="Login"/>';
		
		input_area.empty();
		input_area.append(html);

		$('#'+id).focus();
    },
    setDemoMode: function (demoMode) {
    	this.demo = demoMode;
    },
    setAjaxHandler: function (ajaxFunction) {
    	this.ajaxHandler = ajaxFunction;
    }
};
