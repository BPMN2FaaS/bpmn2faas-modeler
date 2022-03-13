import QueueSchema from '../../resources/event-properties/QueueSchema.json';
import TimerSchema from '../../resources/event-properties/TimerSchema.json';

import { ServiceConstants } from '../constants/ServiceConstants';

export class EventSchemaManager {

    static getEventProperties(serviceType) {
        let eventProps;

        switch(serviceType) {
            case ServiceConstants.queue:
                return QueueSchema;
            case ServiceConstants.timer:
                return TimerSchema;
            default:
              // code block
        }
    }
}
