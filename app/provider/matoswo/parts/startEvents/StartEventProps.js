import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../../factory/CustomEntryFactory';

import { ServiceConstants } from '../../../../constants/ServiceConstants';

import timerEventProps from './TimerEventProps';


export default function(group, element, translate) {

    if (element.businessObject.eventDefinitions && element.businessObject.eventDefinitions[0].$type === 'bpmn:TimerEventDefinition') {
        timerEventProps(group, element, translate);
    } else if (!element.businessObject.eventDefinitions || element.businessObject.eventDefinitions[0].$type === 'bpmn:MessageEventDefinition') {
        delete element.businessObject.schedule;
    
        group.label = 'Trigger';

        group.entries.push(myEntryFactory.groupedSelectBox(translate, {
            id : 'trigger',
            description : 'Specify Type of the Trigger',
            label : 'Source',
            defaultText : 'Choose Service...',
            selectOptions: [ 
                                { label: 'Storage', entries: [ 
                                    { name: 'Object Storage', value: ServiceConstants.objectStorage } ] 
                                }, 
                                { label: 'Database', entries: [ 
                                    { name: 'NoSQL Database', value: ServiceConstants.noSQLDB } ]
                                }, 
                                { label: 'Application Service', entries: [ 
                                    { name: 'Queuing Services', value: ServiceConstants.queue }, 
                                    { name: 'Notification Services', value: ServiceConstants.notification } ] 
                                } 
                            ],
            modelProperty : 'trigger'
        }));
    }

}