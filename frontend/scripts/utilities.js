export function shiftData(currData, days, isInc) {
  let returnData = new Date(currData);
  const shiftDays = isInc ? days : -days;
  returnData.setDate(currData.getDate() + shiftDays);
  return returnData;
}

/**
 * Checks vehicle availability for a given date range or single date
 * @param {string} recordId - Vehicle ID to check
 * @param {Date|null} startDate - Start date of the period (optional)
 * @param {Date|null} endDate - End date of the period (optional)
 * @returns {Promise<boolean>} - Returns true if vehicle is available
 */
export async function checkVehicleAvailability(
  recordId,
  startDate = null,
  endDate = null
) {
  const collection = "Booking";
  const apiUrl = "https://kittoch-car-hire.onrender.com/api/universalCRUD";

  const startPeriodDate = startDate
    ? (() => {
        const now = new Date(startDate);
        now.setHours(0, 0, 0, 0);
        return now;
      })()
    : (() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now;
      })();

  const endPeriodDate = endDate
    ? (() => {
        const now = new Date(endDate);
        now.setHours(23, 59, 59, 999);
        return now;
      })()
    : (() => {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        return now;
      })();

  const dayCounter = 365;
  const currentDataStartPeriod = shiftData(startPeriodDate, dayCounter, false);
  const currentDataEndPeriod = shiftData(endPeriodDate, dayCounter, true);

  // Period check
  const dateRanges = {
    StartDate: {
      start: startPeriodDate,
      end: endPeriodDate,
    },
    ReturnDate: {
      start: startPeriodDate,
      end: endPeriodDate,
    },
  };

  if (startDate && endDate) {
    // Period check already set
  } else if (startDate) {
    // Single start date check
    dateRanges.StartDate = {
      start: shiftData(startPeriodDate, dayCounter, false),
      end: shiftData(startPeriodDate, 1, true),
    };
    dateRanges.ReturnDate = {
      start: startPeriodDate,
      end: shiftData(startPeriodDate, dayCounter, true),
    };
  } else if (endDate) {
    // Single end date check
    dateRanges.StartDate = {
      start: shiftData(endPeriodDate, dayCounter, false),
      end: endPeriodDate,
    };
    dateRanges.ReturnDate = {
      start: shiftData(endPeriodDate, 1, false),
      end: shiftData(endPeriodDate, dayCounter, true),
    };
  } else {
    // Current date check
    dateRanges.StartDate = {
      start: currentDataStartPeriod,
      end: endPeriodDate,
    };
    dateRanges.ReturnDate = {
      start: startPeriodDate,
      end: currentDataEndPeriod,
    };
  }

  try {
    const response = await fetch(`${apiUrl}/filtered/${collection}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filters: { CarId: recordId },
        dateRanges,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return !(data.results && data.results.length > 0);
  } catch (error) {
    console.error("Availability check failed:", error);
    throw error;
  }
}

// Helper function to format dates
export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}
