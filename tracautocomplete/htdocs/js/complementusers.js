$(() => {
  "use strict";

  $.widget("ui.flexcomplete", {

    version: '0.0.1',

    options: {
      inputDelimiters: [',', ';', ' '],
      outputDelimiter: ',',
      allowDuplicates: false,
      width: null,
      maxLength: 1,
      source: '',
      title: null,
      placeholder: null,
      renderer: null,
      caseSensitiveDuplicates: false,
    },

    _buildValue () {
      var value = '';

      $.each(this._chosenValues, (k, v) => {
        value += value.length ? this.options.outputDelimiter + v.value : v.value;
      });

      return value;
    },

    _setValue (value) {
      var val = this.element.val();

      if (val !== value) {
        this.element.val(value);
        this._trigger('change');
      }
    },

    _createTag (name, key, klass) {
      var className = klass ? ' class="' + klass + '"' : '';

      if (name !== undefined) {
        var icon = '';
        $.each(this.options.source, (i, v) => {
          if (v.value === name) {
            icon = `<i class="icon">${v.icon}</i>`;
          }
        });
        return $(`<li ${className} data-flexcomplete-key="${key}">
                    <span>${icon} ${name}</span>
                    <a href="javascript:void(0);" class="ficon">&#x2716;</a>
                  </li>`);
      }
    },

    _removeTag (ev) {
      var $closest = $(ev.currentTarget).closest('li'),
          key = $closest.data('flexcomplete-key'),
          widget = ev.data.widget || this,
          index = false;

      $.each(widget._chosenValues, (i, v) => {
        (key === v.key) && (index = i);
      });

      (index !== false) && widget._chosenValues.splice(index, 1);

      widget._setValue(widget._buildValue());

      $closest.remove();
      widget._resizeInput(ev);
      widget.elements.input.focus();
    },

    _editTag (ev) {
      var $closest = $(ev.currentTarget).closest('li'),
          key = $closest.data('flexcomplete-key'),
          widget = ev.data.widget || this,
          tagName = '';

      if (!key) {
        return true;
      }

      ev.preventDefault();

      $.each(widget._chosenValues, (i, v) => {
        (key === v.key) && (tagName = v.value);
      });

      widget.elements.input.val(tagName);

      widget._removeTag(ev);
    },

    _renderTags () {
      this.elements.list.find('li:not(.flexcomplete-required)').remove();

      $.each(this._chosenValues, (k, v) => {
        var el = this._createTag(v.value, v.key);
        this.elements.list.find('li.flexcomplete-input').before(el);
      });
    },

    _setChosen (values) {
      if (!$.isArray(values)) {
        return false;
      }

      $.each(values, (k, v) => {
        var exists = false;

        v = $.trim(v);

        $.each(this._chosenValues, (kk, vv) => {
          if (this.options.caseSensitiveDuplicates) {
            (vv.value === v) && (exists = true);
          } else {
            (vv.value.toLowerCase() === v.toLowerCase()) && (exists = true);
          }
        });

        if ((v !== '') && (!exists || this.options.allowDuplicates)) {
          this._chosenValues.push({
            key: 'mi_' + Math.random().toString(16).slice(2, 10),
            value: v,
          });

          this._renderTags();
        }
      });
      this._setValue(this._buildValue());
    },

    _containsDelimiter (tags) {
      var delim = false;

      $.each(this.options.inputDelimiters, (k, v) => {
        if (tags.indexOf(v) !== -1) {
          delim = v;
        }
      });

      return delim;
    },

    _autoCompleteMenuPosition () {
      if (this.options.source) {
        var widget = this.elements.input.data('ui-autocomplete');
        widget && widget.menu.element.position({
          of: this.elements.contr,
          my: 'left top',
          at: 'left bottom',
          collision: 'none',
        });
      }
    },

    // select the previous tag or input if no more tags exist
    _prevTag (ev) {
      var tag = $(ev.currentTarget).closest('li'),
          prev = tag.prev(),
          widget = ev.data.widget || this;

      if (prev.is('li')) {
        prev.find('a').focus();
      } else {
        widget._focus();
      }
    },

    // select the next tag or input if no more tags exist
    _nextTag (ev) {
      var tag = $(ev.currentTarget).closest('li'),
          next = tag.next(),
          widget = ev.data.widget || this;

      if (next.is('li:not(.flexcomplete-input)')) {
        next.find('a').focus();
      } else {
        widget._focus();
      }
    },

    _resizeInput (ev) {
      var widget = (ev && ev.data.widget) || this,
          input = widget.elements.input,
          maxWidth = widget.elements.list.width(),
          val = input.val(),
          textWidth = 25 + val.length * 8,
          limitChose = (widget._chosenValues.length >= widget.options.maxLength);

      input.width((textWidth < maxWidth) ? textWidth : maxWidth)
           .parent().css('display', limitChose ? 'none' : '');
      widget.elements.list.css('cursor', limitChose ? 'default' : 'text');
      widget.elements.arrow.css('cursor', limitChose ? 'default' : 'pointer');
    },

    _resetPlaceholder () {
      var placeholder = this.options.placeholder,
          input = this.elements.input,
          width = this.options.width || 'inherit';
      if (placeholder && (this.element.val().length === 0)) {
        input.attr('placeholder', placeholder).css('min-width', 'calc(' + width + ' - 50px)');
      } else {
        input.attr('placeholder', '').css('min-width', 'inherit');
      }
    },

    _parseInput (ev) {
      var widget = (ev && ev.data.widget) || this,
          val,
          delim = false,
          values = [];

      val = widget.elements.input.val();
      val && (delim = widget._containsDelimiter(val));

      if (delim !== false) {
        values = val.split(new RegExp("[" + widget.options.inputDelimiters.join() + "]+"));
      } else if (!ev || (ev.which === $.ui.keyCode.ENTER
                         && !$('.ui-menu-item.ui-state-focus').size()
                         && !$('.ui-menu-item .ui-state-focus').size()
                         && !$('#ui-active-menuitem').size())) {

        values.push(val);
        ev && ev.preventDefault();
      } else if ((ev.type === 'blur')
                  && !$('#ui-active-menuitem').size()) {

        values.push(val);
      }

      if (values.length > 0) {
        widget._setChosen(values);
        widget.elements.input.val('');
        widget._resizeInput();
      }

      widget._resetPlaceholder();
    },

    _inputFocus (ev) {
      var widget = ev.data.widget || this;

      widget.elements.input.value || (widget.options.source.length && widget.elements.input.autocomplete('search', ''));
    },

    // if our input contains no value and backspace has been pressed, select the last tag
    _inputBackspace (ev) {
      var widget = ev.data.widget || this,
          tag = widget.elements.list.find('li:not(.flexcomplete-required):last');

      ev.stopPropagation();

      if ((!$(ev.currentTarget).val()
           || (('selectionStart' in ev.currentTarget)
               && (ev.currentTarget.selectionStart === 0)
               && (ev.currentTarget.selectionEnd === 0)))
          && tag.size()) {

        ev.preventDefault();
        tag.find('a').focus();
      }
    },

    _inputKeypress (ev) {
      var widget = ev.data.widget || this;

      (ev.type === 'keyup') && widget._trigger('keyup', ev, widget);

      switch (ev.which) {
      case $.ui.keyCode.BACKSPACE:
        (ev.type === 'keydown') && widget._inputBackspace(ev);
        break;
      case $.ui.keyCode.LEFT:
        (ev.type === 'keydown') && widget._inputBackspace(ev);
        break;
      default:
        widget._parseInput(ev);
        widget._resizeInput(ev);
        break;
      }

      // resposition autoComplete menu as <ul> grows and shrinks vertically
      if (widget.options.source) {
        setTimeout(() => {
          widget._autoCompleteMenuPosition.call(widget);
        }, 200);
      }
    },

    _tagKeypress (ev) {
      var widget = ev.data.widget;

      switch (ev.which) {
      case $.ui.keyCode.BACKSPACE:
        ev.preventDefault();
        ev.stopPropagation();
        $(ev.currentTarget).trigger('click');
        break;
      case 69: // 'e'
        widget._editTag(ev);
        break;
      case $.ui.keyCode.LEFT:
        (ev.type === 'keydown') && widget._prevTag(ev);
        break;
      case $.ui.keyCode.RIGHT:
        (ev.type === 'keydown') && widget._nextTag(ev);
        break;
      case $.ui.keyCode.DOWN:
        (ev.type === 'keydown') && widget._focus(ev);
        break;
      }
    },

    _tagFocus (ev) {
      $(ev.currentTarget).parent()[ev.type === 'focusout' ? 'removeClass' : 'addClass']
          ('flexcomplete-selected');
    },

    _focus (ev) {
      var widget = (ev && ev.data.widget) || this,
          $closest = $(ev && ev.target).closest('li'),
          $data = $closest.data('flexcomplete-key');

      if (!ev || !$data) {
        widget.elements.input.focus();
      }
    },

    _installAutocomplete () {
      if (this.options.source) {
        var widget = this;

        this.elements.input.autocomplete({
          position: {
            of: this.elements.contr
          },
          source: this.options.source,
          minLength: 0,
          select (ev, ui) {
            ev.preventDefault();
            widget.elements.input.val(ui.item.value);
            widget._parseInput();
          },
          open () {
            var menu = $(this).data('ui-autocomplete').menu;

            menu.element.zIndex && menu.element.zIndex($(this).zIndex() + 1);
            menu.element.width(widget.elements.list.outerWidth());
          },
        });
      }
      if (this.options.renderer) {
        this.elements.input.autocomplete('instance')._renderItem = (ul, item) => {
          var exists = false;
          $.each(this._chosenValues, (k, v) => {
            if (this.options.caseSensitiveDuplicates) {
              (v.value === item.value) && (exists = true);
            } else {
              (v.value.toLowerCase() === item.value.toLowerCase()) && (exists = true);
            }
          });
          if (exists && !this.options.allowDuplicates) {
            return $();
          }

          return $('<li></li>')
            .append(this.options.renderer.call(this, item))
            .appendTo(ul);
        }
      }
    },

    _attachEvents (disabled) {
      var events = [
        {"el": this.elements.input, "method": "on", "ev": "keyup.flexcomplete",    "args": [{widget: this}, this._inputKeypress]},
        {"el": this.elements.input, "method": "on", "ev": "keydown.flexcomplete",  "args": [{widget: this}, this._inputKeypress]},
        {"el": this.elements.input, "method": "on", "ev": "change.flexcomplete",   "args": [{widget: this}, this._inputKeypress]},
        {"el": this.elements.input, "method": "on", "ev": "focus.flexcomplete",    "args": [{widget: this}, this._inputFocus]},
        {"el": this.elements.input, "method": "on", "ev": "blur.flexcomplete",     "args": [{widget: this}, this._parseInput]},
        {"el": this.elements.list,  "method": "on", "ev": "click.flexcomplete",    "args": [{widget: this}, this._focus]},
        {"el": this.elements.list,  "method": "on", "ev": "click.flexcomplete",    "args": ["a", {widget:this}, this._removeTag]},
        {"el": this.elements.list,  "method": "on", "ev": "dblclick.flexcomplete", "args": ["li", {widget: this}, this._editTag]},
        {"el": this.elements.list,  "method": "on", "ev": "focus.flexcomplete",    "args": ["a", {widget: this}, this._tagFocus]},
        {"el": this.elements.list,  "method": "on", "ev": "blur.flexcomplete",     "args": ["a", {widget: this}, this._tagFocus]},
        {"el": this.elements.list,  "method": "on", "ev": "keydown.flexcomplete",  "args": ["a", {widget: this}, this._tagKeypress]},
        {"el": this.elements.arrow, "method": "on", "ev": "click.flexcomplete",    "args": [{widget: this}, this._focus]},
        {"el": this.element,        "method": "on", "ev": "focus.flexcomplete",    "args": [{widget: this}, this._focus]},
      ];
      if (disabled) {
        $.each(events, (i, v) => {
          v["method"] = "off";
          v["args"] = [];
        });
      }
      $.each(events, (i, v) => {
        v["el"][v["method"]](v["ev"], ...v["args"]);
      });
    },

    _create () {
      var els = {},
          o = this.options,
          title = o.title || this.element.attr('title') || null,
          placeholder = o.placeholder || this.element.attr('placeholder') || null;

      this._chosenValues = [];

      // Create the elements
      els.contr = $('<span class="flexcomplete-container"></span>');
      els.list= $('<ul class="flexcomplete-list"></ul>');
      els.input = $('<input type="text" autocomplete="off" />');
      els.inputEl = $('<li class="flexcomplete-input flexcomplete-required"></li>');
      els.origInputEl = $('<li class="flexcomplete-input-hidden flexcomplete-required"></li>');
      els.arrow = $('<span class="flexcomplete-container__arrow" role="presentation"><b role="presentation"></b></span>');

      if (title) {
        o.title = title;
        els.contr.attr('title', o.title);
      }
      if (placeholder) {
        o.placeholder = placeholder;
        els.input.attr('placeholder', o.placeholder);
        o.width && els.input.css('min-width', 'calc(' + o.width + ' - 50px)');
      }

      this.element.replaceWith(els.contr);
      els.origInputEl.append(this.element).hide();

      els.inputEl.append(els.input);
      els.list.append(els.inputEl);
      els.list.append(els.origInputEl);
      els.contr.append(els.list);
      els.contr.append(els.arrow);

      o.width && els.contr.css('width', o.width);

      this.elements = els;

      this._attachEvents(false);

      if ($.trim(this.element.val())) {
        els.input.val(this.element.val());
        this._parseInput();
      }

      this._installAutocomplete();
    },

    _destroy () {
      this.elements.input.unbind('.flexcomplete');
      this.elements.contr.replaceWith(this.element);
    },

    refresh () {
      var delim = this.options.outputDelimiter,
          val = this.element.val(),
          values = [];

      if (delim) {
        values = val.split(delim);
      } else {
        values.push(val);
      }

      if (values.length) {
        this._chosenValues = [];

        this._setChosen(values);
        this._renderTags();
        this.elements.input.val('');
        this._resizeInput();
      }
    },

    disabled (val) {
      this._attachEvents(val);
      this.elements.list[val ? 'addClass' : 'removeClass']('disabled');
      this.elements.inputEl[val ? 'addClass' : 'removeClass']('disabled');
      this.elements.arrow[val ? 'addClass' : 'removeClass']('disabled');
      this.elements.input.attr('disabled', val);
    },

    focus () {
      this._focus();
    },
  });

  var renderer = (item) => {
    return $(`<div><i class="icon">${item.icon}</i> ${item.label}</div>`);
  };
  $(".timeline input[name='authors']:text").flexcomplete({
    width: '180px',
    maxLength: 99,
    outputDelimiter: ' ',
    source: complementusers,
    renderer: renderer,
  });
  $(".query input[name$='reporter']:text,"
    + ".query input[name$='owner']:text,"
    + ".query input[name$='cc']:text").flexcomplete({
    width: '292px',
    source: complementusers,
    renderer: renderer,
  });
  $(document).on('focus', ".query input[name$='reporter']:text,"
                          + ".query input[name$='owner']:text,"
                          + ".query input[name$='cc']:text", function () {
    $(this).flexcomplete({
      width: '292px',
      source: complementusers,
      renderer: renderer,
    }).focus();
  });
  $("input#field-reporter:text").flexcomplete({
    width: 'calc(100% - 4px)',
    inputDelimiters: [],
    source: complementusers,
    renderer: renderer,
  });
  $("input#field-cc:text").flexcomplete({
    width: 'calc(100% - 4px)',
    maxLength: 99,
    source: complementusers,
    renderer: renderer,
  });
  $("input#action_create_and_assign_reassign_owner:text,input#action_reassign_reassign_owner:text").flexcomplete({
    width: '195px',
    inputDelimiters: [],
    source: complementusers,
    placeholder: 'Please input user name',
    renderer: renderer,
  }).flexcomplete('disabled', true);
  $("#action input[name='action']:radio").change(function () {
    var selected = $(this).val();
    if (['create_and_assign', 'reassign',].indexOf(selected) != -1) {
      $("#action input[id^='action_']:text").flexcomplete('disabled', false);
    } else {
      $("#action input[id^='action_']:text").flexcomplete('disabled', true);
    }
  });
  $("#blog-main input[name='author']:text").flexcomplete({
    width: '366px',
    source: complementusers,
    renderer: renderer,
  });
});
