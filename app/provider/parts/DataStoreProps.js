import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../factory/CustomEntryFactory';

import {is} from 'bpmn-js/lib/util/ModelUtil';

import { ServiceTypeConstants } from '../../constants/ServiceTypeConstants';


export default function(group, element, translate) {

    if (is(element, 'bpmn:DataStoreReference')) {
        group.entries.push(myEntryFactory.groupedSelectBox(translate, {
            id : 'service',
            description : 'Specify the Service',
            label : 'Cloud Service',
            defaultText : 'Choose Service...',
            selectOptions: [{ label: 'Storage', entries: [ 
                                { name: 'Object Storage', value: ServiceTypeConstants.objectStorage } ] 
                            }, 
                            /*{ label: 'Database', entries: [ 
                                { name: 'Document Store', value: ServiceTypeConstants.documentStore } ]
                            }*/
                            ],
            modelProperty : 'service'
        }));
    }

    var dataStore;

    if (is(element, 'bpmn:DataInputAssociation') && is(element.source, 'bpmn:DataStoreReference')) {
        dataStore = element.source;
    } else if (is(element, 'bpmn:DataOutputAssociation') && is(element.target, 'bpmn:DataStoreReference')) {
        dataStore = element.target;
    }

    if (is(element, 'bpmn:DataInputAssociation') || is(element, 'bpmn:DataOutputAssociation')) {
        group.entries.push(entryFactory.textField(translate, {
        id : 'containerName',
        description : 'Specify the Container/Bucket Name',
        label : 'Container Name',
        modelProperty : 'containerName'
        }));
    }

}