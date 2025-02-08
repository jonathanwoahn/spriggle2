import { reducer } from './reducer.js';
import { state } from './state.js';

export const dispatcher = async (action) => {
  const newState = reducer(state, action);
  Object.assign(state, newState);

  // create a new event for each task type, with a correlated listener to handle the action
  const event = new Event(action.task);
  self.dispatchEvent(event);
  
  return broadcastState();
}

const sendMessage = async (message) => {
  console.log('[Ingestion Worker] External Broadcast: ', message);
  return self.clients.matchAll().then(clients => {
    clients.forEach((client) => client.postMessage(message));
  });
}

export const broadcastState = async () => {
  await sendMessage({ task: 'state', ...state });
}
