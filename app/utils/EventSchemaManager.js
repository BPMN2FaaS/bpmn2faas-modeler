import ObjectStorageSchema from '../../resources/event-properties/ObjectStorageSchema.json';
import QueueSchema from '../../resources/event-properties/QueueSchema.json';
import TimerSchema from '../../resources/event-properties/TimerSchema.json';

import { ServiceConstants } from '../constants/ServiceConstants';

export class EventSchemaManager {

    static getEventProperties(serviceType) {

        switch(serviceType) {
            case ServiceConstants.objectStorage:
                return ObjectStorageSchema;
            case ServiceConstants.queue:
                return QueueSchema;
            case ServiceConstants.timer:
                return TimerSchema;
            default:
              // code block
        }
    }
}
