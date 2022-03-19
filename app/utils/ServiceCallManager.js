import ObjectStorage from '../../resources/service-calls/ObjectStorage.json';
import Queue from '../../resources/service-calls/Queue.json';
import FifoQueue from '../../resources/service-calls/FifoQueue.json';
import PubSub from '../../resources/service-calls/PubSub.json';

import { ServiceTypeConstants } from '../constants/ServiceTypeConstants';

export class ServiceCallManager {

    static getServiceCalls(serviceType, direction) {
        let serviceCalls;

        switch(serviceType) {
            case ServiceTypeConstants.objectStorage:
                serviceCalls = ObjectStorage;
                break;
            case ServiceTypeConstants.queue:
                serviceCalls = Queue;
                break;
            case ServiceTypeConstants.fifoQueue:
                serviceCalls = FifoQueue;
                break;
            case ServiceTypeConstants.pubsub:
                serviceCalls = PubSub;
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
