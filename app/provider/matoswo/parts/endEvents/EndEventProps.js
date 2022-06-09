import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../../factory/CustomEntryFactory';

import {is} from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element, translate) {

    group.label = 'Return';

    group.entries.push(entryFactory.textField(translate, {
        id : 'return',
        description : 'Specify the return literal',
        label : 'Return',
        modelProperty : 'return'
    }));

}