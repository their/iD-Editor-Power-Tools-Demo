function load() {
	var wa = new AllPages();
	switch (wa.helper__location()) {
		case 'openstreetmap':
			wa.openstreetmap(); //start
			break;
		default:
			return;
	}
}
function AllPages(obj_vars) {
}
AllPages.prototype.helper__location = function() {
	var h = document.location.href;
	if (h.indexOf('www.openstreetmap.org/id') != -1) {
		// openstreetmap
		return 'openstreetmap';
	}
}

/**
 * TASKS GO HERE 
 * 
 * - openstreetmap
 * -
 * -
 * -
 */
AllPages.prototype.openstreetmap = function() {
	
	// global scope vars
	var sb // localStorage vars
	var interval_images; // Interval for CSS images
	var o = {
		sb: [ // Sidebar search field. It is necessary to move this when "opening" tools menu.
		],
		iml_types: {
			brightness: 1, // 1 is ignore
			contrast: 1 //
		},
		hotkeys: {
		},
		hk_notes: 'NOTE: For hotkeys hold CTRL plus hotkey to activate (⌘ plus hotkey on Mac). An area must be selected for the hotkey to correctly work. To change an existing area using the hotkeys, the area must first be selected before running the hotkey.\nTest new line.',
		dv: {
			d1: null,
			d2: null
		},
		sidebar: document.getElementById('sidebar')
	}
	
	// init_ls_vars
	function init_ls_vars() {
		if (!localStorage[ 'extension_osm_vars2' ] || localStorage[ 'extension_osm_vars2' ] == 'false' || localStorage[ 'extension_osm_vars2' ] == 'undefined') {
			var x = {
				'm':{ char: 'm', enabled: true, tags: 'buildings=yes', exec_next: true, square: true }
			};
			localStorage[ 'extension_osm_vars2' ] = JSON.stringify(x);
		} else {
		}
		this.valid = function(e) { // return '' on success
			for (var i in e) {
				if 	(
					i.length != 1 || // char length
					!e[i].hasOwnProperty('char') ||
					!e[i].hasOwnProperty('enabled') ||
					!e[i].hasOwnProperty('tags') ||
					!e[i].hasOwnProperty('exec_next') ||
					typeof e[i].char != 'string' ||
					typeof e[i].tags != 'string' ||
					typeof e[i].enabled != 'boolean' ||
					typeof e[i].exec_next != 'boolean' ||
					typeof e[i].square != 'boolean' ||
					e[i].char.length != 1 ||
					e[i].tags.length == 0
					)
				{
					delete e[i];
					continue;
				}
				// Check tags
				var v = e[i].tags;
				v = v.split('\n');
				for (var i in v) {
					var eq = v[i].match(/=/g);
					if (eq == null || eq.length != 1) { // not 1
						delete e[i];
						break;
					}
					var j = v[i].split('=');
					if (j[0].indexOf(' ') != -1) { // key contains ' '
						delete e[i];
						break;
					}
					if (j[0].length > 255) { // key > 255
						delete e[i];
						break;
					}
					if (j[1].length > 255) { // value > 255
						delete e[i];
						break;
					}
					if (j[0].trim().length == 0) {
						delete e[i];
						break;
					}
					if (j[1].trim().length == 0) {
						delete e[i];
						break;
					}
				}
			}
			return e;
		}
		o.hotkeys = this.valid(JSON.parse( localStorage[ 'extension_osm_vars2' ] ));
		// Update
		localStorage[ 'extension_osm_vars2' ] = JSON.stringify(o.hotkeys);
	}
	/**
	 * function tools_menu_init
	 * 
	 * Add a Tools section
	 */
	function tools_menu_init() {
		
		// Sidebar display elements.
		var x = document.getElementById('sidebar');
		x = x.getElementsByClassName('search-header')[0];
		x = x.getElementsByTagName('input')[0];
		o.sb.push(x);
		var x = document.getElementById('sidebar');
		x = x.getElementsByClassName('search-header')[0];
		x = x.getElementsByClassName('icon')[0];
		o.sb.push(x);
		
		// Init localStorage vars
		init_ls_vars();
		
		// Div container
		o.dv.d1 = document.createElement('div');
		o.dv.d1.setAttribute('style','border-bottom:1px solid #a2a2a2;');
		sidebar.insertBefore(o.dv.d1, sidebar.firstChild); // Append
		// Open / close button
		o.dv.d2 = document.createElement('div'); // "button" causes bad CSS.
		o.dv.d2.setAttribute('style','width:100%;height:20px;text-align:center;cursor:pointer;font-family:courier;border:1px solid #a2a2a2;background-color:white;');
		o.dv.d2.innerText = 'TOOLS'; //(a;b;c;)
		o.dv.d2.is_open = false;
		o.dv.d1.appendChild(o.dv.d2);
		o.dv.d2.addEventListener('click', function(e) {
			console.log(this.is_open);
			if (!this.is_open) {
				this.style.border = '2px solid #a2a2a2;';
				d1b.style.display = 'block';
				this.is_open = true;
				o.sb[1].style.top = '480px';
				o.sb[0].style.top = '460px';
				document.getElementsByClassName('inspector-body')[0].style.top = '520px';
			} else {
				this.style.border = '1px solid #a2a2a2;';
				d1b.style.display = 'none';
				this.is_open = false;
				o.sb[1].style.top = '80px';
				o.sb[0].style.top = '60px';
				document.getElementsByClassName('inspector-body')[0].style.top = '120px';
			}
		}, false);
		// Vars container
		var d1b = document.createElement('div');
		d1b.setAttribute('style','border-bottom:1px solid #a2a2a2;display:none;padding:4px 8px;');
		o.dv.d1.appendChild(d1b);
		
		// Add note
		d1b.appendChild(document.createTextNode(o.hk_notes));
		d1b.appendChild(document.createElement('br'));
		
		// Add hotkeys
		add_hotkeys(d1b);
		
		// Image levels
		for (var type in o.iml_types) {
			var value = o.iml_types[ type ];
			var a = document.createElement('label');
			a.htmlFor = 'slider-'+type;
			a.innerText = type+'('+value+'):';
			d1b.appendChild(a);
			var x = document.createElement('input');
			x.label = a; // Set a.input
			x.id = 'slider-'+type;
			x.iml_type = type;
			x.setAttribute('style', 'float:right;');
			x.setAttribute('type', 'range');
			x.setAttribute('defaultValue', 1);
			x.setAttribute('max', 3);
			x.setAttribute('min', 0);
			x.setAttribute('step', 0.2);
			x.addEventListener('change', function(e) {
				this.label.innerText = this.iml_type + '('+this.value+')'; // Update label
				o.iml_types[ this.iml_type ] = this.value;
				init_sliders(); // Re-init
				// If constant
				//~ init_ls_vars(); // Write change
				//~ o.iml_types[ this.iml_type ] = this.value;
				//~ localStorage[ 'extension_osm_vars2' ] = JSON.stringify(ls_vars); // Update
				//~ init_sliders(); // Re-init
			}, false);
			d1b.appendChild(x);
			x.setAttribute('value', value); // Set value
			// br
			var br = document.createElement('br');
			br.setAttribute('style', 'clear:both;');
			d1b.appendChild(br);
		}
		init_sliders(); // Init
	}
	/**
	 * hk_li
	 * 
	 * e.g. 'm':{ char: 'm', enabled: true, tags: 'buildings=yes', exec_next: true, square: true }
	 */
	var hk_li = function(hotkey, parent_ul) {
		
		hotkey = (hotkey) ? hotkey : {
			char: '',
			enabled: true,
			tags: '',
			exec_next: true,
			square: true
		};
		var rand = Math.random();
		
		function deleteRow() {
			delete o.hotkeys[ this.char ];
			this.parent_ul.render();
		}
		function inpblur() {
			var li = this.li,
				k = li.input_key,
				v = li.input_value,
				p = li.parent_ul;

			k.value = k.value.trim();
			v.value = v.value.trim();
			v.style.height = '31px';
			v.style.position = 'inherit';
			v.style.width = '100%';
			
			k.value = k.value.charAt(0);
			var vl = p.validate(li);
			if (vl == '') {
				o.hotkeys[ k.value ] = li.obj();
				p.render(); // Render
			} else {console.log(vl);
				li.div_notice.style.maxHeight = '100px';
				li.div_notice.style.opacity = '1';
				li.div_notice.innerText = vl;
			}
		}
		function keyfocus() {
			this.style.position = 'absolute';
			this.style.height = '160px';
			this.style.width = '30%';
		}
		function hk_keyup(e) {
			this.value = this.value.toUpperCase();
		}
		
		var l = document.createElement('li'); // LI
		l.className = 'tag-row cf';
		l.hotkey = hotkey;
		l.char = hotkey.char;
		l.parent_ul = parent_ul;
		
		var d = document.createElement('div'); // DIV
		d.className = 'key-wrap';
		d.setAttribute('style','width: 8%;');
		l.appendChild(d);
		var i = document.createElement('input'); // INPUT
		i.setAttribute('style','padding-left: 10px; border: 1px solid #CCC; width:100%;');
		i.className = 'key combobox-input';
		i.maxLength = 1;
		i.value = hotkey.char;
		i.onblur = inpblur;
		i.onkeyup = hk_keyup;
		i.placeholder = 'key';
		i.li = l;
		l.input_key = i;
		d.appendChild(i);
		
		var d = document.createElement('div'); // DIV
		d.className = 'input-wrap-position';
		d.setAttribute('style','width: 30%;');
		l.appendChild(d);
		var i = document.createElement('textarea'); // INPUT
		i.className = 'value combobox-input';
		i.setAttribute('style',
			'border-radius: 0;border: 1px solid #CCC; padding:5px 10px;'+
			'border-width:1px; height:31px; resize:none; overflow:hidden; position:inherit; width:100%; z-index:100;'
		);
		i.value = hotkey.tags;
		i.onblur = inpblur;
		i.onfocus = keyfocus;
		i.placeholder = 'tags';
		i.li = l;
		l.input_value = i;
		d.appendChild(i);
		
		var d = document.createElement('div'); // DIV
		d.className = 'input-wrap-position';
		d.setAttribute('style','width:14%; height:31px; border:1px solid #CCC; padding:0; line-height:1.2em; text-align:center; background-color:#fff;');
		l.appendChild(d);
		var v = document.createElement('label'); // LABEL
		v.setAttribute('style','cursor:pointer;');
		v.htmlFor = 'extcb1'+rand;
		v.innerText = 'Area';
		d.appendChild(v);
		d.appendChild(document.createElement('br')); // BR
		var b = document.createElement('input'); // CHECKBOX
		b.setAttribute('style','height:initial; margin:0; margin-left:35%;');
		b.type = 'checkbox';
		b.checked = hotkey.exec_next;
		b.onclick = inpblur;
		b.id = 'extcb1'+rand;
		l.exec_next = b;
		b.li = l;
		d.appendChild(b);
		
		var d = document.createElement('div'); // DIV
		d.className = 'input-wrap-position';
		d.setAttribute('style','width:14%; height:31px; border:1px solid #CCC; padding:0; line-height:1.2em; text-align:center; background-color:#fff;');
		l.appendChild(d);
		var v = document.createElement('label'); // LABEL
		v.setAttribute('style','cursor:pointer;');
		v.htmlFor = 'extcb2'+rand;
		v.innerText = 'Enable';
		d.appendChild(v);
		d.appendChild(document.createElement('br')); // BR
		var b = document.createElement('input'); // CHECKBOX
		b.setAttribute('style','height:initial; margin:0; margin-left:35%;');
		b.type = 'checkbox';
		b.checked = hotkey.enabled;
		b.onclick = inpblur;
		b.id = 'extcb2'+rand;
		l.isEnabled = b;
		b.li = l;
		d.appendChild(b);
		
		var d = document.createElement('div'); // DIV
		d.className = 'input-wrap-position';
		d.setAttribute('style','width:14%; height:31px; border:1px solid #CCC; padding:0; line-height:1.2em; text-align:center; background-color:#fff;');
		l.appendChild(d);
		var v = document.createElement('label'); // LABEL
		v.setAttribute('style','cursor:pointer;');
		v.htmlFor = 'extcb3'+rand;
		v.innerText = 'Square';
		d.appendChild(v);
		d.appendChild(document.createElement('br')); // BR
		var b = document.createElement('input'); // CHECKBOX
		b.setAttribute('style','height:initial; margin:0; margin-left:35%;');
		b.type = 'checkbox';
		b.checked = hotkey.square;
		b.onclick = inpblur;
		b.id = 'extcb3'+rand;
		l.isSquare = b;
		b.li = l;
		d.appendChild(b);
		
		var b = document.createElement('button'); // BTN
		b.className = 'remove minor';
		b.setAttribute('style','border-top-width:1px;');
		var s = document.createElement('span'); // SPAN
		s.className = 'icon delete';
		b.appendChild(s);
		b.char = hotkey.char;
		b.parent_ul = parent_ul;
		b.onclick = deleteRow;
		l.appendChild(b);
		
		var d = document.createElement('div'); // DIV // NOTICE
		d.className = 'tag-reference-body cf';
		d.setAttribute('style', 'max-height: 0px; opacity: 0; background-color: #cedfdf; border: 1px solid #dc0cca; width: 90%;');
		l.div_notice = d;
		l.appendChild(d);
		
		// function to return object
		l.obj = function() {
			var k = this.input_key,
				v = this.input_value;
			return {
				char: k.value,
				enabled: this.isEnabled.checked,
				tags: v.value,
				exec_next: this.exec_next.checked,
				square: this.isSquare.checked
			};
		}
		
		return l;
	}
	/**
	 * function add_hotkeys
	 */
	function add_hotkeys(parent) {
		var c = document.createElement('ul');
		c.className = 'tag-list';
		parent.appendChild(c);
		
		// Sort keys
		c.sortKeys = function() {
			var keys = Object.keys(o.hotkeys),
				sorted = {};
			keys.sort();
			for (var i=0; i<keys.length; i++)
			{
				var k = keys[i];
				sorted[ k ] = o.hotkeys[ k ];
			}
			o.hotkeys = sorted;
		}
		c.render = function() {
			this.sortKeys(); // Sort
			// Clear
			this.innerHTML = ''; // `this` is UL
			var li;
			// Loop add LIs
			for (var char in o.hotkeys) {
				var obj = o.hotkeys[ char ];
				li = new hk_li(obj, this);
				this.appendChild(li);
			}
			if (li)
				li.focus();
			this.save();
		}
		c.save = function() {
			// Remove
			var x = this.getElementsByTagName('li');
			for (var i = x.length-1; i>=0 ; i--) {
				var li = x[i];
				if (this.validate(li) != '') {
					this.removeChild(x[i]);
				}
			}
			o.hotkeys = {};
			// Save
			var x = this.getElementsByTagName('li');
			for (var i = x.length-1; i>=0 ; i--) {
				var li = x[i];
				var hk = li.obj();
				o.hotkeys[ hk.char ] = hk;
			}
			this.ls(); // localStorage
			// Add preset list to page
			p_init_preset();
			// Add keypress to page
			p_init_hotkeys();
		}
		c.ls = function() {
			// Update
			localStorage[ 'extension_osm_vars2' ] = JSON.stringify(o.hotkeys);
			// Insert to page here
			
		}
		c.validate = function(li) {
			var v = li.input_value,
				k = li.input_key,
				p = li.parent_ul;
			if (k.value == '') {
				if (li.char != '' && o.hotkeys.hasOwnProperty(li.char))
					delete o.hotkeys[ li.char ];
				p.render();
				return;
			}
			if (v.value == '') return ''; //'Tag is empty!';
			v = v.value.trim().split('\n');
			for (var i in v) {
				var eq = v[i].match(/=/g);
				if (eq == null) {
					return 'One or more tags entered do not contain the "=" symbol!';
				}
				if (eq.length != 1) {
					return 'One or more tags entered contain more than one "=" symbol!';
				}
				var j = v[i].split('=');
				if (j[0].indexOf(' ') != -1) {
					return 'One or more tag keys entered contain a space character!'
				}
				if (j[0].length > 255) {
					return 'One or more tag keys entered have a length greater than 255 characters!'
				}
				if (j[1].length > 255) {
					return 'One or more tags entered have a length greater than 255 characters!'
				}
				if (j[0].trim().length == 0) {
					return 'One or more tag keys entered have a length equal to 0 characters!'
				}
				if (j[1].trim().length == 0) {
					return 'One or more tags entered have a length equal to 0 characters!'
				}
			}
			return '';
		}
		c.emptyRows = function() {
			var rows = this.getElementsByTagName('li');
			for (var i = rows.length-1; i>0; i--) {
				var row = rows[i];
				if (row.input_key.value.trim() == '' && row.input_value.value.trim() == '') {
					this.deleteRow(row);
				}
			}
		}
		c.deleteRow = function(row) {
			delete o.hotkeys[ row.char ];
			parent_ul.render();
		}
		c.addRow = function() {
			var p = this.parent_ul;
			p.emptyRows();
			var li = new hk_li(false, p);
			p.appendChild(li);
			li.input_key.focus();
		}
		// Render
		c.render();
		
		// Add btn
		var b = document.createElement('button'); // BTN
		b.className = 'add-tag';
		b.setAttribute('style','width:40%; height:30px; background-color:rgba(0,0,0,0.5); margin-top:-8px;');
		var s = document.createElement('span'); // SPAN
		s.className = 'icon plus light';
		b.appendChild(s);
		b.parent_ul = c;
		b.onclick = c.addRow;
		parent.appendChild(b);
		var b = document.createElement('div'); // DIV CLEAR
		b.className = 'tag-reference-body cf';
		b.setAttribute('style','max-height:0; opacity:0;');
		parent.appendChild(b);
	}
	// init_slider
	function init_sliders() {
		clearInterval(interval_images); // Clear by default.
		apply_img_filters(); // Call once to update or begin
		for (var type in o.iml_types) {
			if (o.iml_types[ type ] != 1) {
				interval_images = setInterval(apply_img_filters, 1000);
				break;
			}
		}
	}
	// apply_img_filters
	function apply_img_filters() {
		var filter = '';
		for (var type in o.iml_types) {
			var value = o.iml_types[ type ];
			filter += type+'('+value+') '; // e.g. "brightness(2) contrast(1)"
		}
		filter = filter.trim();
		var images = document.getElementsByClassName('tile tile-loaded');
		for (var i in images) {
			if (i == 'length') break;
			images[ i ].style["-webkit-filter"] = filter;
		}
	}
	function orth() {
		// GET SELECTED IDS
		var sel = id.selectedIDs(); // Array, e.g. ["w-1"] or ["w-6"]
		// ORTHO
		var a = new iD.operations.Orthogonalize(sel, id); // e.g. Orthogonalize(['w-1'],id);
		a(); // Execute this function.
	}
	function js_append(func, values) {
		// ...
		var code = '(' + func + ')('+values+');'
		var script = document.createElement('script');
		script.textContent = code;
		(document.head||document.documentElement).appendChild(script);
		script.parentNode.removeChild(script);
	}
	// Add preset + values
	// Pass array
	function p_init_preset() {
		
	}
	// Add hotkeys
	// 
	function p_init_hotkeys() {
		js_append(page__hotkeys, JSON.stringify(o.hotkeys));
	}
	
	// Preset
	function page__preset(hotkeys) {
		
	}
	// e.g. new iD.actions.ChangeTags('w-1', {'building':'yes'})(id.graph()) ;
	function page__hotkeys(hotkeys_obj) {
		
		var context = id;
		
		function bToolChangeTags_valid(e) {
			for (var i in e) {
				if 	(
					i.length != 1 || // char length
					!e[i].hasOwnProperty('char') ||
					!e[i].hasOwnProperty('enabled') ||
					!e[i].hasOwnProperty('tags') ||
					!e[i].hasOwnProperty('exec_next') ||
					typeof e[i].char != 'string' ||
					typeof e[i].tags != 'string' ||
					typeof e[i].enabled != 'boolean' ||
					typeof e[i].exec_next != 'boolean' ||
					typeof e[i].square != 'boolean' ||
					e[i].char.length != 1 ||
					e[i].tags.length == 0
					)
				{
					delete e[i];
					continue;
				}
				// Check tags
				var v = e[i].tags;
				v = v.split('\n');
				for (var i in v) {
					var eq = v[i].match(/=/g);
					if (eq == null || eq.length != 1) { // not 1
						delete e[i];
						break;
					}
					var j = v[i].split('=');
					if (j[0].indexOf(' ') != -1) { // key contains ' '
						delete e[i];
						break;
					}
					if (j[0].length > 255) { // key > 255
						delete e[i];
						break;
					}
					if (j[1].length > 255) { // value > 255
						delete e[i];
						break;
					}
					if (j[0].trim().length == 0) {
						delete e[i];
						break;
					}
					if (j[1].trim().length == 0) {
						delete e[i];
						break;
					}
				}
			}
			return e;
		}
		
		// e.g. 'm':{ char: 'm', enabled: true, tags: 'buildings=yes', exec_next: true, square: true }
		function bToolChangeTags() {
			// console.log(this); // e.g. Object {event: Object, capture: undefined, callback: function}
			
			if (!this.event.ctrlKey) return; // Must be CTRL.
			
			var char = String.fromCharCode(this.event.keyCode); console.log(char);
			
			var hk_obj = id.id_browser_tool_hotkeys;
			if (!hk_obj.hasOwnProperty( char )) {
				return;
			}
			hk_obj = hk_obj[ char ]; console.log(hk_obj);
			
			var removeTags = ['area','natural','landuse'];
			var actions = [];
			var addTags = {}; // e.g. { building: 'yes' };
			var tmptags = hk_obj.tags.split('\n');
			
			// Set addTags
			for (var i in tmptags) {
				var tag = tmptags[i].split('=');
				addTags[ tag[0] ] = tag[1];
			}
			
			var entities =
				_.filter(
					_.map(
						context.selectedIDs(),
						context.entity
					),
					function(entity) {
						return entity.geometry(context.graph()) === 'area';
					}
				);
			_.each(
				entities,
				function(entity) {
					var newTags = addTags;
					actions.push(
						iD.actions.ChangeTags(
							entity.id,
							newTags
						)
					);
					//~ var newTags =
						//~ _.omit(
							//~ _.merge(_.clone(entity.tags), addTags),
							//~ removeTags
						//~ );
					//~ actions.push(
						//~ iD.actions.ChangeTags(
							//~ entity.id,
							//~ newTags
						//~ )
					//~ );
				}
			);
			if (actions.length) {
				actions.push(
					t('operations.change_tags.annotation')
				);
				context.perform.apply(
					context,
					actions
				)
			}
		}
		
		// Check obj
		hotkeys_obj = bToolChangeTags_valid(hotkeys_obj); console.log(hotkeys_obj);
		
		// Set id_browser_tool_hotkeys.hotkeys_obj
		// object, Latest set of hotkeys
		context.id_browser_tool_hotkeys = hotkeys_obj;
		
		// Reset any indices, up to 200.
		// Assuming users will not have more than 200 unique keys bound.
		for (var i=0; i<200; i++) {
			var kb =
				d3.
				keybinding('osm_browser_tool_tags' + i); // keybinding( INDEX )
			d3.select(document).call(kb);
		}
		
		// Add new ones
		var c = 0;
		for (var hk in hotkeys_obj) {
			var kb =
				d3.
				keybinding('osm_browser_tool_tags' + c). // keybinding( INDEX )
				on(
					iD.ui.cmd('⌘' + hk),
					bToolChangeTags
				)
			d3.select(document).call(kb);
			c++;
		}
	}
	
	// Init
	tools_menu_init();
}

/**
 * RUN DOCUMENT
 *
 * 
 * 
 * 
 * 
 * 
 *  
**/
var ih;
if (document.readyState == "complete" || document.readyState == "interactive") {
	ih = document.body.innerHTML;
	load();
}
else {
	document.onreadystatechange = function () {
		if (document.readyState == "complete" || document.readyState == "interactive") {
			ih = document.body.innerHTML;
			load();
		}
	}
}
