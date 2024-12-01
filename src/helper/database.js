/* eslint-disable prettier/prettier */
import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';

SQLite.enablePromise(true);
const dbPath = `${RNFS.DocumentDirectoryPath}/mobile_timekeeping.db`;

export const openDatabase = async () => {
  const db = await SQLite.openDatabase({
    name: dbPath,
    location: 'default',
    createFromLocation: 1,
  });
  console.log('Database opened successfully');
  return db;
};

export const fetchAddress = async () => {
  const db = await openDatabase();
  try {
    console.log('fetching...');

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM addresses where latitude=?',
        ['14.7418267'],
        (tx, results) => {
          const rows = results.rows;
          console.log(rows.item(0));
        },
      );
    });
  } catch (error) {
    console.log(error);
  }
};

export const syncAccount = async user => {
  const db = await openDatabase();
  try {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM account',
        [],
        () => {
          console.log('accounts deleted');
          tx.executeSql(
            'INSERT INTO account(accountId, employee, name, location, email, password) VALUES (?,?,?,?,?,?)',
            [
              user.accountID,
              user.EmployeeID,
              user.name,
              user.LocationID,
              user.Email,
              user.Password,
            ],
            () => {
              tx.executeSql(
                'INSERT INTO location(name, latitude, longitude, radius) VALUES (?,?,?,?)',
                [user.Location, user.latitude, user.longitude, user.radius],
                () => {
                  console.log('User synced successfully');
                },
                (tx, error) => {
                  console.error('Error Inserting Location:', error);
                  tx.rollback();
                },
              );
            },
            (tx, error) => {
              console.error('Error inserting user:', error);
              tx.rollback();
            },
          );
        },
        (tx, error) => {
          console.error('Error deleting accounts:', error);
          tx.rollback();
        },
      );
    });
  } catch (error) {
    console.log(error);
  }
};

export const userDetails = async () => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'select * from account',
        [],
        (tx, result) => {
          resolve(result.rows.item(0));
        },
        (tx, error) => {
          reject(error);
        },
      );
    });
  });
};

export const removeDb = async () => {
  await RNFS.unlink(dbPath);
};
