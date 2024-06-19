import React, { useState, useRef, PropsWithChildren } from 'react';

interface CopyableTextProps {
    text: string;
    cropInStart?: number;
    cropInEnd?: number;
}

export const CopyableText = ({text, cropInStart, cropInEnd}: PropsWithChildren<CopyableTextProps>) => {
  const [copied, setCopied] = useState(false);
  const textRef = useRef(null);

  const handleCopy = () => {
    // const range = document.createRange();
    // range.selectNodeContents(textRef.current);
    // const selection = window.getSelection();
    // selection?.removeAllRanges();
    // selection?.addRange(range);

    // document.execCommand('copy');
    navigator.clipboard.writeText(text)
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // selection?.removeAllRanges();
  };

  return (
    <div>
      <p
        ref={textRef}
        onClick={handleCopy}
        style={{
          display: 'inline',
          marginRight: '10px',
          cursor: 'pointer',
          textDecoration: copied ? 'underline' : 'none',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
      >
        {cropInStart && cropInEnd ? (
            text.slice(0, cropInStart) + "..." + text.slice(text.length - cropInEnd)
        ) : (
            text
        )
        }
      </p>
    </div>
  );
};

export default CopyableText;
