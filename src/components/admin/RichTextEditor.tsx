'use client';

import { useEffect, useRef } from 'react';

const BUTTON = 'rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-100';

/**
 * Editor mínimo sin dependencias: contentEditable + document.execCommand.
 * Controlado por `value`/`onChange` (no por un input hidden + name) porque
 * los formularios de Campus guardan estado en React y envían JSON, no
 * FormData nativo.
 *
 * El contenido inicial se pone una sola vez, imperativamente, en un
 * useEffect que corre solo al montar — el div contentEditable NUNCA recibe
 * el HTML vía prop en el JSX. Si lo hiciera, cualquier re-render (por
 * ejemplo al subir una imagen en el mismo formulario) le pisaría al usuario
 * lo que ya tipeó, aunque el string de la prop no cambie entre renders.
 */
export default function RichTextEditor(props: {
  value: string;
  onChange: (html: string) => void;
  compact?: boolean;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef(props.value);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = props.value || '<br>';
    }
    // Solo al montar: a partir de acá el contenido lo maneja el DOM directamente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el valor cambia desde afuera (ej. al abrir el modal de edición con
  // otro curso) y no coincide con lo último que emitimos nosotros, resincronizamos.
  useEffect(() => {
    if (editorRef.current && props.value !== lastEmitted.current) {
      editorRef.current.innerHTML = props.value || '<br>';
      lastEmitted.current = props.value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value]);

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    sync();
  }

  function sync() {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const normalized = html === '<br>' ? '' : html;
    lastEmitted.current = normalized;
    props.onChange(normalized);
  }

  function handleLink() {
    const url = window.prompt('URL del link:');
    if (url) exec('createLink', url);
  }

  return (
    <div>
      <div className="mb-1 flex flex-wrap gap-1">
        <button type="button" className={BUTTON} onClick={() => exec('bold')}>
          <b>N</b>
        </button>
        <button type="button" className={BUTTON} onClick={() => exec('italic')}>
          <i>I</i>
        </button>
        {!props.compact && (
          <>
            <button type="button" className={BUTTON} onClick={() => exec('justifyLeft')} title="Alinear a la izquierda">
              ≡←
            </button>
            <button type="button" className={BUTTON} onClick={() => exec('justifyCenter')} title="Centrar">
              ≡○
            </button>
            <button type="button" className={BUTTON} onClick={() => exec('justifyRight')} title="Alinear a la derecha">
              ≡→
            </button>
            <button type="button" className={BUTTON} onClick={() => exec('justifyFull')} title="Justificar">
              ≡≡
            </button>
            <button type="button" className={BUTTON} onClick={() => exec('insertUnorderedList')}>
              Lista
            </button>
            <button type="button" className={BUTTON} onClick={() => exec('insertOrderedList')}>
              1. Lista
            </button>
            <button type="button" className={BUTTON} onClick={handleLink}>
              Link
            </button>
          </>
        )}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        data-placeholder={props.placeholder}
        className={`${props.compact ? 'min-h-[36px]' : 'min-h-[100px]'} rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-lua-600 outline-none [&_a]:underline [&_a]:text-lua-600 [&_li]:ml-4 [&_ol]:list-decimal [&_ul]:list-disc empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400`}
      />
    </div>
  );
}
