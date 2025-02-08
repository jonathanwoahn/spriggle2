import { EVENTS } from './state.js';

export const reducer = (state, action) => {
  switch(action.task) {
    case EVENTS.CHANGE_STATE:
      return { ...state, isOn: action.status };
    case EVENTS.UPDATE_PROCESSING:
      return { ...state, isProcessing: action.status };
    case EVENTS.STATE:
      return {...state};
    default:
      console.error('Unknown task:', action.task);
      return state;
  }
}
