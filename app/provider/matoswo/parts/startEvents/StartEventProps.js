import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../../factory/CustomEntryFactory';

import { TriggerTypeConstants } from '../../../../constants/TriggerTypeConstants';

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
                                    { name: 'Object Storage', value: TriggerTypeConstants.objectStorage } ] 
                                }, 
                                /*{ label: 'Database', entries: [ 
                                    { name: 'Document Store', value: TriggerTypeConstants.documentStore } ]
                                },*/ 
                                { label: 'Messaging', entries: [ 
                                    { name: 'Queuing Service', value: TriggerTypeConstants.queue }, 
                                    { name: 'PubSub Service', value: TriggerTypeConstants.pubsub } ] 
                                } 
                            ],
            modelProperty : 'trigger'
        }));

        if (element.businessObject.trigger && element.businessObject.trigger === TriggerTypeConstants.queue) {
            group.entries.push(entryFactory.checkbox(translate, {
                id : 'fifo',
                label : 'FIFO',
                modelProperty : 'fifo'
            }));
        }
    }

}