import RouteLayout from '@layout/routeLayout';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { useMemo } from 'react';
import StaticHeader from './staticHeader';
import StaticFooter from './staticFooter';

export default function HowToUse() {
  const data = [
    {
      title: 'How to use Alpha Assessments Powered by Learnosity'
    },
    {
      title: 'How to use Wizenoze resources on eAlpha'
    },
    {
      title: 'Use Zoom or Google Hangouts to deliver an eAlpha lesson'
    },
    {
      title: 'A Guide to eAlpha for Parents – English Language '
    },
    {
      title: 'A Guide to eAlpha for Parents – Standard Arabic Language (بالعربية الفصحى)'
    },
    {
      title: 'A Guide to eAlpha for Parents – Arabic Language (بالعربي)'
    },
    {
      title: 'A Guide to eAlpha for Parents – Spanish Language (en español)'
    },
    {
      title: 'Create and work on assignments'
    },
    {
      title: 'Create and use connections'
    },
    {
      title: 'Run Reports'
    },
    {
      title: 'How to use eAlpha Offline'
    },
    {
      title: 'Upload Examview test scores to eAlpha'
    },
    {
      title: 'Use the School Panel'
    }
  ];
  const renderAccordian = useMemo(() => data.map((item: any) => (
    <Accordion expanded={false}>
      <AccordionSummary
        sx={{
          backgroundColor: 'var(--sandgray)',
          flexDirection: 'row-reverse'
        }}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <p className="py-1">{item.title}</p>
      </AccordionSummary>
      {/* <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails> */}
    </Accordion>
  )), [data]);
  return (
    <RouteLayout navBack={false} overflow={true}>
      <StaticHeader />
      <h2 className="text-3xl my-4 pl-6 mt-28">How To Use</h2>
      <div className="p-6">
        <p className="font-semibold mb-2">Browsing the Content:</p>
        <div className="flex flex-col gap-y-3">
          {
            ['Math', 'Science', 'ELA', 'ELT'].map((sub: string) => (
              <Accordion>
                <AccordionSummary
                  sx={{
                    backgroundColor: 'var(--sandgray)',
                    flexDirection: 'row-reverse'
                  }}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <p className="py-1">{sub}</p>
                </AccordionSummary>
                {/* <AccordionDetails>
                  <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                    malesuada lacus ex, sit amet blandit leo lobortis eget.
                  </Typography>
                </AccordionDetails> */}
              </Accordion>
            ))
          }
        </div>
        <p className="font-semibold mb-2 mt-4">How To:</p>
        <div className="flex flex-col gap-y-3">
          {renderAccordian}
        </div>
      </div>
      <StaticFooter />
    </RouteLayout>
  );
}
