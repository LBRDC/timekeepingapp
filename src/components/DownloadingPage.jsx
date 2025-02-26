import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import RNFS, {exists} from 'react-native-fs';
import RNApkInstaller from '@dominicvonk/react-native-apk-installer';
import Loader from './Loader';
import * as Progress from 'react-native-progress';
const DownloadingPage = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [loadermsg, setloadermsg] = useState('Downloading...');
  const [progress, setProgress] = useState();
  const [progressTxt, setProgressTxt] = useState(0);
  const downloadURL =
    'https://www.dropbox.com/scl/fi/ajppo2x9agu5y5sef9ng1/timekeeping.apk?rlkey=bfh6udsezx3rpyintnbh4nqte&st=7kzyguyn&dl=1';
  const downloadPath = RNFS.DocumentDirectoryPath + '/timekeeping.apk';
  useEffect(() => {
    downloadAndInstall();
  }, []);

  const downloadAndInstall = async () => {
    const isHave = await RNApkInstaller.haveUnknownAppSourcesPermission();
    if (!isHave) {
      RNApkInstaller.showUnknownAppSourcesPermission();
    }
    if (!isHave) return;

    const isExist = await RNFS.exists(downloadPath);

    if (isExist) {
      console.log('File Exist');

      const stat = await RNFS.stat(downloadPath);
      console.log(stat.size);

      if (stat.size < 28458411) {
        await RNFS.unlink(downloadPath);
      } else {
        await RNApkInstaller.install(downloadPath);
        await RNFS.unlink(downloadPath);
        return;
      }
    }
    console.log('Running');

    setloadermsg('Fetching the latest version of the app...');
    setLoading(true);
    const download = RNFS.downloadFile({
      fromUrl: downloadURL,
      toFile: downloadPath,
      progress: res => {
        if (res.bytesWritten > 100) {
          setLoading(false);
        }
        const prog = (res.bytesWritten / res.contentLength).toFixed(2);
        setProgress(parseFloat(prog));
      },
      progressDivider: 1,
    });
    download.promise.then(async res => {
      if (res.statusCode === 200) {
        const installNow = await RNApkInstaller.install(downloadPath);
        console.log(installNow);
      }
    });
  };
  return (
    <View style={styles.container}>
      <Loader loading={loading} message={loadermsg} />
      <Progress.Circle
        size={150}
        indeterminate={false}
        progress={progress}
        showsText={true}
        thickness={10}
        strokeCap="round"
        color="#006341"
        allowFontScaling={true}
      />
      <Text style={styles.title}>Updating App</Text>
      <Text style={styles.message}>
        Please wait while we download the latest updates for the app. This may
        take a few moments.
      </Text>
    </View>
  );
};

export default DownloadingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 30,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: '#006341',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#006341',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
});
