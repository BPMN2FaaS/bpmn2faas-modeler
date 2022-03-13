import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../factory/CustomEntryFactory';

import {is} from 'bpmn-js/lib/util/ModelUtil';

import { ServiceConstants } from '../../../constants/ServiceConstants';


export default function(group, element, translate) {

    if (is(element, 'bpmn:DataStoreReference')) {
        group.entries.push(myEntryFactory.groupedSelectBox(translate, {
            id : 'service',
            description : 'Specify the Service',
            label : 'Cloud Service',
            defaultText : 'Choose Service...',
            selectOptions: [{ label: 'Storage', entries: [ 
                                { name: 'Object Storage', value: ServiceConstants.objectStorage } ] 
                            }, 
                            { label: 'Database', entries: [ 
                                { name: 'NoSQL Database', value: ServiceConstants.noSQLDB } ]
                            }
                            ],
            modelProperty : 'service'
        }));

        group.entries.push(entryFactory.textField(translate, {
            id : 'region',
            description : 'Specify the AWS Account Region',
            label : 'AWS Account Region',
            modelProperty : 'region'
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