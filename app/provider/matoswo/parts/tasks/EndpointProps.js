import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../../factory/CustomEntryFactory';

import { CloudProviderConstants } from '../../../../constants/CloudProviderConstants';
import EndpointManager from '../../../../utils/EndpointManager';


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
            if (element.businessObject.$attrs.arn) EndpointManager.endpoints.endpoints[element.id] = element.businessObject.$attrs.arn;
            break;
        case CloudProviderConstants.azure:
            group.entries.push(entryFactory.textBox(translate, {
                id : 'connectionString',
                description : 'Specify the connection string of the service',
                label : 'Connection String',
                modelProperty : 'connectionString'
            }));
            if (element.businessObject.$attrs.connectionString) EndpointManager.endpoints.endpoints[element.id] = element.businessObject.$attrs.connectionString;
            break;
        default:
            break;
    }

}
