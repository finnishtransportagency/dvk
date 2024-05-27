import React, { useEffect, useRef, useState } from 'react';
import MDEditor, { ICommand, bold, codeEdit, codeLive, codePreview, italic, link } from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { IonLabel } from '@ionic/react';
import { ActionType, Lang, TEXTAREA_MAXLENGTH } from '../../utils/constants';
import './MarkdownInput.css';

interface MarkdownInputProps {
  label: string;
  val: string;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number) => void;
  actionType: ActionType;
  actionLang?: Lang;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({ label, val, setValue, actionType, actionLang, required, disabled, error }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const getTextareaElement = () => {
    // div "container" > div "w-md-editor" > div "w-md-editor-content" > div "w-md-editor-area" > div "w-md-editor-text" > textarea
    const textareaNode = editorRef.current?.firstChild?.childNodes[1]?.firstChild?.firstChild?.lastChild;
    return textareaNode ? (textareaNode as HTMLTextAreaElement) : null;
  };

  const focusInput = () => {
    const element = getTextareaElement();
    element?.focus();
  };

  const [isValid, setIsValid] = useState(!error);
  const [isTouched, setIsTouched] = useState(false);

  const checkValidity = () => {
    if (error) {
      setIsValid(false);
    } else {
      const element = getTextareaElement();
      if (element) {
        setIsValid(element?.checkValidity());
      }
    }
    setIsTouched(true);
    console.log(isValid);
  };

  const handleChange = (newVal: string | null | undefined) => {
    if (isTouched) checkValidity();
    setValue(newVal as string, actionType, actionLang);
  };

  useEffect(() => {
    if (isTouched) {
      const element = getTextareaElement();
      if (error) setIsValid(false);
      if (element) setIsValid(element?.checkValidity());
      setIsTouched(false);
    } else if (!required && !val.trim() && !error) {
      setIsValid(true);
    }
  }, [required, error, isTouched, val]);

  const boldCommand: ICommand = {
    ...bold,
    buttonProps: { 'aria-label': 'Lihavoitu', title: 'Lihavoitu' },
  };

  const italicCommand: ICommand = {
    ...italic,
    buttonProps: { 'aria-label': 'Kursivoitu', title: 'Kursivoitu' },
  };

  const linkCommand: ICommand = {
    ...link,
    buttonProps: { 'aria-label': 'Linkki', title: 'Linkki' },
  };

  const editViewCommand: ICommand = {
    ...codeEdit,
    buttonProps: { 'aria-label': 'Muokkaa', title: 'Muokkaa' },
  };

  const liveViewCommand: ICommand = {
    ...codeLive,
    buttonProps: { 'aria-label': 'Live', title: 'Live' },
  };

  const previewCommand: ICommand = {
    ...codePreview,
    buttonProps: { 'aria-label': 'Esikatsele', title: 'Esikatsele' },
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
          onBlur={() => checkValidity()}
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
          }}
          textareaProps={{
            maxLength: TEXTAREA_MAXLENGTH,
            required: required,
          }}
          commands={[boldCommand, italicCommand, linkCommand]}
          extraCommands={[editViewCommand, liveViewCommand, previewCommand]}
        />
      </div>
    </>
  );
};

export default MarkdownInput;
