import $ from 'jquery';
import BpmnModeler from 'bpmn-js/lib/Modeler';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from './provider/matoswo';
import bpmn2faasModdleDescriptor from './descriptors/bpmn2faasModdle';

import {debounce} from 'min-dash';

import diagramXML from '../resources/newDiagram.bpmn';

import InputFunctions from './utils/BusinessFunctions';

import {BpmnModelOrchestratorTransformation} from './orchestrator-generation/BpmnModelOrchestratorTransformation';
import {StrictModelValidator} from './orchestrator-generation/traversers/control-flow-hierarchy/validators/StrictModelValidator';
import {StepFunctionsGenerator} from './orchestrator-generation/traversers/control-flow-hierarchy/generators/StepFunctionsGenerator';
import {DurableFunctionsGenerator} from './orchestrator-generation/traversers/control-flow-hierarchy/generators/DurableFunctionsGenerator';
import {DurableFunctionsPythonGenerator} from './orchestrator-generation/traversers/control-flow-hierarchy/generators/DurableFunctionsPythonGenerator';
import {ComposerGenerator} from './orchestrator-generation/traversers/control-flow-hierarchy/generators/ComposerGenerator';

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
                uploadFile(file, function(err, data) {
                    if(err) {
                        alert('Please refresh the page and try again. Error: ' + err.message);
                        window.location.reload();
                    } else {
                        getFunctionNames(file);
                    }
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

function uploadFile(file, callback) {
    var bucketName = "bpmn2faas-function-upload-bucket";
    var bucketRegion = "eu-central-1";
    var IdentityPoolId = "eu-central-1:221659c3-d39b-4daf-9a20-b53de7d5d449";

    AWS.config.update({
        region: bucketRegion,
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: IdentityPoolId
        })
    });

    var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: bucketName}
    });

    var progressBar = $("progress");

    s3.upload({
        Key: file.name,
        Body: file,
        ContentType: file.type
        }, function(err, data) {
            callback(err, data);
        }
    ).on('httpUploadProgress', function (progress) {
        var uploaded = parseInt((progress.loaded) / progress.total);
        progressBar.attr('value', uploaded/2);
    });
}

