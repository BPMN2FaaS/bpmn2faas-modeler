import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../../factory/CustomEntryFactory';

import {is} from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element, translate) {
    
    if (is(element, 'bpmn:ExclusiveGateway') && isDiverging(element)) {
        if (element.outgoing.length === 2) {
            group.label = 'if-Statement Properties';
            element.businessObject.mode = 'if';
        }
        else if (element.outgoing.length >= 2) {
            group.label = 'switch-Statement Properties';
            element.businessObject.mode = 'switch';
        }
        
        group.entries.push(entryFactory.textField(translate, {
            id : 'condition',
            description : 'Specify the Condition',
            label : 'Condition',
            modelProperty : 'condition'
        }));
    } else if (is(element, 'bpmn:SequenceFlow') && is(element.source, 'bpmn:ExclusiveGateway') && isDiverging(element.source)) {
        if (element.source.outgoing.length === 2) {
            group.entries.push(myEntryFactory.selectBox(translate, {
                id : 'case',
                description : 'Specify the Case',
                label : 'Case',
                defaultText : 'Choose Case...',
                selectOptions: [{value: 'true', name: 'true'}, {value: 'false', name: 'false'}],
                modelProperty : 'case'
            }));
        } else if (element.source.outgoing.length >= 2) {
            let defaultSet = false;
            for (const arrow of element.source.outgoing) {
                if (arrow.id !== element.id && arrow.businessObject.defaultBranch) defaultSet = true;
            }

            if (!defaultSet) {
                group.entries.push(entryFactory.checkbox(translate, {
                    id : 'defaultBranch',
                    label : 'Default branch',
                    modelProperty : 'defaultBranch'
                }));   
            }

            if (!element.businessObject.defaultBranch) {
                group.entries.push(entryFactory.textField(translate, {
                    id : 'case',
                    description : 'Specify the Case',
                    label : 'Case',
                    modelProperty : 'case'
                }));
            }
        }
    } else {
        delete element.businessObject.mode;
    }

}

function isDiverging(element) {
    if (element.incoming.length === 1 && element.outgoing.length > 1) return true;
    else return false;
}
