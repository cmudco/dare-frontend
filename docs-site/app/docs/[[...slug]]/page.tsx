import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page'

import { getMDXComponents } from '@/components/mdx'
import { source } from '@/lib/source'

type PageProps = {
  params: Promise<{
    slug?: string[]
  }>
}

export function generateStaticParams() {
  return source.generateParams('slug')
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = source.getPage(slug)

  if (!page) {
    return {}
  }

  return {
    title: page.data.title,
    description: page.data.description,
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const page = source.getPage(slug)

  if (!page) {
    notFound()
  }

  const MDX = page.data.body

  return (
    <DocsPage
      toc={page.data.toc}
      tableOfContent={{
        style: 'clerk',
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description ? (
        <DocsDescription>{page.data.description}</DocsDescription>
      ) : null}
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  )
}
