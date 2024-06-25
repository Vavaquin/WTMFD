

let currentData = {
    mach: 0,
    altitude_10k: 0,
    fuel1: 0,
    weapon4: 0,
    fuel_consume: 0,
    type: "",
    nozzle_angle: 0,
    compass: 0
};

let targetData = {
    mach: 0,
    altitude_10k: 0,
    fuel1: 0,
    weapon4: 0,
    fuel_consume: 0,
    type: "",
    nozzle_angle: 0,
    compass:0
};

let stopLoop = false;
let abortController = new AbortController();

function interpolate(current, target, alpha) {
    return current + (target - current) * alpha;
}

function updateDisplay() {
    const alpha = 0.06; // Interpolation factor, adjust for smoothness

    currentData.mach = interpolate(currentData.mach, targetData.mach, alpha);
    currentData.altitude_10k = interpolate(currentData.altitude_10k, targetData.altitude_10k, alpha);
    currentData.fuel1 = interpolate(currentData.fuel1, targetData.fuel1, alpha);
    currentData.weapon4 = interpolate(currentData.weapon4, targetData.weapon4, alpha);
    currentData.fuel_consume = interpolate(currentData.fuel_consume, targetData.fuel_consume, alpha);
    currentData.nozzle_angle = interpolate(currentData.nozzle_angle, targetData.nozzle_angle, alpha);
    currentData.throttle = interpolate(currentData.throttle1, targetData.throttle, alpha);
    currentData.compass = interpolate(currentData.compass, targetData.compass, alpha);
    currentData.type = targetData.type; // No interpolation needed for type

    document.getElementById('speed').innerText = `MACH: ${currentData.mach.toFixed(2)}`;
    document.getElementById('alt').innerText = `ALT: ${currentData.altitude_10k.toFixed(0)}`;
    document.getElementById('fuel').innerText = `FUEL: ${currentData.fuel1.toFixed(0)}`;
    document.getElementById('type').innerText = `MODEL: ${currentData.type}`;
    document.getElementById('cfuel').innerText = `FUEL FLOW: ${currentData.fuel_consume.toFixed(0)}`;
    document.getElementById('compassn').innerText = `[${currentData.compass.toFixed(0)}]`;

    // mostradores

    const arrow = document.getElementById('arrow');
    arrow.style.transform = `rotate(${currentData.nozzle_angle}deg)`;

    const arrow2 = document.getElementById('arrow2');
    arrow2.style.transform = `rotate(${targetData.throttle * 90}deg)`;
    const arrowe = document.getElementById('enginearrow2');
    arrowe.style.transform = `rotate(${targetData.throttle * 90}deg)`;

    const wings = document.getElementById('wings')
    wings.style.transform = `rotate(${targetData.wing_sweep_indicator * -90}deg)`;

    const compass = document.getElementById('compass');
    compass.style.transform = `rotate(${currentData.compass * -1}deg)`;


    // Calculate remaining fuel time
    if (currentData.fuel_consume > 0) {
        const remainingMinutes = currentData.fuel1 / currentData.fuel_consume;
        const minutes = Math.floor(remainingMinutes);
        const seconds = Math.floor((remainingMinutes - minutes) * 60);
        document.getElementById('time').innerText = `FLYING TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        document.getElementById('time').innerText = "TIME REMAINING: N/A";
    }
}

async function fetchSpeed() {
    try {
        const response = await fetch('http://localhost:8111/indicators', { signal: abortController.signal });
        const data = await response.json();

        targetData.mach = data.mach;
        targetData.altitude_10k = data.altitude_10k;
        targetData.fuel1 = data.fuel1;
        targetData.weapon4 = data.weapon4;
        targetData.fuel_consume = data["fuel_consume"];
        targetData.type = data.type;
        targetData.nozzle_angle = data.nozzle_angle;
        targetData.throttle = data.throttle;
        targetData.wing_sweep_indicator = data.wing_sweep_indicator;
        targetData.compass = data.compass;


    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error fetching speed data:', error);
        }
    }
}

async function updateSpeedLoop() {
    stopLoop = false;
    while (!stopLoop) {
        await fetchSpeed();
        await new Promise(resolve => setTimeout(resolve, 150)); // Fetch new data every second
    }
}

function animationLoop() {
    if (stopLoop) return;
    updateDisplay();
    requestAnimationFrame(animationLoop);
}

function resetScript() {
    stopLoop = true;
    abortController.abort(); // Cancel all ongoing fetch requests

    // Create a new AbortController for the next run
    abortController = new AbortController();

    // Reset data
    currentData = {
        mach: 0,
        altitude_10k: 0,
        fuel1: 0,
        weapon4: 0,
        fuel_consume: 0,
        type: "",
        nozzle_angle: 0
    };

    targetData = {
        mach: 0,
        altitude_10k: 0,
        fuel1: 0,
        weapon4: 0,
        fuel_consume: 0,
        type: "",
        nozzle_angle: 0
    };

    // Restart loops
    updateSpeedLoop();
    animationLoop();
}

// Start the update loop when the page loads
window.onload = () => {
    updateSpeedLoop();
    animationLoop();

    document.getElementById('sync').addEventListener('click', () => {
        location.reload();
    });
};