import { LanguageSupport, StreamLanguage } from '@codemirror/language'
import type { StreamParser } from '@codemirror/language'
import type { CustomLanguage } from '@codesandbox/sandpack-react'
import { c, cpp, csharp, java } from '@codemirror/legacy-modes/mode/clike'
import { go } from '@codemirror/legacy-modes/mode/go'
import { python } from '@codemirror/legacy-modes/mode/python'
import { r } from '@codemirror/legacy-modes/mode/r'
import { ruby } from '@codemirror/legacy-modes/mode/ruby'
import { rust } from '@codemirror/legacy-modes/mode/rust'
import { shell } from '@codemirror/legacy-modes/mode/shell'
import { standardSQL } from '@codemirror/legacy-modes/mode/sql'
import { xml } from '@codemirror/legacy-modes/mode/xml'
import { yaml } from '@codemirror/legacy-modes/mode/yaml'

// Sandpack ships JS/TS/HTML/CSS; these cover the rest of what students write.
const legacy = (
  name: string,
  extensions: string[],
  parser: StreamParser<unknown>
): CustomLanguage => ({
  name,
  extensions,
  language: new LanguageSupport(StreamLanguage.define(parser)),
})

export const EXTRA_EDITOR_LANGUAGES: CustomLanguage[] = [
  legacy('python', ['py'], python),
  legacy('java', ['java'], java),
  legacy('c', ['c', 'h'], c),
  legacy('cpp', ['cpp', 'cc', 'hpp'], cpp),
  legacy('csharp', ['cs'], csharp),
  legacy('go', ['go'], go),
  legacy('rust', ['rs'], rust),
  legacy('ruby', ['rb'], ruby),
  legacy('shell', ['sh', 'bash'], shell),
  legacy('sql', ['sql'], standardSQL),
  legacy('r', ['r'], r),
  legacy('yaml', ['yaml', 'yml'], yaml),
  legacy('xml', ['svg', 'xml'], xml),
]
