import $ from 'jquery';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {is} from 'bpmn-js/lib/util/ModelUtil';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from './provider';
import bpmn2faasModdleDescriptor from './descriptors/bpmn2faasModdle';
import EndpointManager from './utils/EndpointManager';
import { CloudProviderConstants } from './constants/CloudProviderConstants';

import {debounce} from 'min-dash';
import { v1 as uuidv1 } from 'uuid';

import diagramXML from '../resources/newDiagram.bpmn';

import InputFunctions from './utils/BusinessFunctions';


var zipReceived = false;

var container = $('#js-drop-zone');

var bpmnModeler = new BpmnModeler({
    container: '#js-canvas',
    propertiesPanel: {
        parent: '#js-properties-panel'
    },
    additionalModules: [
        propertiesPanelModule,
        propertiesProviderModule,
    ],
    moddleExtensions: {
        bpmn2faas: bpmn2faasModdleDescriptor
    }
});

function createNewDiagram() {
    openDiagram(diagramXML);
}

async function openDiagram(xml) {
    try {
        await bpmnModeler.importXML(xml);
        container
            .removeClass('with-error')
            .addClass('with-diagram');
    } catch (err) {
        container
            .removeClass('with-diagram')
            .addClass('with-error');
        container.find('.error pre').text(err.message);
        console.error(err);
    }
}

function registerFileDrop(container) {
    function handleFileSelect(e) {
        e.stopPropagation();
        e.preventDefault();

        if (!zipReceived) {
            var files = e.dataTransfer.files;
            var file = files[0];
            if (file.type === 'application/zip') {
                var progressBar = $("progress");
                progressBar.attr('value', 0.5);

                sendBusinessCode(file, function(result) {
                    console.log(JSON.parse(result));
                    InputFunctions.input = JSON.parse(result);
                    progressBar.attr('value', 1);
                    $('#js-without-zip').addClass('with-zip');
                    progressBar.addClass('with-zip');
                    $('#js-with-zip').removeClass('with-zip');
                    zipReceived = true;
                }, function(err) {
                    alert('Please refresh the page and try again. Error: ' + err.message);
                        window.location.reload();
                });
            } else {
                var textElement = $('#js-without-zip')[0];
                textElement.innerHTML = 'File format not accepted! Try again with a .zip archive!';
                textElement.style.color = 'red';
            }
        } else {
            var files = e.dataTransfer.files;
            var file = files[0];
            var reader = new FileReader();

            reader.onload = function (e) {
                var xml = e.target.result;
                openDiagram(xml);
            };

            reader.readAsText(file);
        }
    }

    function handleDragOver(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    container.get(0).addEventListener('dragover', handleDragOver, false);
    container.get(0).addEventListener('drop', handleFileSelect, false);
}

function sendBusinessCode(file, callback, error) {
    var formData = new FormData();
    formData.append('file', file);
    document.cookie = 'session_id=' + uuidv1();
    $.ajax({
        url: 'http://localhost:8001/upload-files',    //Your api url
        type: 'PUT',   //type is any HTTP method
        crossDomain: true,
        processData: false,
        xhrFields: { withCredentials: true },
        contentType: false,
        data: formData,   //Data as js object
        success: function (result) {
            callback(result);
        },
        error: function (err) {
            error(err);
        },
        //async: 'false'
    });
}

function sendBPMN(bpmn, callback, error) {
    var formData = new FormData();
    formData.append('bpmn', bpmn);
    formData.append('endpoints', JSON.stringify(EndpointManager.endpoints));
    $.ajax({
        url: 'http://localhost:8001/generate',    //Your api url
        type: 'PUT',   //type is any HTTP method
        crossDomain: true,
        processData: false,
        xhrFields: { withCredentials: true },
        contentType: false,
        data: formData,   //Data as js object
        success: function (result) {
            callback(result);
        },
        error: function (err) {
            error(err);
        },
        //async: 'false'
        timeout: 15000
    });
}

////// file drag / drop ///////////////////////
// check file api availability
if (!window.FileList || !window.FileReader) {
    window.alert(
        'Looks like you use an older browser that does not support drag and drop. ' +
        'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
    registerFileDrop(container);
}

// bootstrap diagram functions
$(function () {
    $('#js-create-diagram').on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        createNewDiagram();
    });

    var {xml} = {};

    var downloadLink = $('#js-download-diagram');
    var downloadSvgLink = $('#js-download-svg');
    var testButton = $('#generate');

    $('.buttons a').on('click', function (e) {
        if (!$(this).is('.active')) {
            e.preventDefault();
            e.stopPropagation();
        } else {
            if ($(this)[0].id === 'generate') {
                sendBPMN(xml.xml, function(result) {
                    result = JSON.parse(result);
                    const a = document.createElement('a');
                    var zipFile = new Blob([atob(result.file)], {"type": "application/zip"})
                    a.href = "data:application/zip;base64," + result.file;
                    a.style.display = 'none';
                    a.download = result.filename;
                    document.body.appendChild(a);
                    a.click();
                }, function(err) {
                    alert('Please refresh the page and try again. Error: ' + err.message);
                        window.location.reload();
                });
            }
        }
    });

    function setEncoded(link, name, data) {
        var encodedData = encodeURIComponent(data);
        var hrefAttribute = 'data:application/bpmn20-xml;charset=UTF-8,';
        if (name.endsWith('.zip')) {
            hrefAttribute = 'data:application/zip;base64,';
        }

        if (data) {
            link.addClass('active').attr({
                'href': hrefAttribute + encodedData,
                'download': name
            });
        } else {
            link.removeClass('active');
        }
    }

    function validate(link, data) {
        const bpmnJson = bpmnModeler.get('canvas').getRootElement().businessObject.$parent;

        let valid = false;

        if (bpmnJson.rootElements[0].participants.length === 1) {
            const pool = bpmnJson.rootElements[0].participants[0];
            if (pool.$attrs.provider) {
                valid = true;
                for (const element of pool.processRef.flowElements) {
                    if (is(element, 'bpmn:ServiceTask')) {
                        if (pool.$attrs.provider === CloudProviderConstants.aws) {
                            if (!element.$attrs.arn) {
                                valid = false;
                                break;
                            }
                        } else if (pool.$attrs.provider === CloudProviderConstants.azure) {
                            if (!element.$attrs.connectionString) {
                                valid = false;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (valid && data) {
            link.addClass('active');
        } else {
            link.removeClass('active');
        }
        
    }

    var exportArtifacts = debounce(async function () {
        try {
            const {svg} = await bpmnModeler.saveSVG();
            setEncoded(downloadSvgLink, 'diagram.svg', svg);
        } catch (err) {
            console.error('Error happened saving SVG: ', err);
            setEncoded(downloadSvgLink, 'diagram.svg', null);
        }

        try {
            xml = await bpmnModeler.saveXML({format: true});
            setEncoded(downloadLink, 'diagram.bpmn', xml.xml);
            validate(testButton, 'diagram.bpmn', xml.xml);
        } catch (err) {
            console.error('Error happened saving diagram: ', err);
            setEncoded(downloadLink, 'diagram.bpmn', null);
            validate(testButton, 'diagram.bpmn', null);
        }

    }, 500);

    bpmnModeler.on('commandStack.changed', exportArtifacts);
});