function getFunctionNames(file) {
    AWS.config.update({
        region: 'eu-central-1',
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'eu-central-1:221659c3-d39b-4daf-9a20-b53de7d5d449'
        })
    });
    var lambda = new AWS.Lambda();
    var params = {
        FunctionName: 'arn:aws:lambda:eu-central-1:743714542295:function:GetFunctionNames',
        InvocationType: 'RequestResponse',
        LogType: 'None',
        Payload: JSON.stringify(file.name)
    };
    lambda.invoke(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else {
            console.log(JSON.parse(data.Payload).body);
            InputFunctions.input = JSON.parse(data.Payload).body;
            var progressBar = $("progress");
            progressBar.attr('value', 1);
            $('#js-without-zip').addClass('with-zip');
            progressBar.addClass('with-zip');
            $('#js-with-zip').removeClass('with-zip');
            zipReceived = true;
        }
    });

    /*var formData = new FormData();
    formData.append('file', file);
    console.log(file);
    $.ajax({
        url: 'https://kob9neyge1.execute-api.eu-central-1.amazonaws.com/prod/GetFunctionNames',    //Your api url
        type: 'POST',   //type is any HTTP method
        crossDomain: true,
        processData: false,
        contentType: 'multipart/form-data',
        data: formData,   //Data as js object
        success: function (result) {
            console.log(result);
        },
        async: 'false'
    });*/
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

    var downloadLink = $('#js-download-diagram');
    var downloadSvgLink = $('#js-download-svg');
    /*var downloadStepFunctionsLink = $('#js-download-aws-step-functions');
    var downloadDurableFunctionsLink = $('#js-download-azure-durable-functions');
    var downloadDurablePythonFunctionsLink = $('#js-download-azure-durable-python-functions');
    var downloadOpenWhiskComposerLink = $('#js-download-apache-openwhisk-composer');
    var downloadIBMComposerLink = $('#js-download-ibm-composer');*/

    $('.buttons a').on('click', function (e) {
        if (!$(this).is('.active')) {
            e.preventDefault();
            e.stopPropagation();
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

    var exportArtifacts = debounce(async function () {
        try {
            const {svg} = await bpmnModeler.saveSVG();
            setEncoded(downloadSvgLink, 'diagram.svg', svg);
        } catch (err) {
            console.error('Error happened saving SVG: ', err);
            setEncoded(downloadSvgLink, 'diagram.svg', null);
        }

        try {
            const {xml} = await bpmnModeler.saveXML({format: true});
            setEncoded(downloadLink, 'diagram.bpmn', xml);
        } catch (err) {
            console.error('Error happened saving diagram: ', err);
            setEncoded(downloadLink, 'diagram.bpmn', null);
        }

        /////////////////////////////////////////////////////////////////////////////////////
        // generate the workflow definitions from the bpmn and make available for download //
        // as zip archives at their respective download buttons                            //
        /////////////////////////////////////////////////////////////////////////////////////

        /*try {
            const bpmnJson = bpmnModeler.get('canvas').getRootElement().businessObject.$parent;
            const awsAccountId = bpmnJson.rootElements[0].awsAccountId;
            const awsAccountRegion = bpmnJson.rootElements[0].awsAccountRegion;
            const btoc = new BpmnModelOrchestratorTransformation();

            setEncoded(
                downloadStepFunctionsLink,
                'AWS_StepFunctions.zip',
                await btoc.convertJsonToOrchestrator(bpmnJson, new StepFunctionsGenerator(awsAccountId, awsAccountRegion), [new StrictModelValidator()])
            );
        } catch (err) {
            console.error('Error happened saving generated Step Functions workflow definition: ', err);
            setEncoded(downloadStepFunctionsLink, 'AWS_StepFunctions.zip', null);
        }

        try {
            const bpmnJson = bpmnModeler.get('canvas').getRootElement().businessObject.$parent;
            const btoc = new BpmnModelOrchestratorTransformation();

            setEncoded(
                downloadDurableFunctionsLink,
                'Azure_DurableFunctions.zip',
                await btoc.convertJsonToOrchestrator(bpmnJson, new DurableFunctionsGenerator(), [new StrictModelValidator()])
            );
        } catch (err) {
            console.error('Error happened saving generated Durable Functions workflow definition: ', err);
            setEncoded(downloadDurableFunctionsLink, 'Azure_DurableFunctions.zip', null);
        }

        try {
            const bpmnJson = bpmnModeler.get('canvas').getRootElement().businessObject.$parent;
            const btoc = new BpmnModelOrchestratorTransformation();

            setEncoded(
                downloadDurablePythonFunctionsLink,
                'Azure_DurableFunctionsPython.zip',
                await btoc.convertJsonToOrchestrator(bpmnJson, new DurableFunctionsPythonGenerator(), [new StrictModelValidator()])
            );
        } catch (err) {
            console.error('Error happened saving generated Durable Functions Python workflow definition: ', err);
            setEncoded(downloadDurableFunctionsLink, 'Azure_DurableFunctionsPython.zip', null);
        }

        try {
            const bpmnJson = bpmnModeler.get('canvas').getRootElement().businessObject.$parent;
            const btoc = new BpmnModelOrchestratorTransformation();

            setEncoded(
                downloadOpenWhiskComposerLink,
                'OpenWhisk_Composer.zip',
                await btoc.convertJsonToOrchestrator(bpmnJson, new ComposerGenerator(), [new StrictModelValidator()])
            );
        } catch (err) {
            console.error('Error happened saving generated Composer workflow definition: ', err);
            setEncoded(downloadOpenWhiskComposerLink, 'OpenWhisk_Composer.zip', null);
        }

        try {
            const bpmnJson = bpmnModeler.get('canvas').getRootElement().businessObject.$parent;
            const btoc = new BpmnModelOrchestratorTransformation();

            setEncoded(
                downloadIBMComposerLink,
                'IBM_Composer.zip',
                await btoc.convertJsonToOrchestrator(bpmnJson, new ComposerGenerator(true), [new StrictModelValidator()])
            );
        } catch (err) {
            console.error('Error happened saving generated Composer workflow definition: ', err);
            setEncoded(downloadIBMComposerLink, 'IBM_Composer.zip', null);
        }*/

    }, 500);

    bpmnModeler.on('commandStack.changed', exportArtifacts);
});
