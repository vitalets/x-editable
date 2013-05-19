/**
* The [source for the plugin](http://github.com/cmlenz/jquery-iframe-transport)
* is available on [Github](http://github.com/) and dual licensed under the MIT
* or GPL Version 2 licenses.
*/

(function($, undefined) {
  "use strict";

	// Register a prefilter that checks whether the `iframe` option is set, and
	// switches to the "iframe" data type if it is `true`.
	$.ajaxPrefilter(function(options, origOptions, jqXHR) {
		if (options.iframe) {
			return "iframe";
		}
	});

	// Register a transport for the "iframe" data type. It will only activate
	// when the "files" option has been set to a non-empty list of enabled file
	// inputs.
	$.ajaxTransport("iframe", function(options, origOptions, jqXHR) {
		var form = null,
		iframe = null,
		name = "iframe-" + $.now(),
		files = $(options.files).filter(":file:enabled"),
		plus = /\+/g,
		markers = null;

		// This function gets called after a successful submission or an abortion
		// and should revert all changes made to the page to enable the
		// submission via this transport.
		function cleanUp() {
			markers.replaceWith(function(idx) {
				return files.get(idx);
			});
			form.remove();
			iframe.attr("src", "javascript:false;").remove();
		}

		// Remove "iframe" from the data types list so that further processing is
		// based on the content type returned by the server, without attempting an
		// (unsupported) conversion from "iframe" to the actual type.
		options.dataTypes.shift();

		if (files.length) {
			form = $("<form enctype='multipart/form-data' method='post'></form>").
			hide().attr({action: options.url, target: name});

			// If there is any additional data specified via the `data` option,
			// we add it as hidden fields to the form. This (currently) requires
			// the `processData` option to be set to false so that the data doesn't
			// get serialized to a string.
			//			if (typeof(options.data) === "string" && options.data.length > 0) {
			//				$.error("data must not be serialized");
			//			}

			//Error above no longer necessary. We let ajax do processData to get the query string
			//and then parse the nice flat query string to create the hidden inputs
			//Has the advantage of handling php style array names name="something[blue]" name="something[red]"
		$.each( options.data.split('&') || {}, function(name, value) {
			var tuple = value.split('=');
			$("<input type='hidden' />").attr({name:  decodeURIComponent(tuple[0].replace(plus,' ')), value: decodeURIComponent(tuple[1].replace(plus, ' ')) }).
			appendTo(form);
		});

		// Add a hidden `X-Requested-With` field with the value `IFrame` to the
		// field, to help server-side code to determine that the upload happened
		// through this transport.
		$("<input type='hidden' value='IFrame' name='X-Requested-With' />").
		appendTo(form);

		// Move the file fields into the hidden form, but first remember their
		// original locations in the document by replacing them with disabled
		// clones. This should also avoid introducing unwanted changes to the
		// page layout during submission.
		markers = files.after(function(idx) {
			return $(this).clone().prop("disabled", true);
		}).next();
		files.appendTo(form);

		return {

			// The `send` function is called by jQuery when the request should be
			// sent.
			send: function(headers, completeCallback) {
				iframe = $("<iframe src='javascript:false;' name='" + name +
				"' id='" + name + "' style='display:none'></iframe>");

				// The first load event gets fired after the iframe has been injected
				// into the DOM, and is used to prepare the actual submission.
				iframe.bind("load", function() {

					// The second load event gets fired when the response to the form
					// submission is received. The implementation detects whether the
					// actual payload is embedded in a `<textarea>` element, and
					// prepares the required conversions to be made in that case.
					iframe.unbind("load").bind("load", function() {
						var doc = this.contentWindow ? this.contentWindow.document :
						(this.contentDocument ? this.contentDocument : this.document),
						root = doc.documentElement ? doc.documentElement : doc.body,
						textarea = root.getElementsByTagName("textarea")[0],
						type = textarea && textarea.getAttribute("data-type") || null,
						status = textarea && textarea.getAttribute("data-status") || 200,
						statusText = textarea && textarea.getAttribute("data-statusText") || "OK",
						content = {
							html: root.innerHTML,
							text: type ?
							textarea.value :
							root ? (root.textContent || root.innerText) : null
						};
						cleanUp();
						completeCallback(status, statusText, content, type ?
						("Content-Type: " + type) :
						null);
					});

					// Now that the load handler has been set up, submit the form.
					form[0].submit();
				});

				// After everything has been set up correctly, the form and iframe
				// get injected into the DOM so that the submission can be
				// initiated.
				$("body").append(form, iframe);
			},

			// The `abort` function is called by jQuery when the request should be
			// aborted.
			abort: function() {
				if (iframe !== null) {
					iframe.unbind("load").attr("src", "javascript:false;");
					cleanUp();
				}
			}
		};
	}
});

})(jQuery);

