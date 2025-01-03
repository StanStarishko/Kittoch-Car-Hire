/* export function shiftData(currData, days, isInc) {
  let returnData = new Date(currData);
  const shiftDays = isInc ? days : -days;
  returnData.setDate(currData.getDate() + shiftDays);
  return returnData;
}
 */

export function getCarTitle(car) {
  return `${car.VehicleId} ${car.Make} ${car.Model}`
}

/**
 * Checks vehicle availability for a given date range or single date
 * @param {string} recordId - Vehicle ID to check
 * @param {Date|null} startDate - Start date of the period (optional)
 * @param {Date|null} endDate - End date of the period (optional)
 * @param {inside|null} boolean - Either only startDate or endDate must be specified (optional)
 *        - If true, the specified date is between startDate and endDate
 *        - If false, the specified date is outside the range from startDate to endDate 
 * @returns {Promise<boolean>} - Returns true if vehicle is available
 */
export async function checkVehicleAvailability(
  recordId,
  startDate = null,
  endDate = null,
  inside = true
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

  /*   const dayCounter = 365;
  const currentDataStartPeriod = shiftData(startPeriodDate, dayCounter, false);
  const currentDataEndPeriod = shiftData(endPeriodDate, dayCounter, true);
 */

  let bodyJSON = null;

  if (startDate && endDate) {
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

    bodyJSON = JSON.stringify({
      filters: {
        CarId: recordId,
        insideDateRanges: inside
      },
      dateRanges,
    });
  } else {
    const queryDate = startPeriodDate ? startPeriodDate : endPeriodDate;
    const queryAvailable = inside ? "noAvailableDate" : "availableDate";

    bodyJSON = JSON.stringify({
      filters: {
        CarId: recordId,
        [queryAvailable]: queryDate,
      },
    });

  }

  // for debugging
  //console.log(JSON.stringify(bodyJSON, null, 4));

  try {
    const response = await fetch(`${apiUrl}/filtered/${collection}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyJSON,
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`recordId: ${recordId}, data.results.length: ${data.results.length}`);
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

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear(); // Год

  return `${day}-${month}-${year}`;
}
