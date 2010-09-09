/**
 * jQuery Form repeater
 * Version 0.5 - 09/09/2010
 * @author Michaël Rigart 
 *
 * This package is distributed under the AGPL license.
 *
 *
 *
 **/


(function($){  
	$.fn.repeater = function(options, values) {
		      
		var defaults = {
		    ID: 0,
		    count: 0,
			prefix: options.prefix || 'row_id',
		    afterAdd: options.afterAdd || function () {},
		    afterDelete: options.afterDelete || function () {},
		    removeClass: options.removeClass || 'delete',
		    repeatingClass: options.repeatingClass || 'repeating',
		    addClass: options.addClass || 'add',
		    upClass: options.upClass || 'up',
		    downClass: options.downClass || 'down',
		    positionClass: options.positionId || 'position',
		    minRows: options.minRows || 0,
		    maxRows: options.maxRows || -1,
		    str: options.str || false,
		    deletesContainer: (options.deletesContainer != undefined)? options.deletesContainer : true		
		}
		
		
		var settings = $.extend(defaults);
		var values = $.extend(values);
		
		// loop all elements
		return this.each(function() {
			
	        /**
	         * retrieve the dom element that holds data like link and model name
	         * retrieve the dom element that needs duplication
	         */ 
	        var block = $(this);
	        var container = block.find('.' + settings.repeatingClass +':first');
	        settings.entry = container.find('tr:first');

	        // verwijder de dummy
	        settings.entry.remove();	

	        // voeg de listener toe om elementen toe te voegen
	        if(options.addClass){
	        	block.find('.' + settings.addClass + ':first').bind('click', function(evt) { 
	    			evt.preventDefault();
	            	evt.stopPropagation();
	                add();
	                            			
	        	});
	        }
	        
			if(values[block.attr('id')]){
				for (var i = 0; i < values[block.attr('id')].length; i++) {
					add(values[block.attr('id')][i]);
				}
			}
			
			function add(options) {
		        if (settings.maxRows != -1 && settings.maxRows <= settings.count) {
		            return;
		        }
		        
		        // Bepalen row id
		        var rowId = settings.ID++;
		        settings.count++;

		        // voorbereiden van entry. hiervoor klonen we de dummy
		        var entry = settings.entry.clone(true);
		        

		        // Vervang de prefix in alle id's en namen
		        entry.id = entry.attr('id').replace("#{" + settings.prefix + "}", rowId);
		        
		        entry.find('*').each(function(){
		        	var element = $(this);
		        	
		            if (element.attr('id')) {
		                element.id = element.attr('id').replace("#{" + settings.prefix + "}", rowId);
		            }
		            if (element.attr('name')) {
		                element.attr('name', element.attr('name').replace("#{" + settings.prefix + "}", rowId));
		            }
		            if (element.attr('for')) {
		                element.attr('for', element.attr('for').replace("#{" + settings.prefix + "}", rowId));
		            }
		            element.className = element.attr('class').replace("#{" + settings.prefix + "}", rowId);        	
		        });
		        
		        
		        // zet de positie. Handig als ge lijsten  wil hebben dat geordend moeten worden
		        entry.find('.' + settings.positionClass + ':first').val(rowId);

		        // Maak de delete functionaliteit
		        entry.find('.' + settings.removeClass + ':first').bind('click', function(evt){ 
		        	evt.preventDefault();
		        	evt.stopPropagation();

	                if (settings.count > settings.minRows) {
	                    if(settings.deletesContainer){
	                        entry.remove();
	                        settings.count--;
	                        settings.afterDelete(rowId);
	                    }else{
	                        $.each(entry.find(".delete"), function(index, input){ $(input).val(1) });
	                        entry.hide();
	                    }
	                }		        	
		        });
		        
		        // up node
		        entry.find('.' + settings.upClass + ':first').bind('click', function(evt){ 
	        		var prev = entry.prev();

	        		if (prev.get(0)) {
	        			entry.get(0).parentNode.removeChild(entry.get(0));
	        			prev.get(0).parentNode.insertBefore(entry.get(0), prev.get(0));

	        			var prevId = -1;
	        			var nextId = -1;

	        			prevId = prev.find('.' + settings.positionClass + ':first').val();

	        			var element = entry.find('.' + settings.positionClass + ':first');
	        			nextId = element.val();
	        			element.val(prevId);

	        			prev.find('.' + settings.positionClass + ':first').val(nextId);
	        		}		        	
		        });
		        
		        // down node
		        entry.find('.' + settings.downClass + ':first').bind('click', function(evt){ 
	                var next = entry.next();

	                if (next.get(0)) {
	                    next.get(0).parentNode.removeChild(next.get(0));
	                    entry.get(0).parentNode.insertBefore(next.get(0), entry.get(0));

	                    var prevId = -1;
	                    var nextId = -1;

	                    nextId = next.find('.' + settings.positionClass + ':first').val();

	                    var element = entry.find('.' + settings.positionClass + ':first');
	                    prevId = element.val();
	                    element.val(nextId);

	                    next.find('.' + settings.positionClass + ':first').val(prevId);
	                }
		        });		        
  
		        
		        // Values zetten indien mogelijk
		        if(options) {
		        	entry.find('.attr').each(function(){
		        		var element = $(this);
		                var attr = element.attr('name').substring(element.attr('name').lastIndexOf('[') + 1, element.attr('name').length - 1);
		              
		                switch(this.tagName){
		                    case "INPUT":
		                        switch(this.type){
		                            case "text":
		                            case "hidden":
		                                if (element.attr('name')) {
		                                	element.val(options[attr]);
		                                }
		                            break;
		                            case "checkbox":
		                                if(element.attr('name')){
		                                	element.checked = options[attr];
		                                }
		                            break;
		                        }
		                    case "SELECT":
		                        if (element.attr('name')){
		                            var select_options = element.children();
		                            var len = select_options.length;
		                            for (var i = 0; i < len; i++) {     
		                                if(select_options[i].value == options[attr]){
		                                    select_options[i].selected = true;
		                                }
		                            }
		                        }
		                    break;
		                    case "IMG":
		                        if (element.attr('name')){
		                            input.src = options[attr];
		                        }
		                    break;
		                    case "SPAN":
		                        if (element.attr('name')){
		                            element.innerHTML = options[attr];
		                        }
		                    break;
		                    case "TEXTAREA":
		                        if(element.attr('name')){
		                            input.innerHTML = options[attr];
		                        }
		                    break;
		                }          
		            });
		        }

		        // Add entry to DOM
		        container.append(entry);

		        // Handling some callback after creation
		        settings.afterAdd[block.attr('id')].call(this, entry, rowId, options)
			}
  
		});  
	};  
})(jQuery);
