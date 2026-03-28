// Logs Page JavaScript

let allLogs = [];
let filteredLogs = [];
let currentLogs = [];
let selectedLogs = new Set();
let isLiveStreaming = false;
let liveStreamInterval = null;
let currentPage = 1;
let itemsPerPage = 25;
let totalPages = 1;

// Initialize Logs
function initLogs() {
    // Generate initial logs
    generateMockLogs(100);
    
    // Setup multi-select styling
    setupMultiSelect();
    
    // Update stats
    updateLogStats();
    
    // Load logs for first page
    loadLogsForPage();
}

// Generate Mock Logs
function generateMockLogs(count) {
    const attackTypes = ['XSS', 'SQL Injection', 'Port Scan', 'Brute Force', 'DDoS', 'Malware', 'Phishing', 'Insider Threat'];
    const severities = ['critical', 'high', 'medium', 'low'];
    const countries = ['USA', 'China', 'Russia', 'Germany', 'India', 'Brazil', 'Japan', 'South Korea', 'UK', 'France'];
    const targetSystems = ['web-server-01', 'db-server-01', 'auth-server-01', 'api-gateway', 'firewall-01', 'load-balancer-01'];
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < count; i++) {
        const log = {
            id: i + 1,
            timestamp: new Date(now - Math.random() * 7 * oneDay).toISOString(),
            attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
            sourceIP: generateIP(),
            targetSystem: targetSystems[Math.floor(Math.random() * targetSystems.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            country: countries[Math.floor(Math.random() * countries.length)],
            description: generateLogDescription(),
            isBlocked: Math.random() > 0.3,
            userAgent: `Mozilla/5.0 (${['Windows', 'Linux', 'Mac OS'][Math.floor(Math.random() * 3)]})`,
            port: Math.floor(Math.random() * 65535),
            protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 4)]
        };
        
        allLogs.push(log);
    }
    
    // Sort by timestamp (newest first)
    allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    filteredLogs = [...allLogs];
}

// Generate Log Description
function generateLogDescription() {
    const actions = [
        'attempted to inject malicious script',
        'scanned for open ports',
        'tried SQL injection payload',
        'attempted brute force attack',
        'sent phishing email',
        'downloaded suspicious file',
        'accessed restricted resource',
        'modified system configuration',
        'attempted privilege escalation',
        'bypassed security controls'
    ];
    
    const targets = [
        'login form',
        'database server',
        'administrative panel',
        'API endpoint',
        'file upload system',
        'user session',
        'network firewall',
        'authentication system',
        'payment gateway',
        'web application'
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    const target = targets[Math.floor(Math.random() * targets.length)];
    
    return `${action} on ${target}`;
}

// Load Logs for Current Page
function loadLogsForPage() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    currentLogs = filteredLogs.slice(startIndex, endIndex);
    
    renderLogs();
    updatePagination();
    updateSelectedCount();
}

