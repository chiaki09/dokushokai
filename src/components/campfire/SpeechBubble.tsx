'use client'

interface SpeechBubbleProps {
  content: string
  direction: 'left' | 'right'
  userName: string
  userColor: string
}

export function SpeechBubble({ content, direction, userName, userColor }: SpeechBubbleProps) {
  const maxLength = 50
  const displayContent = content.length > maxLength
    ? content.substring(0, maxLength) + '...'
    : content

  return (
    <div
      className={`
        relative max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300
        ${direction === 'left' ? 'mr-4' : 'ml-4'}
      `}
    >
      {/* Speech bubble */}
      <div
        className={`
          relative px-4 py-3 rounded-2xl text-sm font-medium text-campfire-text shadow-lg border
          ${direction === 'left'
            ? 'rounded-bl-sm bg-campfire-warm'
            : 'rounded-br-sm bg-campfire-warm'
          }
        `}
        style={{
          borderColor: userColor + '40',
        }}
      >
        {/* Content */}
        <div className="relative z-10">
          {displayContent}
        </div>

        {/* Speech bubble tail */}
        <div
          className={`
            absolute top-1/2 transform -translate-y-1/2 w-0 h-0
            ${direction === 'left'
              ? 'right-full border-r-8 border-l-0'
              : 'left-full border-l-8 border-r-0'
            }
            border-t-8 border-b-8 border-t-transparent border-b-transparent
          `}
          style={{
            borderRightColor: direction === 'left' ? '#252019' : 'transparent',
            borderLeftColor: direction === 'right' ? '#252019' : 'transparent',
          }}
        />
      </div>
    </div>
  )
}
