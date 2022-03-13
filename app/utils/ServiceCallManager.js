import ObjectStorage from '../../resources/service-calls/ObjectStorage.json';

import { ServiceConstants } from '../constants/ServiceConstants';

export class ServiceCallManager {

    static getServiceCalls(serviceType, direction) {
        let serviceCalls;

        switch(serviceType) {
            case ServiceConstants.objectStorage:
                serviceCalls = ObjectStorage;
                break;
            default:
              // code block
        }

        let result = [];

        if (direction) {
            for (let serviceCall of serviceCalls) {
                if (serviceCall.direction == direction) result.push(serviceCall);
            }
        } else {
            result = serviceCalls;
        }

        return result;
    }
}
