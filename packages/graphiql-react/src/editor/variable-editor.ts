import type { SchemaReference } from 'codemirror-graphql/utils/SchemaReference';
import { useEffect, useRef } from 'react';

import { useExecutionContext } from '../execution';
import {
  commonKeys,
  DEFAULT_EDITOR_THEME,
  DEFAULT_KEY_MAP,
  importCodeMirror,
} from './common';
import { useEditorContext } from './context';
import {
  useChangeHandler,
  useCompletion,
  useKeyMap,
  useMergeQuery,
  usePrettifyEditors,
  useSynchronizeOption,
} from './hooks';
import { WriteableEditorProps } from './types';

export type UseVariableEditorArgs = WriteableEditorProps & {
  /**
   * Invoked when a reference to the GraphQL schema (type or field) is clicked
   * as part of the editor or one of its tooltips.
   * @param reference The reference that has been clicked.
   */
  onClickReference?(reference: SchemaReference): void;
  /**
   * Invoked when the contents of the variables' editor change.
   * @param value The new contents of the editor.
   */
  onEdit?(value: string): void;
};

// To make react-compiler happy, otherwise complains about using dynamic imports in Component
function importCodeMirrorImports() {
  return importCodeMirror([
    import('codemirror-graphql/esm/variables/hint.js'),
    import('codemirror-graphql/esm/variables/lint.js'),
    import('codemirror-graphql/esm/variables/mode.js'),
  ]);
}

// To make react-compiler happy, otherwise complains about - Hooks may not be referenced as normal values
const _useVariableEditor = useVariableEditor;

export function useVariableEditor(
  {
    editorTheme = DEFAULT_EDITOR_THEME,
    keyMap = DEFAULT_KEY_MAP,
    onClickReference,
    onEdit,
    readOnly = false,
  }: UseVariableEditorArgs = {},
  caller?: Function,
) {
  const { initialVariables, variableEditor, setVariableEditor } =
    useEditorContext({
      nonNull: true,
      caller: caller || _useVariableEditor,
    });
  const executionContext = useExecutionContext();
  const merge = useMergeQuery({ caller: caller || _useVariableEditor });
  const prettify = usePrettifyEditors({ caller: caller || _useVariableEditor });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let isActive = true;

    void importCodeMirrorImports().then(CodeMirror => {
      // Don't continue if the effect has already been cleaned up
      if (!isActive) {
        return;
      }
      const container = ref.current;
      if (!container) {
        return;
      }

      const newEditor = CodeMirror(container, {
        value: initialVariables,
        lineNumbers: true,
        tabSize: 2,
        mode: 'graphql-variables',
        theme: editorTheme,
        autoCloseBrackets: true,
        matchBrackets: true,
        showCursorWhenSelecting: true,
        readOnly: readOnly ? 'nocursor' : false,
        foldGutter: true,
        lint: {
          // @ts-expect-error
          variableToType: undefined,
        },
        hintOptions: {
          closeOnUnfocus: false,
          completeSingle: false,
          container,
          // @ts-expect-error
          variableToType: undefined,
        },
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        extraKeys: commonKeys,
      });

      newEditor.addKeyMap({
        'Cmd-Space'() {
          newEditor.showHint({ completeSingle: false, container });
        },
        'Ctrl-Space'() {
          newEditor.showHint({ completeSingle: false, container });
        },
        'Alt-Space'() {
          newEditor.showHint({ completeSingle: false, container });
        },
        'Shift-Space'() {
          newEditor.showHint({ completeSingle: false, container });
        },
      });

      newEditor.on('keyup', (editorInstance, event) => {
        const { code, key, shiftKey } = event;
        const isLetter = code.startsWith('Key');
        const isNumber = !shiftKey && code.startsWith('Digit');
        if (isLetter || isNumber || key === '_' || key === '"') {
          editorInstance.execCommand('autocomplete');
        }
      });

      setVariableEditor(newEditor);
    });

    return () => {
      isActive = false;
    };
  }, [editorTheme, initialVariables, readOnly, setVariableEditor]);

  useSynchronizeOption(variableEditor, 'keyMap', keyMap);

  useChangeHandler(
    variableEditor,
    onEdit,
    STORAGE_KEY,
    'variables',
    _useVariableEditor,
  );

  useCompletion(variableEditor, onClickReference);

  useKeyMap(variableEditor, ['Cmd-Enter', 'Ctrl-Enter'], executionContext?.run);
  useKeyMap(variableEditor, ['Shift-Ctrl-P'], prettify);
  useKeyMap(variableEditor, ['Shift-Ctrl-M'], merge);

  return ref;
}

export const STORAGE_KEY = 'variables';
