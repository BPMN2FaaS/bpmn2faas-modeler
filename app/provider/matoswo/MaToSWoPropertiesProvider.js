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
import laneProps from './parts/LaneProps';
import taskProps from './parts/tasks/TaskProps';
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

// Create the custom service tab
function createMaToSWoTabGroups(element, translate) {
    // Create a group called "Service Properties".
    var serviceGroup = {
        id: 'matoswo-tab',
        label: 'Service Properties',
        entries: []
    };

    console.log(element);
    // Add the matoswo props to the matoswoGroup group.
    if (is(element, 'bpmn:DataStoreReference') || is(element, 'bpmn:DataObjectReference') || is(element, 'bpmn:DataInputAssociation') || is(element, 'bpmn:DataOutputAssociation')) {
        dataStoreProps(serviceGroup, element, translate);
    } else if (is(element, 'bpmn:StartEvent')) {
        startEventProps(serviceGroup, element, translate);
    } else if (is(element, 'bpmn:Lane')) {
        laneProps(serviceGroup, element, translate);
    } else if (is(element, 'bpmn:Task')) {
        taskProps(serviceGroup, element, translate);
    } else if (is(element, 'bpmn:ExclusiveGateway') || is(element, 'bpmn:SequenceFlow')) {
        exclusiveGatewayProps(serviceGroup, element, translate);
    } else {
        //console.log(element);
    }

    return [
        serviceGroup
    ];
}

export default function MaToSWoPropertiesProvider(eventBus, bpmnFactory, canvas, elementRegistry, translate) {
    PropertiesActivator.call(this, eventBus);

    this.getTabs = function (element) {

        var generalTab = {
            id: 'general',
            label: 'General',
            groups: createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate)
        };

        // The "matoswo" tab
        var matoswoTab = {
            id: 'matoswo',
            label: 'Properties',
            groups: createMaToSWoTabGroups(element, translate)
        };

        // Show general + "matoswo" tab
        return [
            generalTab,
            matoswoTab
        ];
    };
}

inherits(MaToSWoPropertiesProvider, PropertiesActivator);