/**
File editable input.

@class file
@extends abstractinput
@experimental
@example
<a href="#" id="file" data-type="file" data-pk="1">awesome</a>
 
 *Note that on the server side the json return needs to be returned in a <textarea> element 
 in order to handle HTML dataType, status and .statusText. 
 See http://github.com/cmlenz/jquery-iframe-transport for details.

<script>
$(function(){
$('#file').editable({
url: '/post',
title: 'Enter file, caption and url #',
});
});
</script>
**/
(function ($) {

	var File = function (options) {
		this.init('file', options, File.defaults);
	};

	//inherit from Abstract input
	$.fn.editableutils.inherit(File, $.fn.editabletypes.abstractinput);

	$.extend(File.prototype, {
		/**
		Renders input from tpl

		@method render()
		**/
		render: function() {
			this.$input = this.$tpl.find('input');

			this.$input.filter('[name="file"]').bind('change focus click', function() {
				var $this = $(this),
				newVal = $this.val().split('\\').pop(),
				$button = $this.siblings('button');
				if(newVal !== '') {
					$button.text(newVal);
				}
			});

		},

		/**
		Default method to show value in element. Can be overwritten by display option.

		@method value2html(value, element)
		**/
		value2html: function(value, element) {
			if(!value) {
				$(element).empty();
				return;
			}

			//@TODO Not sure what to return here since you can't set value of type=file
			//For images I would construct and image elemnt and link
			var html = '';
			$(element).html(html);
		},

		/**
		Gets value from element's html

		@method html2value(html)
		**/
		html2value: function(html) {
			/*
			you may write parsing method to get value by element's html
			*/
			return null;
		},

		/**
		Converts value to string.
		It is used in internal comparing (not for sending to server).

		@method value2str(value)
		**/
		value2str: function(value) {
			var str = '';
			if(value) {
				for(var k in value) {
					str = str + k + ':' + value[k] + ';';
				}
			}
			return str;
		},

		/*
		Converts string to value. Used for reading value from 'data-value' attribute.

		@method str2value(str)
		*/
		str2value: function(str) {
			/*
			this is mainly for parsing value defined in data-value attribute.
			If you will always set value by javascript, no need to overwrite it
			*/
			return str;
		},

		/**
		Sets value of input.

		@method value2input(value)
		@param {mixed} value
		**/
		value2input: function(value) {
			if(!value) {
				return;
			}
			this.$input.filter('[name="file"]').val(value.file);
			this.$input.filter('[name="caption"]').val(value.caption);
			this.$input.filter('[name="url"]').val(value.url);
		},

		/**
		Returns value of input.

		@method input2value()
		**/
		input2value: function() {
			return {
				file: this.$input.filter('[name="file"]').val(),
			};
		},

		/**
		Activates input: sets focus on the first field.

		@method activate()
		**/
		activate: function() {

			//Set file specific option and success callback to load new file reference
			//Hard to know if the file is remote so just force the send
			$(this.options.scope).editable('option', 'savenochange', true );
			//iframe transport specific ajaxOptions.
			$(this.options.scope).editable('option', 'ajaxOptions', {
				dataType: 'json',
				iframe: true,
				files: this.$input.filter('[name="file"]')
			});

			this.$input.filter('[name="file"]').focus();
		},

		/**
		Attaches handler to submit form in case of 'showbuttons=false' mode

		@method autosubmit()
		**/
		autosubmit: function() {
			this.$input.keydown(function (e) {
				if (e.which === 13) {
					$(this).closest('form').submit();
				}
			});
		}
	});

File.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
	tpl: '<div class="editable-file">' +
	'<span style="position:relative; display: inline-block; overflow: hidden; cursor: pointer;">' +
	'<input type="file" name="file" class="input-small" size="1" style="opacity: 0;filter: alpha(opacity=0); cursor: pointer; font-size: 400%; height: 600%; position: absolute; top: 0; right: 0; width: 240%" />' +
	'<button type="button" style="cursor: pointer; display: inline-block; margin-right: 5px;  ">Chose file</button>' +
	'</span></div>',
	
	inputclass: '',
	
	}
});
