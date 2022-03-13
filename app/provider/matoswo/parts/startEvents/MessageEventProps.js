import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../../factory/CustomEntryFactory';

import {is} from 'bpmn-js/lib/util/ModelUtil';

import { ServiceConstants } from '../../../../constants/ServiceConstants';


export default function(group, element, translate) {

    const cloudProvider = element.businessObject.$parent.laneSets[0].lanes[0].cloudProvider;
    
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