import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../../factory/CustomEntryFactory';

import {is} from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element, translate) {

    group.label = 'Timer Properties';

    group.entries.push(entryFactory.textField(translate, {
        id : 'schedule',
        description : 'Specify the schedule in cron format',
        label : 'Timer Schedule',
        modelProperty : 'schedule'
    }));

}