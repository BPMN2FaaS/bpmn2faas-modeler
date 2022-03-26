import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';


export default function(group, element, translate) {

    group.label = 'Function Properties';

    group.entries.push(entryFactory.textField(translate, {
        id : 'handler',
        description : 'Descriptor of the handler function',
        label : 'Handler',
        modelProperty : 'handler'
    }));

}
