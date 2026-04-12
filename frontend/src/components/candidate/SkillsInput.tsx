'use client'

import { useRef, useState } from 'react'

interface Props {
  value: string[]
  onChange: (skills: string[]) => void
  maxSkills?: number
}

const SKILL_SUGGESTIONS = [
  // Tech
  ['React', 'Laravel', 'PHP', 'Python', 'JavaScript', 'TypeScript', 'Node.js', 'MySQL', 'AWS', 'Docker', 'Figma', 'WordPress'],
  // Business
  ['Microsoft Office', 'Excel', 'Project Management', 'Google Analytics', 'CRM', 'Salesforce', 'Content Writing', 'SEO', 'Social Media'],
  // Islamic / Specialist
  ['Arabic', 'Quran Teaching', 'Islamic Finance', 'Community Outreach', 'Fundraising', 'Urdu', 'Public Speaking', 'Research'],
]

const SUGGESTION_ROW_LABELS = ['Tech', 'Business', 'Islamic / Specialist']

export default function SkillsInput({ value, onChange, maxSkills = 30 }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const atMax = value.length >= maxSkills

  function addSkill(raw: string) {
    const skill = raw.trim()
    if (!skill) return
    if (atMax) return
    // Case-insensitive duplicate check
    if (value.some((s) => s.toLowerCase() === skill.toLowerCase())) return
    onChange([...value, skill])
  }

  function removeSkill(skill: string) {
    onChange(value.filter((s) => s !== skill))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(input)
      setInput('')
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip commas from typed input — comma triggers add
    const v = e.target.value.replace(',', '')
    setInput(v)
  }

  return (
    <div>
      {/* Tag input box */}
      <div
        className="min-h-[44px] flex flex-wrap gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white cursor-text focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border"
            style={{ backgroundColor: '#EEF2FF', color: '#033BB0', borderColor: '#C7D2FE' }}
          >
            <span className="max-w-[160px] truncate">{skill}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeSkill(skill) }}
              className="hover:opacity-60 transition-opacity flex-shrink-0"
              aria-label={`Remove ${skill}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        {!atMax && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? 'Add a skill...' : ''}
            className="flex-1 min-w-[120px] text-sm bg-transparent outline-none placeholder-gray-400 py-0.5"
          />
        )}
      </div>

      {/* Counter */}
      <p className={`text-xs mt-1.5 ${atMax ? 'text-red-500' : 'text-gray-400'}`}>
        {atMax
          ? `${maxSkills}/${maxSkills} skills added — remove one to add more`
          : `${value.length}/${maxSkills} skills added`}
      </p>

      {/* Suggestion chips */}
      <div className="mt-3 space-y-2">
        <p className="text-xs font-medium text-gray-500">Quick add:</p>
        {SKILL_SUGGESTIONS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex flex-wrap gap-1.5">
            <span className="text-xs text-gray-400 self-center w-full -mb-0.5 italic">
              {SUGGESTION_ROW_LABELS[rowIdx]}
            </span>
            {row.map((suggestion) => {
              const alreadyAdded = value.some(
                (s) => s.toLowerCase() === suggestion.toLowerCase()
              )
              return (
                <button
                  key={suggestion}
                  type="button"
                  disabled={alreadyAdded || atMax}
                  onClick={() => addSkill(suggestion)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    alreadyAdded
                      ? 'border-gray-200 text-gray-300 cursor-default'
                      : atMax
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  {alreadyAdded ? '✓ ' : '+ '}{suggestion}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
