import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import './style.css';

type Props = {
  uiArr: any[];
  responsive:any;
}

export default function Index(props: Props) {
  return (
    <Carousel
      responsive={props.responsive}
      arrows={true}
      itemClass="px-3 pt-4 pb-7"
    >
      {props.uiArr}
    </Carousel>
  );
}
