import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../factory/CustomEntryFactory';

import serviceTaskProps from './ServiceTaskProps';

import InputFunctions from '../../../utils/BusinessFunctions';
import { EventSchemaManager } from '../../../utils/EventSchemaManager';

import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getPriviousTaskNames, getTriggerType } from '../../../orchestrator-generation/util/util';


export default function(group, element, translate) {

    if (is(element, 'bpmn:ServiceTask')) {
        delete element.businessObject.function;
        serviceTaskProps(group, element, translate);
    } else if (element.type === 'bpmn:Task') {
        delete element.businessObject.serviceCall;
        group.label = 'Function Properties';

        createLoopProps(group, element, translate);

        var options = [];

        for (const entry of InputFunctions.input.modules) {
            var module = {label: entry.module, entries: []};

            for (const func of entry.functions) {
                module.entries.push({name: func.function, value : entry.module + ":" + func.function});
            }

            options.push(module);
        }

        group.entries.push(myEntryFactory.groupedSelectBox(translate, {
            id : 'function',
            description : 'Specify the Function to be executed.',
            label : 'Function',
            defaultText : 'Choose Function...',
            selectOptions: options,
            modelProperty : 'function'
        }));

        if (element.businessObject.function) {
            for (const entry of InputFunctions.input.modules) {
                for (const func of entry.functions) {
                    if (func.function === element.businessObject.function.split(':')[1]) {
                        for (let i = 0; i < func.args.length; i++) {
                            group.entries.push(entryFactory.checkbox(translate, {
                                id : 'advancedInput' + (i+1),
                                label : 'Advanced input',
                                modelProperty : 'advancedInput' + (i+1)
                            }));

                            if (element.businessObject.$attrs['advancedInput' + (i+1)]) {
                                group.entries.push(entryFactory.textBox(translate, {
                                    id : 'arg' + (i+1) + ' (advanced)',
                                    description : 'Specify the argument <' + func.args[i] + '>',
                                    label : 'Argument ' + (i+1),
                                    modelProperty : 'arg' + (i+1)
                                }));
                            } else {
                                group.entries.push(myEntryFactory.selectBox(translate, {
                                    id : 'arg' + (i+1),
                                    description : 'Specify the argument <' + func.args[i] + '>',
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
        }
    }

}

export function getArgs(element) {
    let args = [];
    const triggerType = getTriggerType(element);

    if (triggerType) {
        const eventSchema = EventSchemaManager.getEventProperties(triggerType);

        for (const [property, type] of Object.entries(eventSchema)) {
            args.push({value: 'event[\''+property+'\']', name: 'event[\''+property+'\']'});
        }
    }

    for (const name of getPriviousTaskNames(element)) {
        args.push({value: 'event[\''+name+'\']', name: name});
    }

    return args;
}

function loopEnabled(element) {
    if (element.businessObject.loopCharacteristics && element.businessObject.loopCharacteristics.$type === 'bpmn:StandardLoopCharacteristics') {
        return true;
    } else return false;
}

export function createLoopProps(group, element, translate) {
    if (loopEnabled(element)) {
        const isOnFunc = () => {
            return true;
        }
    
        group.entries.push(entryFactory.toggleSwitch(translate, {
            id : 'toggleSwitch',
            descriptionOn : 'Specify the type of loop.',
            descriptionOff : 'Specify the descriptionOff to be executed.',
            label : 'for <-> forEach',
            labelOn: '',
            labelOff: '',
            isOn: isOnFunc,
            modelProperty : 'toggleSwitch'
        }, 'test'));

        let loopMode;

        if (element.businessObject.toggleSwitch) {
            loopMode = 'forEach';
            delete element.businessObject.for;
        } else {
            loopMode = 'for';
            delete element.businessObject.forEach;
            element.businessObject.toggleSwitch = false;
        }

        group.entries.push(entryFactory.textField(translate, {
            id : loopMode,
            description : 'Specify loop condition',
            label : loopMode,
            modelProperty : loopMode
        }));
    } else {
        delete element.businessObject.toggleSwitch;
        delete element.businessObject.for;
        delete element.businessObject.forEach;
    }
}