// Render Logs Table
function renderLogs() {
    const container = document.getElementById('logs-container');
    if (!container) return;
    
    container.innerHTML = currentLogs.map(log => `
        <tr class="log-row" data-id="${log.id}">
            <td>
                <input type="checkbox" class="log-checkbox" 
                       onchange="toggleLogSelection(${log.id})" 
                       ${selectedLogs.has(log.id) ? 'checked' : ''}>
            </td>
            <td class="timestamp-cell">
                <div class="log-time">${formatDate(log.timestamp)}</div>
                <div class="log-date">${new Date(log.timestamp).toLocaleDateString()}</div>
            </td>
            <td>
                <div class="attack-type">
                    <i class="fas ${getAttackTypeIcon(log.attackType)}"></i>
                    ${log.attackType}
                </div>
            </td>
            <td>
                <div class="source-ip">
                    <i class="fas fa-network-wired"></i>
                    ${log.sourceIP}
                </div>
            </td>
            <td>${log.targetSystem}</td>
            <td>
                <span class="badge severity-${log.severity}" 
                      style="background: ${getSeverityColor(log.severity)}">
                    <i class="fas ${log.severity === 'critical' ? 'fa-skull-crossbones' : 
                                    log.severity === 'high' ? 'fa-exclamation-circle' : 
                                    'fa-exclamation-triangle'}"></i>
                    ${log.severity.toUpperCase()}
                </span>
            </td>
            <td>
                <div class="country-info">
                    <i class="fas fa-globe-americas"></i>
                    ${log.country}
                </div>
            </td>
            <td class="description-cell">
                ${log.description}
                ${log.isBlocked ? '<span class="badge badge-success">Blocked</span>' : ''}
            </td>
            <td>
                <div class="log-actions">
                    <button class="btn-icon" onclick="viewLogDetail(${log.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="showRemediation('${log.attackType}')" title="Remediation">
                        <i class="fas fa-lightbulb"></i>
                    </button>
                    <button class="btn-icon" onclick="createIncidentFromLog(${log.id})" title="Create Incident">
                        <i class="fas fa-exclamation-triangle"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Update counts
    document.getElementById('showing-count').textContent = currentLogs.length;
    document.getElementById('total-count').textContent = filteredLogs.length;
}

// Update Log Statistics
function updateLogStats() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const logsToday = allLogs.filter(log => 
        (now - new Date(log.timestamp)) < oneDay
    ).length;
    
    const criticalLogs = allLogs.filter(log => 
        log.severity === 'critical' && (now - new Date(log.timestamp)) < oneDay
    ).length;
    
    const blockedAttacks = allLogs.filter(log => 
        log.isBlocked && (now - new Date(log.timestamp)) < oneDay
    ).length;
    
    const uniqueSources = new Set(
        allLogs.filter(log => (now - new Date(log.timestamp)) < oneDay)
               .map(log => log.sourceIP)
    ).size;
    
    document.getElementById('total-logs').textContent = logsToday;
    document.getElementById('critical-logs').textContent = criticalLogs;
    document.getElementById('blocked-attacks').textContent = blockedAttacks;
    document.getElementById('unique-sources').textContent = uniqueSources;
    document.getElementById('log-count').textContent = allLogs.length;
}

// Filter Logs
function filterLogs() {
    const severityFilter = Array.from(document.getElementById('filter-severity').selectedOptions)
        .map(option => option.value);
    
    const typeFilter = Array.from(document.getElementById('filter-type').selectedOptions)
        .map(option => option.value);
    
    const ipFilter = document.getElementById('filter-ip').value.toLowerCase();
    const timeFilter = document.getElementById('filter-time').value;
    
    const now = Date.now();
    let timeLimit = now;
    
    switch(timeFilter) {
        case '1h': timeLimit = now - (60 * 60 * 1000); break;
        case '24h': timeLimit = now - (24 * 60 * 60 * 1000); break;
        case '7d': timeLimit = now - (7 * 24 * 60 * 60 * 1000); break;
        case '30d': timeLimit = now - (30 * 24 * 60 * 60 * 1000); break;
        case 'all': timeLimit = 0; break;
    }
    
    filteredLogs = allLogs.filter(log => {
        // Filter by severity
        if (severityFilter.length > 0 && !severityFilter.includes(log.severity)) {
            return false;
        }
        
        // Filter by type
        if (typeFilter.length > 0 && !typeFilter.includes(log.attackType)) {
            return false;
        }
        
        // Filter by IP
        if (ipFilter && !log.sourceIP.toLowerCase().includes(ipFilter)) {
            return false;
        }
        
        // Filter by time
        if (timeLimit > 0 && new Date(log.timestamp).getTime() < timeLimit) {
            return false;
        }
        
        return true;
    });
    
    // Reset to first page
    currentPage = 1;
    loadLogsForPage();
}

// Search Logs
function searchLogs() {
    const searchTerm = document.getElementById('search-logs').value.toLowerCase();
    
    if (!searchTerm) {
        filteredLogs = [...allLogs];
    } else {
        filteredLogs = allLogs.filter(log => 
            log.description.toLowerCase().includes(searchTerm) ||
            log.sourceIP.toLowerCase().includes(searchTerm) ||
            log.targetSystem.toLowerCase().includes(searchTerm) ||
            log.attackType.toLowerCase().includes(searchTerm) ||
            log.country.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    loadLogsForPage();
}

// Apply Filters (explicit)
function applyFilters() {
    filterLogs();
}

// Reset Filters
function resetFilters() {
    document.getElementById('filter-severity').selectedIndex = -1;
    document.getElementById('filter-type').selectedIndex = -1;
    document.getElementById('filter-ip').value = '';
    document.getElementById('filter-time').value = '24h';
    document.getElementById('search-logs').value = '';
    
    // Re-select default values
    ['critical', 'high', 'medium'].forEach(value => {
        const option = document.querySelector(`#filter-severity option[value="${value}"]`);
        if (option) option.selected = true;
    });
    
    ['XSS', 'SQL Injection', 'Port Scan', 'Brute Force'].forEach(value => {
        const option = document.querySelector(`#filter-type option[value="${value}"]`);
        if (option) option.selected = true;
    });
    
    filteredLogs = [...allLogs];
    currentPage = 1;
    loadLogsForPage();
}

