# F.A.S.T.-FIRST-ALLIANCE-SELECTION-TOOL-
A Google Apps Script Javascript that allows for FRC event data to be directly imported into a Google Sheet
Created by Caleb Russell of FRC Team 7056 -The F.A.S.T. Team (Fowlerville Area Scientific Technicians)

# Features 
- LIVE EPA and Role breakdown
    - Event Only EPA
    - Scroll to "What are the different Roles" for more info
- Color Coded alliance "Pick List"
- Picked Alliances are sorted into a "Draft Board"

# INSTALLATION/DEPLOYMENT (START HERE)
1. Create the Google Sheet you wish to store your data in
2. Create/Rename a tab to "Config"
3. In "Config" cell A1 type "Event Key:"
4. In "Config" cell B1 type your event key for the event you are scouting (i.e. 2026mimas) these keys can be found online at First Inspires and TBA
5. Go to Extensions>Apps Script>Project Settings>Script Properties>Add Script Property, In the property name field write TBA_KEY and in the value field, paste your TBA API/Auth Key
6. While still in Apps Script go to Editor
7. You should see a default file named Code.gs with a blank Function
8. If not you can create one by pressing the plus and then "script"
9. Delete the blank function
10. (Optional but HIGHLY recommend) Rename the .gs file to something along the lines of Alliance Selector or F.A.S.T. this is incase you want to add more apps scripts later and don't want to get them confused
11. Copy the code from the FIRST Alliance Selection Tool.gs file into your Apps script editor.
12. Run the function "updateDashboard()" from the dropdown menu in Apps Script. this will auto save to your google drive and deploy the code to your sheet.
13. You are now finished, if you like this and wish to use it for future events you need to put the new event key in "Config" then go to "FRC Tools" and click "Update Dashboard"

# Considerations (READ THESE)
- Alliance selection is not currently automated, There are plans to implement this in the future but it is not definite
  - Someone must use the dropdown box in the rightmost column in the "Picklist" tab to assign a team to an alliance. The sheet will auto update and that team will be marked as "Picked" and be highlighted red.
- To undo an alliance pick you can either hit the undo button in the "FRC Tools" menu (Preferred) or you can manually delete them from the Alliances tab (Not Recommended)
- Allainces must be selected in the order they are selected during the event (Captain, Pick 1, Pick 2, and Backup if needed)
- Because this uses event specific data, if you put this together before the event starts, EPA will appear as 0 and all teams will have the role "Defense/Development"
- The tabs "Alliances", and "RawData" Are mostly there just for the code to reference. they are auto updated and you should not need to ever edit these.
- "Picklist" is the only tab with the dropdowns for allaince selecting. other options include manually typing them in the "Alliances" tab
- Before running the program you must create a "Config" tab and add your event key (Refer to "Installation/Deployment")
- Sheet updates every 5 minutes but if you need it sooner you can hit "FRC Tools" in the menu and click "Update Dashboard"
- To undo an alliance selection, there are two methods click "FRC Tools" then "Undo Last Pick" (Recommended) or go to Alliances and manually delete everything except the title (Use only if deletign a large amoutn of alliances)
- My email is calebrussell92910@gmail.com, Please contact me with any bug reports or issues

# What are the different roles?

ELITE AUTO SCORER – High total EPA with a strong share coming from autonomous. Usually an auto-focused specialist that consistently drives early match advantage.

ELITE POWER SCORER – Very high total EPA dominated by teleop output. Primary match carry robot that scores heavily during driver control.

ELITE ALL-AROUND – High total EPA with balanced auto and teleop contribution. Strong in all phases with no clear weakness.

AUTO SPECIALIST – Auto makes up a large portion of total output. Robot is primarily valuable for autonomous performance and early match control.

PRIMARY SCORER – Teleop-heavy robot with strong scoring output during driver control. Main offensive contributor for an alliance.

HIGH VALUE HYBRID – Balanced contributions between auto and teleop with strong overall EPA. Reliable, flexible playoff pick.

TELEOP RELIABLE – Consistent teleop contributor with stable scoring output. Solid mid-to-late pick for sustained performance.

AUTO CONTRIBUTOR – Noticeable but not dominant autonomous contribution. Adds value in auto without being a primary focus.

BALANCED SUPPORT – Even distribution of contributions with moderate EPA. Flexible utility robot with no strong specialization.

LOW SCORING SUPPORT – Lower overall scoring impact but still contributes in matches. Often used for niche tasks or backup scoring.

DEFENSIVE / UTILITY – Low scoring output but provides value through defense, disruption, or support roles.

DEFENSE / DEVELOPMENT – Very low total EPA. Primarily defensive, learning, or developing robot with minimal scoring contribution.

