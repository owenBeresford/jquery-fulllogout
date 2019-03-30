/*jslint white: true, browser: true, devel: true,  nomen: true, todo: true */
/**
 *  jquery-full-logout
 * 
 * Copyright (c) 2017 Owen Beresford, All rights reserved.
 * I have not signed a total rights contract, my employer isn't relevant.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * jquery-full-logout ~ a script to logout of all tabs/windows of a service, and close them if possible.
 *
 * @author: Owen beresford owenberesford@users.noreply.github.com
 * @version: 0.0.1
 * @date: 25/08/2017
 * @licence: AGPL <http://www.gnu.org/licenses/agpl-3.0.html> 
 * 
 * deps: 
 *  jQuery must already be loaded 
 *  requires window.postMessage 
 *
These are the options that are currently supported:
  ** debug ~ whether to write to console.log, or not.
  ** channel ~ A name used to ID the messages sent between tabs/ windows. DEFAULT: 'logout'.
                 Probably only important if this clashes with another system.
  ** domain ~ YOU MUST SET THIS. What URL your website is running from, including the port and SSL state. DEFAULT, which is useless: "".
                 Set to allow interoperation between different sections of the site optionally on different technologies.
  ** secret ~ A shared secret as a security feature. DEFAULT: "OnlyKnownToThisClass".
  ** defaultClose ~ Whether this lib should consider a window close event a logout request? DEFAULT: false
  ** callback ~ If there is extra functionality to execute on logout event, set it in this callback.  DEFAULT: null.

  ** type ~ 'fullLogout' internal only
*/

(function($){
	"use strict";

// add leading 0 to strings holding an int if needed.
	if(typeof pad !== 'function') {
        var pad=function(number) {
            var r = String(number);
            if ( r.length === 1 ) {
                r = '0' + r;
            }
            return r;
        }
	}


	/**
	 * fullLogout ~ jQuery style constructor 
	 * 
	 * @param DOMElement el
	 * @param array options ~ see doc header
	 * @access public
	 * @return <object>
	 */
	$.fullLogoutImpl = function(el, options) {
		if(! window.postMessage) {
			console.warn("FullLogout: postMessage is a required browser feature, which is absent here. Aborting.  Pls try upgrading to this decade.");
			return;
		}

		function BlockingLogout(el, options) {
			if(!options.domain) {
				console.warn("fullLogout: code will probably fail, you didn't set the domain option.");
			}
	        this.options = $.extend({}, $.fullLogoutImpl.defaultOptions, options);
// 			document.domain=""+options.domain;
			window.addEventListener(this.options.channel, this.eatEvent, false);
			if(this.options.defaultClose) {
				window.onbeforeunload = function (e) { // make this use jquery event-handlers?
					this.logout();
				}
			}

			if(this.options.debug) {
				console.log("fullLogout() Created an instance on window "+window.name+".");
			}
			return this; 
		}

		BlockingLogout.prototype.eatEvent=function (e) {
			if(e.origin !== this.options.domain) {
console.log("Have a random message ", e);
				return;			
			}
			if(typeof e.data == 'string') { // needed for MSIE, plubie Safari
				e.data=JSON.unpack(e.data);
			}
			// we depend on the domain & the secret.  This is meaningless if someone has read this source, and has access to your web-server.
			// but if they can do both of these , there are too many attack surfaces for this little library to be important.
			if(!e.data.secret || e.data.secret !== this.options.secret) {
				return;
			}
			if(e.data.logout) {
				if(this.options.callback) {
					this.options.callback();
				}
				try {
					window.close();
				} catch(ignored) {
				}
			}
		}

		BlockingLogout.prototype.logout=function() {
			let t={secret:this.options.secret, logout:"do it!" };
			window.postMessage(t, this.options.channel); 
		}

	    return new BlockingLogout(el, options);
	};


// pls see doc header 
	$.fullLogoutImpl.defaultOptions = {
		debug:0,
		type:'fullLogout',
		channel:'logout',
		domain:"",
		secret:"OnlyKnownToThisClasss",
		defaultClose:false,
		callback:null,
	};
	
	/**
	 * fullLogout ~ only makes sense for singular objects.
     * Should be applied to the entire document.
	 * 
	 * @param array options
	 * @access public
	 * @return void;
	 */ 
	$.fn.fullLogout = function(options) { 
		try {
			return $.fullLogoutImpl(this, options);

		} catch( $e) {
			console.log($e);
			console.log($e.stack);
		}
	};

}(jQuery));

