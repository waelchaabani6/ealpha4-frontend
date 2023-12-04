import { ContentState, convertToRaw, EditorState, Modifier } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import React, { useEffect, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

type Props = {
  onChange: (value: any) => void;
  value: any;
  error?: boolean;
}

AppTextEditor.defaultProps = {
  error: false
};

export default function AppTextEditor({ onChange, value, error }: Props) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (!updated) {
      const defaultValue = value || '';
      const blocksFromHtml = htmlToDraft(defaultValue);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHtml.contentBlocks,
        blocksFromHtml.entityMap
      );
      const newEditorState = EditorState.createWithContent(contentState);
      setEditorState(newEditorState);
    }
  }, [value]);

  const onEditorStateChange = (editorStat: any) => {
    setUpdated(true);
    setEditorState(editorStat);

    return onChange(draftToHtml(convertToRaw(editorStat.getCurrentContent())));
  };

  return (
    <div className={`p-4 min-h-[250px] ${error ? 'bg-red-200' : 'bg-white'} rounded-md border ${error ? 'border-red-500' : 'border-linegray'}`}>
      <Editor
        spellCheck={true}
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        wrapperClassName={`min-h-[250px] ${error ? 'bg-red-200' : 'bg-white-200'}`}
      />
    </div>
  );
}
