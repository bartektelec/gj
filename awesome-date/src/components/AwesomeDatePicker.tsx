import * as React from 'react';
import { getDaysInMonth } from 'date-fns';
import { debounce } from 'lodash';
import styled from 'styled-components';

const StyledContainer = styled.div`
  box-sizing: border-box;
  font-size: 2.5rem;
  line-height: 3rem;
  font-weight: bolder;
  color: blue;
  height: 20rem;
  display: flex;
  justify-content: stretch;
  align-items: center;
  position: relative;
  perspective: 200px;
  perspective-origin: 50% 50%;
  mask-image: linear-gradient(
    to bottom,
    transparent 17%,
    white,
    transparent 83%
  );
  ::before {
    z-index: -1;
    display: block;
    content: '';
    position: absolute;
    top: calc((20rem - 3.5rem) / 2);
    left: 0;
    right: 0;
    height: calc(3.5rem);
    background-color: #dddddd;
    border-top: 2px solid lightgray;
    border-bottom: 2px solid lightgray;
  }
`;

const StyledList = styled.ul`
  box-sizing: border-box;
  display: block;
  padding: 10rem 0;
  list-style: none;
  margin: 0 0.5rem;
  height: 100%;
  text-align: center;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;

  :first-child {
    color: #333;
  }
  :last-child {
    color: #5252ff;
  }

  ::-webkit-scrollbar {
    display: none;
  }
`;

const StyledListItem = styled.li<{ rotateX?: number; rotateY?: number }>`
  transform: scaleZ(0.8) translateZ(0.2rem)
    rotateX(${({ rotateX }) => rotateX + 'deg' || 0});
  transform-origin: ${({ rotateX }) =>
    rotateX ? (rotateX < 0 ? '80% center' : '20% center') : 'center'};
  transition: opacity 0.4s ease, transform 0.4s ease;
  scroll-snap-align: center;
  cursor: pointer;
`;
export interface AwesomeDatePickerProps {
  minYear?: number;
  maxYear?: number;
  lineRotation?: number;
  onChange?: (value: Date) => void;
}

const AwesomeDatePicker: React.FC<AwesomeDatePickerProps> = ({
  minYear = 1950,
  maxYear = 2050,
  lineRotation = 20,
  onChange,
}) => {
  const [selectedDay, setSelectedDay] = React.useState<number>(1);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(0);
  const [selectedYear, setSelectedYear] = React.useState<number>(minYear);
  const [currentDate, setCurrentDate] = React.useState<Date>(
    new Date(selectedYear, selectedMonth, selectedDay)
  );
  const [currentMonthDays, setCurrentMonthDays] = React.useState<number>(
    getDaysInMonth(currentDate)
  );

  React.useEffect(() => {
    setCurrentMonthDays(getDaysInMonth(new Date(selectedYear, selectedMonth)));
    setCurrentDate(new Date(selectedYear, selectedMonth, selectedDay));
  }, [selectedDay, selectedMonth, selectedYear]);

  React.useEffect(() => {
    if (!onChange) return;
    onChange(currentDate);
  }, [currentDate, onChange]);

  const whichItem = (scrollTop: number): number => {
    if (scrollTop < 24) return 0;
    return Math.round((scrollTop - 24) / 48);
  };
  const yearsList = Array.from(
    { length: maxYear - minYear + 1 },
    (_, index) => index + minYear
  );

  const daysList = Array.from(
    { length: currentMonthDays },
    (_, index) => index + 1
  );

  const monthList = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const handleScrollDays = (e: React.UIEvent<HTMLUListElement, UIEvent>) => {
    const target = e.target as HTMLUListElement;
    const item = whichItem(target.scrollTop);
    setSelectedDay(daysList[item]);
  };
  const handleScrollMonth = (e: React.UIEvent<HTMLUListElement, UIEvent>) => {
    const target = e.target as HTMLUListElement;
    const item = whichItem(target.scrollTop);
    setSelectedMonth(item);
  };
  const handleScrollYear = (e: React.UIEvent<HTMLUListElement, UIEvent>) => {
    const target = e.target as HTMLUListElement;
    const item = whichItem(target.scrollTop);
    setSelectedYear(yearsList[item]);
  };

  const handleScrollTo = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLLIElement;
    const parentEl = target.parentElement;
    if (!parentEl || !target.dataset.value) return;
    parentEl.scrollTop = parseInt(target.dataset.value) * 48 + 24;
  };

  const calculateRotation = (elValue: number, selectedValue: number) =>
    elValue === selectedValue
      ? 0
      : elValue < selectedValue
      ? Math.min((selectedValue - elValue) * lineRotation, lineRotation * 3)
      : -Math.min((elValue - selectedValue) * lineRotation, lineRotation * 3);

  return (
    <StyledContainer>
      <StyledList onScroll={debounce(handleScrollDays, 350)}>
        {daysList.map((el, index) => (
          <StyledListItem
            data-value={index}
            onClick={handleScrollTo}
            rotateY={-10}
            rotateX={calculateRotation(el, selectedDay)}
            key={'day-' + el}
          >
            {el}
          </StyledListItem>
        ))}
      </StyledList>
      <StyledList onScroll={debounce(handleScrollMonth, 350)}>
        {monthList.map((el, index) => (
          <StyledListItem
            key={'month-' + el}
            data-value={index}
            onClick={handleScrollTo}
            rotateX={calculateRotation(index, selectedMonth)}
          >
            {el}
          </StyledListItem>
        ))}
      </StyledList>
      <StyledList onScroll={debounce(handleScrollYear, 350)}>
        {yearsList.map((el, index) => (
          <StyledListItem
            key={'year-' + el}
            data-value={index}
            onClick={handleScrollTo}
            rotateY={10}
            rotateX={calculateRotation(el, selectedYear)}
          >
            {el}
          </StyledListItem>
        ))}
      </StyledList>
    </StyledContainer>
  );
};

export default AwesomeDatePicker;
