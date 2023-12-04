import { styled } from '@mui/system';

const BackgrouduiWrap = styled('div')((props: any): any => ({
  padding: '13px',
  position: 'relative',
  overflow: 'auto',
  '.MuiTableCell-root': {
    borderBottom: 0,
    padding: '5px'
  },
  '.MuiTable-root.MuiTable-stickyHeader': {
    // minWidth: '1200px'
  },
  thead: {
    backgroundColor: 'var(--light-accent)'
  },
  '.MuiTableCell-head': {
    fontFamily: 'Montserrat-500',
    fontSize: '14px',
    color: '#222222',
    '.MuiTableSortLabel-root': {
      fontFamily: 'Montserrat-500'
    }
  },
  '.MuiTableCell-body': {
    fontFamily: 'Montserrat-400'
  },
  nav: {
    padding: '65px 0 40px 0'
  },
  '.innerBoxContainer': {
    boxShadow: '0px 3px 7.5px rgba(0, 0, 0, 0.25)'
  },
  '.tableIconButton': {
    border: '1px solid #E6E6E6',
    borderRadius: '3px',
    padding: '3px'
  },
  'th.MuiTableCell-root': {
    backgroundColor: 'var(--light-accent)'
  },
  '.MuiTableRow-root>*': {
    borderBottom: '1px solid var(--sandgray)'
  },
  'td .MuiFormGroup-root': {
    padding: '7px'
  },
  '.MuiLinearProgress-root': {
    backgroundColor: 'var(--leafgreen)'
  },
  '.MuiLinearProgress-root span': {
    backgroundColor: 'var(--darkgreen)'
  },
  ...props?.css
})) as any;

type Props = {
  children?: React.ReactNode | JSX.Element;
  customCSS?: any;
}

const Wrapper = (props: Props): JSX.Element => (
  <BackgrouduiWrap css={props?.customCSS || ''}>
    {props.children}
  </BackgrouduiWrap>
);

export default Wrapper;

// const BackgrouduiWrap = styled('div')`
//   padding :13px;
//   position:relative;
//   // overflow: auto;
//   .MuiTableCell-root{
//     // border-bottom:0
//   }
//   .MuiTable-root.MuiTable-stickyHeader{
//     min-width : 1200px;
//   }
//   thead{
//     background-color: var(--light-accent);
//   }
//   .MuiTableCell-head {
//     font-family: "Montserrat-500";
//     font-size: 14px;
//     color: #222222;
//     .MuiTableSortLabel-root{
//       font-family: "Montserrat-500";
//     }
//   }
//   .MuiTableCell-body {
//     font-family: "Montserrat-400";
//   }
//   nav{
//     padding: 65px 0 40px 0;
//   }
//   .innerBoxContainer{
//     box-shadow: 0px 3px 7.5px rgba(0, 0, 0, 0.25);
//   }
//   .tableIconButton{
//     border: 1px solid #E6E6E6;
//     border-radius: 3px;
//     padding : 3px;
//   }
//   th.MuiTableCell-root{
//     background-color: var(--light-accent);
//   }
//   .MuiTableCell-root{
//     padding:5px;
//   }
//   .MuiTableRow-root>*{
//     border-bottom: 1px solid var(--sandgray);
//   }
//   td .MuiFormGroup-root {
//     padding : 7px;
//   }
//   .MuiLinearProgress-root {
//     background-color: var(--leafgreen);
//   }

//   .MuiLinearProgress-root span {
//     background-color: var(--darkgreen);
//   }
//   ${css}
// `;
