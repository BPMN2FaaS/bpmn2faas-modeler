import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../../factory/CustomEntryFactory';

import InputFunctions from '../../../../utils/BusinessFunctions';
import { ServiceCallManager } from '../../../../utils/ServiceCallManager';
import { EventSchemaManager } from '../../../../utils/EventSchemaManager';
import { ServiceConstants } from '../../../../constants/ServiceConstants';
import { getArgs, createLoopProps } from './TaskProps'

import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getPriviousTaskNames, getTriggerType } from '../../../../orchestrator-generation/util/util'


export default function(group, element, translate) {

    group.label = 'Service Call Properties';

    let serviceCalls;

    for (const in_arrow of element.incoming) {
        if (is(in_arrow.source, 'bpmn:DataStoreReference')) {
            let db = in_arrow.source;
            if (db.businessObject.service == ServiceConstants.objectStorage) {
                serviceCalls = ServiceCallManager.getServiceCalls(ServiceConstants.objectStorage, 'in');
                for (let serviceCall of serviceCalls) {
                    serviceCall.value = serviceCall.name;
                }
                break;
            }
        }
    }

    for (const out_arrow of element.outgoing) {
        if (is(out_arrow.target, 'bpmn:DataStoreReference')) {
            let db = out_arrow.target;
            if (db.businessObject.service == ServiceConstants.objectStorage) {
                serviceCalls = ServiceCallManager.getServiceCalls(ServiceConstants.objectStorage, 'out');
                for (let serviceCall of serviceCalls) {
                    serviceCall.value = serviceCall.name;
                }
                break;
            }
        }
    }

    if (serviceCalls) {
        createLoopProps(group, element, translate);

        group.entries.push(myEntryFactory.selectBox(translate, {
            id : 'serviceCall',
            description : 'Choose the Service Function',
            label : 'Service Function',
            defaultText : 'Choose Function...',
            selectOptions : serviceCalls,
            modelProperty : 'serviceCall'
        }));

        if (element.businessObject.serviceCall) {
            let serviceCall = serviceCalls.find(obj => obj.value == element.businessObject.serviceCall);
            for (let i = 0; i < serviceCall.args.length; i++) {
                group.entries.push(entryFactory.checkbox(translate, {
                    id : 'advancedInput' + (i+1),
                    label : 'Advanced input',
                    modelProperty : 'advancedInput' + (i+1)
                }));

                if (element.businessObject.$attrs['advancedInput' + (i+1)]) {
                    group.entries.push(entryFactory.textField(translate, {
                        id : 'arg' + (i+1) + ' (advanced)',
                        description : 'Specify the argument <' + serviceCall.args[i] + '>',
                        label : 'Argument ' + (i+1),
                        modelProperty : 'arg' + (i+1)
                    }));
                } else {
                    group.entries.push(myEntryFactory.selectBox(translate, {
                        id : 'arg' + (i+1),
                        description : 'Specify the argument <' + serviceCall.args[i] + '>',
                        label : 'Argument ' + (i+1),
                        defaultText : 'Choose argument...',
                        selectOptions : getArgs(element),
                        modelProperty : 'arg' + (i+1)
                    }));
                }
            }
        }
    }

}
