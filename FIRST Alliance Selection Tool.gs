function getStatboticsBase() {
  return "https://api.statbotics.io/v3";
}

function getTBAUrl() {
  return "https://www.thebluealliance.com/api/v3";
}

function getTBAKey() {
  return PropertiesService.getScriptProperties().getProperty("TBA_KEY");
}

/**
 * =========================================================
 * MENU
 * =========================================================
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("FRC Tools")
    .addItem("📊 Update Dashboard", "updateDashboard")
    .addItem("🔄 Refresh Picklist", "updatePicklistOnly")
    .addItem("🏆 Refresh Draft Board", "updateDraftBoard")
    .addItem("↩ Undo Last Pick", "undoLastPick")
    .addToUi();
}

/**
 * =========================================================
 * DASHBOARD
 * =========================================================
 */
function updateDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const config = ss.getSheetByName("Config");
  const raw = ss.getSheetByName("RawData");
  const dash = ss.getSheetByName("Dashboard");

  const eventKey = String(config.getRange("B1").getValue()).trim();
  if (!eventKey) return;

  config.getRange("C1").setValue("Loading...");

  const teams = fetchTeams(eventKey);
  const epaMap = fetchEPA(teams, eventKey);

  const data = teams.map(t => {
    const id = String(t.team_number);
    const epa = epaMap[id] || { total: 0, auto: 0, teleop: 0 };

    return {
      team: id,
      name: t.nickname || "",
      epa: epa.total,
      auto: epa.auto,
      teleop: epa.teleop,
      role: classify(epa)
    };
  });

  writeTable(raw, data);
  writeTable(dash, [...data].sort((a,b)=>b.epa-a.epa));

  config.getRange("C1").setValue("Ready");

  updatePicklistOnly();
  updateDraftBoard();
}

/**
 * =========================================================
 * PICKLIST (FIXED CORE SYSTEM)
 * =========================================================
 */
function updatePicklistOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const raw = ss.getSheetByName("RawData");
  const picklist = ss.getSheetByName("Picklist");
  const alliances = ss.getSheetByName("Alliances");

  if (!raw || raw.getLastRow() < 2) return;

  const rawValues = raw.getDataRange().getValues().slice(1);

  const teams = rawValues.map(r => ({
    team: String(r[0] || ""),
    name: r[1] || "",
    epa: Number(r[2] || 0),
    auto: Number(r[3] || 0),
    teleop: Number(r[4] || 0),
    role: r[5] || ""
  })).filter(t => t.team);

  // ---------------- PRESERVE ALLIANCES ----------------
  const allianceData = alliances.getDataRange().getValues();
  const teamToAlliance = {};

  for (let i = 1; i < allianceData.length; i++) {
    teamToAlliance[String(allianceData[i][1])] = allianceData[i][0];
  }

  const output = [
    ["Rank","Team","Name","EPA","Role","Status","Alliance"]
  ];

  let rank = 1;

  teams
    .sort((a,b) => b.epa - a.epa)
    .forEach(t => {

      const isPicked = teamToAlliance[t.team] != null;

      output.push([
        isPicked ? "" : rank++,
        t.team,
        t.name,
        t.epa,
        t.role,
        isPicked ? "PICKED" : "AVAILABLE",
        teamToAlliance[t.team] || ""
      ]);
    });

  picklist.clearContents();
  picklist.getRange(1,1,output.length,output[0].length).setValues(output);

  // ---------------- DROPDOWN (1–8 ALLIANCES) ----------------
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      "1","2","3","4","5","6","7","8"
    ], true)
    .build();

  if (output.length > 1) {
    picklist.getRange(2,7,output.length-1,1).setDataValidation(rule);
  }

  applyStatusColors(picklist);
}

/**
 * =========================================================
 * COLOR SYSTEM
 * =========================================================
 */
function applyStatusColors(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const statusRange = sheet.getRange(2, 6, lastRow - 1, 1);
  const values = statusRange.getValues();

  const colors = values.map(r => {
    const v = r[0];
    if (v === "PICKED") return ["#f4cccc"];
    if (v === "AVAILABLE") return ["#d9ead3"];
    return ["#ffffff"];
  });

  statusRange.setBackgrounds(colors);
}

/**
 * =========================================================
 * DROPDOWN HANDLER
 * =========================================================
 */
