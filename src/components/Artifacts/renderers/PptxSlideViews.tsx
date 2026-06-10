import React from 'react'
import type { PptxSlideConfig, PptxTheme } from '@/redux/types/dareToolResults'

interface SlideViewProps {
  slide: PptxSlideConfig
  theme: Required<PptxTheme>
}

export const MiniSlide: React.FC<SlideViewProps> = ({ slide, theme }) => (
  <div
    className='flex h-full w-full flex-col p-1.5'
    style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
  >
    <div
      className='mb-1 h-0.5 w-full'
      style={{ backgroundColor: theme.primaryColor }}
    />
    <div className='truncate text-[7px] font-bold'>{slide.title}</div>
    <div className='mt-1 space-y-0.5'>
      {(slide.bullets || slide.leftBullets || []).slice(0, 3).map((_, i) => (
        <div
          key={`mini-bullet-${i}`}
          className='h-0.5 rounded-sm'
          style={{ backgroundColor: theme.mutedTextColor, opacity: 0.45 }}
        />
      ))}
    </div>
  </div>
)

export const SlidePreview: React.FC<SlideViewProps> = ({ slide, theme }) => {
  switch (slide.layout) {
    case 'title':
      return <TitleSlide slide={slide} theme={theme} />
    case 'section':
      return <SectionSlide slide={slide} theme={theme} />
    case 'twoColumn':
      return <TwoColumnSlide slide={slide} theme={theme} />
    case 'table':
      return <TableSlide slide={slide} theme={theme} />
    case 'quote':
      return <QuoteSlide slide={slide} theme={theme} />
    case 'summary':
      return <SummarySlide slide={slide} theme={theme} />
    default:
      return <BulletsSlide slide={slide} theme={theme} />
  }
}

const Shell: React.FC<{
  theme: Required<PptxTheme>
  children: React.ReactNode
  accent?: boolean
}> = ({ theme, children, accent }) => (
  <div
    className='relative h-full w-full overflow-hidden p-[64px]'
    style={{
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      fontFamily: theme.fontFamily,
    }}
  >
    <div
      className='absolute top-0 left-0 h-1.5 w-full'
      style={{ backgroundColor: theme.primaryColor }}
    />
    {accent && (
      <div
        className='absolute right-[-7%] bottom-[-18%] h-56 w-56 rounded-full'
        style={{ backgroundColor: theme.accentColor, opacity: 0.18 }}
      />
    )}
    <div className='relative z-10 h-full'>{children}</div>
  </div>
)

const TitleSlide: React.FC<SlideViewProps> = ({ slide, theme }) => (
  <Shell theme={theme} accent>
    <div className='flex h-full max-w-[70%] flex-col justify-center'>
      <h1 className='text-[56px] leading-tight font-bold'>{slide.title}</h1>
      {slide.subtitle && (
        <p
          className='mt-8 text-[28px] leading-relaxed'
          style={{ color: theme.mutedTextColor }}
        >
          {slide.subtitle}
        </p>
      )}
    </div>
  </Shell>
)

const SectionSlide: React.FC<SlideViewProps> = ({ slide, theme }) => (
  <Shell theme={theme}>
    <div className='flex h-full max-w-[76%] flex-col justify-center'>
      <h2 className='text-[48px] leading-tight font-bold'>{slide.title}</h2>
      {(slide.body || slide.subtitle) && (
        <p
          className='mt-7 text-[27px] leading-relaxed'
          style={{ color: theme.mutedTextColor }}
        >
          {slide.body || slide.subtitle}
        </p>
      )}
    </div>
  </Shell>
)

const BulletsSlide: React.FC<SlideViewProps> = ({ slide, theme }) => (
  <Shell theme={theme}>
    <SlideTitle title={slide.title || 'Key Points'} theme={theme} />
    {slide.body && (
      <p
        className='mb-8 text-[22px] leading-snug'
        style={{ color: theme.mutedTextColor }}
      >
        {slide.body}
      </p>
    )}
    <BulletList items={slide.bullets || []} theme={theme} />
  </Shell>
)

