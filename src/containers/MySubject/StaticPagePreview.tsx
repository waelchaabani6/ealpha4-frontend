import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from '@shared/toast';
import RouteLayout from '@layout/routeLayout';

const StaticPagePreview = () => {
  const [htmlContent, setHtmlContent] = useState('');
  const { state: locationState } = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(locationState?.staticUrl);
        const data = await response.text();
        setHtmlContent(data);
      } catch (error: any) {
        toast('error', error || 'Error');
      }
    };

    fetchData();
  }, []);

  return (
    <RouteLayout navBack={true}>
      <div className="w-full h-full p-4 bg-white mt-2">
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </RouteLayout>
  );
};

export default StaticPagePreview;
