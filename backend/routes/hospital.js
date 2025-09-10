const express = require('express');
const { requestAccess, contract } = require('../utils/web3');
const { downloadFromIPFS } = require('../utils/ipfs');

const router = express.Router();

// Request emergency access
router.post('/request-access', async (req, res) => {
  try {
    const { patientAddress, hospitalId } = req.body;
    
    const requestId = await requestAccess(patientAddress);
    
    res.json({
      success: true,
      requestId,
      message: 'Access request submitted. Waiting for guardian approvals.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check access request status
router.get('/access-status/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await contract.accessRequests(requestId);
    
    res.json({
      success: true,
      request: {
        id: request[0].toString(),
        patient: request[1],
        hospital: request[2],
        ipfsHash: request[3],
        timestamp: request[4].toString(),
        approvals: request[5].toString(),
        executed: request[6]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download medical record (only if access approved)
router.post('/download-record', async (req, res) => {
  try {
    const { requestId, patientId } = req.body;
    
    // Check if request is approved
    const request = await contract.accessRequests(requestId);
    if (!request[6]) { // executed flag
      return res.status(403).json({ 
        success: false, 
        error: 'Access not yet approved by guardians' 
      });
    }
    
    const encryptionKey = `patient_${patientId}_key`;
    const fileBuffer = await downloadFromIPFS(request[3], encryptionKey);
    
    res.json({
      success: true,
      fileData: fileBuffer.toString('base64'),
      ipfsHash: request[3]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Parse QR code
router.post('/parse-qr', async (req, res) => {
  try {
    const { qrData } = req.body;
    
    const parsedData = JSON.parse(qrData);
    
    if (parsedData.type !== 'EDAV_EMERGENCY') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid QR code format' 
      });
    }
    
    res.json({
      success: true,
      patientAddress: parsedData.patientAddress,
      ipfsHash: parsedData.ipfsHash,
      timestamp: parsedData.timestamp
    });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid QR code data' });
  }
});

module.exports = router;