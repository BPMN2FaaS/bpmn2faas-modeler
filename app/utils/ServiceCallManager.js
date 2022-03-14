import ObjectStorage from '../../resources/service-calls/ObjectStorage.json';
import Queue from '../../resources/service-calls/Queue.json';
import FifoQueue from '../../resources/service-calls/FifoQueue.json';

import { ServiceConstants } from '../constants/ServiceConstants';

export class ServiceCallManager {

    static getServiceCalls(serviceType, direction) {
        let serviceCalls;

        switch(serviceType) {
            case ServiceConstants.objectStorage:
                serviceCalls = ObjectStorage;
                break;
            case ServiceConstants.queue:
                serviceCalls = {standard: Queue, fifo: FifoQueue};
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
