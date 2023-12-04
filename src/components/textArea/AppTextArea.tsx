import React, { forwardRef } from 'react';

type Props = {
  onChange: (value: any) => void;
  value: any;
  error?: boolean;
  customClass?: any;
  disabled?:boolean;
}

const AppTextArea = forwardRef(({ onChange, value, error, customClass, disabled }: Props, ref: any) => (
  <div>
    <textarea className={`w-full h-[100px] p-4 bg-gray-200 rounded-md border ${error ? 'border-red-500' : 'border-linegray'} ${customClass}`} rows={2} value={value} onChange={onChange} ref={ref} />
  </div>
));

AppTextArea.defaultProps = {
  error: false
};

export default AppTextArea;
