import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import myEntryFactory from '../../../factory/CustomEntryFactory';

import { CloudProviderConstants } from '../../../constants/CloudProviderConstants';
import EndpointManager from '../../../utils/EndpointManager';

import { is } from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element, translate) {

    group.label = 'Target Platform';

    let onChange = function (provider) {
        EndpointManager.endpoints = {provider: provider, endpoints: {}};
        resetEndpointProperties(element, provider);
    }

    group.entries.push(myEntryFactory.selectBox(translate, {
        id : 'provider',
        description : 'Specify the cloud provider',
        label : 'Cloud Provider',
        defaultText : 'Choose Provider...',
        selectOptions : [
                            { name: 'AWS', value: CloudProviderConstants.aws },
                            { name: 'Microsoft Azure', value: CloudProviderConstants.azure }
        ],
        onChange: onChange,
        modelProperty : 'provider'
    }));

}

function resetEndpointProperties(element, provider) {
    for (const child of element.children) {
        if (is(child, 'bpmn:ServiceTask')) {
            switch (provider) {
                case CloudProviderConstants.aws:
                    if (child.businessObject.$attrs.arn) {
                        EndpointManager.endpoints.endpoints[child.id] = child.businessObject.$attrs.arn;
                    }
                    break;
                case CloudProviderConstants.azure:
                    if (child.businessObject.$attrs.connectionString) {
                        EndpointManager.endpoints.endpoints[child.id] = child.businessObject.$attrs.connectionString;
                    }
                    break;
                default:
                    break;
            }
        }
    }
}
