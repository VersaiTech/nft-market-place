import React, { useEffect, useState } from 'react';

const initialValues = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};
export default function Clock({ deadline, text }) {
  const [time, setTime] = useState(initialValues);

  useEffect(() => {
    setInterval(() => getTimeUntil(deadline), 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTimeUntil = (deadline) => {
    const time = Date.parse(deadline) - Date.parse(new Date().toString());

    if (time < 0) {
      setTime(initialValues);
    } else {
      const seconds = Math.floor((time / 1000) % 60);
      const minutes = Math.floor((time / 1000 / 60) % 60);
      const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
      const days = Math.floor(time / (1000 * 60 * 60 * 24));
      setTime({ days, hours, minutes, seconds });
    }
  };

  const leading0 = (num) => {
    return num < 10 ? '0' + num : num;
  };

  return (
    <React.Fragment>
      {time.seconds > 0 && (
        <React.Fragment>
          <span className="countdown-label">{text}</span>
          <div className="md:mx-0 w-full md:w- h-[36px] bg-gradient-to-r from-[#73e8f4] via-[#441af5] to-[#E18D9F] p-1 rounded-full clock-container">
            <div
              className={`clock bg-red-300 cursor-pointer w-full h-full rounded-full px-1 py-1 flex gap-2 font-bold text-sm items-center justify-center  dark:bg-[#14215d]`}
            >
              <div className="time-unit">{leading0(time.days)}d</div>
              <div className="time-unit">{leading0(time.hours)}h</div>
              <div className="time-unit">{leading0(time.minutes)}m </div>{' '}
              <div className="time-unit">{leading0(time.seconds)}s </div>{' '}
            </div>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
