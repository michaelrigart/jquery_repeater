/**
 * jQuery Form repeater
 * Version 0.5 - 09/09/2010
 * Version 0.6 - 14/02/2011
 *
 * @author Michaël Rigart
 * @author Stefaan Colman
 *
 * This package is distributed under the AGPL license.
 */

(function($) {
    var DEFAULTS = {
        prefix:           'row_id',
        afterAdd:         function () {},
        afterDelete:      function () {},
        removeClass:      'delete',
        addClass:         'add',
        upClass:          'up',
        downClass:        'down',
        positionClass:    'position',
        minRows:          0,
        maxRows:          -1,
        minRowsMessage:   false,
        maxRowsMessage:   false,
        alerter:          alert
    };

    /**
     *
     * @param options Hash containing
     * @param objects
     */
    $.fn.repeater = function(options, objects) {
        var settings = $.extend(true, {}, DEFAULTS, options);

        var container = this.get(0);
        if (container) {
            var repeater = new FormRepeater(container, settings);
            if (objects) {
                $.each(objects, function (i, object) {
                    repeater.add(object);
                });
            }
            return repeater;
        }
        else {
            throw 'No repeating container found!';
        }

    };

    function nestedProperty (hash, property) {
        var parts  = property.split('.');
        var parent = hash;

        for (var i = 0; i < parts.length - 1; i++) {
            parent = parent[parts[i]];
            if (! parent) {
                return undefined;
            }
        }

        return parent[parts[parts.length - 1]];
    }

    function gsub (str, source, target) {
        while(str.indexOf(source) >= 0) {
            str = str.replace(source, target);
        }
        return str;
    }

    var FormRepeater = function (container, options) {
        this.container = container;
        this.entry     = $(container).children().get(0);

        // Configuration
        this.prefix         = options.prefix;
        this.afterAdd       = options.afterAdd;
        this.afterDelete    = options.afterDelete;

        this.removeClass    = options.removeClass;
        this.upClass        = options.upClass;
        this.downClass      = options.downClass;
        this.positionClass  = options.positionClass;

        this.minRows        = options.minRows;
        this.minRowsMessage = options.minRowsMessage;
        this.maxRows        = options.maxRows;
        this.maxRowsMessage = options.maxRowsMessage;
        this.alerter        = options.alerter;

        this.currentId      = 0;
        this.count          = 0;

        // Remove all children from container
        this.container.innerHTML = '';

        var repeater = this;
        $('.' + options.addClass).click(function() {
            repeater.add();
        });
    };

    FormRepeater.prototype.add = function (object) {
        // Did we reach max?
        if (this.count == this.maxRows) {
            if (this.maxRowsMessage) {
                this.alerter.call(null, this.maxRowsMessage);
            }
            return;
        }

        var repeater = this;
        // Create the entry
        var rowId = this.currentId++;
        var entry = this.entry.cloneNode(true);
        this.count++;

        // Replace the prefix with rowId
        $(entry).find('[id],[name],[for]').each(function(i, elem) {
            $.each(['id', 'name', 'for'], function (j, attr) {
                var attrValue = $(elem).attr(attr);
                if (attrValue) {
                    attrValue = gsub(attrValue, "#{" + repeater.prefix + "}", rowId);
                    $(elem).attr(attr, attrValue);
                }
            });
        });

        // Deleting
        $(entry).find('.' + this.removeClass).click(function() {
            if (repeater.count >  repeater.minRows) {
                repeater.count--;
                $(entry).remove();
                repeater.afterDelete();
            }
            else {
                // Can't delete
                if (repeater.minRowsMessage) {
                    repeater.alerter.call(null, repeater.minRowsMessage);
                }
            }

        });

        // Positioning
        $(entry).find('.' + this.upClass).click(function() {
            repeater.up(entry);
        });
        $(entry).find('.' + this.downClass).click(function() {
            repeater.down(entry);
        });
        $(entry).find('.' + this.positionClass).val(rowId);

        // Do we add existing object?
        if (object) {
            $(entry).find('[data-val]').each(function (i, elem) {
                var attr  = $(elem).attr('data-val');
                var value = nestedProperty(object, attr);
                if (value !== undefined) {
                    switch (elem.nodeName.toLowerCase()) {
                        case 'input':
                            var type = $(elem).attr('type').toLowerCase();
                            if (type == 'checkbox' || type == 'radio') {
                                elem.checked = value === true || elem.value == value;
                            }
                            else {
                                elem.value = value;
                            }

                            break;
                        case 'select':
                        case 'textarea':
                            elem.value = value;
                            break;
                        default:
                            if (elem.childNodes.length > 0) {
                                if (elem.firstChild.nodeName == "#text") {
                                    elem.firstChild.data =  value;
                                }
                            }
                            else {
                                elem.appendChild(document.createTextNode(value));
                            }
                    }
                }
            });
        }

        // Add it in the flow
        this.container.appendChild(entry);

        this.afterAdd(entry, rowId, object);
    };

    FormRepeater.prototype.up = function (elem) {
        var prev = $(elem).prev().get(0);
        if (prev) {
            // Switch position value
            var tmpPos = $(elem).find('.' + this.positionClass).val();
            $(elem).find('.' + this.positionClass).val($(prev).find('.' + this.positionClass).val());
            $(prev).find('.' + this.positionClass).val(tmpPos);

            // Now switch them
            $(elem).remove();
            prev.parentNode.insertBefore(elem, prev);
        }
    };

    FormRepeater.prototype.down = function (elem) {
        var next = $(elem).next().get(0);
        if (next) {
            // Switch position value
            var tmpPos = $(elem).children('.' + this.positionClass).val();
            $(elem).children('.' + this.positionClass).val($(next).children('.' + this.positionClass).val());
            $(next).children('.' + this.positionClass).val(tmpPos);

            // Now switch them
            $(next).remove();
            elem.parentNode.insertBefore(next, elem);
        }
    };

})(jQuery);
