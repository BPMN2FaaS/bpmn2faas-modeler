import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../../factory/CustomEntryFactory';

import { CloudProviderConstants } from '../../../../constants/CloudProviderConstants';


export default function(group, element, translate) {

    let provider = element.parent.businessObject.$attrs.provider;

    switch (provider) {
        case CloudProviderConstants.aws:
            group.entries.push(entryFactory.textBox(translate, {
                id : 'arn',
                description : 'Specify the ARN of the service',
                label : 'ARN',
                modelProperty : 'arn'
            }));
            break;
        case CloudProviderConstants.azure:
            group.entries.push(entryFactory.textBox(translate, {
                id : 'connectionString',
                description : 'Specify the connection string of the service',
                label : 'Connection String',
                modelProperty : 'connectionString'
            }));
            break;
        default:
            break;
    }

}
