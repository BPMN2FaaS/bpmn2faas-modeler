import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../../factory/CustomEntryFactory';

import timerEventProps from './TimerEventProps';
import messageEventProps from './MessageEventProps';

import {is} from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element, translate) {

    if (element.businessObject.eventDefinitions !== undefined) {
        if (element.businessObject.eventDefinitions[0].$type === 'bpmn:TimerEventDefinition') {
            timerEventProps(group, element, translate);
        } else if (element.businessObject.eventDefinitions[0].$type === 'bpmn:MessageEventDefinition') {
            messageEventProps(group, element, translate);
        }
    } else {
        
    }

}