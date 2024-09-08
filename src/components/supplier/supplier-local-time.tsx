import React, { useState, useEffect } from "react";

const SupplierLocalTime = ({ utcOffset }: { utcOffset: number }) => {
  const [localTime, setLocalTime] = useState("");
  const [dayDifference, setDayDifference] = useState(0);
  const [isBusinessHours, setIsBusinessHours] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const userTime = new Date(
        now.toLocaleString("en-US", {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      );

      // Calculate supplier's time
      const supplierTime = new Date(now.getTime() + utcOffset * 60 * 60 * 1000);

      // Format supplier's time

      try {
        const formattedTime = supplierTime.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC"
        });
        setLocalTime(formattedTime);

        // Calculate day difference relative to user's local time
        const userDay = userTime.getDate();
        const supplierDay = supplierTime.getUTCDate();
        const userMonth = userTime.getMonth();
        const supplierMonth = supplierTime.getUTCMonth();
        const userYear = userTime.getFullYear();
        const supplierYear = supplierTime.getUTCFullYear();

        let diff = supplierDay - userDay;

        // Adjust for month/year boundaries
        if (
          supplierYear > userYear ||
          (supplierYear === userYear && supplierMonth > userMonth)
        ) {
          diff += 1;
        } else if (
          supplierYear < userYear ||
          (supplierYear === userYear && supplierMonth < userMonth)
        ) {
          diff -= 1;
        }

        setDayDifference(diff);

        // Check if it's business hours
        const dayOfWeek = supplierTime.getUTCDay();
        const hours = supplierTime.getUTCHours();
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        const isWorkHours = hours >= 8 && hours < 17;
        setIsBusinessHours(isWeekday && isWorkHours);
      } catch (error) {
        console.error("Error formatting time:", error);
        setLocalTime("Invalid Time");
        setDayDifference(0);
        setIsBusinessHours(false);
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, [utcOffset]);

  const renderDayDifference = () => {
    if (dayDifference === 0) return null;
    const sign = dayDifference > 0 ? "+" : "";
    return (
      <sup className="ml-1 text-xs font-bold">
        {sign}
        {dayDifference}
      </sup>
    );
  };

  const formatOffset = (offset: number) => {
    const sign = offset >= 0 ? "+" : "-";
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset);
    const minutes = Math.round((absOffset - hours) * 60);
    return `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <div className="text-sm font-medium">
      <div className="flex items-center">
        <span>{localTime}</span>
        {renderDayDifference()}
        <span
          className={`ml-2 h-3 w-3 rounded-full ${isBusinessHours ? "bg-green-500" : "bg-red-500"}`}
          title={isBusinessHours ? "Business Hours" : "Outside Business Hours"}
        ></span>
      </div>
      <div className="text-xs text-gray-500">{formatOffset(utcOffset)}</div>
    </div>
  );
};

export default SupplierLocalTime;