function onEdit(e) {
  const sheet = e.range.getSheet();

  if (sheet.getName() !== "Picklist") return;
  if (e.range.getColumn() !== 7) return;
  if (e.range.getRow() === 1) return;

  const alliance = e.range.getValue();
  const team = String(sheet.getRange(e.range.getRow(), 2).getValue());

  if (!alliance || !team) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const alliances = ss.getSheetByName("Alliances");

  alliances.appendRow([alliance, team]);

  e.range.clearContent();

  updatePicklistOnly();
  updateDraftBoard();
}

/**
 * =========================================================
 * DRAFT BOARD
 * =========================================================
 */
function updateDraftBoard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const alliances = ss.getSheetByName("Alliances");

  let board = ss.getSheetByName("DraftBoard");
  if (!board) board = ss.insertSheet("DraftBoard");

  const data = alliances.getDataRange().getValues();

  const map = {};

  for (let i = 1; i < data.length; i++) {
    const a = Number(data[i][0]);
    const t = data[i][1];

    if (!map[a]) map[a] = [];
    map[a].push(t);
  }

  const output = [["Alliance","Captain","Pick 1","Pick 2","Backup"]];

  for (let i = 1; i <= 8; i++) {
    const p = map[i] || [];
    output.push([i, p[0]||"", p[1]||"", p[2]||"", p[3]||""]);
  }

  board.clearContents();
  board.getRange(1,1,output.length,output[0].length).setValues(output);
}

/**
 * =========================================================
 * UNDO
 * =========================================================
 */
function undoLastPick() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Alliances");
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return;

  sheet.deleteRow(data.length);

  updatePicklistOnly();
  updateDraftBoard();
}

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */
function classify(e) {
  const total = e.total || 0;
  const auto = e.auto || 0;
  const teleop = e.teleop || 0;

  // -----------------------------
  // ELITE LAYER (TOP TEAMS)
  // -----------------------------
  if (total >= 60) {
    if (auto >= 18) return "ELITE AUTO SCORER";
    if (teleop >= 50) return "ELITE POWER SCORER";
    return "ELITE ALL-AROUND";
  }

  // -----------------------------
  // HIGH IMPACT TEAMS
  // -----------------------------
  if (total >= 40) {
    if (auto > teleop * 0.6) return "AUTO SPECIALIST";
    if (teleop > 35) return "PRIMARY SCORER";
    return "HIGH VALUE HYBRID";
  }

  // -----------------------------
  // MID-TIER TEAMS
  // -----------------------------
  if (total >= 25) {
    if (teleop > auto * 1.5) return "TELEOP RELIABLE";
    if (auto > 10) return "AUTO CONTRIBUTOR";
    return "BALANCED SUPPORT";
  }

  // -----------------------------
  // LOW-MID TEAMS
  // -----------------------------
  if (total >= 12) {
    if (teleop > 15) return "LOW SCORING SUPPORT";
    return "DEFENSIVE / UTILITY";
  }

  // -----------------------------
  // LOW IMPACT TEAMS
  // -----------------------------
  return "DEFENSE / DEVELOPMENT";
}

/**
 * =========================================================
 * API
 * =========================================================
 */
function fetchTeams(eventKey){
  const res = UrlFetchApp.fetch(
    `${getTBAUrl()}/event/${eventKey}/teams`,
    { headers: { "X-TBA-Auth-Key": getTBAKey() } }
  );

  return JSON.parse(res.getContentText());
}

function fetchEPA(teams, eventKey){
  const map = {};
  const base = getStatboticsBase();

  teams.forEach(t=>{
    try{
      const res = UrlFetchApp.fetch(
        `${base}/team_event/${t.team_number}/${eventKey}`
      );

      const d = JSON.parse(res.getContentText());
      const ep = d?.epa?.total_points;

      map[String(t.team_number)] = {
        total: ep?.mean ?? 0,
        auto: d?.epa?.breakdown?.auto_points ?? 0,
        teleop: d?.epa?.breakdown?.teleop_points ?? 0
      };

    } catch {
      map[String(t.team_number)] = { total:0, auto:0, teleop:0 };
    }
  });

  return map;
}
function writeTable(sheet, data) {
  sheet.clearContents();

  const table = [
    ["Team", "Name", "EPA", "Auto", "Teleop", "Role"]
  ];

  data.forEach(d => {
    table.push([
      d.team,
      d.name,
      d.epa,
      d.auto,
      d.teleop,
      d.role
    ]);
  });

  sheet.getRange(1, 1, table.length, table[0].length).setValues(table);
}
