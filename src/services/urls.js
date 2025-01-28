/* eslint-disable prettier/prettier */
export function URL() {
  return {
    login: 'http://192.168.0.49:3002/query/mobile/login.php',
    syncAccount: 'http://192.168.0.49:3002/query/mobile/syncAccount.php',
    otp: 'http://192.168.0.49:3002/query/mobile/mail/mail.php',
    updateEmail: 'http://192.168.0.49:3002/query/mobile/updateEmail.php',
    updatePassword: 'http://192.168.0.49:3002/query/mobile/updatePassword.php',
    registerDevice: 'http://192.168.0.49:3002/query/mobile/addSerial.php',
    timekeep: 'http://192.168.0.49:3002/query/mobile/timekeep.php',
    recentAction: 'http://192.168.0.49:3002/query/mobile/recentActivity.php',
    syncRecords: 'http://192.168.0.49:3002/query/mobile/syncRecords.php',
  };
}

// export function URL() {
//   return {
//     login: 'http://192.168.1.2:3002/query/mobile/login.php',
//     syncAccount: 'http://192.168.1.2:3002/query/mobile/syncAccount.php',
//     otp: 'http://192.168.1.2:3002/query/mobile/mail/mail.php',
//     updateEmail: 'http://192.168.1.2:3002/query/mobile/updateEmail.php',
//     updatePassword: 'http://192.168.1.2:3002/query/mobile/updatePassword.php',
//     registerDevice: 'http://192.168.1.2:3002/query/mobile/addSerial.php',
//     timekeep: 'http://192.168.1.2:3002/query/mobile/timekeep.php',
//     recentAction: 'http://192.168.1.2:3002/query/mobile/recentActivity.php',
//   };
// }

// export function URL() {
//   return {
//     login: 'http://localhost:3002/query/mobile/login.php',
//     otp: 'http://localhost:3002/query/mobile/mail/mail.php',
//     updateEmail: 'http://localhost:3002/query/mobile/updateEmail.php',
//     updatePassword: 'http://localhost:3002/query/mobile/updatePassword.php',
//     registerDevice: 'http://localhost:3002/query/mobile/addSerial.php',
//   };
// }

// export function URL() {
//   return {
//     login: 'http://192.168.1.5:3002/query/mobile/login.php',
//     otp: 'http://192.168.1.5:3002/query/mobile/mail/mail.php',
//     updateEmail: 'http://192.168.1.5:3002/query/mobile/updateEmail.php',
//     updatePassword: 'http://192.168.1.5:3002/query/mobile/updatePassword.php',
//   };
// }

// export function URL() {
//   return {
//     login: 'http://192.168.0.129/timekeeping/admin/query/mobile/login.php',
//     otp: 'http://192.168.0.129/timekeeping/admin/query/mobile/mail/mail.php',
//     updateEmail:
//       'http://192.168.0.129/timekeeping/admin/query/mobile/updateEmail.php',
//     updatePassword:
//       'http://192.168.0.129/timekeeping/admin/query/mobile/updatePassword.php',
//   };
// }

// export async function executeRequest(url, method, data, result) {
//   result({error: false, loading: true});
//   const request = await fetch(url, {
//     method,
//     body: data,
//     headers: {'Content-Type': 'application/json'},
//   });
//   if (request.ok) {
//     const data = await request.json();
//     return result({error: false, loading: false, data: data});
//   } else {
//     return result({error: true, loading: false, data: 'Internal Server Error'});
//   }
// }

export async function executeRequest(
  url,
  method,
  data,
  result,
  timeout = 8000,
) {
  // Initialize loading state
  result({error: false, loading: true});

  // Create an AbortController to handle timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Ensure data is properly formatted as JSON
    const requestBody = data;

    // Make the fetch request
    const request = await fetch(url, {
      method,
      body: requestBody,
      headers: {'Content-Type': 'application/json'},
      signal: controller.signal,
    });
    // Clear the timeout if the request completes
    clearTimeout(timeoutId);

    // Check if the response is OK
    if (request.ok) {
      const responseData = await request.json();
      return result({error: false, loading: false, data: responseData});
    } else {
      // Handle non-OK responses
      return result({
        error: true,
        loading: false,
        data: `HTTP Error: ${request.status}`,
      });
    }
  } catch (error) {
    // Clear the timeout in case of an error
    clearTimeout(timeoutId);
    console.log(error);

    // Handle specific errors
    if (error.name === 'AbortError') {
      return result({error: true, loading: false, data: 'Request timed out'});
    } else if (error instanceof TypeError) {
      return result({error: true, loading: false, data: 'Network Error'});
    } else {
      return result({
        error: true,
        loading: false,
        data: 'Unknown Error, Please try again a few minutes',
      });
    }
  }
}
