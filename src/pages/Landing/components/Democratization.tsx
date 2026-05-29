import React from 'react'
import { Container, Eyebrow, Section, SectionTitle } from './primitives'

export const Democratization: React.FC = () => {
  return (
    <Section className='border-t border-border'>
      <Container>
        <div className='grid gap-14 lg:grid-cols-12'>
          <div className='lg:col-span-5'>
            <Eyebrow index='01'>Access</Eyebrow>
            <SectionTitle className='mt-5'>
              AI should not require an enterprise budget.
            </SectionTitle>
          </div>

          <div className='space-y-6 text-lg leading-relaxed text-muted-foreground lg:col-span-7'>
            <p>
              Access to frontier models has not been evenly distributed across
              higher education. Large research universities with dedicated
              infrastructure teams and enterprise contracts have options that
              smaller institutions do not.
            </p>
            <p>
              DARE is designed to change that. Any institution can deploy DARE,
              connect the models they choose, and run a governed AI environment
              for their students and faculty — without significant
              infrastructure overhead or vendor dependency. A community college
              and an R1 research university can run the same platform, each
              configured on their own terms.
            </p>

            <blockquote className='border-l-2 border-dare pl-6'>
              <p className='font-serif text-xl font-medium leading-snug text-foreground sm:text-2xl'>
                Not a shared service someone else controls, but infrastructure
                you own, pointed at models you select, governed by policies you
                set.
              </p>
            </blockquote>
          </div>
        </div>
      </Container>
    </Section>
  )
}

export default Democratization
