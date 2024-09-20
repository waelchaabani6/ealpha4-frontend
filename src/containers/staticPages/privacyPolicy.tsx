import React, { useEffect, useState } from 'react';
import toast from '@shared/toast';

const PrivacyPolicy = () => {
  const [htmlContent, setHtmlContent] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://www.ealpha4.com/privacy-policy').then((resp) => resp.text());
        setHtmlContent(response);
      } catch (error: any) {
        toast('error', error || 'Error');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-full bg-white">
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};

export default PrivacyPolicy;
