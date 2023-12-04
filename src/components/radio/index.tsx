import {
  Radio,
  RadioProps
} from '@mui/material';

export default function Index(props: RadioProps) {
  return <Radio
    sx={{
      color: 'var(--sunlight)',
      '&.Mui-checked': {
        color: 'var(--sunlight)'
      }
    }}
    {...props}
  />;
}
