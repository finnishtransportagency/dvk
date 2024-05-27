import React, { useState } from 'react';
import MDEditor, { ICommand, bold, codeEdit, codeLive, codePreview, italic, link } from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { IonLabel } from '@ionic/react';
import { ActionType, Lang, TEXTAREA_MAXLENGTH } from '../../utils/constants';

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
  /* const inputRef = useRef<HTMLIonTextareaElement>(null);
  const focusInput = () => {
    inputRef.current?.setFocus().catch((err) => {
      console.error(err.message);
    });
  }; */

  const [, setIsValid] = useState(!error);
  const [isTouched, setIsTouched] = useState(false);

  const checkValidity = () => {
    if (error) {
      setIsValid(false);
    }
    setIsTouched(true);
  };

  const handleChange = (newVal: string | null | undefined) => {
    if (isTouched) checkValidity();
    setValue(newVal as string, actionType, actionLang);
  };

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
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')}>
        {label} {required ? '*' : ''}
      </IonLabel>
      <div className="container">
        <MDEditor
          value={val}
          onChange={(value) => handleChange(value)}
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
          }}
          textareaProps={{
            maxLength: TEXTAREA_MAXLENGTH,
          }}
          commands={[boldCommand, italicCommand, linkCommand]}
          extraCommands={[editViewCommand, liveViewCommand, previewCommand]}
        />
      </div>
    </>
  );
};

export default MarkdownInput;
