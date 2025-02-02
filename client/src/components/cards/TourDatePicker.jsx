import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { House, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

const TourDatePicker = ({ setDate, setTourModalOpen }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isFixed, setIsFixed] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  // Handle scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNextDate = () => {
    setSelectedDate(selectedDate.add(1, "day"));
  };

  const handlePrevDate = () => {
    const today = dayjs();
    if (!selectedDate.isSame(today, "day")) {
      setSelectedDate(selectedDate.subtract(1, "day"));
    }
  };

  return (
    <div
      className={`w-52 bg-white shadow-xl rounded-lg text-center z-50 ${isFixed ? "fixed top-24 right-10" : "absolute top-[450px] right-10"
        }`}
    >
      {/* Header Section */}
      <div className="flex justify-center items-center pt-4 mb-4">
        <House className="text-gray-500" />
        <span className="ml-2 text-sm font-medium text-gray-500">Tour Date</span>
      </div>

      <hr className="border-gray-200 my-4" />

      {/* Date Selector */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <ChevronLeft
          className={`text-gray-500 cursor-pointer hover:text-gray-700 ${selectedDate.isSame(dayjs(), "day") ? "opacity-50 cursor-not-allowed" : ""
            }`}
          onClick={handlePrevDate}
        />
        <div className="px-4 py-2 border rounded-lg">
          <p className="text-sm font-medium">{selectedDate.format("ddd")}</p>
          <p className="text-lg font-bold">{selectedDate.format("D")}</p>
          <p className="text-sm text-gray-500">{selectedDate.format("MMM")}</p>
        </div>
        <ChevronRight
          className="text-gray-500 cursor-pointer hover:text-gray-700"
          onClick={handleNextDate}
        />
      </div>

      {/* Schedule Button */}
      {currentUser ? (
        <div
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 cursor-pointer rounded-b-lg transition-colors duration-300"
          onClick={() => {
            setDate(selectedDate);
            setTourModalOpen(true);
          }}
        >
          Schedule Tour
        </div>
      ) : (
          <button
            className="bg-gray-300 text-white font-bold py-4 w-full rounded-b-lg cursor-not-allowed"
            disabled
          >
            Signin to Schedule
          </button>
      )}
    </div>
  );
};

export default TourDatePicker;
