// @ts-check
import { useContext } from 'react';
import { ChannelContext } from '../../../context';

export const handleActionWarning = `Action handler was called, but it is missing one of its required arguments.
      Make sure the ChannelContext was properly set and that this hook was initialized with a valid message.`;
/**
 * @type {import('types').useActionHandler}
 */
export const useActionHandler = (message) => {
  const { channel, updateMessage, removeMessage } = useContext(ChannelContext);
  return async (name, value, event) => {
    event.preventDefault();
    if (!message || !updateMessage || !removeMessage || !channel) {
      console.warn(handleActionWarning);
      return;
    }
    const messageID = message.id;
    const formData = {
      [name]: value,
    };
    if (messageID) {
      const data = await channel.sendAction(messageID, formData);

      if (data?.message) {
        updateMessage(data.message);
      } else {
        removeMessage(message);
      }
    }
  };
};
