import React, { useCallback, useContext, useState } from 'react';
import { ImageDropzone } from 'react-file-utils';
import { logChatPromiseExecution } from 'stream-chat';
import {
  ChannelContext,
  ChatAutoComplete,
  EmojiPicker,
  useMessageInput,
} from 'stream-chat-react';

import './TeamMessageInput.css';

import { UploadsPreview } from './UploadsPreview';
import { TeamTypingIndicator } from '../TeamTypingIndicator/TeamTypingIndicator';

import { BoldIcon } from '../../assets/BoldIcon';
import { CodeSnippet } from '../../assets/CodeSnippet';
import { ItalicsIcon } from '../../assets/ItalicsIcon';
import { LightningBolt } from '../../assets/LightningBolt';
import { LightningBoltSmall } from '../../assets/LightningBoltSmall';
import { SendButton } from '../../assets/SendButton';
import { SmileyFace } from '../../assets/SmileyFace';
import { StrikeThroughIcon } from '../../assets/StrikeThroughIcon';

export const TeamMessageInput = (props) => {
  const {
    acceptedFiles,
    channel,
    maxNumberOfFiles,
    multipleUploads,
    sendMessage,
  } = useContext(ChannelContext);

  const [boldState, setBoldState] = useState(false);
  const [codeState, setCodeState] = useState(false);
  const [giphyState, setGiphyState] = useState(false);
  const [italicState, setItalicState] = useState(false);
  const [strikeThroughState, setStrikeThroughState] = useState(false);

  const resetIconState = () => {
    setBoldState(false);
    setCodeState(false);
    setItalicState(false);
    setStrikeThroughState(false);
  };

  const getPlaceholder = () => {
    if (channel.type === 'team') {
      return `#${channel.data.id || 'random'}`;
    }

    const members = Object.values(channel.state.members);
    return members[0]?.user.name || 'Johnny Blaze';
  };

  const overrideSubmitHandler = (message) => {
    let updatedMessage;

    if (message.attachments.length && message.text.startsWith('/giphy')) {
      const updatedText = message.text.replace('/giphy', '');
      updatedMessage = { ...message, text: updatedText };
    }

    if (giphyState) {
      const updatedText = `/giphy ${message.text}`;
      updatedMessage = { ...message, text: updatedText };
    } else {
      if (boldState) {
        const updatedText = `**${message.text}**`;
        updatedMessage = { ...message, text: updatedText };
      }

      if (codeState) {
        const updatedText = `\`${message.text}\``;
        updatedMessage = { ...message, text: updatedText };
      }

      if (italicState) {
        const updatedText = `*${message.text}*`;
        updatedMessage = { ...message, text: updatedText };
      }

      if (strikeThroughState) {
        const updatedText = `~~${message.text}~~`;
        updatedMessage = { ...message, text: updatedText };
      }
    }

    const sendMessagePromise = sendMessage(updatedMessage || message);
    logChatPromiseExecution(sendMessagePromise, 'send message');

    setGiphyState(false);
    resetIconState();
  };

  const messageInput = useMessageInput({ ...props, overrideSubmitHandler });

  const onChange = useCallback(
    (e) => {
      if (
        messageInput.text.length === 1 &&
        e.nativeEvent?.inputType === 'deleteContentBackward'
      ) {
        setGiphyState(false);
      }

      if (
        !giphyState &&
        messageInput.text.startsWith('/giphy') &&
        !messageInput.numberOfUploads
      ) {
        e.target.value = e.target.value.replace('/giphy', '');
        setGiphyState(true);
      }

      messageInput.handleChange(e);
    },
    [giphyState, messageInput],
  );

  const onCommandClick = (e) => {
    e.preventDefault();

    if (messageInput.textareaRef.current) {
      messageInput.textareaRef.current.focus();
    }

    const newEvent = {
      ...e,
      preventDefault: () => null,
      target: { ...e.target, value: '/' },
    };

    logChatPromiseExecution(channel.keystroke(), 'start typing event');
    messageInput.handleChange(newEvent);
  };

  const GiphyIcon = () => (
    <div className="giphy-icon__wrapper">
      <LightningBoltSmall />
      <p className="giphy-icon__text">GIPHY</p>
    </div>
  );

  return (
    <div className="team-message-input__wrapper">
      <ImageDropzone
        accept={acceptedFiles}
        handleFiles={messageInput.uploadNewFiles}
        multiple={multipleUploads}
        disabled={
          (maxNumberOfFiles !== undefined &&
            messageInput.numberOfUploads >= maxNumberOfFiles) ||
          giphyState
        }
      >
        <div className="team-message-input__input">
          <div className="team-message-input__top">
            {giphyState && !messageInput.numberOfUploads && <GiphyIcon />}
            <UploadsPreview {...messageInput} />
            <ChatAutoComplete
              commands={messageInput.getCommands()}
              innerRef={messageInput.textareaRef}
              handleSubmit={messageInput.handleSubmit}
              onSelectItem={messageInput.onSelectItem}
              onChange={onChange}
              value={messageInput.text}
              rows={1}
              maxRows={props.maxRows}
              placeholder={`Message ${getPlaceholder()}`}
              onPaste={messageInput.onPaste}
              triggers={props.autocompleteTriggers}
              grow={props.grow}
              disabled={props.disabled}
              additionalTextareaProps={{
                ...props.additionalTextareaProps,
              }}
            />
            <div
              className="team-message-input__button"
              role="button"
              aria-roledescription="button"
              onClick={messageInput.handleSubmit}
            >
              <SendButton />
            </div>
          </div>
          <div className="team-message-input__bottom">
            <div className="team-message-input__icons">
              <SmileyFace openEmojiPicker={messageInput.openEmojiPicker} />
              <LightningBolt {...{ onCommandClick }} />
              <div className="icon-divider"></div>
              <BoldIcon {...{ boldState, resetIconState, setBoldState }} />
              <ItalicsIcon
                {...{ italicState, resetIconState, setItalicState }}
              />
              <StrikeThroughIcon
                {...{
                  resetIconState,
                  strikeThroughState,
                  setStrikeThroughState,
                }}
              />
              <CodeSnippet {...{ codeState, resetIconState, setCodeState }} />
            </div>
          </div>
        </div>
      </ImageDropzone>
      <TeamTypingIndicator type="input" />
      <EmojiPicker {...messageInput} />
    </div>
  );
};
