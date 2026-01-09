let screens = [];

const PRODUCTS = {
    11: "Reserve Level Ribbon (10mm)",
    111: "Scoreboard Replacement (10mm)",
    1231: "Pavilion Scoreboard (10mm)",
    131: "Out of Town Scoreboard (10mm)"
};

function addScreen() {
    const prodId = document.getElementById('prodId').value;
    const qty = document.getElementById('qty').value;
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const isOutdoor = document.getElementById('isOutdoor').checked;
    const mountType = document.getElementById('mountType').value;
    const crew = document.getElementById('crew').value;
    const distPower = document.getElementById('distPower').value;

    const screen = {
        product_id: parseInt(prodId),
        quantity: parseInt(qty),
        width_ft: parseFloat(width),
        height_ft: parseFloat(height),
        is_outdoor: isOutdoor,
        mounting_type: mountType,
        crew_size: parseInt(crew),
        dist_power: parseFloat(distPower)
    };

    screens.push(screen);
    renderList();

    // Enable Generate Button
    document.getElementById('genBtn').disabled = false;
    document.getElementById('genBtn').style.opacity = "1";
    document.getElementById('genBtn').innerHTML = `GENERATE (${screens.length} Screens)`;
}

function renderList() {
    const list = document.getElementById('screenList');
    list.innerHTML = '';

    screens.forEach((s, idx) => {
        const div = document.createElement('div');
        div.className = 'screen-item';
        div.innerHTML = `
            <div class="screen-info">
                <strong>${PRODUCTS[s.product_id]} (x${s.quantity})</strong>
                <span>${s.width_ft}' x ${s.height_ft}' | ${s.mounting_type} | ${s.is_outdoor ? 'OD' : 'ID'}</span>
            </div>
            <button onclick="removeScreen(${idx})" style="background:none; border:none; color: #ef4444; cursor:pointer;">✕</button>
        `;
        list.appendChild(div);
    });
}

function removeScreen(idx) {
    screens.splice(idx, 1);
    renderList();
    if (screens.length === 0) {
        document.getElementById('genBtn').disabled = true;
        document.getElementById('genBtn').innerHTML = "GENERATE DOCUMENTS";
    }
}

async function generateProposal() {
    const clientName = document.getElementById('clientName').value || "Unknown Client";
    const projectAddr = document.getElementById('projectAddr').value || "Unknown Address";

    // Show Loader
    document.getElementById('loadingOverlay').classList.add('active');

    try {
        const payload = {
            client_name: clientName,
            project_address: projectAddr,
            screens: screens
        };

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Generation Failed");

        const data = await response.json();

        // Show Success
        document.getElementById('loadingOverlay').classList.remove('active');
        document.getElementById('successOverlay').classList.add('active');

    } catch (e) {
        alert("Error: " + e.message);
        document.getElementById('loadingOverlay').classList.remove('active');
    }
}
