
// Utility for fetching city and state from pincode
export interface PincodeData {
  city: string;
  state: string;
  district?: string;
}

export const fetchLocationFromPincode = async (pincode: string): Promise<PincodeData | null> => {
  if (!pincode || pincode.length !== 6) {
    return null;
  }

  try {
    // Using India Post API for pincode lookup
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const postOffice = data[0].PostOffice[0];
      return {
        city: postOffice.District,
        state: postOffice.State,
        district: postOffice.District
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching pincode data:', error);
    return null;
  }
};

// Debounce function to limit API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
