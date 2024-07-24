/* eslint-disable comma-dangle */
import { ReactComponent as Book } from '@images/book.svg';

type SmallBookProps = {
  isTopCenter?: boolean;
  isTopRight?: boolean;
  isTopLeft?: boolean;
  isEmpty?: boolean;
  leftArrow?: boolean;
  gradesName: any;
  index: number;
  handleClick: (index: number) => void;
  image: any;
  logo: any;
  shortName?: any;
};
function SmallBook({
  isTopRight,
  isTopLeft,
  isEmpty,
  leftArrow,
  gradesName,
  index,
  handleClick,
  image,
  logo,
  isTopCenter,
  shortName = '',
}: SmallBookProps): JSX.Element {
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      // style={{ direction: 'ltr' }}
      key={index}
      onClick={() => handleClick(index)}
      className="mt-3 flex-shrink-0 max-w-[230px] py-2 h-12 z-10 flex flex-row items-center bg-[#FFFFFF] mb-6 mx-2 rounded-lg border-solid relative border border-grey-500"
    >
      {!isEmpty && isTopLeft && (
        <div className="absolute top-0 left-[39px] transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-4 h-4 bg-[#FFFFFF] border-l border-t border-grey-500" />
      )}
      {!isEmpty && leftArrow && (
        <div className="absolute top-[10px] left-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-[#FFFFFF] border-l border-b border-grey-500" />
      )}
      {!isEmpty && isTopRight && (
        <div className="absolute top-0 left-[83px] transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-4 h-4 bg-[#FFFFFF] border-l border-t border-grey-500" />
      )}
      {!isEmpty && isTopCenter && (
        <div className="absolute top-0 left-[65px] transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-4 h-4 bg-[#FFFFFF] border-l border-t border-grey-500" />
      )}

      <div className="z-0">
        {image || logo ? (
          <img
            className="h-10 w-12 pl-1"
            src={image || logo}
            alt={gradesName?.grade}
          />
        ) : (
          <Book height={40} width={36} />
        )}
        {/* <img className="h-10 w-12" src={`${image || logo || '/src/assets/images/book.svg'}`} alt={gradesName?.grade} /> */}
      </div>

      <div className="w-full text-sm font-semibold text-center cursor-pointer">
        <span className="ml-3 mr-3">{gradesName.grade}</span>
      </div>
    </div>
  );
}

export default SmallBook;
