/* eslint-disable linebreak-style */
import { createContext } from 'react';

const defaultDate = { start: new Date(), end: new Date() };

const HolidayDatesContext = createContext(defaultDate);
export default HolidayDatesContext;
