'use strict';

var domify = require('min-dom').domify,
    domQuery = require('min-dom').query;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
    escapeHTML = require('bpmn-js-properties-panel/lib/Utils').escapeHTML;

var entryFieldDescription = require('bpmn-js-properties-panel/lib/factory/EntryFieldDescription');


var checkbox = function(translate, options, defaultParameters) {
  var resource = defaultParameters,
      id = resource.id,
      label = options.label || id,
      onClick = !!options.onClick && typeof options.onClick === 'function',
      canBeDisabled = !!options.disabled && typeof options.disabled === 'function',
      canBeHidden = !!options.hidden && typeof options.hidden === 'function',
      description = options.description;

  resource.html =
    domify('<input id="camunda-' + escapeHTML(id) + '" ' +
         'type="checkbox" ' +
         'name="' + escapeHTML(options.modelProperty) + '" ' +
         (onClick ? ' onclick="onClick(this.checked)" ' : '') +
         (canBeDisabled ? 'data-disable="isDisabled"' : '') +
         (canBeHidden ? 'data-show="isHidden"' : '') +
         ' />' +
    '<label for="camunda-' + escapeHTML(id) + '" ' +
         (canBeDisabled ? 'data-disable="isDisabled"' : '') +
         (canBeHidden ? 'data-show="isHidden"' : '') +
         '>' + escapeHTML(label) + '</label>');

  // add description below checkbox entry field
  if (description) {
    resource.html.appendChild(entryFieldDescription(translate, description, { show: canBeHidden && 'isHidden' }));
  }

  resource.get = function(element) {
    var bo = getBusinessObject(element),
        res = {};

    res[options.modelProperty] = bo.get(options.modelProperty);

    return res;
  };

  resource.set = function(element, values) {
    var res = {};

    res[options.modelProperty] = !!values[options.modelProperty];

    return cmdHelper.updateProperties(element, res);
  };

  if (typeof options.set === 'function') {
    resource.set = options.set;
  }

  if (typeof options.get === 'function') {
    resource.get = options.get;
  }

  if (onClick) {
    domQuery('input', resource.html).onClick = function() {
      return options.onClick.apply(resource, arguments);
    };
  }

  if (canBeDisabled) {
    resource.isDisabled = function(checked) {
      return options.disabled.apply(resource, arguments);
    };
  }

  if (canBeHidden) {
    resource.isHidden = function() {
      return !options.hidden.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-checkbox'];

  return resource;
};

module.exports = checkbox;
