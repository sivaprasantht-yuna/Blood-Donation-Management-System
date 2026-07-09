import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function ModernDatePicker({ value, onChange, placeholder = "Select Date" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial date or default to today
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Get number of days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (e, day) => {
    e.preventDefault();
    e.stopPropagation();
    const formattedMonth = String(currentMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Create grid arrays
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const calendarGrid = [...blanks, ...days];

  // Check if selected date matches this grid cell
  const isSelected = (day) => {
    if (!value) return false;
    const d = new Date(value);
    return (
      d.getDate() === day &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  // Format date display (e.g., "Jul 8, 2026")
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative text-left" ref={containerRef}>
      <div
        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-within:border-red-500 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}>
          {value ? formatDateDisplay(value) : placeholder}
        </span>
        <CalendarIcon size={16} className="text-gray-400 dark:text-gray-300" />
      </div>

      {isOpen && (
        <div 
          className="absolute left-0 mt-2 z-50 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="bg-transparent border-none text-xs font-black text-gray-850 dark:text-white focus:outline-none focus:ring-0 cursor-pointer p-0 select-none"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="bg-transparent border-none text-xs font-black text-gray-850 dark:text-white focus:outline-none focus:ring-0 cursor-pointer p-0 select-none"
              >
                {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 15 + i).map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 dark:text-gray-500 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {calendarGrid.map((day, idx) => {
              if (day === null) {
                return <div key={`blank-${idx}`} className="py-1.5" />;
              }

              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={(e) => handleSelectDay(e, day)}
                  className={`py-1.5 rounded-lg transition font-semibold cursor-pointer ${
                    selected
                      ? "bg-red-600 text-white font-extrabold"
                      : today
                        ? "border border-red-500 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                        : "text-gray-750 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-750"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
