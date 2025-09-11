const crypto = require('crypto');

let client;

const initIPFS = async () => {
  if (!client) {
    const { create } = await import('@web3-storage/w3up-client');
    client = await create();
    // You'll need to authenticate with Web3.Storage
    // Follow their docs for proper authentication
  }
  return client;
};

const encryptData = (data, key) => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decryptData = (encryptedData, key) => {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const uploadToIPFS = async (fileBuffer, fileName, encryptionKey) => {
  try {
    await initIPFS();
    
    // Encrypt the file
    const encryptedData = encryptData(fileBuffer.toString('base64'), encryptionKey);
    
    // Create a File object
    const file = new File([encryptedData], fileName, { type: 'application/octet-stream' });
    
    // Upload to IPFS
    const cid = await client.uploadFile(file);
    
    return cid.toString();
  } catch (error) {
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
};

const downloadFromIPFS = async (cid, encryptionKey) => {
  try {
    await initIPFS();
    
    // Download from IPFS
    const res = await client.get(cid);
    const files = await res.files();
    const file = files[0];
    const encryptedData = await file.text();
    
    // Decrypt the data
    const decryptedData = decryptData(encryptedData, encryptionKey);
    
    return Buffer.from(decryptedData, 'base64');
  } catch (error) {
    throw new Error(`IPFS download failed: ${error.message}`);
  }
};

module.exports = {
  uploadToIPFS,
  downloadFromIPFS,
  encryptData,
  decryptData
};