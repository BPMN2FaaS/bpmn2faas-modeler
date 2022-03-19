import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../../factory/CustomEntryFactory';

import { ServiceCallManager } from '../../../../utils/ServiceCallManager';
import { ServiceTypeConstants } from '../../../../constants/ServiceTypeConstants';
import { getArgs, createLoopProps } from './TaskProps'

import { is } from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element, translate) {

    group.label = 'Service Call Properties';
    createLoopProps(group, element, translate);

    let serviceCalls;
    let db;

    for (const in_arrow of element.incoming) {
        if (is(in_arrow.source, 'bpmn:DataStoreReference')) {
            db = in_arrow.source;
            let dbService = db.businessObject.service;

            if (element.businessObject.service !== ServiceTypeConstants.objectStorage || element.businessObject.service === ServiceTypeConstants.noSQLDB) {
                delete element.businessObject.service;
            }

            if (dbService === ServiceTypeConstants.objectStorage || dbService === ServiceTypeConstants.noSQLDB) {
                serviceCalls = ServiceCallManager.getServiceCalls(dbService, 'in');
                for (let serviceCall of serviceCalls) {
                    serviceCall.value = serviceCall.name;
                }
                element.businessObject.service = dbService;
                break;
            }
        }
    }

    if (!db) {
        for (const out_arrow of element.outgoing) {
            if (is(out_arrow.target, 'bpmn:DataStoreReference')) {
                db = out_arrow.target;
                let dbService = db.businessObject.service;

                if (element.businessObject.service !== ServiceTypeConstants.objectStorage || element.businessObject.service === ServiceTypeConstants.noSQLDB) {
                    delete element.businessObject.service;
                }

                if (dbService === ServiceTypeConstants.objectStorage || dbService === ServiceTypeConstants.noSQLDB) {
                    serviceCalls = ServiceCallManager.getServiceCalls(dbService, 'out');
                    for (let serviceCall of serviceCalls) {
                        serviceCall.value = serviceCall.name;
                    }
                    element.businessObject.service = dbService;
                    break;
                }
            }
        }
    }

    if (!db) {
        if (element.businessObject.service === ServiceTypeConstants.objectStorage) delete element.businessObject.service;
        
        let onChange = function () {
            delete element.businessObject.serviceCall;
            delete element.businessObject.fifo;
            for (let i = 0; i <= 5; i++) delete element.businessObject['arg'+i];
        }

        group.entries.push(myEntryFactory.groupedSelectBox(translate, {
            id : 'service',
            description : 'Specify Type of the Service',
            label : 'Service',
            defaultText : 'Choose Service...',
            selectOptions: [ 
                                { label: 'Messaging', entries: [ 
                                    { name: 'Queuing Service', value: ServiceTypeConstants.queue },
                                    { name: 'PubSub Service', value: ServiceTypeConstants.pubsub }] 
                                } 
                            ],
            onChange: onChange,
            modelProperty : 'service'
        }));

        if (element.businessObject.service) {
            serviceCalls = ServiceCallManager.getServiceCalls(element.businessObject.service);

            if (element.businessObject.service === ServiceTypeConstants.queue) {
                if (element.businessObject.fifo === undefined) element.businessObject.fifo = false;
                if (element.businessObject.fifo) serviceCalls = ServiceCallManager.getServiceCalls(ServiceTypeConstants.fifoQueue);

                let resetFunction = function (checked) {
                    delete element.businessObject.serviceCall;
                    for (let i = 1; i <= 5; i++) delete element.businessObject['arg'+1];
                }

                group.entries.push(myEntryFactory.checkbox(translate, {
                    id : 'fifo',
                    label : 'FIFO',
                    onClick: resetFunction,
                    modelProperty : 'fifo'
                }));
            } else delete element.businessObject.fifo;

            for (let serviceCall of serviceCalls) {
                serviceCall.value = serviceCall.name;
            }
        }
    }

    if (serviceCalls) {
        group.entries.push(myEntryFactory.selectBox(translate, {
            id : 'serviceCall'+(element.businessObject.fifo ? 'fifo' : ''),
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
                    group.entries.push(entryFactory.textBox(translate, {
                        id : 'arg' + (i+1) + ' (advanced)',
                        description : 'Specify the argument as ' + serviceCall.args[i].type,
                        label : 'Argument ' + (i+1) + ': ' + serviceCall.args[i].name,
                        modelProperty : 'arg' + (i+1)
                    }));
                } else {
                    group.entries.push(myEntryFactory.selectBox(translate, {
                        id : 'arg' + (i+1),
                        description : 'Specify the argument as ' + serviceCall.args[i].type,
                        label : 'Argument ' + (i+1) + ': ' + serviceCall.args[i].name,
                        defaultText : 'Choose argument...',
                        selectOptions : getArgs(element),
                        modelProperty : 'arg' + (i+1)
                    }));
                }
            }
        }
    }

}
