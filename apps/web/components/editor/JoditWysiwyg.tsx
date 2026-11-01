"use client";

import dynamic from "next/dynamic";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export interface JoditWysiwygHandle {
  insertImage: (imageUrl: string, altText?: string) => void;
  insertHtmlAtCursor: (html: string) => void;
  saveSelection: () => void;
  restoreSelection: () => void;
  getEditor: () => any;
}

type Props = {
  value: string;
  onChange: (newContent: string) => void;
  placeholder?: string;
  direction?: "rtl" | "ltr";
  onOpenMediaPicker?: () => void;
};

const JoditWysiwyg = forwardRef<JoditWysiwygHandle, Props>(function JoditWysiwyg(
  {
    value,
    onChange,
    placeholder = "محتوای مقاله را اینجا بنویسید...",
    direction = "rtl",
    onOpenMediaPicker,
  },
  ref
) {
  const editorRef = useRef<any>(null);
  const savedSelectionRef = useRef<any>(null);

  // Keep a stable ref to onOpenMediaPicker so config NEVER changes identity on re-render
  const onOpenMediaPickerRef = useRef(onOpenMediaPicker);
  useEffect(() => {
    onOpenMediaPickerRef.current = onOpenMediaPicker;
  }, [onOpenMediaPicker]);

  // Keep a stable ref to onChange callback
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Track internal content so we never feed back the editor's own typing into jodit.value
  const internalContentRef = useRef<string>(value || "");
  const [editorValue, setEditorValue] = useState<string>(value || "");
  const isTypingRef = useRef(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize when value is modified from the OUTSIDE (e.g. switching articles or form reset)
  useEffect(() => {
    if (value === internalContentRef.current || isTypingRef.current) {
      return;
    }
    internalContentRef.current = value || "";
    setEditorValue(value || "");
    if (editorRef.current && editorRef.current.value !== value) {
      try {
        editorRef.current.value = value || "";
      } catch (err) {
        console.warn("[Jodit] Could not sync external value", err);
      }
    }
  }, [value]);

  // Cleanup typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  const handleOpenPicker = () => {
    try {
      if (editorRef.current?.s) {
        savedSelectionRef.current = editorRef.current.s.save();
      }
    } catch (err) {
      console.warn("[Jodit] Could not save selection for media picker", err);
    }
    if (onOpenMediaPickerRef.current) {
      onOpenMediaPickerRef.current();
    }
  };

  useImperativeHandle(ref, () => ({
    saveSelection: () => {
      try {
        if (editorRef.current?.s) {
          savedSelectionRef.current = editorRef.current.s.save();
        }
      } catch (e) {
        console.warn("[Jodit] Could not save selection", e);
      }
    },
    restoreSelection: () => {
      try {
        if (editorRef.current?.s && savedSelectionRef.current) {
          editorRef.current.s.restore();
          savedSelectionRef.current = null;
        }
      } catch (e) {
        console.warn("[Jodit] Could not restore selection", e);
      }
    },
    insertImage: (imageUrl: string, altText?: string) => {
      if (!editorRef.current) return;
      try {
        if (savedSelectionRef.current && editorRef.current.s) {
          editorRef.current.s.restore();
          savedSelectionRef.current = null;
        }

        const alt = (altText || "تصویر مقاله").replace(/"/g, "&quot;");
        const imgTag = `<p><img src="${imageUrl}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 16px; margin: 16px 0;" /></p>`;

        if (editorRef.current.s && typeof editorRef.current.s.insertHTML === "function") {
          editorRef.current.s.insertHTML(imgTag, true);
        } else {
          editorRef.current.value = (editorRef.current.value || "") + imgTag;
        }

        const updatedVal = editorRef.current.value || "";
        internalContentRef.current = updatedVal;
        onChangeRef.current(updatedVal);
      } catch (err) {
        console.error("[Jodit] Error inserting image:", err);
      }
    },
    insertHtmlAtCursor: (html: string) => {
      if (!editorRef.current) return;
      try {
        if (savedSelectionRef.current && editorRef.current.s) {
          editorRef.current.s.restore();
          savedSelectionRef.current = null;
        }
        if (editorRef.current.s && typeof editorRef.current.s.insertHTML === "function") {
          editorRef.current.s.insertHTML(html, true);
        } else {
          editorRef.current.value = (editorRef.current.value || "") + html;
        }
        const updatedVal = editorRef.current.value || "";
        internalContentRef.current = updatedVal;
        onChangeRef.current(updatedVal);
      } catch (err) {
        console.error("[Jodit] Error inserting html:", err);
      }
    },
    getEditor: () => editorRef.current,
  }));

  const handleEditorChange = (newContent: string) => {
    internalContentRef.current = newContent;
    isTypingRef.current = true;
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 400);

    onChangeRef.current(newContent);
  };

  const handleEditorBlur = (newContent: string) => {
    internalContentRef.current = newContent;
    isTypingRef.current = false;
    onChangeRef.current(newContent);
  };

  // Config is completely stable: it only depends on placeholder and direction
  // It NEVER recreates the editor instance during typing!
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder,
      direction,
      theme: "dark",
      minHeight: 480,
      toolbarSticky: true,
      toolbarStickyOffset: 72,
      toolbarAdaptive: false,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      link: {
        openInNewTabCheckbox: true,
        noFollowCheckbox: true,
      },
      controls: {
        image: {
          exec: () => {
            handleOpenPicker();
          },
          tooltip: "انتخاب و آپلود تصویر از کتابخانه رسانه آن‌ساپ",
        },
      },
      buttons: [
        "source",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "paragraph",
        "fontsize",
        "brush",
        "|",
        "link",
        "image",
        "table",
        "|",
        "align",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "fullsize",
      ],
      style: {
        background: "#121416",
        color: "#e1e2e5",
        borderColor: "rgba(225, 226, 229, 0.1)",
        fontFamily: "var(--font-yekan-bakh), sans-serif",
      },
    }),
    [placeholder, direction]
  );

  return (
    <div className="space-y-2 relative">
      {onOpenMediaPicker && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleOpenPicker}
            className="px-4 py-2 rounded-xl bg-panel border border-foreground/15 text-mint hover:text-white hover:bg-primary/40 text-xs font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <svg className="w-4 h-4 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>+ درج تصویر از کتابخانه رسانه آن‌ساپ</span>
          </button>
        </div>
      )}

      {/* Sticky toolbar container with proper layering */}
      <div className="rounded-2xl border border-foreground/10 bg-[#121416] shadow-sm relative [&_.jodit-toolbar__box]:sticky [&_.jodit-toolbar__box]:top-[72px] [&_.jodit-toolbar__box]:z-20 [&_.jodit-toolbar__box]:bg-[#191c1e] [&_.jodit-toolbar__box]:border-b [&_.jodit-toolbar__box]:border-foreground/10 [&_.jodit-container]:border-0 [&_.jodit-container]:bg-transparent">
        <JoditEditor
          ref={editorRef}
          value={editorValue}
          config={config}
          onChange={handleEditorChange}
          onBlur={handleEditorBlur}
        />
      </div>
    </div>
  );
});

export default JoditWysiwyg;
