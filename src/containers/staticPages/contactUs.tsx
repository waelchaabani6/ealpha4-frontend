import RouteLayout from '@layout/routeLayout';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { useMemo } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { useGet } from '@shared/api/useApi';
import Banner from '@images/staticPageImages/About-Us_Banner.jpg';
import StaticHeader from './staticHeader';
import StaticFooter from './staticFooter';

export default function ContactUs() {
  const data = [
    {
      title: 'Africa',
      content: 'askme@alphapublishing.com',
      nested: []
    },
    {
      title: 'Asia',
      content: 'askme@alphapublishing.com',
      nested: []
    },
    {
      title: 'Central Asia',
      content: 'aida.ishenbaeva@smarteducation.ae',
      nested: []
    },
    {
      title: 'Europe',
      content: 'askme@alphapublishing.com',
      nested: []
    },
    {
      title: 'Latin America',
      content: 'Gloria.Bohorquez@alphapublishing.com',
      nested: []
    },
    {
      title: 'Middle East',
      content: '',
      nested: [
        {
          title: 'Bahrain',
          content: 'askme@alphapublishing.com'
        },
        {
          title: 'Egypt',
          content: 'tala.barqawi@alphapublishing.com'
        },
        {
          title: 'Jordan',
          content: 'Tala.Barqawi@alphapublishing.com'
        },
        {
          title: 'Kuwait',
          content: 'askme@alphapublishing.com'
        },
        {
          title: 'Lebanon',
          content: 'tala.barqawi@alphapublishing.com'
        },
        {
          title: 'Oman',
          content: 'askme@alphapublishing.com'
        },
        {
          title: 'Palestine',
          content: 'Tala.Barqawi@alphapublishing.com'
        },
        {
          title: 'Qatar',
          content: 'askme@alphapublishing.com'
        },
        {
          title: 'Republic of Iraq',
          content: 'Tala.Barqawi@alphapublishing.com'
        },
        {
          title: 'Saudi Arabia',
          content: 'Ahmad.Alyasin@smarteducation.ae'
        },
        {
          title: 'Syria',
          content: 'tala.barqawi@alphapublishing.com'
        },
        {
          title: 'UAE',
          content: 'askme@alphapublishing.com'
        }
      ]
    },
    {
      title: 'North America',
      content: 'askme@alphapublishing.com',
      nested: []
    },
    {
      title: 'Türkiye',
      content: 'ozbek.inan@smarteducation.ae',
      nested: []
    }
  ];
  const renderAccordian = useMemo(() => data.map((itm: any) => (
    <Accordion>
      <AccordionSummary
        sx={{
          backgroundColor: '#f3f3f3',
          flexDirection: 'row-reverse'
        }}
        expandIcon={<div className="mx-2"><AddIcon className="text-black" /></div>}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <p className="py-1">{itm.title}</p>
      </AccordionSummary>
      <AccordionDetails>
        {
          (itm.nested.length > 0)
            ? itm.nested.map((itm2: any) => (
              <Accordion style={{ boxShadow: 'none', border: 'none' }}>
                <AccordionSummary
                  sx={{
                    flexDirection: 'row-reverse'
                  }}
                  expandIcon={<div className="mx-2"><AddIcon className="text-black" /></div>}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <p className="py-1">{itm2.title}</p>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography className="pl-9">
                    <a className="text-blue-500 hover:underline" href={`mailto:${itm2.content}`}>
                      {itm2.content}
                    </a>
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
            : (
              <Typography className="pl-9">
                <a className="text-blue-500 hover:underline" href={`mailto:${itm.content}`}>
                  {itm.content}
                </a>
              </Typography>
            )
        }

      </AccordionDetails>
    </Accordion>
  )), [data]);

  const { isLoading: pageLoading, data: pageContent } = useGet({
    baseURL: import.meta.env.VITE_APP_CMS_SERVICE_URL,
    url: `cms-service/page/2/`
  });

  return (
    <RouteLayout navBack={false} overflow={true}>
      <StaticHeader />
      {/* eslint-disable-next-line react/no-danger */}
      <div className="mt-24" dangerouslySetInnerHTML={{ __html: pageContent?.data?.response?.content }} />
      {/* <img src={Banner} alt="contact us" className="h-24 mt-24 md:h-auto w-full" />
      <h2 className="text-3xl my-4 pl-6">Contact Us</h2>
      <div className="p-6">
        <div className="h-full grid grid-cols-1 gap-y-4 md:grid-cols-2 gap-x-4">
          <div className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-4">
            <div className="flex flex-col gap-y-4">
              <div className="w-42 p-2">
                <p className="text-2xl font-semibold pb-4">Head Office</p>
                <div>
                  <p>Office #C 1101,Tower C</p>
                  <p>The OPUS Tower by Omniyat,</p>
                  <p>Bussiness Day, Dubai,</p>
                  <p>UAE.</p>
                </div>
              </div>

              <div className="w-42 p-2">
                <p className="text-2xl font-semibold pb-4">UK office</p>
                <div>
                  <p>71-75, Shelton Street,</p>
                  <p>London, United Kingdom,</p>
                  <p>WC2H 9JQ.</p>
                </div>
              </div>
              <div className="w-42 p-2">
                <p className="text-2xl font-semibold pb-4">US office</p>
                <div>
                  <p>242 W 30th Street Suite 1100,</p>
                  <p>New York, NY 10001.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-y-4">
              <div className="w-42 p-2">
                <p className="text-2xl font-semibold pb-4">General enquiries</p>
                <div>
                  <p>askme@alphapublishing.com</p>
                  <p>+971 4 3918658</p>
                </div>
              </div>
            </div>

          </div>
          <div className="flex flex-col gap-y-2">
            <p className="text-2xl font-semibold pb-4">For enquiries in...</p>
            {renderAccordian}
          </div>
        </div>
      </div> */}
      <StaticFooter />
    </RouteLayout>
  );
}
