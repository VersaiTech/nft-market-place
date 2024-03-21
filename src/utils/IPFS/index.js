import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

const auth =
  'Basic ' +
  Buffer.from(
    process.env.REACT_APP_INFURA_PROJECT_ID +
      ':' +
      process.env.REACT_APP_INFURA_PROJECT_SECRET,
  ).toString('base64');

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

export const handleFileIpfs = async (data) => {
  try {
    const added = await client.add(data);
    const url = `https://coinwiz.infura-ipfs.io/ipfs/${added.path}`;
    return url;
  } catch (err) {
    console.log(err);
  }
};

export const handleMetaDataIpfs = async (data) => {
  try {
    const added = await client.add(JSON.stringify(data));
    const url = `https://coinwiz.infura-ipfs.io/ipfs/${added.path}`;
    return url;
  } catch (err) {
    console.log(err);
  }
};
