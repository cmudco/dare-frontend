import {
  BookOpen,
  Building2,
  Hash,
  Lightbulb,
  MapPin,
  Scale,
  Tag,
  User,
  type LucideIcon,
} from 'lucide-react'

const KINDS: Record<string, { icon: LucideIcon; label: string }> = {
  person: { icon: User, label: 'Person' },
  organization: { icon: Building2, label: 'Organization' },
  location: { icon: MapPin, label: 'Place' },
  title: { icon: BookOpen, label: 'Title' },
  concept: { icon: Lightbulb, label: 'Concept' },
  law: { icon: Scale, label: 'Law' },
  identifier: { icon: Hash, label: 'Identifier' },
}

export const entityKind = (kind: string) =>
  KINDS[kind] ?? { icon: Tag, label: kind }

export const relationText = (label: string) => label.replace(/_/g, ' ')
