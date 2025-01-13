'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Copy } from 'lucide-react'

export function CopyToClipboard({ text }: { text: string | undefined }) {
  const [isCopied, setIsCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCopy = async () => {
    if (inputRef.current) {
      try {
        await navigator.clipboard.writeText(inputRef.current.value)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
      } catch (err) {
        console.error('Failed to copy text: ', err)
      }
    }
  }

  return (
    <span className="inline-flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        value={text}
        readOnly
        ref={inputRef}
        className="flex-grow"
      />
      <Button
        onClick={handleCopy}
        variant="outline"
        size="icon"
        className="flex-shrink-0"
      >
        {isCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </span>
  )
}