// Pagination Functions
function updatePagination() {
    totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    
    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = currentPage === totalPages;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadLogsForPage();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadLogsForPage();
    }
}

function changeItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById('items-per-page').value);
    currentPage = 1;
    loadLogsForPage();
}

// Live Stream Functions
function startLiveStream() {
    if (isLiveStreaming) return;
    
    isLiveStreaming = true;
    document.getElementById('live-btn').disabled = true;
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('live-btn').innerHTML = '<i class="fas fa-circle"></i> Live';
    
    // Generate new log every 3 seconds
    liveStreamInterval = setInterval(() => {
        addNewLiveLog();
    }, 3000);
}

function pauseLiveStream() {
    if (!isLiveStreaming) return;
    
    isLiveStreaming = false;
    clearInterval(liveStreamInterval);
    document.getElementById('live-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('live-btn').innerHTML = '<i class="fas fa-play"></i> Start Live Stream';
}

function addNewLiveLog() {
    const attackTypes = ['XSS', 'SQL Injection', 'Port Scan', 'Brute Force', 'DDoS'];
    const severities = ['critical', 'high', 'medium', 'low'];
    
    const newLog = {
        id: allLogs.length + 1,
        timestamp: new Date().toISOString(),
        attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        sourceIP: generateIP(),
        targetSystem: 'live-system',
        severity: severities[Math.floor(Math.random() * severities.length)],
        country: ['USA', 'China', 'Russia', 'Germany'][Math.floor(Math.random() * 4)],
        description: `Real-time ${attackTypes[Math.floor(Math.random() * attackTypes.length)]} attack detected`,
        isBlocked: Math.random() > 0.5,
        userAgent: 'Live Stream',
        port: Math.floor(Math.random() * 65535),
        protocol: 'TCP'
    };
    
    // Add to beginning of arrays
    allLogs.unshift(newLog);
    filteredLogs.unshift(newLog);
    
    // Update stats
    updateLogStats();
    
    // Reload current page (logs will shift)
    loadLogsForPage();
    
    // Show notification for critical logs
    if (newLog.severity === 'critical') {
        showNotification(`Critical ${newLog.attackType} attack detected from ${newLog.sourceIP}`, 'error');
    }
}

// Log Selection Functions
function toggleLogSelection(logId) {
    if (selectedLogs.has(logId)) {
        selectedLogs.delete(logId);
    } else {
        selectedLogs.add(logId);
    }
    
    updateSelectedCount();
}

function selectAllLogs() {
    const selectAll = document.getElementById('select-all').checked;
    const checkboxes = document.querySelectorAll('.log-checkbox');
    
    if (selectAll) {
        currentLogs.forEach(log => selectedLogs.add(log.id));
        checkboxes.forEach(cb => cb.checked = true);
    } else {
        currentLogs.forEach(log => selectedLogs.delete(log.id));
        checkboxes.forEach(cb => cb.checked = false);
    }
    
    updateSelectedCount();
}

function updateSelectedCount() {
    const count = selectedLogs.size;
    const bulkActions = document.getElementById('bulk-actions');
    const selectedCount = document.getElementById('selected-count');
    
    selectedCount.textContent = count;
    
    if (count > 0) {
        bulkActions.style.display = 'block';
    } else {
        bulkActions.style.display = 'none';
    }
}

function clearSelection() {
    selectedLogs.clear();
    document.getElementById('select-all').checked = false;
    document.querySelectorAll('.log-checkbox').forEach(cb => cb.checked = false);
    updateSelectedCount();
}

// View Log Details
function viewLogDetail(logId) {
    const log = allLogs.find(l => l.id === logId);
    if (!log) return;
    
    const content = document.getElementById('log-detail-content');
    content.innerHTML = `
        <div class="log-detail-grid">
            <div class="log-detail-section">
                <h4>Basic Information</h4>
                <div class="log-detail-item">
                    <span class="log-detail-label">Log ID:</span>
                    ${log.id}
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Timestamp:</span>
                    ${new Date(log.timestamp).toLocaleString()}
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Attack Type:</span>
                    <span class="badge" style="background: ${getSeverityColor(log.severity)}">
                        ${log.attackType}
                    </span>
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Severity:</span>
                    <span class="badge severity-${log.severity}" 
                          style="background: ${getSeverityColor(log.severity)}">
                        ${log.severity.toUpperCase()}
                    </span>
                </div>
            </div>
            
            <div class="log-detail-section">
                <h4>Network Information</h4>
                <div class="log-detail-item">
                    <span class="log-detail-label">Source IP:</span>
                    ${log.sourceIP}
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Target System:</span>
                    ${log.targetSystem}
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Country:</span>
                    <i class="fas fa-globe-americas"></i> ${log.country}
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Port:</span>
                    ${log.port}
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Protocol:</span>
                    ${log.protocol}
                </div>
            </div>
            
            <div class="log-detail-section">
                <h4>Attack Details</h4>
                <div class="log-detail-item">
                    <span class="log-detail-label">Description:</span>
                    ${log.description}
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Status:</span>
                    ${log.isBlocked ? 
                        '<span class="badge badge-success">Blocked</span>' : 
                        '<span class="badge badge-danger">Active</span>'}
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">User Agent:</span>
                    ${log.userAgent}
                </div>
            </div>
            
            <div class="log-detail-section">
                <h4>Actions</h4>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="btn btn-primary" onclick="createIncidentFromLog(${log.id}); closeLogModal()">
                        <i class="fas fa-exclamation-triangle"></i> Create Incident
                    </button>
                    <button class="btn btn-outline" onclick="showRemediation('${log.attackType}')">
                        <i class="fas fa-lightbulb"></i> View Remediation
                    </button>
                    <button class="btn btn-outline" onclick="exportSingleLog(${log.id})">
                        <i class="fas fa-download"></i> Export Log
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('log-detail-modal').classList.remove('hidden');
}

// Close Log Modal
function closeLogModal() {
    document.getElementById('log-detail-modal').classList.add('hidden');
}

// Show Remediation Suggestions
function showRemediation(attackType) {
    const suggestions = {
        'XSS': [
            'Implement Content Security Policy (CSP) headers',
            'Sanitize user input on both client and server side',
            'Use secure frameworks that auto-escape XSS',
            'Enable XSS filters in web browsers',
            'Regularly update web application firewalls'
        ],
        'SQL Injection': [
            'Use prepared statements and parameterized queries',
            'Implement stored procedures',
            'Apply principle of least privilege to database accounts',
            'Regularly update and patch database software',
            'Use web application firewalls with SQLi protection'
        ],
        'Port Scan': [
            'Configure firewall to block port scanning attempts',
            'Implement intrusion detection systems (IDS)',
            'Use port knocking techniques',
            'Limit exposed ports to essential services only',
            'Monitor network traffic for scanning patterns'
        ],
        'Brute Force': [
            'Implement account lockout policies',
            'Use CAPTCHA after failed attempts',
            'Enable multi-factor authentication',
            'Implement rate limiting on login endpoints',
            'Use strong password policies'
        ],
        'DDoS': [
            'Use DDoS protection services (Cloudflare, Akamai)',
            'Implement rate limiting and throttling',
            'Use load balancers to distribute traffic',
            'Configure firewalls to block suspicious traffic',
            'Monitor network traffic patterns'
        ]
    };
    
    const content = document.getElementById('remediation-content');
    const suggestionsList = suggestions[attackType] || [
        'Analyze attack pattern',
        'Update security rules',
        'Monitor for similar attacks',
        'Review system logs'
    ];
    
    content.innerHTML = `
        <h4>Remediation for ${attackType}</h4>
        <p>Recommended actions to mitigate this type of attack:</p>
        <ul class="remediation-list">
            ${suggestionsList.map(suggestion => `<li>${suggestion}</li>`).join('')}
        </ul>
        <div class="mt-20">
            <button class="btn btn-primary" onclick="closeRemediationModal()">
                <i class="fas fa-check"></i> Understood
            </button>
        </div>
    `;
    
    document.getElementById('remediation-modal').classList.remove('hidden');
}

// Close Remediation Modal
function closeRemediationModal() {
    document.getElementById('remediation-modal').classList.add('hidden');
}

// Create Incident from Log
function createIncidentFromLog(logId) {
    const log = allLogs.find(l => l.id === logId);
    if (!log) return;
    
    const incident = {
        id: Math.floor(Math.random() * 1000) + 100,
        title: `Incident: ${log.attackType} from ${log.sourceIP}`,
        description: log.description,
        severity: log.severity,
        status: 'open',
        assignedTo: null,
        createdAt: new Date().toISOString(),
        logs: [log.id],
        sourceIP: log.sourceIP
    };
    
    // In a real app, this would be saved to backend
    alert(`Incident #${incident.id} created for ${log.attackType} attack`);
    
    // Update incident count in sidebar
    const incidentCount = document.getElementById('incident-count');
    if (incidentCount) {
        let count = parseInt(incidentCount.textContent) || 0;
        count++;
        incidentCount.textContent = count;
    }
}

// Create Incident from Selected Logs
function createIncidentFromSelected() {
    if (selectedLogs.size === 0) return;
    
    const selectedLogIds = Array.from(selectedLogs);
    const sampleLog = allLogs.find(l => l.id === selectedLogIds[0]);
    
    const incident = {
        id: Math.floor(Math.random() * 1000) + 100,
        title: `Bulk Incident: ${selectedLogIds.length} related logs`,
        description: `Created from ${selectedLogIds.length} selected security logs`,
        severity: 'high',
        status: 'open',
        assignedTo: null,
        createdAt: new Date().toISOString(),
        logs: selectedLogIds,
        sourceIP: 'Multiple'
    };
    
    alert(`Incident #${incident.id} created with ${selectedLogIds.length} logs`);
    
    // Update incident count
    const incidentCount = document.getElementById('incident-count');
    if (incidentCount) {
        let count = parseInt(incidentCount.textContent) || 0;
        count++;
        incidentCount.textContent = count;
    }
    
    // Clear selection
    clearSelection();
}

// Create Incident from Current Log (in modal)
function createIncidentFromCurrentLog() {
    // This would use the currently viewed log
    alert('Incident created from current log');
    closeLogModal();
}

// Export Functions
function exportLogs() {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Logs exported successfully', 'success');
}

function exportSelectedLogs() {
    if (selectedLogs.size === 0) {
        alert('No logs selected for export');
        return;
    }
    
    const selectedLogData = allLogs.filter(log => selectedLogs.has(log.id));
    const dataStr = JSON.stringify(selectedLogData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `selected-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification(`${selectedLogs.size} logs exported`, 'success');
    clearSelection();
}

function exportSingleLog(logId) {
    const log = allLogs.find(l => l.id === logId);
    if (!log) return;
    
    const dataStr = JSON.stringify(log, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `log-${logId}-${new Date(log.timestamp).toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Log exported', 'success');
}

// Clear Logs
function clearLogs() {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
        allLogs = [];
        filteredLogs = [];
        selectedLogs.clear();
        currentPage = 1;
        
        // Regenerate some logs
        generateMockLogs(50);
        loadLogsForPage();
        updateLogStats();
        
        showNotification('Logs cleared', 'info');
    }
}

// Delete Selected Logs
function deleteSelectedLogs() {
    if (selectedLogs.size === 0) {
        alert('No logs selected for deletion');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedLogs.size} selected logs?`)) {
        // Remove selected logs
        allLogs = allLogs.filter(log => !selectedLogs.has(log.id));
        filteredLogs = filteredLogs.filter(log => !selectedLogs.has(log.id));
        
        // Clear selection
        clearSelection();
        
        // Reload
        loadLogsForPage();
        updateLogStats();
        
        showNotification(`${selectedLogs.size} logs deleted`, 'success');
    }
}

// Setup Multi-Select
function setupMultiSelect() {
    // Add styles for multi-select
    const style = document.createElement('style');
    style.textContent = `
        select[multiple] {
            min-height: 100px;
        }
        
        select[multiple] option {
            padding: 8px 12px;
            margin: 2px 0;
            border-radius: 4px;
            cursor: pointer;
        }
        
        select[multiple] option:hover {
            background: var(--primary-color) !important;
            color: white !important;
        }
        
        select[multiple] option:checked {
            background: var(--primary-color) !important;
            color: white !important;
        }
    `;
    document.head.appendChild(style);
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: 15px; background: none; border: none; color: white; cursor: pointer;">
            &times;
        </button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5001);
}

// Export functions
window.initLogs = initLogs;
window.filterLogs = filterLogs;
window.searchLogs = searchLogs;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.prevPage = prevPage;
window.nextPage = nextPage;
window.changeItemsPerPage = changeItemsPerPage;
window.startLiveStream = startLiveStream;
window.pauseLiveStream = pauseLiveStream;
window.toggleLogSelection = toggleLogSelection;
window.selectAllLogs = selectAllLogs;
window.clearSelection = clearSelection;
window.viewLogDetail = viewLogDetail;
window.closeLogModal = closeLogModal;
window.showRemediation = showRemediation;
window.closeRemediationModal = closeRemediationModal;
window.createIncidentFromLog = createIncidentFromLog;
window.createIncidentFromSelected = createIncidentFromSelected;
window.createIncidentFromCurrentLog = createIncidentFromCurrentLog;
window.exportLogs = exportLogs;
window.exportSelectedLogs = exportSelectedLogs;
window.clearLogs = clearLogs;
window.deleteSelectedLogs = deleteSelectedLogs;