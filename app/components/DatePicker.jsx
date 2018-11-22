import React from 'react';
import { DatePicker } from 'antd-mobile';   


function formatDate(date) {
  /* eslint no-confusing-arrow: 0 */
  const pad = n => n < 10 ? `0${n}` : n;
  const dateStr = `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${dateStr}`;
}
const CustomChildren = ({ extra, onClick, children }) => (
  <div className="datePicker"
    onClick={onClick}
  >
    {children}
    <span>{extra}</span>
  </div>
);

class DatePickerSelect extends React.Component {
  constructor(props){
    super(props);
    this.state={
      date:props.defaultDate,
      nowDate:props.nowDate,
      maxDate:props.maxDate,
      minDate:props.minDate,
      SetValidityDate:props.SetValidityDate
    }
  }
  
  render() {
    let {date,nowDate,maxDate,minDate,SetValidityDate} = this.state;
    return (
      <DatePicker
        value={date}
        onChange={date =>{
          this.setState({ date },()=>{
            let day = new Date(date.getFullYear(),date.getMonth(),date.getDate(),23,59,59);
            SetValidityDate(day)
          })
        } }
        mode="date"
        minDate={minDate}
        maxDate={maxDate}
        format={val => `${formatDate(val).split('`/')}`}
      >
        <CustomChildren></CustomChildren>
      </DatePicker>

    );
  }
}

export default DatePickerSelect;