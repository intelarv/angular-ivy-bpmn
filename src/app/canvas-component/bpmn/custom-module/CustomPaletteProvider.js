import {
  assign
} from 'min-dash';


/**
 * A palette that allows you to create BPMN _and_ custom elements.
 */
export default function PaletteProvider(palette, create, elementFactory, spaceTool, lassoTool) {

  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;

  palette.registerProvider(this);
}

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool'
];


PaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      create = this._create,
      elementFactory = this._elementFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool;


  function createAction(type, group, className, title, imageUrl, html, displayTitle, options) {

    function createListener(event) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      create.start(event, shape);
    }

    var shortType = type.replace(/^bpmn:/, '');

    return {
      group: group,
      className: className,
      title: title || 'Create ' + shortType,
      imageUrl: imageUrl,
      html: html,
      displayTitle: displayTitle,
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  function createParticipant(event, collapsed) {
    create.start(event, elementFactory.createParticipantShape(collapsed));
  }

  assign(actions, {
    'messages-email': createAction(
      'hf:email', 'messages', 'icon-messages-email', 'Email', null,  null, 'Email'
    ),
    'messages-pns': createAction(
      'hf:pns', 'messages', 'icon-messages-pns', 'Push', null,  null, 'Push'
    ),
    'messages-sms': createAction(
      'hf:sms', 'messages', 'icon-messages-sms', 'Text', null,  null, 'Text'
    ),
    'messages-msgcenter': createAction(
      'hf:msgcenter', 'messages', 'icon-messages-msgcenter', 'Msg Center', null,  null, 'Msg Center'
    ),
    'messages-webhook': createAction(
      'hf:webhook', 'messages', 'icon-messages-webhook', 'Web Hook', null,  null, 'Web Hook'
    ),
    'messages-separator': {
      group: 'messages',
      separator: true
    },
    'delay-waituntil': createAction(
      'hf:waituntil', 'delay', 'icon-delay-waituntil', 'Wait Until', null,  null, 'Wait Until'
    ),
    'delay-timedelay': createAction(
      'hf:timedelay', 'delay', 'icon-delay-timedelay', 'Time Delay', null,  null, 'Time Delay'
    ),
    'delay-timewindow': createAction(
      'hf:timewindow', 'delay', 'icon-delay-timewindow', 'Time Window', null,  null, 'Time Window'
    ),
    'delay-separator': {
      group: 'delay',
      separator: true
    },
    'flowcontrol-truefalse': createAction(
      'hf:truefalse', 'flowcontrol', 'icon-flowcontrol-truefalse', 'True False Branch', null,  null, 'True False'
    ),
    'flowcontrol-multisplit': createAction(
      'hf:multisplit', 'flowcontrol', 'icon-flowcontrol-multisplit', 'Multi Split Branch', null,  null, 'Multi Split'
    ),

    'flowcontrol-start': createAction(
      'hf:start', 'flowcontrol', 'icon-flowcontrol-start', 'Start', null,  null, 'Exit'
    ),
    'flowcontrol-exit': createAction(
      'hf:exit', 'flowcontrol', 'icon-flowcontrol-exit', 'Exit', null,  null, 'Exit'
    ),
    'flowcontrol-separator': {
      group: 'flowcontrol',
      separator: true
    },
    'custom-triangle': createAction(
      'hf:triangle', 'custom', 'icon-custom-triangle', 'Email', null,  null, 'Email'
    ),
    'custom-circle': createAction(
      'hf:circle', 'custom', 'icon-custom-circle', 'Text', null,  null, 'Text'
    ),
    'custom-separator': {
      group: 'custom',
      separator: true
    },
    'lasso-tool': {
      group: 'tools',
      className: 'bpmn-icon-lasso-tool',
      title: 'Activate the lasso tool',
      action: {
        click: function(event) {
          lassoTool.activateSelection(event);
        }
      }
    },
    'space-tool': {
      group: 'tools',
      className: 'bpmn-icon-space-tool',
      title: 'Activate the create/remove space tool',
      action: {
        click: function(event) {
          spaceTool.activateSelection(event);
        }
      }
    },
    'tool-separator': {
      group: 'tools',
      separator: true
    },
    'create.start-event': createAction(
      'bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none'
    ),
    'create.intermediate-event': createAction(
      'bpmn:IntermediateThrowEvent', 'event', 'bpmn-icon-intermediate-event-none'
    ),
    'create.end-event': createAction(
      'bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none'
    ),
    'create.exclusive-gateway': createAction(
      'bpmn:ExclusiveGateway', 'gateway', 'bpmn-icon-gateway-xor'
    ),
    'create.task': createAction(
      'bpmn:Task', 'activity', 'bpmn-icon-task'
    ),
    'create.subprocess-expanded': createAction(
      'bpmn:SubProcess', 'activity', 'bpmn-icon-subprocess-expanded', 'Create expanded SubProcess',
      null, null, null,{ isExpanded: true }
    ),
    'create.participant-expanded': {
      group: 'collaboration',
      className: 'bpmn-icon-participant',
      title: 'Create Pool/Participant',
      action: {
        dragstart: createParticipant,
        click: createParticipant
      }
    }
  });

  return actions;
};
