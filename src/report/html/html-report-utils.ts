import path from 'node:path'
import {missionContext} from '../../context/MissionContext'
import {VOYAGER_WORKING_DIR} from '../../context/context-variable-provider'

export function normalizeInstrumentName(instrumentName: string): string {
    return instrumentName.replace(/[^\w\s]/gi, '')
}

export function getHtmlFilePath(instrumentName: string): string {
    return path.join(<string>missionContext.getVariable(VOYAGER_WORKING_DIR), instrumentName + '.html')
}

function getCommandHtml(commandName: string, commandSuccessStatus: string, commandRunningTime: string): string {
    return `<td>${commandName}</td>
            <td class="${commandSuccessStatus.toLowerCase()}">${commandSuccessStatus}</td>
            <td>${commandRunningTime}</td>`
}

export function getCommandSummaryHtml(commandName: string, commandSuccessStatus: string, commandRunningTime: string): string {
    return `
        <tr>
            ${getCommandHtml(commandName, commandSuccessStatus, commandRunningTime)}
        </tr>`
}

export function getInstrumentSummaryHtml(instrumentName: string, numberOfCommands: number, commandName: string, commandSuccessStatus: string, commandRunningTime: string): string {
    return `
    <tr>
    <td rowspan="${numberOfCommands}">
        <a onclick=" ${normalizeInstrumentName(instrumentName)}OpenNewTab()" class="clickable-link">${instrumentName}</a>
    </td>
    ${getCommandHtml(commandName, commandSuccessStatus, commandRunningTime)}
    </tr>
    <script>
        function ${normalizeInstrumentName(instrumentName)}OpenNewTab() {
            const newTabURL = './html/${instrumentName}.html'
            window.open(newTabURL, '_blank')
        }
        document.getElementById('summaryReportLink').addEventListener('click', openNewTab)
    </script>`
}

export function getMissionSummaryHtml(missionName: string, missionRunningTime: string, summaryContent: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Summary Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        h1 {
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        .success {
            color: green;
        }

        .fail {
            color: red;
        }
        
        .clickable-link {
            color: inherit; /* Inherit the color from the parent */
            text-decoration: none; /* Remove the default underline */
        }

        .clickable-link:hover,
        .clickable-link:focus {
            text-decoration: underline; /* Underline the link when hovered or focused */
            cursor: pointer; /* Change the cursor to indicate it is clickable */
        }
    </style>
</head>
<body>
<h1>
    <a onclick="openNewTab()" class="clickable-link">${missionName} Summary Report</a>
</h1>
<table>
    <tr>
        <th>Instrument</th>
        <th>Command</th>
        <th>Status</th>
        <th>Duration</th>
    </tr>
    ${summaryContent}
</table>
<p>Elapsed Time: ${missionRunningTime}</p>
<script>
    function openNewTab() {
        const newTabURL = './html/${missionName}.html'
        window.open(newTabURL, '_blank')
    }
    document.getElementById('summaryReportLink').addEventListener('click', openNewTab)
</script>
</body>
</html>`
}
