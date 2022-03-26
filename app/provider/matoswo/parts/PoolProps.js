import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../factory/CustomEntryFactory';

import { CloudProviderConstants } from '../../../constants/CloudProviderConstants';


export default function(group, element, translate) {

    group.label = 'Target Platform';

    group.entries.push(myEntryFactory.selectBox(translate, {
        id : 'provider',
        description : 'Specify the cloud provider',
        label : 'Cloud Provider',
        defaultText : 'Choose provider...',
        selectOptions : [
                            { name: 'AWS', value: CloudProviderConstants.aws },
                            { name: 'Microsoft Azure', value: CloudProviderConstants.azure }
        ],
        modelProperty : 'provider'
    }));

}
