const { createMachine, interpret } = require('xstate');

const candidateStateMachine = createMachine({
  id: 'candidate',
  initial: 'aplicado',
  states: {
    aplicado: {
      on: {
        REVIEW: 'en_revision',
        REJECT: 'rechazado'
      }
    },
    en_revision: {
      on: {
        PRESELECT: 'preseleccionado',
        REJECT: 'rechazado'
      }
    },
    preseleccionado: {
      on: {
        SCHEDULE_INITIAL_INTERVIEW: 'entrevista_inicial',
        REJECT: 'rechazado'
      }
    },
    entrevista_inicial: {
      on: {
        PASS_INITIAL: 'entrevista_tecnica',
        FAIL_INITIAL: 'rechazado'
      }
    },
    entrevista_tecnica: {
      on: {
        PASS_TECHNICAL: 'entrevista_final',
        FAIL_TECHNICAL: 'rechazado'
      }
    },
    entrevista_final: {
      on: {
        APPROVE: 'aprobado',
        REJECT_FINAL: 'rechazado'
      }
    },
    aprobado: {
      on: {
        HIRE: 'contratado'
      }
    },
    rechazado: {
      type: 'final'
    },
    contratado: {
      type: 'final'
    }
  }
});

class CandidateStateService {
  constructor() {
    this.machine = candidateStateMachine;
  }

  getValidTransitions(currentState) {
    const transitions = [];
    
    // Get the state definition from the machine
    const stateNode = this.machine.states[currentState];
    
    if (stateNode && stateNode.on) {
      // Iterate through all possible events for this state
      Object.keys(stateNode.on).forEach(event => {
        const nextState = this.getNextState(currentState, event);
        
        if (nextState !== currentState) {
          const transition = {
            event,
            nextState,
            description: this.getTransitionDescription(event)
          };
          transitions.push(transition);
        }
      });
    }
    
    return transitions;
  }

  canTransition(currentState, event) {
    const service = interpret(this.machine).start();
    const nextState = service.machine.transition(currentState, event);
    service.stop();
    return nextState.value !== currentState;
  }

  getNextState(currentState, event) {
    // Use XState's machine.transition method to get the correct next state
    const service = interpret(this.machine).start();
    const state = service.machine.transition(currentState, event);
    service.stop();
    return state.value;
  }

  getTransitionDescription(event) {
    const descriptions = {
      REVIEW: 'Iniciar revisión del candidato',
      PRESELECT: 'Preseleccionar candidato',
      SCHEDULE_INITIAL_INTERVIEW: 'Programar entrevista inicial',
      PASS_INITIAL: 'Aprobar entrevista inicial',
      FAIL_INITIAL: 'Reprobar entrevista inicial',
      PASS_TECHNICAL: 'Aprobar entrevista técnica',
      FAIL_TECHNICAL: 'Reprobar entrevista técnica',
      APPROVE: 'Aprobar candidato',
      REJECT_FINAL: 'Rechazar en entrevista final',
      HIRE: 'Contratar candidato',
      REJECT: 'Rechazar candidato'
    };
    return descriptions[event] || event;
  }
}

module.exports = CandidateStateService; 