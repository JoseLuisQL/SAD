'use client';

interface HighlightedTextProps {
  text: string;
  terms?: string[];
  className?: string;
}

export default function HighlightedText({ 
  text, 
  terms = [], 
  className = '' 
}: HighlightedTextProps) {
  if (!terms || terms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Sanitize text to prevent XSS
  const sanitizedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Create a regex pattern from all search terms
  const pattern = terms
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special chars
    .join('|');
  
  if (!pattern) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = sanitizedText.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = terms.some(term => 
          part.toLowerCase() === term.toLowerCase()
        );
        
        return isMatch ? (
          <mark 
            key={index} 
            className="bg-amber-100 text-amber-900 font-semibold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}
