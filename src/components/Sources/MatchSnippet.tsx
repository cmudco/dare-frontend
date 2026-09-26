import { ContentMatch } from '@/redux/types/files'

interface MatchSnippetProps {
  match: ContentMatch
  query: string
}

/** The matching passage with the query marked, as the server found it. */
const MatchSnippet = ({ match, query }: MatchSnippetProps) => {
  const at = match.snippet.toLowerCase().indexOf(query.toLowerCase())
  const end = at + query.length
  return (
    <p className='truncate pl-7 text-xs text-muted-foreground'>
      {match.page !== null && `p. ${match.page} · `}
      {at === -1 ? (
        match.snippet
      ) : (
        <>
          {match.snippet.slice(0, at)}
          <mark className='rounded-sm bg-primary/15 px-0.5 text-foreground'>
            {match.snippet.slice(at, end)}
          </mark>
          {match.snippet.slice(end)}
        </>
      )}
    </p>
  )
}

export default MatchSnippet
