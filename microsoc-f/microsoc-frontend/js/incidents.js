// Incidents Page JavaScript

let incidents = [];

// Load Incidents
async function loadIncidents() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5001/api/incidents", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            console.error(data.message);
            return;
        }

        renderIncidents(data.incidents);
    } catch (err) {
        console.error("Failed to load incidents", err);
    }
}


// Render Incidents Table
function renderInciments(filteredIncidents = incidents) {
    const tbody = document.querySelector('#incidents-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = filteredIncidents.map(incident => `
        <tr data-id="${incident.id}">
            <td>#${incident.id}</td>
            <td>
                <strong>${incident.title}</strong>
                <div class="incident-description">${incident.description}</div>
            </td>
            <td>
                <span class="badge" style="background: ${getSeverityColor(incident.severity)}">
                    ${incident.severity.toUpperCase()}
                </span>
            </td>
            <td>
                <span class="status-badge status-${incident.status}">
                    ${incident.status.replace('_', ' ').toUpperCase()}
                </span>
            </td>
            <td>${incident.assignedTo || 'Unassigned'}</td>
            <td>${formatDate(incident.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="viewIncident(${incident.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline" onclick="editIncident(${incident.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Filter Incidents
function filterIncidents() {
    const statusFilter = document.getElementById('filter-status').value;
    const severityFilter = document.getElementById('filter-severity').value;
    
    let filtered = incidents;
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(incident => incident.status === statusFilter);
    }
    
    if (severityFilter !== 'all') {
        filtered = filtered.filter(incident => incident.severity === severityFilter);
    }
    
    renderInciments(filtered);
}

// Search Incidents
function searchIncidents() {
    const searchTerm = document.getElementById('search-incidents').value.toLowerCase();
    
    if (!searchTerm) {
        renderInciments(incidents);
        return;
    }
    
    const filtered = incidents.filter(incident => 
        incident.title.toLowerCase().includes(searchTerm) ||
        incident.description.toLowerCase().includes(searchTerm) ||
        (incident.assignedTo && incident.assignedTo.toLowerCase().includes(searchTerm))
    );
    
    renderInciments(filtered);
}

// Open New Incident Modal
function openNewIncidentModal() {
    document.getElementById('new-incident-modal').classList.remove('hidden');
}

// Close Modal
function closeModal() {
    document.getElementById('new-incident-modal').classList.add('hidden');
    document.getElementById('new-incident-form').reset();
}

// Create New Incident
function createNewIncident() {
    const title = document.getElementById('incident-title').value;
    const description = document.getElementById('incident-description').value;
    const severity = document.getElementById('incident-severity').value;
    const assignee = document.getElementById('incident-assignee').value;
    
    const newIncident = {
        id: incidents.length + 1,
        title: title,
        description: description,
        severity: severity,
        status: 'open',
        assignedTo: assignee || null,
        createdAt: new Date().toISOString(),
        logs: 0,
        sourceIP: 'N/A'
    };
    
    incidents.unshift(newIncident);
    renderInciments();
    closeModal();
    
    // Show success message
    alert('Incident created successfully!');
}

// View Incident Details
function viewIncident(id) {
    const incident = incidents.find(i => i.id === id);
    if (!incident) return;
    
    const details = `
        Incident #${incident.id}: ${incident.title}
        
        Description: ${incident.description}
        
        Severity: ${incident.severity.toUpperCase()}
        Status: ${incident.status.toUpperCase()}
        Assigned To: ${incident.assignedTo || 'Unassigned'}
        Created: ${formatDate(incident.createdAt)}
        Source IP: ${incident.sourceIP}
        Related Logs: ${incident.logs}
    `;
    
    alert(details);
}

// Edit Incident
function editIncident(id) {
    const incident = incidents.find(i => i.id === id);
    if (!incident) return;
    
    const newStatus = prompt('Enter new status (open/in_progress/resolved/closed):', incident.status);
    if (newStatus && ['open', 'in_progress', 'resolved', 'closed'].includes(newStatus)) {
        incident.status = newStatus;
        renderInciments();
        alert('Incident status updated!');
    }
}

// Export functions
window.loadIncidents = loadIncidents;
window.filterIncidents = filterIncidents;
window.searchIncidents = searchIncidents;
window.openNewIncidentModal = openNewIncidentModal;
window.closeModal = closeModal;
window.createNewIncident = createNewIncident;
window.viewIncident = viewIncident;
window.editIncident = editIncident;