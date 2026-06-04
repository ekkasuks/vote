// ===================================================
// Google Apps Script - ระบบโหวตผลงานนักเรียน
// โรงเรียนบ้านใหม่ สพป.นครปฐม เขต 1
// ===================================================

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // ← ใส่ Sheet ID ของคุณ
const SHEET_VOTERS = 'voters';       // ชีทรายชื่อผู้โหวต
const SHEET_WORKS = 'works';         // ชีทผลงานนักเรียน
const SHEET_VOTES = 'votes';         // ชีทผลการโหวต
const SHEET_CONFIG = 'config';       // ชีทการตั้งค่า

// ===================================================
// INIT - สร้างชีทถ้ายังไม่มี
// ===================================================
function initSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // Voters sheet
  if (!ss.getSheetByName(SHEET_VOTERS)) {
    const s = ss.insertSheet(SHEET_VOTERS);
    s.appendRow(['id', 'name', 'createdAt']);
  }

  // Works sheet
  if (!ss.getSheetByName(SHEET_WORKS)) {
    const s = ss.insertSheet(SHEET_WORKS);
    s.appendRow(['id', 'studentName', 'driveFileId', 'driveViewUrl', 'description', 'createdAt']);
  }

  // Votes sheet
  if (!ss.getSheetByName(SHEET_VOTES)) {
    const s = ss.insertSheet(SHEET_VOTES);
    s.appendRow(['id', 'voterId', 'voterName', 'rank1WorkId', 'rank2WorkId', 'rank3WorkId', 'votedAt']);
  }

  // Config sheet
  if (!ss.getSheetByName(SHEET_CONFIG)) {
    const s = ss.insertSheet(SHEET_CONFIG);
    s.appendRow(['key', 'value']);
    s.appendRow(['votingOpen', 'true']);
    s.appendRow(['adminPin', '1234']);
  }
}

// ===================================================
// doGet - จุดรับ HTTP GET
// ===================================================
function doGet(e) {
  const action = e.parameter.action || '';
  let result;

  try {
    switch (action) {
      case 'getVoters':    result = getVoters(); break;
      case 'getWorks':     result = getWorks(); break;
      case 'getVotes':     result = getVotes(); break;
      case 'getConfig':    result = getConfig(); break;
      case 'getDashboard': result = getDashboard(); break;
      default: result = { error: 'Unknown action' };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===================================================
// doPost - จุดรับ HTTP POST
// ===================================================
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ error: 'Invalid JSON' });
  }

  const action = body.action || '';
  let result;

  try {
    switch (action) {
      case 'addVoter':      result = addVoter(body); break;
      case 'updateVoter':   result = updateVoter(body); break;
      case 'deleteVoter':   result = deleteVoter(body); break;
      case 'addWork':       result = addWork(body); break;
      case 'updateWork':    result = updateWork(body); break;
      case 'deleteWork':    result = deleteWork(body); break;
      case 'submitVote':    result = submitVote(body); break;
      case 'clearVotes':    result = clearVotes(body); break;
      case 'setVotingOpen': result = setVotingOpen(body); break;
      case 'verifyAdmin':   result = verifyAdmin(body); break;
      case 'changeAdminPin': result = changeAdminPin(body); break;
      default: result = { error: 'Unknown action' };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return jsonResponse(result);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===================================================
// CONFIG
// ===================================================
function getConfig() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_CONFIG);
  const rows = sheet.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0]) config[rows[i][0]] = rows[i][1];
  }
  return { success: true, data: config };
}

function setConfig(key, value) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_CONFIG);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

function setVotingOpen(body) {
  setConfig('votingOpen', body.open ? 'true' : 'false');
  return { success: true };
}

function verifyAdmin(body) {
  const config = getConfig().data;
  const ok = body.pin === config.adminPin;
  return { success: ok };
}

function changeAdminPin(body) {
  setConfig('adminPin', body.newPin);
  return { success: true };
}

// ===================================================
// VOTERS
// ===================================================
function getVoters() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_VOTERS);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = rows.slice(1).filter(r => r[0]).map(r => rowToObj(headers, r));
  return { success: true, data };
}

function addVoter(body) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_VOTERS);
  const id = 'V' + Date.now();
  sheet.appendRow([id, body.name, new Date().toISOString()]);
  return { success: true, id };
}

