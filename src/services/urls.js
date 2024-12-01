/* eslint-disable prettier/prettier */
// export function URL() {
//   return {
//     login: 'http://192.168.0.49:3002/query/mobile/login.php',
//     otp: 'http://192.168.0.49:3002/query/mobile/mail/mail.php',
//     updateEmail: 'http://192.168.0.49:3002/query/mobile/updateEmail.php',
//     updatePassword: 'http://192.168.0.49:3002/query/mobile/updatePassword.php',
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

export function URL() {
  return {
    login: 'http://192.168.0.129/timekeeping/admin/query/mobile/login.php',
    otp: 'http://192.168.0.129/timekeeping/admin/query/mobile/mail/mail.php',
    updateEmail:
      'http://192.168.0.129/timekeeping/admin/query/mobile/updateEmail.php',
    updatePassword:
      'http://192.168.0.129/timekeeping/admin/query/mobile/updatePassword.php',
  };
}

export async function executeRequest(url, method, data, result) {
  result({error: false, loading: true});
  const request = await fetch(url, {
    method,
    body: data,
    headers: {'Content-Type': 'application/json'},
  });
  if (request.ok) {
    const data = await request.json();
    return result({error: false, loading: false, data: data});
  } else {
    return result({error: true, loading: false, data: 'Internal Server Error'});
  }
}
