import * as React from "react";
import { getDaysInMonth } from "date-fns";
import styled from "styled-components";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const StyledContainer = styled.div`
  box-sizing: border-box;
  font-size: 2.5rem;
  font-weight: bolder;
  color: blue;
  height: 20rem;
  border: 1px solid red;
  display: flex;
  justify-content: stretch;
  align-items: center;
  position: relative;
  ::before {
    z-index: -1;
    display: block;
    content: "";
    position: absolute;
    top: calc((20rem - 3.5rem) / 2);
    left: 0;
    right: 0;
    height: calc(3.5rem);
    background-color: #ececec;
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
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  :first-child {
    color: black;
  }
  :last-child {
    color: #3b3bff;
  }
`;

const StyledListItem = styled.li`
  scroll-snap-align: center;
`;
export interface AwesomeDatePickerProps {
  minYear?: number;
  maxYear?: number;
}

const AwesomeDatePicker: React.FC<AwesomeDatePickerProps> = ({
  minYear = 1950,
  maxYear = 2050,
}) => {
  const [currentMonthDays, setCurrentMonthDays] = React.useState<number>(30);
  const [selectedDays, setSelectedDays] = React.useState<number>(1);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(1);
  const [selectedYearr, setSelectedYear] = React.useState<number>(2000);
  return (
    <StyledContainer>
      <StyledList>
        {Array.from({ length: currentMonthDays }, (x, index) => index + 1).map(
          (el) => (
            <StyledListItem key={"day-" + el}>{el}</StyledListItem>
          )
        )}
      </StyledList>
      <StyledList>
        {MONTH_NAMES.map((el) => (
          <StyledListItem key={"month-" + el}>{el}</StyledListItem>
        ))}
      </StyledList>
      <StyledList>
        {Array.from(
          { length: maxYear - minYear + 1 },
          (x, index) => index + minYear
        ).map((el) => (
          <StyledListItem key={"year-" + el}>{el}</StyledListItem>
        ))}
      </StyledList>
    </StyledContainer>
  );
};

export default AwesomeDatePicker;
