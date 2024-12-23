/* eslint-disable prettier/prettier */
import RNFS, {read} from 'react-native-fs';
const USER_DATA = `${RNFS.DocumentDirectoryPath}/timekeeping_data.json`;

export const saveDetails = async data => {
  // console.log(data);
  const details = await readDetails();
  if (!Object.values(details.account)[1].length != 0) {
    await writeDetails(data);
  }
};

export const checkDatasetExists = async () => {
  try {
    const fileExists = await RNFS.exists(USER_DATA);
    return fileExists;
  } catch (error) {
    console.error('Error checking database existence:', error);
    return false;
  }
};

export const readDetails = async () => {
  try {
    const raw = await RNFS.readFile(USER_DATA, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading JSON data:', error);
    return null;
  }
};

export const writeDetails = async data => {
  try {
    const details = await readDetails();
    //Account
    details.account.accountid = data.accountID;
    details.account.email = data.Email;
    details.account.employee = data.EmployeeID;
    details.account.location = data.LocationID;
    details.account.identifier = data.identifier;
    details.account.password = data.Password;
    details.account.name = data.name;
    //Location
    details.location.latitude = data.latitude;
    details.location.longitude = data.longitude;
    details.location.radius = data.radius;
    //Records

    const jsonData = JSON.stringify(details, null, 2);
    await RNFS.writeFile(USER_DATA, jsonData, 'utf8');
    console.log('Data written successfully to:', USER_DATA);
    return true;
  } catch (error) {
    console.error('Error writing JSON data:', error);
    return false;
  }
};

// export const removeDb = async () => {
//   await RNFS.unlink(dbPath);
// };

// export const copyDB = async () => {
//   const externalPath = `${RNFS.DownloadDirectoryPath}/timekeeping_data.json`;
//   try {
//     await RNFS.copyFile(dbPath, externalPath);
//     console.log('File copied to:', externalPath);
//     // Alert.alert('File Copied', `File copied to: ${externalPath}`);
//   } catch (error) {
//     console.error('Error copying file:', error);
//     // Alert.alert('Error', `Failed to copy file: ${error.message}`);
//   }
// };
