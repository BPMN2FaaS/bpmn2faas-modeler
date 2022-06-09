import inherits from 'inherits';

import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';
import {is} from 'bpmn-js/lib/util/ModelUtil';

// Require all properties you need from existing providers.
// In this case all available bpmn relevant properties without camunda extensions.
import processProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps';
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';
import idProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps';
import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';

// Require custom property entries.
import dataStoreProps from './parts/DataStoreProps';
import startEventProps from './parts/startEvents/StartEventProps';
import endEventProps from './parts/endEvents/EndEventProps';
import laneProps from './parts/LaneProps';
import poolProps from './parts/PoolProps';
import taskProps from './parts/tasks/TaskProps';
import endpointProps from './parts/tasks/EndpointProps';
import exclusiveGatewayProps from './parts/gateways/ExclusiveGatewayProps';


// The general tab contains all bpmn relevant properties.
// The properties are organized in groups.
function createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate) {
    var generalGroup = {
        id: 'general',
        label: 'General',
        entries: []
    };

    idProps(generalGroup, element, translate);
    nameProps(generalGroup, element, bpmnFactory, canvas, translate);

    var documentationGroup = {
        id: 'documentation',
        label: 'Documentation',
        entries: []
    };

    documentationProps(documentationGroup, element, bpmnFactory, translate);

    return [
        generalGroup,
        documentationGroup
    ];
}

function createPropertiesTabGroups(element, translate) {
    // Create a group called "Properties".
    var propertiesGroup = {
        id: 'properties-tab',
        label: 'Properties',
        entries: []
    };

    console.log(element);
    if (is(element, 'bpmn:DataStoreReference') || is(element, 'bpmn:DataObjectReference') || is(element, 'bpmn:DataInputAssociation') || is(element, 'bpmn:DataOutputAssociation')) {
        dataStoreProps(propertiesGroup, element, translate);
    } else if (is(element, 'bpmn:StartEvent')) {
        startEventProps(propertiesGroup, element, translate);
    } else if (is(element, 'bpmn:Participant')) {
        poolProps(propertiesGroup, element, translate);
    } else if (is(element, 'bpmn:Task')) {
        taskProps(propertiesGroup, element, translate);
    } else if (is(element, 'bpmn:ExclusiveGateway') || is(element, 'bpmn:SequenceFlow')) {
        exclusiveGatewayProps(propertiesGroup, element, translate);
    } else if (is(element, 'bpmn:EndEvent')) {
        endEventProps(propertiesGroup, element, translate);
    } else {
        //console.log(element);
    }

    return [
        propertiesGroup
    ];
}

function createEndpointTabGroups(element, translate) {
    // Create a group called "Endpoint Properties".
    var endpointGroup = {
        id: 'endpoint-tab',
        label: 'Endpoint Properties',
        entries: []
    };

    if (is(element, 'bpmn:ServiceTask')) {
        endpointProps(endpointGroup, element, translate);
    }

    return [
        endpointGroup
    ];
}

export default function PropertiesProvider(eventBus, bpmnFactory, canvas, elementRegistry, translate) {
    PropertiesActivator.call(this, eventBus);

    this.getTabs = function (element) {

        var generalTab = {
            id: 'general',
            label: 'General',
            groups: createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate)
        };

        var propertiesTab = {
            id: 'properties',
            label: 'Properties',
            groups: createPropertiesTabGroups(element, translate)
        };

        var endpointTab = {
            id: 'endpoint',
            label: 'Endpoint',
            groups: createEndpointTabGroups(element, translate)
        };

        return [
            generalTab,
            propertiesTab,
            endpointTab
        ];
    };
}

inherits(PropertiesProvider, PropertiesActivator);