const TwoColumnSlide: React.FC<SlideViewProps> = ({ slide, theme }) => (
  <Shell theme={theme}>
    <SlideTitle title={slide.title || 'Comparison'} theme={theme} />
    <div className='grid grid-cols-2 gap-9'>
      <ColumnCard
        title={slide.leftTitle || 'Column 1'}
        items={slide.leftBullets || []}
        theme={theme}
      />
      <ColumnCard
        title={slide.rightTitle || 'Column 2'}
        items={slide.rightBullets || []}
        theme={theme}
      />
    </div>
  </Shell>
)

const TableSlide: React.FC<SlideViewProps> = ({ slide, theme }) => (
  <Shell theme={theme}>
    <SlideTitle title={slide.title || 'Table'} theme={theme} />
    <div className='overflow-hidden rounded-sm border border-slate-200 bg-white'>
      <table className='w-full table-fixed text-left text-[18px]'>
        <thead
          style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
        >
          <tr>
            {(slide.headers || []).map((header, index) => (
              <th
                key={`pptx-header-${index}`}
                className='px-4 py-3 font-semibold'
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(slide.rows || []).slice(0, 8).map((row, rowIndex) => (
            <tr
              key={`pptx-row-${rowIndex}`}
              className={rowIndex % 2 ? 'bg-slate-50' : 'bg-white'}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`pptx-cell-${rowIndex}-${cellIndex}`}
                  className='px-4 py-3 leading-snug text-slate-700'
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Shell>
)

const QuoteSlide: React.FC<SlideViewProps> = ({ slide, theme }) => (
  <Shell theme={theme}>
    <div className='flex h-full flex-col justify-center'>
      <blockquote className='max-w-4xl text-[43px] leading-tight font-bold'>
        "{slide.quote || slide.body}"
      </blockquote>
      {slide.attribution && (
        <p className='mt-9 text-[24px]' style={{ color: theme.mutedTextColor }}>
          - {slide.attribution}
        </p>
      )}
    </div>
  </Shell>
)

const SummarySlide: React.FC<SlideViewProps> = ({ slide, theme }) => (
  <Shell theme={theme}>
    <SlideTitle title={slide.title || 'Summary'} theme={theme} />
    <div className='grid grid-cols-3 gap-6'>
      {(slide.bullets || []).slice(0, 3).map((item, index) => (
        <div
          key={`summary-${index}`}
          className='min-h-[220px] rounded-sm border border-slate-200 bg-white p-7 shadow-xs'
        >
          <div
            className='mb-5 text-[19px] font-bold'
            style={{ color: theme.primaryColor }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
          <p className='text-[25px] leading-snug font-semibold text-slate-900'>
            {item}
          </p>
        </div>
      ))}
    </div>
  </Shell>
)

const SlideTitle: React.FC<{
  title: string
  theme: Required<PptxTheme>
}> = ({ title, theme }) => (
  <h2
    className='mb-10 text-[42px] leading-tight font-bold'
    style={{ color: theme.textColor }}
  >
    {title}
  </h2>
)

const BulletList: React.FC<{
  items: string[]
  theme: Required<PptxTheme>
  compact?: boolean
}> = ({ items, theme, compact }) => {
  const fontSize = getBulletFontSize(items, compact)
  const gapClass = compact || items.length > 5 ? 'space-y-4' : 'space-y-5'

  return (
    <ul className={`${gapClass} leading-snug`} style={{ fontSize }}>
      {items.map((item, index) => (
        <li key={`pptx-bullet-${index}`} className='flex gap-3'>
          <span
            className='mt-[0.55em] h-3 w-3 shrink-0 rounded-full'
            style={{ backgroundColor: theme.primaryColor }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

const ColumnCard: React.FC<{
  title: string
  items: string[]
  theme: Required<PptxTheme>
}> = ({ title, items, theme }) => (
  <div className='rounded-sm border border-slate-200 bg-white p-7 shadow-xs'>
    <h3 className='mb-6 text-[25px] font-bold text-slate-900'>{title}</h3>
    <BulletList items={items} theme={theme} compact />
  </div>
)

function getBulletFontSize(items: string[], compact?: boolean) {
  const longest = Math.max(0, ...items.map((item) => item.length))

  if (compact) {
    if (items.length > 5 || longest > 90) return 18
    if (items.length > 4 || longest > 70) return 20
    return 22
  }

  if (items.length > 6 || longest > 115) return 22
  if (items.length > 5 || longest > 90) return 24
  if (items.length > 4 || longest > 70) return 27
  return 30
}