function updateVoter(body) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_VOTERS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === body.id) {
      sheet.getRange(i + 1, 2).setValue(body.name);
      return { success: true };
    }
  }
  return { error: 'Voter not found' };
}

function deleteVoter(body) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_VOTERS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === body.id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Voter not found' };
}

// ===================================================
// WORKS
// ===================================================
function getWorks() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_WORKS);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = rows.slice(1).filter(r => r[0]).map(r => rowToObj(headers, r));
  return { success: true, data };
}

function addWork(body) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_WORKS);
  const id = 'W' + Date.now();
  // driveFileId: Google Drive File ID
  // driveViewUrl: https://drive.google.com/uc?export=view&id=FILE_ID
  const viewUrl = body.driveFileId
    ? `https://drive.google.com/uc?export=view&id=${body.driveFileId}`
    : '';
  sheet.appendRow([id, body.studentName, body.driveFileId || '', viewUrl, body.description || '', new Date().toISOString()]);
  return { success: true, id };
}

function updateWork(body) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_WORKS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === body.id) {
      if (body.studentName !== undefined) sheet.getRange(i + 1, 2).setValue(body.studentName);
      if (body.driveFileId !== undefined) {
        sheet.getRange(i + 1, 3).setValue(body.driveFileId);
        sheet.getRange(i + 1, 4).setValue(`https://drive.google.com/uc?export=view&id=${body.driveFileId}`);
      }
      if (body.description !== undefined) sheet.getRange(i + 1, 5).setValue(body.description);
      return { success: true };
    }
  }
  return { error: 'Work not found' };
}

function deleteWork(body) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_WORKS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === body.id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Work not found' };
}

// ===================================================
// VOTES
// ===================================================
function getVotes() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_VOTES);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = rows.slice(1).filter(r => r[0]).map(r => rowToObj(headers, r));
  return { success: true, data };
}

function submitVote(body) {
  // ตรวจว่าโหวตไปแล้วหรือยัง
  const existing = getVotes().data;
  const alreadyVoted = existing.find(v => v.voterId === body.voterId);
  if (alreadyVoted) return { error: 'already_voted' };

  // ตรวจการตั้งค่า
  const config = getConfig().data;
  if (config.votingOpen !== 'true') return { error: 'voting_closed' };

  // ตรวจ rank ต้องไม่ซ้ำกัน
  const ranks = [body.rank1, body.rank2, body.rank3];
  if (new Set(ranks).size !== 3) return { error: 'duplicate_rank' };

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_VOTES);
  const id = 'VT' + Date.now();
  sheet.appendRow([id, body.voterId, body.voterName, body.rank1, body.rank2, body.rank3, new Date().toISOString()]);
  return { success: true, id };
}

function clearVotes(body) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_VOTES);
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return { success: true };
}

// ===================================================
// DASHBOARD - คำนวณคะแนน
// ===================================================
function getDashboard() {
  const votes = getVotes().data;
  const works = getWorks().data;
  const config = getConfig().data;

  // คะแนน: อันดับ1=3pt, อันดับ2=2pt, อันดับ3=1pt
  const scores = {};
  works.forEach(w => { scores[w.id] = 0; });

  votes.forEach(v => {
    if (v.rank1WorkId) scores[v.rank1WorkId] = (scores[v.rank1WorkId] || 0) + 3;
    if (v.rank2WorkId) scores[v.rank2WorkId] = (scores[v.rank2WorkId] || 0) + 2;
    if (v.rank3WorkId) scores[v.rank3WorkId] = (scores[v.rank3WorkId] || 0) + 1;
  });

  // เรียงลำดับ
  const ranked = works.map(w => ({
    id: w.id,
    studentName: w.studentName,
    driveViewUrl: w.driveViewUrl,
    description: w.description,
    score: scores[w.id] || 0,
    rank1Count: votes.filter(v => v.rank1WorkId === w.id).length,
    rank2Count: votes.filter(v => v.rank2WorkId === w.id).length,
    rank3Count: votes.filter(v => v.rank3WorkId === w.id).length,
  })).sort((a, b) => b.score - a.score);

  return {
    success: true,
    data: {
      works: ranked,
      totalVoters: votes.length,
      votingOpen: config.votingOpen === 'true',
    }
  };
}

// ===================================================
// UTILS
// ===================================================
function rowToObj(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i]; });
  return obj;
}
