import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MDEditor, { ICommand, bold, codeEdit, codeLive, codePreview, italic, link } from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { PluggableList } from 'unified';
import { IonLabel } from '@ionic/react';
import { ActionType, Lang, TEXTAREA_MAXLENGTH } from '../../utils/constants';
import './MarkdownInput.css';
import { getInputCounterText } from '../../utils/common';

interface MarkdownInputProps {
  label: string;
  val: string;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number) => void;
  actionType: ActionType;
  actionLang?: Lang;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({ label, val, setValue, actionType, actionLang, required, disabled, error, helperText }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'general' });
  const editorRef = useRef<HTMLDivElement>(null);
  const rehypePlugins = [[rehypeSanitize, { tagNames: ['p', 'a', 'b', 'strong', 'em', 'br'] }]] as PluggableList;

  const [isValid, setIsValid] = useState(!error);
  const [isTouched, setIsTouched] = useState(false);

  const maxLength = TEXTAREA_MAXLENGTH;
  const counterText = val ? getInputCounterText(val.length, maxLength) : '';

  const getTextareaElement = () => {
    // div "container" > div "w-md-editor" > div "w-md-editor-content" > div "w-md-editor-area" > div "w-md-editor-text" > textarea
    // When preview mode is selected, returns 'P' instead of 'TEXTAREA'
    const textareaNode = editorRef.current?.firstChild?.childNodes[1]?.firstChild?.firstChild?.lastChild;
    return textareaNode?.nodeName === 'TEXTAREA' ? (textareaNode as HTMLTextAreaElement) : null;
  };

  const focusInput = () => {
    const element = getTextareaElement();
    element?.focus();
  };

  const checkValidity = useCallback(() => {
    if (!error) {
      const element = getTextareaElement();
      if (element) {
        setIsValid(element.checkValidity());
      }
    }
  }, [error]);

  const handleChange = (newVal: string | null | undefined) => {
    if (isTouched) checkValidity();
    setValue(newVal as string, actionType, actionLang);
  };

  const getErrorText = () => {
    if (error) return error;
    if (!isValid) return t('required-field');
    return '';
  };

  useEffect(() => {
    if (isTouched) {
      checkValidity();
      setIsTouched(false);
    } else if (error) {
      setIsValid(false);
    } else if (!required && !val.trim() && !error) {
      setIsValid(true);
    }
  }, [required, error, isTouched, val, checkValidity]);

  const boldCommand: ICommand = {
    ...bold,
    buttonProps: { 'aria-label': t('markdown.bold'), title: `${t('markdown.bold')} (ctrl + b)` },
  };

  const italicCommand: ICommand = {
    ...italic,
    buttonProps: { 'aria-label': t('markdown.italic'), title: `${t('markdown.italic')} (ctrl + i)` },
  };

  const linkCommand: ICommand = {
    ...link,
    buttonProps: { 'aria-label': t('markdown.hyperlink'), title: `${t('markdown.hyperlink')} (ctrl + l)` },
  };

  const editViewCommand: ICommand = {
    ...codeEdit,
    buttonProps: { 'aria-label': t('markdown.edit-view'), title: `${t('markdown.edit-view')} (ctrl + 7)` },
  };

  const liveViewCommand: ICommand = {
    ...codeLive,
    buttonProps: { 'aria-label': t('markdown.live-view'), title: `${t('markdown.live-view')} (ctrl + 8)` },
  };

  const previewCommand: ICommand = {
    ...codePreview,
    buttonProps: { 'aria-label': t('markdown.preview'), title: `${t('markdown.preview')} (ctrl + 9)` },
  };

  return (
    <>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={() => focusInput()}>
        {label} {required ? '*' : ''}
      </IonLabel>
      <div className="md-editor-container" ref={editorRef}>
        <MDEditor
          className={isValid ? '' : 'error'}
          value={val}
          onChange={(value) => handleChange(value)}
          onBlur={() => {
            checkValidity();
            setIsTouched(true);
          }}
          previewOptions={{
            rehypePlugins: rehypePlugins,
          }}
          textareaProps={{
            maxLength: maxLength,
            required: required,
          }}
          commands={[boldCommand, italicCommand, linkCommand]}
          extraCommands={[editViewCommand, liveViewCommand, previewCommand]}
          defaultTabEnable
        />
        <div className="textarea-helper">
          {!error && isValid && counterText && <div className="counter">{counterText}</div>}
          {!error && isValid && !counterText && helperText && <div className="helper-text">{helperText}</div>}
          {(error || !isValid) && <div className="error-text">{getErrorText()}</div>}
        </div>
      </div>
    </>
  );
};

export default MarkdownInput;
