'use strict';

var escapeHTML = require('bpmn-js-properties-panel/lib/Utils').escapeHTML;

var domify = require('min-dom').domify,
    domQuery = require('min-dom').query;

var forEach = require('lodash/forEach');

var entryFieldDescription = require('bpmn-js-properties-panel/lib/factory/EntryFieldDescription');


var isList = function(list) {
  return !(!list || Object.prototype.toString.call(list) !== '[object Array]');
};

var addEmptyParameter = function(list) {
  return list.concat([ { name: '', value: '' } ]);
};

var createOption = function(option) {
  return '<option value="' + option.value + '">' + option.name + '</option>';
};

/**
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} [options.label]
 * @param  {Array<Object>} options.selectOptions
 * @param  {string} options.modelProperty
 * @param  {boolean} options.emptyParameter
 * @param  {function} options.disabled
 * @param  {function} options.hidden
 * @param  {Object} defaultParameters
 *
 * @return {Object}
 */
var groupedSelectbox = function(translate, options, defaultParameters) {
  var resource = defaultParameters,
      label = options.label || resource.id,
      defaultText = options.defaultText || 'Choose option...',
      selectOptions = options.selectOptions || [ { name: '', value: '' } ],
      modelProperty = options.modelProperty,
      emptyParameter = options.emptyParameter,
      onChange = !!options.onChange && typeof options.onChange === 'function',
      canBeDisabled = !!options.disabled && typeof options.disabled === 'function',
      canBeHidden = !!options.hidden && typeof options.hidden === 'function',
      description = options.description;


  if (emptyParameter) {
    selectOptions = addEmptyParameter(selectOptions);
  }


  resource.html =
    domify('<label for="camunda-' + escapeHTML(resource.id) + '"' +
    (canBeDisabled ? 'data-disable="isDisabled" ' : '') +
    (canBeHidden ? 'data-show="isHidden" ' : '') +
    '>' + escapeHTML(label) + '</label>' +
    '<select id="camunda-' + escapeHTML(resource.id) + '-select" name="' +
    escapeHTML(modelProperty) + '"' +
    (onChange ? ' onchange="onChange()" ' : '')  +
    (canBeDisabled ? 'data-disable="isDisabled" ' : '') +
    (canBeHidden ? 'data-show="isHidden" ' : '') +
    ' data-value></select>');

  var select = domQuery('select', resource.html);

  if (isList(selectOptions)) {
    select.appendChild(domify('<option value="" selected disabled hidden>' + defaultText + '</option>'));
    forEach(selectOptions, function(option) {
      var optgroups = '<optgroup label="' + escapeHTML(option.label) + '">';
      forEach(option.entries, function(entry) {
          optgroups += '<option value="' + escapeHTML(entry.value) + '">' +
          (entry.name ? escapeHTML(entry.name) : '') + '</option>';
      });
      optgroups += '</optgroup>';
      select.appendChild(domify(optgroups));
    });
  }

  // add description below select box entry field
  if (description && typeof options.showCustomInput !== 'function') {
    resource.html.appendChild(entryFieldDescription(translate, description, { show: canBeHidden && 'isHidden' }));
  }

  /**
   * Fill the select box options dynamically.
   *
   * Calls the defined function #selectOptions in the entry to get the
   * values for the options and set the value to the inputNode.
   *
   * @param {djs.model.Base} element
   * @param {HTMLElement} entryNode
   * @param {EntryDescriptor} inputNode
   * @param {Object} inputName
   * @param {Object} newValue
   */
  resource.setControlValue = function(element, entryNode, inputNode, inputName, newValue) {
    if (typeof selectOptions === 'function') {

      var options = selectOptions(element, inputNode);

      if (options) {

        // remove existing options
        while (inputNode.firstChild) {
          inputNode.removeChild(inputNode.firstChild);
        }

        // add options
        forEach(options, function(option) {
          var template = domify(createOption(option));

          inputNode.appendChild(template);
        });


      }
    }

    // set select value
    if (newValue !== undefined) {
      inputNode.value = newValue;
    }

  };

  if (onChange) {
    select.onChange = function () {
      return options.onChange.apply(resource, arguments);
    };
  }

  if (canBeDisabled) {
    resource.isDisabled = function() {
      return options.disabled.apply(resource, arguments);
    };
  }

  if (canBeHidden) {
    resource.isHidden = function() {
      return !options.hidden.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-dropdown'];

  return resource;
};

module.exports = groupedSelectbox;
