import ObjectStorageSchema from '../../resources/event-properties/ObjectStorageSchema.json';
import DocumentStore from '../../resources/event-properties/DocumentStoreSchema.json';
import QueueSchema from '../../resources/event-properties/QueueSchema.json';
import FifoQueueSchema from '../../resources/event-properties/FifoQueueSchema.json';
import PubSubSchema from '../../resources/event-properties/PubSubSchema.json';
import TimerSchema from '../../resources/event-properties/TimerSchema.json';

import { TriggerTypeConstants } from '../constants/TriggerTypeConstants';

export class EventSchemaManager {

    static getEventProperties(serviceType) {

        switch(serviceType) {
            case TriggerTypeConstants.objectStorage:
                return ObjectStorageSchema;
            case TriggerTypeConstants.documentStore:
                return DocumentStore;
            case TriggerTypeConstants.queue:
                return QueueSchema;
            case TriggerTypeConstants.fifoQueue:
                return FifoQueueSchema;
            case TriggerTypeConstants.pubsub:
                return PubSubSchema;
            case TriggerTypeConstants.timer:
                return TimerSchema;
            default:
              // code block
        }
    }
}
